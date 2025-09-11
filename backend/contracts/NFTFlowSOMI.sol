// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IERC4907.sol";
import "./interfaces/IPriceOracle.sol";
import "./PaymentStreamSOMI.sol";
import "./ReputationSystemEnhanced.sol";
import "./OnChainAnalytics.sol";

/**
 * @title NFTFlowSOMI
 * @dev Enhanced NFT rental marketplace using native Somnia token (SOMI/STT)
 * Leverages Somnia's native token for all payments and operations
 * Achieves maximum on-chain impact with native token integration
 */
contract NFTFlowSOMI is ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;

    // ============ ENHANCED STRUCTS ============
    
    struct Rental {
        address lender;
        address tenant;
        address nftContract;
        uint256 tokenId;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPrice;
        uint256 pricePerSecond;
        uint256 paymentStreamId;
        uint256 collateralAmount;
        bool active;
        bool completed;
        bool disputed;
        uint256 disputeResolutionTime;
        RentalStatus status;
        uint256[] milestones;
        uint256 currentMilestone;
        uint256 gasUsed;
        uint256 transactionFee;
    }

    struct RentalStatus {
        bool isActive;
        bool isCompleted;
        bool isDisputed;
        bool isCancelled;
        uint256 completionTime;
        uint256 disputeStartTime;
        address disputeResolver;
    }

    struct NFTListing {
        address nftContract;
        uint256 tokenId;
        address owner;
        uint256 pricePerSecond;
        uint256 minDuration;
        uint256 maxDuration;
        uint256 collateralRequired;
        bool active;
        bool verified;
        uint256 totalRentals;
        uint256 totalEarnings;
        uint256 lastRentalTime;
        string metadataHash;
        ListingFeatures features;
    }

    struct ListingFeatures {
        bool supportsERC4907;
        bool supportsMetadata;
        bool supportsRoyalties;
        bool supportsGovernance;
        uint256 verificationLevel;
    }

    struct DisputeResolution {
        address resolver;
        uint256 resolutionTime;
        bool resolvedInFavorOfTenant;
        uint256 refundAmount;
        string resolutionReason;
        uint256 gasUsed;
        uint256 resolutionFee;
    }

    struct SOMIMetrics {
        uint256 totalVolumeSOMI;
        uint256 totalFeesSOMI;
        uint256 totalGasUsed;
        uint256 averageTransactionFee;
        uint256 microPaymentCount;
        uint256 totalMicroPayments;
    }

    // ============ STATE VARIABLES ============
    
    mapping(bytes32 => Rental) public rentals;
    mapping(bytes32 => NFTListing) public listings;
    mapping(bytes32 => DisputeResolution) public disputeResolutions;
    mapping(address => uint256[]) public userRentals;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256) public userSOMIBalance;
    mapping(address => uint256) public userTotalSpentSOMI;
    mapping(address => uint256) public userTotalEarnedSOMI;
    
    // Contract instances
    PaymentStreamSOMI public paymentStreamFactory;
    ReputationSystemEnhanced public reputationSystem;
    OnChainAnalytics public analyticsSystem;
    IPriceOracle public priceOracle;
    
    // SOMI-specific configuration
    uint256 public constant MIN_RENTAL_DURATION = 1; // 1 second minimum
    uint256 public constant MAX_RENTAL_DURATION = 31536000; // 1 year maximum
    uint256 public platformFeePercentage = 250; // 2.5% in basis points
    uint256 public disputeResolutionTime = 7 days;
    uint256 public minimumRentalAmount = 1000000000000; // 0.000001 SOMI minimum
    
    // SOMI metrics
    SOMIMetrics public somiMetrics;
    uint256 public nextRentalId;
    uint256 public totalVolumeSOMI;
    uint256 public totalRentals;
    uint256 public totalDisputes;
    uint256 public totalResolvedDisputes;
    
    // Gas optimization for Somnia
    uint256 public gasPriceMultiplier = 110; // 10% buffer for gas price fluctuations
    uint256 public maxGasPrice = 20000000000; // 20 gwei max gas price
    
    // ============ EVENTS ============
    
    event NFTListedForRent(
        bytes32 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address owner,
        uint256 pricePerSecondSOMI,
        uint256 minDuration,
        uint256 maxDuration,
        bool verified
    );
    
    event NFTRented(
        bytes32 indexed rentalId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address tenant,
        uint256 duration,
        uint256 totalPriceSOMI,
        uint256 collateralAmountSOMI,
        uint256 gasUsed
    );
    
    event RentalCompleted(
        bytes32 indexed rentalId,
        uint256 completionTime,
        uint256 totalPaidSOMI,
        bool successful,
        uint256 gasUsed
    );
    
    event RentalDisputed(
        bytes32 indexed rentalId,
        address indexed disputer,
        string reason,
        uint256 disputeTime,
        uint256 disputeFeeSOMI
    );
    
    event DisputeResolved(
        bytes32 indexed rentalId,
        address indexed resolver,
        bool resolvedInFavorOfTenant,
        uint256 refundAmountSOMI,
        uint256 gasUsed
    );
    
    event SOMIPaymentReceived(
        address indexed from,
        address indexed to,
        uint256 amountSOMI,
        string purpose,
        uint256 timestamp
    );
    
    event SOMIWithdrawn(
        address indexed to,
        uint256 amountSOMI,
        string purpose,
        uint256 timestamp
    );
    
    event GasPriceUpdated(
        uint256 oldGasPrice,
        uint256 newGasPrice,
        uint256 timestamp
    );
    
    event MicroPaymentProcessed(
        address indexed user,
        uint256 amountSOMI,
        uint256 gasUsed,
        uint256 timestamp
    );

    // ============ MODIFIERS ============
    
    modifier onlyVerifiedNFT(address nftContract, uint256 tokenId) {
        require(
            listings[keccak256(abi.encodePacked(nftContract, tokenId))].verified,
            "NFT not verified"
        );
        _;
    }
    
    modifier onlyActiveRental(bytes32 rentalId) {
        require(rentals[rentalId].active, "Rental not active");
        _;
    }
    
    modifier onlyDisputeResolver() {
        require(
            reputationSystem.getReputationScore(msg.sender) >= 800,
            "Insufficient reputation to resolve disputes"
        );
        _;
    }
    
    modifier validSOMIPayment(uint256 amount) {
        require(amount >= minimumRentalAmount, "Payment too small");
        require(msg.value == amount, "Incorrect SOMI amount");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(
        address _paymentStreamFactory,
        address _reputationSystem,
        address _analyticsSystem,
        address _priceOracle
    ) Ownable() {
        paymentStreamFactory = PaymentStreamSOMI(payable(_paymentStreamFactory));
        reputationSystem = ReputationSystemEnhanced(_reputationSystem);
        analyticsSystem = OnChainAnalytics(_analyticsSystem);
        priceOracle = IPriceOracle(_priceOracle);
    }

    // ============ CORE RENTAL FUNCTIONS ============

    /**
     * @dev List NFT for rent with SOMI pricing
     */
    function listNFTForRent(
        address nftContract,
        uint256 tokenId,
        uint256 pricePerSecondSOMI,
        uint256 minDuration,
        uint256 maxDuration,
        uint256 collateralRequiredSOMI,
        string memory metadataHash
    ) external returns (bytes32 listingId) {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(pricePerSecondSOMI >= minimumRentalAmount, "Price too low");
        require(minDuration >= MIN_RENTAL_DURATION, "Min duration too short");
        require(maxDuration <= MAX_RENTAL_DURATION, "Max duration too long");
        require(minDuration <= maxDuration, "Invalid duration range");
        
        listingId = keccak256(abi.encodePacked(nftContract, tokenId, block.timestamp, msg.sender));
        
        // On-chain NFT verification
        bool supportsERC4907 = _checkERC4907Support(nftContract);
        bool supportsMetadata = _checkMetadataSupport(nftContract);
        bool supportsRoyalties = _checkRoyaltySupport(nftContract);
        
        listings[listingId] = NFTListing({
            nftContract: nftContract,
            tokenId: tokenId,
            owner: msg.sender,
            pricePerSecond: pricePerSecondSOMI,
            minDuration: minDuration,
            maxDuration: maxDuration,
            collateralRequired: collateralRequiredSOMI,
            active: true,
            verified: true,
            totalRentals: 0,
            totalEarnings: 0,
            lastRentalTime: 0,
            metadataHash: metadataHash,
            features: ListingFeatures({
                supportsERC4907: supportsERC4907,
                supportsMetadata: supportsMetadata,
                supportsRoyalties: supportsRoyalties,
                supportsGovernance: true,
                verificationLevel: 3
            })
        });
        
        userListings[msg.sender].push(uint256(listingId));
        
        emit NFTListedForRent(
            listingId,
            nftContract,
            tokenId,
            msg.sender,
            pricePerSecondSOMI,
            minDuration,
            maxDuration,
            true
        );
        
        return listingId;
    }

    /**
     * @dev Rent NFT with native SOMI payment
     */
    function rentNFT(
        bytes32 listingId,
        uint256 duration,
        uint256[] memory milestones
    ) external payable nonReentrant whenNotPaused validSOMIPayment(0) {
        NFTListing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(duration >= listing.minDuration, "Duration too short");
        require(duration <= listing.maxDuration, "Duration too long");
        require(listing.owner != msg.sender, "Cannot rent own NFT");
        
        // Calculate total price in SOMI
        uint256 totalPriceSOMI = listing.pricePerSecond.mul(duration);
        require(msg.value >= totalPriceSOMI, "Insufficient SOMI payment");
        
        // Check if NFT is available
        bytes32 rentalId = keccak256(abi.encodePacked(listing.nftContract, listing.tokenId, block.timestamp));
        require(!rentals[rentalId].active, "NFT already rented");
        
        uint256 gasStart = gasleft();
        
        // Calculate fees in SOMI
        uint256 platformFeeSOMI = totalPriceSOMI.mul(platformFeePercentage).div(10000);
        uint256 netPriceSOMI = totalPriceSOMI.sub(platformFeeSOMI);
        
        // On-chain reputation and collateral calculation
        uint256 userRep = reputationSystem.getReputationScore(msg.sender);
        uint256 collateralMultiplier = reputationSystem.getCollateralMultiplier(msg.sender);
        uint256 requiredCollateralSOMI = listing.collateralRequired.mul(collateralMultiplier).div(100);
        
        require(msg.value >= totalPriceSOMI.add(requiredCollateralSOMI), "Insufficient SOMI payment");
        
        // Create SOMI payment stream
        uint256 streamId = paymentStreamFactory.createStream{value: msg.value}(
            listing.owner,
            block.timestamp,
            block.timestamp.add(duration),
            listing.nftContract,
            milestones
        );
        
        // On-chain NFT management
        if (listing.features.supportsERC4907) {
            IERC4907(listing.nftContract).setUser(listing.tokenId, msg.sender, uint64(block.timestamp.add(duration)));
        } else {
            IERC721(listing.nftContract).transferFrom(listing.owner, address(this), listing.tokenId);
        }
        
        // Create rental with SOMI tracking
        rentals[rentalId] = Rental({
            lender: listing.owner,
            tenant: msg.sender,
            nftContract: listing.nftContract,
            tokenId: listing.tokenId,
            startTime: block.timestamp,
            endTime: block.timestamp.add(duration),
            totalPrice: totalPriceSOMI,
            pricePerSecond: listing.pricePerSecond,
            paymentStreamId: streamId,
            collateralAmount: requiredCollateralSOMI,
            active: true,
            completed: false,
            disputed: false,
            disputeResolutionTime: 0,
            status: RentalStatus({
                isActive: true,
                isCompleted: false,
                isDisputed: false,
                isCancelled: false,
                completionTime: 0,
                disputeStartTime: 0,
                disputeResolver: address(0)
            }),
            milestones: milestones,
            currentMilestone: 0,
            gasUsed: gasStart.sub(gasleft()),
            transactionFee: tx.gasprice.mul(gasStart.sub(gasleft()))
        });
        
        // Update SOMI metrics
        userRentals[msg.sender].push(uint256(rentalId));
        userTotalSpentSOMI[msg.sender] = userTotalSpentSOMI[msg.sender].add(totalPriceSOMI);
        userTotalEarnedSOMI[listing.owner] = userTotalEarnedSOMI[listing.owner].add(netPriceSOMI);
        listing.totalRentals++;
        listing.totalEarnings = listing.totalEarnings.add(netPriceSOMI);
        listing.lastRentalTime = block.timestamp;
        totalVolumeSOMI = totalVolumeSOMI.add(totalPriceSOMI);
        totalRentals++;
        
        // Update SOMI metrics
        somiMetrics.totalVolumeSOMI = somiMetrics.totalVolumeSOMI.add(totalPriceSOMI);
        somiMetrics.totalFeesSOMI = somiMetrics.totalFeesSOMI.add(platformFeeSOMI);
        somiMetrics.totalGasUsed = somiMetrics.totalGasUsed.add(rentals[rentalId].gasUsed);
        somiMetrics.microPaymentCount++;
        somiMetrics.totalMicroPayments = somiMetrics.totalMicroPayments.add(totalPriceSOMI);
        
        // Update analytics
        analyticsSystem.updateRentalMetrics(
            msg.sender,
            listing.owner,
            totalPriceSOMI,
            duration,
            block.timestamp
        );
        
        emit NFTRented(rentalId, listing.nftContract, listing.tokenId, msg.sender, duration, totalPriceSOMI, requiredCollateralSOMI, rentals[rentalId].gasUsed);
        emit SOMIPaymentReceived(msg.sender, listing.owner, totalPriceSOMI, "Rental Payment", block.timestamp);
        emit MicroPaymentProcessed(msg.sender, totalPriceSOMI, rentals[rentalId].gasUsed, block.timestamp);
    }

    /**
     * @dev Complete rental with SOMI refunds
     */
    function completeRental(bytes32 rentalId) external nonReentrant {
        Rental storage rental = rentals[rentalId];
        require(rental.active, "Rental not active");
        require(block.timestamp >= rental.endTime, "Rental period not ended");
        require(msg.sender == rental.tenant || msg.sender == rental.lender, "Not authorized");
        
        uint256 gasStart = gasleft();
        
        // Finalize payment stream
        paymentStreamFactory.finalizeStream(rental.paymentStreamId);
        
        // Return NFT to owner
        if (listings[keccak256(abi.encodePacked(rental.nftContract, rental.tokenId))].features.supportsERC4907) {
            IERC4907(rental.nftContract).setUser(rental.tokenId, address(0), 0);
        } else {
            IERC721(rental.nftContract).transferFrom(address(this), rental.lender, rental.tokenId);
        }
        
        // Return collateral to tenant in SOMI
        if (rental.collateralAmount > 0) {
            payable(rental.tenant).transfer(rental.collateralAmount);
            emit SOMIPaymentReceived(address(this), rental.tenant, rental.collateralAmount, "Collateral Refund", block.timestamp);
        }
        
        // Update reputation
        reputationSystem.updateReputation(rental.tenant, true);
        reputationSystem.updateReputation(rental.lender, true);
        
        // Mark rental as completed
        rental.active = false;
        rental.completed = true;
        rental.status.isActive = false;
        rental.status.isCompleted = true;
        rental.status.completionTime = block.timestamp;
        
        uint256 gasUsed = gasStart.sub(gasleft());
        
        emit RentalCompleted(rentalId, block.timestamp, rental.totalPrice, true, gasUsed);
    }

    // ============ DISPUTE RESOLUTION ============

    /**
     * @dev Create dispute with SOMI fee
     */
    function createDispute(bytes32 rentalId, string memory reason) external payable {
        Rental storage rental = rentals[rentalId];
        require(rental.active, "Rental not active");
        require(msg.sender == rental.tenant || msg.sender == rental.lender, "Not authorized");
        require(!rental.disputed, "Dispute already exists");
        
        uint256 disputeFeeSOMI = 0.001 ether; // 0.001 SOMI dispute fee
        require(msg.value >= disputeFeeSOMI, "Insufficient dispute fee");
        
        rental.disputed = true;
        rental.status.isDisputed = true;
        rental.status.disputeStartTime = block.timestamp;
        rental.disputeResolutionTime = block.timestamp.add(disputeResolutionTime);
        
        totalDisputes++;
        
        emit RentalDisputed(rentalId, msg.sender, reason, block.timestamp, disputeFeeSOMI);
    }

    /**
     * @dev Resolve dispute with SOMI refunds
     */
    function resolveDispute(
        bytes32 rentalId,
        bool resolvedInFavorOfTenant,
        uint256 refundAmountSOMI,
        string memory resolutionReason
    ) external onlyDisputeResolver {
        Rental storage rental = rentals[rentalId];
        require(rental.disputed, "No dispute exists");
        require(block.timestamp >= rental.disputeResolutionTime, "Resolution time not reached");
        
        uint256 gasStart = gasleft();
        
        DisputeResolution storage resolution = disputeResolutions[rentalId];
        resolution.resolver = msg.sender;
        resolution.resolutionTime = block.timestamp;
        resolution.resolvedInFavorOfTenant = resolvedInFavorOfTenant;
        resolution.refundAmount = refundAmountSOMI;
        resolution.resolutionReason = resolutionReason;
        resolution.gasUsed = gasStart.sub(gasleft());
        resolution.resolutionFee = tx.gasprice.mul(resolution.gasUsed);
        
        // Execute resolution with SOMI
        if (refundAmountSOMI > 0) {
            payable(rental.tenant).transfer(refundAmountSOMI);
            emit SOMIPaymentReceived(address(this), rental.tenant, refundAmountSOMI, "Dispute Refund", block.timestamp);
        }
        
        // Update reputation based on resolution
        if (resolvedInFavorOfTenant) {
            reputationSystem.updateReputation(rental.tenant, true);
            reputationSystem.updateReputation(rental.lender, false);
        } else {
            reputationSystem.updateReputation(rental.tenant, false);
            reputationSystem.updateReputation(rental.lender, true);
        }
        
        rental.active = false;
        rental.status.isActive = false;
        totalResolvedDisputes++;
        
        emit DisputeResolved(rentalId, msg.sender, resolvedInFavorOfTenant, refundAmountSOMI, resolution.gasUsed);
    }

    // ============ SOMI UTILITY FUNCTIONS ============

    /**
     * @dev Deposit SOMI to contract
     */
    function depositSOMI() external payable {
        require(msg.value > 0, "Must send SOMI");
        userSOMIBalance[msg.sender] = userSOMIBalance[msg.sender].add(msg.value);
        emit SOMIPaymentReceived(msg.sender, address(this), msg.value, "Deposit", block.timestamp);
    }

    /**
     * @dev Withdraw SOMI from contract
     */
    function withdrawSOMI(uint256 amount) external {
        require(userSOMIBalance[msg.sender] >= amount, "Insufficient SOMI balance");
        require(address(this).balance >= amount, "Contract insufficient SOMI");
        
        userSOMIBalance[msg.sender] = userSOMIBalance[msg.sender].sub(amount);
        payable(msg.sender).transfer(amount);
        
        emit SOMIWithdrawn(msg.sender, amount, "Withdrawal", block.timestamp);
    }

    /**
     * @dev Get current SOMI gas price
     */
    function getCurrentGasPrice() external view returns (uint256) {
        return tx.gasprice;
    }

    /**
     * @dev Estimate rental cost in SOMI
     */
    function estimateRentalCost(
        address nftContract,
        uint256 tokenId,
        uint256 duration
    ) external view returns (uint256 totalCostSOMI, uint256 gasEstimate, uint256 totalWithGas) {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        NFTListing memory listing = listings[listingId];
        
        if (listing.active) {
            totalCostSOMI = listing.pricePerSecond.mul(duration);
        } else {
            // Use oracle price if available
            try priceOracle.getEstimatedPrice(nftContract, tokenId) returns (uint256 pricePerSecond) {
                totalCostSOMI = pricePerSecond.mul(duration);
            } catch {
                totalCostSOMI = minimumRentalAmount.mul(duration);
            }
        }
        
        // Estimate gas cost
        gasEstimate = 200000; // Estimated gas for rental
        uint256 gasCostSOMI = tx.gasprice.mul(gasEstimate);
        totalWithGas = totalCostSOMI.add(gasCostSOMI);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get comprehensive rental data
     */
    function getRentalData(bytes32 rentalId) external view returns (Rental memory) {
        return rentals[rentalId];
    }

    /**
     * @dev Get SOMI metrics
     */
    function getSOMIMetrics() external view returns (SOMIMetrics memory) {
        return somiMetrics;
    }

    /**
     * @dev Get user SOMI statistics
     */
    function getUserSOMIStats(address user) external view returns (
        uint256 balance,
        uint256 totalSpent,
        uint256 totalEarned,
        uint256 totalRentals
    ) {
        return (
            userSOMIBalance[user],
            userTotalSpentSOMI[user],
            userTotalEarnedSOMI[user],
            userRentals[user].length
        );
    }

    /**
     * @dev Get platform SOMI statistics
     */
    function getPlatformSOMIStats() external view returns (
        uint256 totalVolume,
        uint256 totalFees,
        uint256 totalGasUsed,
        uint256 averageTransactionFee,
        uint256 microPaymentCount
    ) {
        return (
            somiMetrics.totalVolumeSOMI,
            somiMetrics.totalFeesSOMI,
            somiMetrics.totalGasUsed,
            somiMetrics.totalGasUsed > 0 ? somiMetrics.totalGasUsed.div(totalRentals) : 0,
            somiMetrics.microPaymentCount
        );
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Check ERC-4907 support
     */
    function _checkERC4907Support(address nftContract) internal view returns (bool) {
        try IERC4907(nftContract).supportsInterface(type(IERC4907).interfaceId) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }

    /**
     * @dev Check metadata support
     */
    function _checkMetadataSupport(address nftContract) internal view returns (bool) {
        try IERC721(nftContract).tokenURI(0) returns (string memory) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev Check royalty support
     */
    function _checkRoyaltySupport(address nftContract) internal view returns (bool) {
        return true; // Simplified check
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = newFeePercentage;
    }

    /**
     * @dev Update minimum rental amount
     */
    function updateMinimumRentalAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "Amount must be greater than 0");
        minimumRentalAmount = newAmount;
    }

    /**
     * @dev Update gas price multiplier
     */
    function updateGasPriceMultiplier(uint256 newMultiplier) external onlyOwner {
        require(newMultiplier >= 100 && newMultiplier <= 200, "Invalid multiplier"); // 1x to 2x
        gasPriceMultiplier = newMultiplier;
    }

    /**
     * @dev Update max gas price
     */
    function updateMaxGasPrice(uint256 newMaxGasPrice) external onlyOwner {
        require(newMaxGasPrice > 0, "Max gas price must be greater than 0");
        maxGasPrice = newMaxGasPrice;
    }

    /**
     * @dev Withdraw platform fees in SOMI
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No SOMI to withdraw");
        
        payable(owner()).transfer(balance);
        emit SOMIWithdrawn(owner(), balance, "Platform Fees", block.timestamp);
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw SOMI
     */
    function emergencyWithdrawSOMI() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No SOMI to withdraw");
        
        payable(owner()).transfer(balance);
        emit SOMIWithdrawn(owner(), balance, "Emergency Withdrawal", block.timestamp);
    }

    /**
     * @dev Receive function for SOMI
     */
    receive() external payable {
        // Accept SOMI payments
        emit SOMIPaymentReceived(msg.sender, address(this), msg.value, "Direct Payment", block.timestamp);
    }
}
