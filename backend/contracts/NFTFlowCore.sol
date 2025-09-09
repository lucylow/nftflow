// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "../interfaces/IERC4907.sol";
import "../interfaces/IPriceOracle.sol";
import "./PaymentStream.sol";
import "./ReputationSystem.sol";
import "./DynamicPricing.sol";

/**
 * @title NFTFlowCore
 * @dev Core contract implementing the NFTFlow Protocol rental lifecycle state machine
 * Manages the complete rental process from listing to completion/cancellation
 */
contract NFTFlowCore is 
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable 
{
    // Rental states following the state machine
    enum RentalState {
        LISTED,     // NFT is listed for rental
        RENTED,     // Rental has been initiated
        ACTIVE,     // Rental is in progress
        COMPLETED,  // Rental completed successfully
        CANCELLED   // Rental was cancelled
    }

    // Struct representing a rental with complete state information
    struct Rental {
        address nftContract;
        uint256 tokenId;
        address owner;
        address renter;
        uint256 pricePerSecond;
        uint256 startTime;
        uint256 endTime;
        uint256 collateralAmount;
        uint256 streamId;
        RentalState state;
        uint256 createdAt;
        uint256 lastUpdated;
    }

    // Struct for rental listings with enhanced parameters
    struct RentalListing {
        address nftContract;
        uint256 tokenId;
        address owner;
        uint256 pricePerSecond;
        uint256 minRentalDuration;
        uint256 maxRentalDuration;
        uint256 collateralMultiplier; // Basis points (10000 = 100%)
        bool active;
        uint256 createdAt;
        uint256 lastPriceUpdate;
    }

    // State variables
    mapping(uint256 => Rental) public rentals;
    mapping(bytes32 => RentalListing) public listings;
    mapping(address => uint256[]) public userRentals;
    mapping(address => uint256[]) public ownerListings;
    mapping(address => uint256) public userCollateralBalance;
    
    uint256 public nextRentalId;
    uint256 public platformFeePercentage = 250; // 2.5% in basis points
    uint256 public creatorRoyaltyPercentage = 50; // 0.5% of total rental in basis points
    uint256 public constant MAX_RENTAL_DURATION = 30 days;
    uint256 public constant MIN_RENTAL_DURATION = 1; // 1 second
    uint256 public constant BASIS_POINTS = 10000;
    
    // Contract addresses
    address public paymentStreamContract;
    address public reputationContract;
    address public dynamicPricingContract;
    address public utilityTrackerContract;
    IPriceOracle public priceOracle;
    
    // Treasury and creator royalty addresses
    address public treasury;
    mapping(address => address) public collectionCreators; // NFT contract => creator address
    
    // Upgrade timelock
    uint256 public upgradeTimelock = 7 days;
    uint256 public proposedUpgradeTime;
    address public proposedImplementation;

    // Events for the state machine
    event RentalListed(
        bytes32 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address owner,
        uint256 pricePerSecond,
        uint256 collateralMultiplier
    );
    
    event RentalStarted(
        uint256 indexed rentalId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address owner,
        address renter,
        uint256 duration,
        uint256 totalCost,
        uint256 streamId
    );
    
    event RentalCompleted(
        uint256 indexed rentalId,
        address indexed renter,
        bool successful,
        uint256 totalPaid
    );
    
    event RentalCancelled(
        uint256 indexed rentalId,
        address indexed cancelledBy,
        string reason,
        uint256 refundAmount
    );
    
    event CollateralDeposited(
        address indexed user,
        uint256 amount
    );
    
    event CollateralWithdrawn(
        address indexed user,
        uint256 amount
    );

    event CreatorRoyaltySet(
        address indexed nftContract,
        address indexed creator
    );

    event UpgradeProposed(
        address indexed newImplementation,
        uint256 upgradeTime
    );

    event UpgradeExecuted(
        address indexed newImplementation
    );

    // Modifiers
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || 
            msg.sender == paymentStreamContract ||
            msg.sender == reputationContract,
            "Not authorized"
        );
        _;
    }

    modifier onlyAfterTimelock() {
        require(
            proposedUpgradeTime > 0 && 
            block.timestamp >= proposedUpgradeTime,
            "Upgrade timelock not expired"
        );
        _;
    }

    /**
     * @dev Initialize the contract (for proxy pattern)
     */
    function initialize(
        address _priceOracle,
        address _paymentStreamContract,
        address _reputationContract,
        address _dynamicPricingContract,
        address _utilityTrackerContract,
        address _treasury
    ) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        priceOracle = IPriceOracle(_priceOracle);
        paymentStreamContract = _paymentStreamContract;
        reputationContract = _reputationContract;
        dynamicPricingContract = _dynamicPricingContract;
        utilityTrackerContract = _utilityTrackerContract;
        treasury = _treasury;
    }

    /**
     * @dev List an NFT for rental with dynamic pricing support
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param basePricePerSecond Base price per second in wei
     * @param minDuration Minimum rental duration in seconds
     * @param maxDuration Maximum rental duration in seconds
     * @param collateralMultiplier Collateral multiplier in basis points
     */
    function listForRental(
        address nftContract,
        uint256 tokenId,
        uint256 basePricePerSecond,
        uint256 minDuration,
        uint256 maxDuration,
        uint256 collateralMultiplier
    ) external nonReentrant whenNotPaused {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not token owner");
        require(IERC721(nftContract).isApprovedForAll(msg.sender, address(this)), "Contract not approved");
        require(basePricePerSecond > 0, "Price must be greater than 0");
        require(minDuration >= MIN_RENTAL_DURATION, "Duration too short");
        require(maxDuration <= MAX_RENTAL_DURATION, "Duration too long");
        require(minDuration <= maxDuration, "Invalid duration range");
        require(collateralMultiplier <= 20000, "Collateral multiplier too high"); // Max 200%

        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));
        
        listings[listingId] = RentalListing({
            nftContract: nftContract,
            tokenId: tokenId,
            owner: msg.sender,
            pricePerSecond: basePricePerSecond,
            minRentalDuration: minDuration,
            maxRentalDuration: maxDuration,
            collateralMultiplier: collateralMultiplier,
            active: true,
            createdAt: block.timestamp,
            lastPriceUpdate: block.timestamp
        });

        ownerListings[msg.sender].push(uint256(listingId));

        emit RentalListed(listingId, nftContract, tokenId, msg.sender, basePricePerSecond, collateralMultiplier);
    }

    /**
     * @dev Rent an NFT with enhanced security and dynamic pricing
     * @param listingId The listing ID to rent
     * @param duration Duration in seconds
     */
    function rentNFT(
        bytes32 listingId,
        uint256 duration
    ) external payable nonReentrant whenNotPaused {
        RentalListing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(duration >= listing.minRentalDuration, "Duration too short");
        require(duration <= listing.maxRentalDuration, "Duration too long");
        
        // Get dynamic price if available
        uint256 finalPricePerSecond = listing.pricePerSecond;
        if (dynamicPricingContract != address(0)) {
            try IDynamicPricing(dynamicPricingContract).getDynamicPrice(
                listing.nftContract,
                listing.tokenId,
                listing.pricePerSecond,
                msg.sender
            ) returns (uint256 dynamicPrice) {
                finalPricePerSecond = dynamicPrice;
            } catch {
                // Use base price if dynamic pricing fails
                finalPricePerSecond = listing.pricePerSecond;
            }
        }
        
        uint256 totalCost = finalPricePerSecond * duration;
        
        // Calculate required collateral based on reputation
        uint256 requiredCollateral = _calculateRequiredCollateral(
            totalCost,
            listing.collateralMultiplier,
            msg.sender
        );
        
        require(msg.value >= totalCost + requiredCollateral, "Insufficient payment");
        require(
            userCollateralBalance[msg.sender] + msg.value >= requiredCollateral,
            "Insufficient collateral"
        );

        uint256 rentalId = nextRentalId++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;

        // Create payment stream
        uint256 streamId = _createPaymentStream(
            listing.owner,
            startTime,
            endTime,
            totalCost
        );

        rentals[rentalId] = Rental({
            nftContract: listing.nftContract,
            tokenId: listing.tokenId,
            owner: listing.owner,
            renter: msg.sender,
            pricePerSecond: finalPricePerSecond,
            startTime: startTime,
            endTime: endTime,
            collateralAmount: requiredCollateral,
            streamId: streamId,
            state: RentalState.RENTED,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });

        userRentals[msg.sender].push(rentalId);

        // Set user for ERC-4907 compatible NFTs
        if (supportsInterface(listing.nftContract, type(IERC4907).interfaceId)) {
            IERC4907(listing.nftContract).setUser(listing.tokenId, msg.sender, uint64(endTime));
        }

        // Update state to ACTIVE
        rentals[rentalId].state = RentalState.ACTIVE;
        rentals[rentalId].lastUpdated = block.timestamp;

        // Store collateral
        userCollateralBalance[msg.sender] = userCollateralBalance[msg.sender] + requiredCollateral;

        // Deactivate listing temporarily
        listing.active = false;

        // Emit event
        _emitRentalStarted(rentalId, listing, msg.sender, duration, totalCost, streamId);
    }

    /**
     * @dev Helper function to emit rental started event
     */
    function _emitRentalStarted(
        uint256 rentalId,
        RentalListing memory listing,
        address renter,
        uint256 duration,
        uint256 totalCost,
        uint256 streamId
    ) internal {
        emit RentalStarted(rentalId, listing.nftContract, listing.tokenId, listing.owner, renter, duration, totalCost, streamId);
    }

    /**
     * @dev Complete a rental and handle final payments
     * @param rentalId The rental ID to complete
     */
    function completeRental(uint256 rentalId) external nonReentrant {
        Rental storage rental = rentals[rentalId];
        require(rental.state == RentalState.ACTIVE, "Rental not active");
        require(block.timestamp >= rental.endTime, "Rental not expired");
        require(
            msg.sender == rental.renter || 
            msg.sender == rental.owner || 
            msg.sender == owner(),
            "Not authorized"
        );

        rental.state = RentalState.COMPLETED;
        rental.lastUpdated = block.timestamp;

        // Finalize payment stream
        if (rental.streamId > 0) {
            PaymentStream(payable(paymentStreamContract)).finalizeStream(rental.streamId);
        }

        // Return collateral to renter
        if (rental.collateralAmount > 0) {
            userCollateralBalance[rental.renter] = userCollateralBalance[rental.renter] - rental.collateralAmount;
            payable(rental.renter).transfer(rental.collateralAmount);
        }

        // Clear user for ERC-4907 compatible NFTs
        if (supportsInterface(rental.nftContract, type(IERC4907).interfaceId)) {
            IERC4907(rental.nftContract).setUser(rental.tokenId, address(0), 0);
        }

        // Update reputation
        if (reputationContract != address(0)) {
            ReputationSystem(reputationContract).updateReputation(rental.renter, true);
            ReputationSystem(reputationContract).updateReputation(rental.owner, true);
        }

        // Record utility usage
        _recordUtilityUsage(rental);

        // Reactivate listing
        _reactivateListing(rental);

        uint256 totalPaid = rental.pricePerSecond * (rental.endTime - rental.startTime);
        emit RentalCompleted(rentalId, rental.renter, true, totalPaid);
    }

    /**
     * @dev Cancel a rental with fair fund distribution
     * @param rentalId The rental ID to cancel
     * @param reason Reason for cancellation
     */
    function cancelRental(uint256 rentalId, string calldata reason) external nonReentrant {
        Rental storage rental = rentals[rentalId];
        require(rental.state == RentalState.ACTIVE, "Rental not active");
        require(
            msg.sender == rental.renter || 
            msg.sender == rental.owner || 
            msg.sender == owner(),
            "Not authorized"
        );

        rental.state = RentalState.CANCELLED;
        rental.lastUpdated = block.timestamp;

        // Calculate pro-rata refund
        uint256 elapsedTime = block.timestamp - rental.startTime;
        uint256 totalDuration = rental.endTime - rental.startTime;
        uint256 usedAmount = rental.pricePerSecond * elapsedTime;
        uint256 refundAmount = (rental.pricePerSecond * totalDuration) - usedAmount;

        // Cancel payment stream and distribute funds
        if (rental.streamId > 0) {
            PaymentStream(payable(paymentStreamContract)).cancelStream(rental.streamId);
        }

        // Return unused payment to renter
        if (refundAmount > 0) {
            payable(rental.renter).transfer(refundAmount);
        }

        // Return collateral to renter
        if (rental.collateralAmount > 0) {
            userCollateralBalance[rental.renter] = userCollateralBalance[rental.renter] - rental.collateralAmount;
            payable(rental.renter).transfer(rental.collateralAmount);
        }

        // Clear user for ERC-4907 compatible NFTs
        if (supportsInterface(rental.nftContract, type(IERC4907).interfaceId)) {
            IERC4907(rental.nftContract).setUser(rental.tokenId, address(0), 0);
        }

        // Update reputation based on who cancelled
        if (reputationContract != address(0)) {
            bool isRenterFault = msg.sender == rental.renter;
            ReputationSystem(reputationContract).updateReputation(rental.renter, !isRenterFault);
            ReputationSystem(reputationContract).updateReputation(rental.owner, isRenterFault);
        }

        // Reactivate listing
        _reactivateListing(rental);

        emit RentalCancelled(rentalId, msg.sender, reason, refundAmount);
    }

    /**
     * @dev Calculate required collateral based on reputation
     */
    function _calculateRequiredCollateral(
        uint256 totalCost,
        uint256 baseMultiplier,
        address user
    ) internal view returns (uint256) {
        if (reputationContract == address(0)) {
            return totalCost * baseMultiplier / BASIS_POINTS;
        }

        uint256 reputationMultiplier = ReputationSystem(reputationContract).getCollateralMultiplier(user);
        
        // Use the higher of base multiplier or reputation-based multiplier
        uint256 finalMultiplier = baseMultiplier > reputationMultiplier ? baseMultiplier : reputationMultiplier;
        
        return totalCost * finalMultiplier / BASIS_POINTS;
    }

    /**
     * @dev Create payment stream for rental
     */
    function _createPaymentStream(
        address recipient,
        uint256 startTime,
        uint256 endTime,
        uint256 totalAmount
    ) internal view returns (uint256) {
        // This would interact with the PaymentStream contract
        // For now, return a mock stream ID
        return uint256(keccak256(abi.encodePacked(recipient, startTime, endTime, totalAmount, block.timestamp)));
    }

    /**
     * @dev Record utility usage for analytics
     */
    function _recordUtilityUsage(Rental memory rental) internal {
        if (utilityTrackerContract == address(0)) {
            return;
        }

        uint256 duration = rental.endTime - rental.startTime;
        uint256 utilityValue = rental.pricePerSecond * duration;
        
        (bool success, ) = utilityTrackerContract.call(
            abi.encodeWithSignature(
                "recordUtilityUsage(address,uint256,address,uint256,uint256,uint256,uint256)",
                rental.nftContract,
                rental.tokenId,
                rental.renter,
                rental.startTime,
                rental.endTime,
                0, // Gaming utility type
                utilityValue
            )
        );
        // Continue even if utility tracking fails
        success; // Silence unused variable warning
    }

    /**
     * @dev Reactivate listing after rental completion/cancellation
     */
    function _reactivateListing(Rental memory rental) internal {
        bytes32 listingId = keccak256(abi.encodePacked(rental.nftContract, rental.tokenId, rental.owner));
        if (listings[listingId].owner == rental.owner) {
            listings[listingId].active = true;
        }
    }

    /**
     * @dev Deposit collateral for future rentals
     */
    function depositCollateral() external payable {
        require(msg.value > 0, "Must deposit some amount");
        userCollateralBalance[msg.sender] = userCollateralBalance[msg.sender] + msg.value;
        emit CollateralDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw available collateral
     * @param amount Amount to withdraw
     */
    function withdrawCollateral(uint256 amount) external nonReentrant {
        require(userCollateralBalance[msg.sender] >= amount, "Insufficient balance");
        userCollateralBalance[msg.sender] = userCollateralBalance[msg.sender] - amount;
        payable(msg.sender).transfer(amount);
        emit CollateralWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Set creator royalty address for a collection
     * @param nftContract NFT contract address
     * @param creator Creator address
     */
    function setCreatorRoyalty(address nftContract, address creator) external onlyOwner {
        collectionCreators[nftContract] = creator;
        emit CreatorRoyaltySet(nftContract, creator);
    }

    /**
     * @dev Propose contract upgrade with timelock
     * @param newImplementation New implementation address
     */
    function proposeUpgrade(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation");
        proposedImplementation = newImplementation;
        proposedUpgradeTime = block.timestamp + upgradeTimelock;
        emit UpgradeProposed(newImplementation, proposedUpgradeTime);
    }

    /**
     * @dev Execute contract upgrade after timelock
     */
    function executeUpgrade() external onlyOwner onlyAfterTimelock {
        require(proposedImplementation != address(0), "No upgrade proposed");
        _upgradeTo(proposedImplementation);
        emit UpgradeExecuted(proposedImplementation);
        proposedImplementation = address(0);
        proposedUpgradeTime = 0;
    }

    /**
     * @dev Check if a contract supports an interface
     */
    function supportsInterface(address contractAddr, bytes4 interfaceId) internal view returns (bool) {
        try IERC165(contractAddr).supportsInterface(interfaceId) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }

    /**
     * @dev Get rental details
     */
    function getRental(uint256 rentalId) external view returns (Rental memory) {
        return rentals[rentalId];
    }

    /**
     * @dev Get listing details
     */
    function getListing(bytes32 listingId) external view returns (RentalListing memory) {
        return listings[listingId];
    }

    /**
     * @dev Get rental state
     */
    function getRentalState(uint256 rentalId) external view returns (RentalState) {
        return rentals[rentalId].state;
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = newFeePercentage;
    }

    /**
     * @dev Update creator royalty percentage
     */
    function updateCreatorRoyalty(uint256 newRoyaltyPercentage) external onlyOwner {
        require(newRoyaltyPercentage <= 500, "Royalty too high"); // Max 5%
        creatorRoyaltyPercentage = newRoyaltyPercentage;
    }

    /**
     * @dev Withdraw platform fees
     */
    function withdrawPlatformFees() external onlyOwner {
        payable(treasury).transfer(address(this).balance);
    }

    /**
     * @dev Required by UUPSUpgradeable
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}

/**
 * @title IDynamicPricing
 * @dev Interface for dynamic pricing contract
 */
interface IDynamicPricing {
    function getDynamicPrice(
        address nftContract,
        uint256 tokenId,
        uint256 basePrice,
        address user
    ) external view returns (uint256);
}
