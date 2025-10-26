// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NFTFlowCore
 * @dev Enhanced NFT rental platform with comprehensive security measures
 * @notice Implements rental functionality with emergency controls and access management
 */
contract NFTFlowCore is ReentrancyGuard, Pausable, AccessControl {
    using Counters for Counters.Counter;
    
    // Role definitions
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");
    bytes32 public constant FEE_COLLECTOR_ROLE = keccak256("FEE_COLLECTOR_ROLE");
    
    // Custom errors for gas efficiency
    error InsufficientPayment();
    error RentalNotActive();
    error Unauthorized();
    error ContractPaused();
    error InvalidDuration();
    error InvalidPrice();
    error RentalExpired();
    error AlreadyListed();
    error NotListed();
    error NotRenter();
    error NotOwner();
    error TransferFailed();
    error InvalidAddress();
    error EmergencyPauseActive();
    
    // Structs
    struct RentalListing {
        address owner;
        address nftContract;
        uint256 tokenId;
        uint256 pricePerSecond;
        uint256 minDuration;
        uint256 maxDuration;
        uint256 collateralMultiplier;
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct ActiveRental {
        address renter;
        address lender;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPrice;
        uint256 collateralAmount;
        bool active;
        RentalStatus status;
    }
    
    enum RentalStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        CANCELLED,
        DISPUTED
    }
    
    // State variables
    mapping(bytes32 => RentalListing) public listings;
    mapping(bytes32 => ActiveRental) public rentals;
    mapping(address => mapping(address => mapping(uint256 => bool))) public isListed;
    
    Counters.Counter private _listingIdCounter;
    Counters.Counter private _rentalIdCounter;
    
    // Platform configuration
    uint256 public platformFeePercentage = 250; // 2.5% (basis points)
    uint256 public maxRentalDuration = 365 days;
    uint256 public minRentalDuration = 1 hours;
    uint256 public emergencyPauseDuration = 7 days;
    
    address public feeCollector;
    address public priceOracle;
    
    // Emergency controls
    bool public emergencyPauseActive;
    uint256 public emergencyPauseStartTime;
    
    // Events
    event ListingCreated(
        bytes32 indexed listingId,
        address indexed owner,
        address indexed nftContract,
        uint256 tokenId,
        uint256 pricePerSecond,
        uint256 minDuration,
        uint256 maxDuration
    );
    
    event ListingUpdated(
        bytes32 indexed listingId,
        uint256 pricePerSecond,
        uint256 minDuration,
        uint256 maxDuration
    );
    
    event ListingDeactivated(bytes32 indexed listingId);
    
    event RentalStarted(
        bytes32 indexed rentalId,
        bytes32 indexed listingId,
        address indexed renter,
        uint256 startTime,
        uint256 endTime,
        uint256 totalPrice
    );
    
    event RentalCompleted(bytes32 indexed rentalId);
    event RentalCancelled(bytes32 indexed rentalId, address indexed cancelledBy);
    
    event EmergencyPauseActivated(address indexed activator, uint256 duration);
    event EmergencyPauseDeactivated();
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    
    // Modifiers
    modifier onlyEmergencyRole() {
        if (!hasRole(EMERGENCY_ROLE, msg.sender)) {
            revert Unauthorized();
        }
        _;
    }
    
    modifier onlyPauserRole() {
        if (!hasRole(PAUSER_ROLE, msg.sender)) {
            revert Unauthorized();
        }
        _;
    }
    
    modifier onlyPriceUpdater() {
        if (!hasRole(PRICE_UPDATER_ROLE, msg.sender)) {
            revert Unauthorized();
        }
        _;
    }
    
    modifier notEmergencyPaused() {
        if (emergencyPauseActive) {
            revert EmergencyPauseActive();
        }
        _;
    }
    
    modifier validDuration(uint256 duration) {
        if (duration < minRentalDuration || duration > maxRentalDuration) {
            revert InvalidDuration();
        }
        _;
    }
    
    modifier validPrice(uint256 price) {
        if (price == 0) {
            revert InvalidPrice();
        }
        _;
    }
    
    constructor(
        address _feeCollector,
        address _priceOracle
    ) {
        if (_feeCollector == address(0) || _priceOracle == address(0)) {
            revert InvalidAddress();
        }
        
        feeCollector = _feeCollector;
        priceOracle = _priceOracle;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        _grantRole(PRICE_UPDATER_ROLE, msg.sender);
        _grantRole(FEE_COLLECTOR_ROLE, _feeCollector);
    }
    
    /**
     * @dev Create a new NFT rental listing
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param pricePerSecond Price per second in wei
     * @param minDuration Minimum rental duration in seconds
     * @param maxDuration Maximum rental duration in seconds
     * @param collateralMultiplier Collateral multiplier (e.g., 100 = 1x)
     */
    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 pricePerSecond,
        uint256 minDuration,
        uint256 maxDuration,
        uint256 collateralMultiplier
    ) external 
        nonReentrant 
        whenNotPaused 
        notEmergencyPaused
        validPrice(pricePerSecond)
        validDuration(minDuration)
        validDuration(maxDuration)
    {
        if (minDuration > maxDuration) {
            revert InvalidDuration();
        }
        
        if (isListed[msg.sender][nftContract][tokenId]) {
            revert AlreadyListed();
        }
        
        // Verify ownership
        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) {
            revert NotOwner();
        }
        
        // Verify approval
        if (nft.getApproved(tokenId) != address(this) && 
            !nft.isApprovedForAll(msg.sender, address(this))) {
            revert Unauthorized();
        }
        
        _listingIdCounter.increment();
        bytes32 listingId = keccak256(abi.encodePacked(
            msg.sender,
            nftContract,
            tokenId,
            _listingIdCounter.current()
        ));
        
        listings[listingId] = RentalListing({
            owner: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            pricePerSecond: pricePerSecond,
            minDuration: minDuration,
            maxDuration: maxDuration,
            collateralMultiplier: collateralMultiplier,
            active: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        isListed[msg.sender][nftContract][tokenId] = true;
        
        emit ListingCreated(
            listingId,
            msg.sender,
            nftContract,
            tokenId,
            pricePerSecond,
            minDuration,
            maxDuration
        );
    }
    
    /**
     * @dev Rent an NFT
     * @param listingId Listing ID to rent
     * @param duration Rental duration in seconds
     */
    function rentNFT(
        bytes32 listingId,
        uint256 duration
    ) external 
        payable 
        nonReentrant 
        whenNotPaused 
        notEmergencyPaused
        validDuration(duration)
    {
        RentalListing storage listing = listings[listingId];
        
        if (!listing.active) {
            revert NotListed();
        }
        
        if (listing.owner == msg.sender) {
            revert Unauthorized(); // Can't rent your own NFT
        }
        
        if (duration < listing.minDuration || duration > listing.maxDuration) {
            revert InvalidDuration();
        }
        
        // Calculate costs
        uint256 totalPrice = listing.pricePerSecond * duration;
        uint256 platformFee = (totalPrice * platformFeePercentage) / 10000;
        uint256 collateralAmount = (totalPrice * listing.collateralMultiplier) / 100;
        uint256 totalRequired = totalPrice + platformFee + collateralAmount;
        
        if (msg.value < totalRequired) {
            revert InsufficientPayment();
        }
        
        // Transfer NFT to contract
        IERC721(listing.nftContract).transferFrom(
            listing.owner,
            address(this),
            listing.tokenId
        );
        
        // Create rental
        _rentalIdCounter.increment();
        bytes32 rentalId = keccak256(abi.encodePacked(
            listingId,
            msg.sender,
            _rentalIdCounter.current()
        ));
        
        rentals[rentalId] = ActiveRental({
            renter: msg.sender,
            lender: listing.owner,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            totalPrice: totalPrice,
            collateralAmount: collateralAmount,
            active: true,
            status: RentalStatus.ACTIVE
        });
        
        // Deactivate listing
        listing.active = false;
        isListed[listing.owner][listing.nftContract][listing.tokenId] = false;
        
        // Transfer payments
        if (platformFee > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: platformFee}("");
            if (!feeSuccess) {
                revert TransferFailed();
            }
        }
        
        (bool priceSuccess, ) = listing.owner.call{value: totalPrice}("");
        if (!priceSuccess) {
            revert TransferFailed();
        }
        
        // Refund excess payment
        uint256 excess = msg.value - totalRequired;
        if (excess > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excess}("");
            if (!refundSuccess) {
                revert TransferFailed();
            }
        }
        
        emit RentalStarted(
            rentalId,
            listingId,
            msg.sender,
            block.timestamp,
            block.timestamp + duration,
            totalPrice
        );
    }
    
    /**
     * @dev Complete a rental and return NFT
     * @param rentalId Rental ID to complete
     */
    function completeRental(bytes32 rentalId) external nonReentrant {
        ActiveRental storage rental = rentals[rentalId];
        
        if (!rental.active) {
            revert RentalNotActive();
        }
        
        if (block.timestamp < rental.endTime) {
            revert RentalExpired();
        }
        
        // Get listing info
        bytes32 listingId = keccak256(abi.encodePacked(
            rental.lender,
            rental.renter,
            rentalId
        ));
        RentalListing storage listing = listings[listingId];
        
        // Return NFT to lender
        IERC721(listing.nftContract).transferFrom(
            address(this),
            rental.lender,
            listing.tokenId
        );
        
        // Return collateral to renter
        if (rental.collateralAmount > 0) {
            (bool success, ) = rental.renter.call{value: rental.collateralAmount}("");
            if (!success) {
                revert TransferFailed();
            }
        }
        
        rental.active = false;
        rental.status = RentalStatus.COMPLETED;
        
        emit RentalCompleted(rentalId);
    }
    
    /**
     * @dev Cancel a rental (only renter or after expiry)
     * @param rentalId Rental ID to cancel
     */
    function cancelRental(bytes32 rentalId) external nonReentrant {
        ActiveRental storage rental = rentals[rentalId];
        
        if (!rental.active) {
            revert RentalNotActive();
        }
        
        bool isRenter = rental.renter == msg.sender;
        bool isExpired = block.timestamp > rental.endTime;
        
        if (!isRenter && !isExpired) {
            revert Unauthorized();
        }
        
        // Get listing info
        bytes32 listingId = keccak256(abi.encodePacked(
            rental.lender,
            rental.renter,
            rentalId
        ));
        RentalListing storage listing = listings[listingId];
        
        // Return NFT to lender
        IERC721(listing.nftContract).transferFrom(
            address(this),
            rental.lender,
            listing.tokenId
        );
        
        // Calculate refunds based on cancellation time
        uint256 refundAmount = 0;
        if (isRenter && !isExpired) {
            // Early cancellation - partial refund
            uint256 timeUsed = block.timestamp - rental.startTime;
            uint256 timeRemaining = rental.endTime - block.timestamp;
            refundAmount = (rental.totalPrice * timeRemaining) / (rental.endTime - rental.startTime);
        }
        
        // Return payments
        if (refundAmount > 0) {
            (bool success, ) = rental.renter.call{value: refundAmount}("");
            if (!success) {
                revert TransferFailed();
            }
        }
        
        // Return collateral
        if (rental.collateralAmount > 0) {
            (bool success, ) = rental.renter.call{value: rental.collateralAmount}("");
            if (!success) {
                revert TransferFailed();
            }
        }
        
        rental.active = false;
        rental.status = RentalStatus.CANCELLED;
        
        emit RentalCancelled(rentalId, msg.sender);
    }
    
    /**
     * @dev Emergency pause function
     */
    function activateEmergencyPause() external onlyEmergencyRole {
        emergencyPauseActive = true;
        emergencyPauseStartTime = block.timestamp;
        
        emit EmergencyPauseActivated(msg.sender, emergencyPauseDuration);
    }
    
    /**
     * @dev Deactivate emergency pause
     */
    function deactivateEmergencyPause() external onlyEmergencyRole {
        require(
            block.timestamp >= emergencyPauseStartTime + emergencyPauseDuration,
            "Emergency pause duration not elapsed"
        );
        
        emergencyPauseActive = false;
        
        emit EmergencyPauseDeactivated();
    }
    
    /**
     * @dev Emergency withdrawal function
     * @param token Token address (address(0) for ETH)
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyEmergencyRole {
        if (to == address(0)) {
            revert InvalidAddress();
        }
        
        if (token == address(0)) {
            // ETH withdrawal
            uint256 balance = address(this).balance;
            uint256 withdrawAmount = amount == 0 ? balance : amount;
            
            (bool success, ) = to.call{value: withdrawAmount}("");
            if (!success) {
                revert TransferFailed();
            }
        } else {
            // Token withdrawal
            IERC20 tokenContract = IERC20(token);
            uint256 balance = tokenContract.balanceOf(address(this));
            uint256 withdrawAmount = amount == 0 ? balance : amount;
            
            if (!tokenContract.transfer(to, withdrawAmount)) {
                revert TransferFailed();
            }
        }
    }
    
    /**
     * @dev Update platform fee
     * @param newFeePercentage New fee percentage in basis points
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%");
        
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = newFeePercentage;
        
        emit PlatformFeeUpdated(oldFee, newFeePercentage);
    }
    
    /**
     * @dev Update fee collector address
     * @param newFeeCollector New fee collector address
     */
    function updateFeeCollector(address newFeeCollector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newFeeCollector == address(0)) {
            revert InvalidAddress();
        }
        
        address oldCollector = feeCollector;
        feeCollector = newFeeCollector;
        
        _grantRole(FEE_COLLECTOR_ROLE, newFeeCollector);
        _revokeRole(FEE_COLLECTOR_ROLE, oldCollector);
        
        emit FeeCollectorUpdated(oldCollector, newFeeCollector);
    }
    
    /**
     * @dev Get rental information
     * @param rentalId Rental ID
     * @return rental Rental information
     */
    function getRental(bytes32 rentalId) external view returns (ActiveRental memory) {
        return rentals[rentalId];
    }
    
    /**
     * @dev Get listing information
     * @param listingId Listing ID
     * @return listing Listing information
     */
    function getListing(bytes32 listingId) external view returns (RentalListing memory) {
        return listings[listingId];
    }
    
    /**
     * @dev Check if NFT is listed
     * @param owner NFT owner
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @return true if listed
     */
    function isNFTListed(
        address owner,
        address nftContract,
        uint256 tokenId
    ) external view returns (bool) {
        return isListed[owner][nftContract][tokenId];
    }
    
    /**
     * @dev Get contract version
     * @return version string
     */
    function version() external pure returns (string memory) {
        return "2.0.0";
    }
}
