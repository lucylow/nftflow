// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title PaymentStreamSOMI
 * @dev Enhanced payment streaming contract using native Somnia token (SOMI/STT)
 * Leverages Somnia's low fees for micro-payment streaming
 * Achieves 100% on-chain payment processing with native token
 */
contract PaymentStreamSOMI is ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;

    // ============ ENHANCED STRUCTS ============
    
    struct Stream {
        address sender;
        address recipient;
        uint256 depositSOMI;
        uint256 ratePerSecondSOMI;
        uint256 startTime;
        uint256 stopTime;
        uint256 remainingBalanceSOMI;
        uint256 totalWithdrawnSOMI;
        bool active;
        bool finalized;
        bool disputed;
        uint256 platformFeeAmountSOMI;
        uint256 creatorRoyaltyAmountSOMI;
        address creatorAddress;
        uint256[] milestones;
        uint256 currentMilestone;
        StreamType streamType;
        uint256 lastReleaseTime;
        uint256 totalReleases;
        StreamMetadata metadata;
        uint256 gasUsed;
        uint256 transactionFeeSOMI;
    }

    struct StreamMetadata {
        string description;
        string category;
        uint256 priority;
        bool autoRelease;
        uint256 releaseInterval;
        uint256 lastAutoRelease;
        uint256 gasPrice;
        uint256 maxGasPrice;
    }

    struct SOMIStreamMetrics {
        uint256 totalStreams;
        uint256 totalVolumeSOMI;
        uint256 activeStreams;
        uint256 completedStreams;
        uint256 disputedStreams;
        uint256 totalFeesSOMI;
        uint256 totalRoyaltiesSOMI;
        uint256 totalGasUsed;
        uint256 microPaymentCount;
    }

    enum StreamType {
        RENTAL,
        SUBSCRIPTION,
        SALARY,
        ROYALTY,
        CUSTOM
    }

    // ============ STATE VARIABLES ============
    
    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public senderStreams;
    mapping(address => uint256[]) public recipientStreams;
    mapping(address => uint256[]) public creatorStreams;
    mapping(address => SOMIStreamMetrics) public userSOMIMetrics;
    
    uint256 public nextStreamId;
    uint256 public constant MINIMUM_STREAM_DURATION = 1; // 1 second
    uint256 public constant BASIS_POINTS = 10000;
    
    // SOMI-specific fee structure
    uint256 public platformFeePercentage = 250; // 2.5%
    uint256 public creatorRoyaltyPercentage = 50; // 0.5%
    uint256 public disputeResolutionFeeSOMI = 0.001 ether; // 0.001 SOMI
    uint256 public minimumStreamAmountSOMI = 1000000000000; // 0.000001 SOMI
    
    address public treasury;
    address public disputeResolver;
    mapping(address => address) public collectionCreators;
    
    // Security and automation
    mapping(address => bool) public authorizedContracts;
    mapping(address => bool) public autoReleaseEnabled;
    uint256 public maxStreamDuration = 31536000; // 1 year
    uint256 public minStreamAmountSOMI = 1000000000000; // 0.000001 SOMI
    
    // SOMI analytics
    SOMIStreamMetrics public globalSOMIMetrics;
    mapping(uint256 => uint256) public dailyVolumeSOMI;
    mapping(uint256 => uint256) public dailyStreams;
    mapping(uint256 => uint256) public dailyGasUsed;
    
    // Gas optimization for Somnia
    uint256 public gasPriceMultiplier = 110; // 10% buffer
    uint256 public maxGasPrice = 20000000000; // 20 gwei max
    
    // ============ EVENTS ============
    
    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 depositSOMI,
        uint256 ratePerSecondSOMI,
        uint256 startTime,
        uint256 stopTime,
        StreamType streamType,
        uint256[] milestones,
        uint256 gasUsed
    );
    
    event StreamWithdrawn(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amountSOMI,
        uint256 totalWithdrawnSOMI,
        uint256 timestamp,
        uint256 gasUsed
    );
    
    event StreamCancelled(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 senderBalanceSOMI,
        uint256 recipientBalanceSOMI,
        uint256 timestamp,
        uint256 gasUsed
    );
    
    event StreamFinalized(
        uint256 indexed streamId,
        uint256 totalPaidSOMI,
        uint256 platformFeeCollectedSOMI,
        uint256 creatorRoyaltyCollectedSOMI,
        uint256 timestamp,
        uint256 gasUsed
    );
    
    event MilestoneReached(
        uint256 indexed streamId,
        uint256 milestoneIndex,
        uint256 amountSOMI,
        uint256 timestamp
    );
    
    event AutoReleaseExecuted(
        uint256 indexed streamId,
        uint256 amountSOMI,
        uint256 timestamp,
        uint256 gasUsed
    );
    
    event StreamDisputed(
        uint256 indexed streamId,
        address indexed disputer,
        string reason,
        uint256 timestamp,
        uint256 disputeFeeSOMI
    );
    
    event DisputeResolved(
        uint256 indexed streamId,
        address indexed resolver,
        bool resolvedInFavorOfRecipient,
        uint256 refundAmountSOMI,
        uint256 gasUsed
    );
    
    event PlatformFeeWithdrawn(
        address indexed treasury,
        uint256 amountSOMI,
        uint256 timestamp
    );
    
    event CreatorRoyaltyPaid(
        address indexed creator,
        uint256 amountSOMI,
        uint256 timestamp
    );
    
    event MicroPaymentProcessed(
        address indexed user,
        uint256 amountSOMI,
        uint256 gasUsed,
        uint256 timestamp
    );
    
    event SOMIPaymentReceived(
        address indexed from,
        address indexed to,
        uint256 amountSOMI,
        string purpose,
        uint256 timestamp
    );

    // ============ MODIFIERS ============
    
    modifier onlyAuthorized() {
        require(
            authorizedContracts[msg.sender] || 
            msg.sender == owner() ||
            msg.sender == disputeResolver,
            "Not authorized"
        );
        _;
    }
    
    modifier onlyDisputeResolver() {
        require(msg.sender == disputeResolver, "Not dispute resolver");
        _;
    }
    
    modifier validSOMIPayment(uint256 amount) {
        require(amount >= minStreamAmountSOMI, "Payment too small");
        require(msg.value == amount, "Incorrect SOMI amount");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(address _treasury, address _disputeResolver) Ownable() {
        treasury = _treasury != address(0) ? _treasury : msg.sender;
        disputeResolver = _disputeResolver != address(0) ? _disputeResolver : msg.sender;
    }

    // ============ CORE STREAMING FUNCTIONS ============

    /**
     * @dev Create enhanced payment stream with SOMI
     */
    function createStream(
        address recipient,
        uint256 startTime,
        uint256 stopTime,
        address nftContract,
        uint256[] memory milestones
    ) external payable nonReentrant whenNotPaused validSOMIPayment(0) returns (uint256 streamId) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot stream to self");
        require(startTime >= block.timestamp, "Start time in the past");
        require(stopTime > startTime, "Stop time before start time");
        
        uint256 duration = stopTime.sub(startTime);
        require(duration >= MINIMUM_STREAM_DURATION, "Duration too short");
        require(duration <= maxStreamDuration, "Duration too long");
        
        uint256 gasStart = gasleft();
        
        // Calculate enhanced fees in SOMI
        uint256 platformFeeAmountSOMI = msg.value.mul(platformFeePercentage).div(BASIS_POINTS);
        uint256 creatorRoyaltyAmountSOMI = msg.value.mul(creatorRoyaltyPercentage).div(BASIS_POINTS);
        uint256 netAmountSOMI = msg.value.sub(platformFeeAmountSOMI).sub(creatorRoyaltyAmountSOMI);
        
        uint256 ratePerSecondSOMI = netAmountSOMI.div(duration);
        require(ratePerSecondSOMI > 0, "Rate per second must be greater than 0");

        streamId = nextStreamId++;
        
        // Create stream metadata with gas optimization
        StreamMetadata memory metadata = StreamMetadata({
            description: "NFT Rental Payment Stream",
            category: "Rental",
            priority: 1,
            autoRelease: true,
            releaseInterval: 3600, // 1 hour auto-release
            lastAutoRelease: startTime,
            gasPrice: tx.gasprice,
            maxGasPrice: maxGasPrice
        });
        
        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            depositSOMI: netAmountSOMI,
            ratePerSecondSOMI: ratePerSecondSOMI,
            startTime: startTime,
            stopTime: stopTime,
            remainingBalanceSOMI: netAmountSOMI,
            totalWithdrawnSOMI: 0,
            active: true,
            finalized: false,
            disputed: false,
            platformFeeAmountSOMI: platformFeeAmountSOMI,
            creatorRoyaltyAmountSOMI: creatorRoyaltyAmountSOMI,
            creatorAddress: collectionCreators[nftContract],
            milestones: milestones,
            currentMilestone: 0,
            streamType: StreamType.RENTAL,
            lastReleaseTime: startTime,
            totalReleases: 0,
            metadata: metadata,
            gasUsed: gasStart.sub(gasleft()),
            transactionFeeSOMI: tx.gasprice.mul(gasStart.sub(gasleft()))
        });

        // Update tracking arrays
        senderStreams[msg.sender].push(streamId);
        recipientStreams[recipient].push(streamId);
        if (collectionCreators[nftContract] != address(0)) {
            creatorStreams[collectionCreators[nftContract]].push(streamId);
        }
        
        // Update SOMI analytics
        _updateSOMIStreamMetrics(msg.sender, recipient, msg.value, true);
        _updateDailySOMIAnalytics(msg.value, 1, streams[streamId].gasUsed);
        
        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            netAmountSOMI,
            ratePerSecondSOMI,
            startTime,
            stopTime,
            StreamType.RENTAL,
            milestones,
            streams[streamId].gasUsed
        );
        
        emit SOMIPaymentReceived(msg.sender, address(this), msg.value, "Stream Creation", block.timestamp);
        emit MicroPaymentProcessed(msg.sender, msg.value, streams[streamId].gasUsed, block.timestamp);
        
        return streamId;
    }

    /**
     * @dev Enhanced balance calculation with SOMI
     */
    function balanceOf(uint256 streamId) external view returns (uint256) {
        Stream memory stream = streams[streamId];
        require(stream.sender != address(0), "Stream does not exist");
        
        if (block.timestamp <= stream.startTime) {
            return 0;
        }
        
        if (block.timestamp >= stream.stopTime) {
            return stream.remainingBalanceSOMI;
        }
        
        uint256 elapsedTime = block.timestamp.sub(stream.startTime);
        uint256 availableAmountSOMI = elapsedTime.mul(stream.ratePerSecondSOMI);
        uint256 totalWithdrawnSOMI = stream.depositSOMI.sub(stream.remainingBalanceSOMI);
        
        // Check milestone restrictions
        uint256 milestoneRestrictedAmountSOMI = _calculateMilestoneRestrictedAmount(streamId, availableAmountSOMI);
        
        return milestoneRestrictedAmountSOMI.sub(totalWithdrawnSOMI);
    }

    /**
     * @dev Enhanced withdrawal with SOMI and milestone tracking
     */
    function withdrawFromStream(uint256 streamId, uint256 amountSOMI) external nonReentrant whenNotPaused {
        Stream storage stream = streams[streamId];
        require(stream.recipient == msg.sender, "Not the recipient");
        require(stream.active && !stream.finalized, "Stream not active");
        require(!stream.disputed, "Stream under dispute");
        
        uint256 availableBalanceSOMI = this.balanceOf(streamId);
        require(availableBalanceSOMI > 0, "No funds available");
        
        uint256 withdrawAmountSOMI = amountSOMI == 0 ? availableBalanceSOMI : amountSOMI;
        require(withdrawAmountSOMI <= availableBalanceSOMI, "Insufficient balance");
        require(withdrawAmountSOMI <= stream.remainingBalanceSOMI, "Exceeds remaining balance");
        
        uint256 gasStart = gasleft();
        
        // Update stream state
        stream.remainingBalanceSOMI = stream.remainingBalanceSOMI.sub(withdrawAmountSOMI);
        stream.totalWithdrawnSOMI = stream.totalWithdrawnSOMI.add(withdrawAmountSOMI);
        stream.lastReleaseTime = block.timestamp;
        stream.totalReleases++;
        
        // Check for milestone completion
        _checkMilestoneCompletion(streamId, withdrawAmountSOMI);
        
        // Transfer SOMI funds
        payable(msg.sender).transfer(withdrawAmountSOMI);
        
        // Update analytics
        _updateSOMIStreamMetrics(stream.sender, msg.sender, withdrawAmountSOMI, false);
        
        uint256 gasUsed = gasStart.sub(gasleft());
        
        emit StreamWithdrawn(streamId, msg.sender, withdrawAmountSOMI, stream.totalWithdrawnSOMI, block.timestamp, gasUsed);
        emit SOMIPaymentReceived(address(this), msg.sender, withdrawAmountSOMI, "Stream Withdrawal", block.timestamp);
        emit MicroPaymentProcessed(msg.sender, withdrawAmountSOMI, gasUsed, block.timestamp);
    }

    /**
     * @dev Automatic fund release for enabled streams with SOMI
     */
    function releaseFunds(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.active && !stream.finalized, "Stream not active");
        require(block.timestamp >= stream.startTime, "Stream not started");
        require(!stream.disputed, "Stream under dispute");
        
        uint256 gasStart = gasleft();
        
        // Check if auto-release is enabled and interval has passed
        if (stream.metadata.autoRelease && 
            block.timestamp >= stream.metadata.lastAutoRelease.add(stream.metadata.releaseInterval)) {
            
            uint256 availableBalanceSOMI = this.balanceOf(streamId);
            if (availableBalanceSOMI > 0) {
                stream.remainingBalanceSOMI = stream.remainingBalanceSOMI.sub(availableBalanceSOMI);
                stream.totalWithdrawnSOMI = stream.totalWithdrawnSOMI.add(availableBalanceSOMI);
                stream.lastReleaseTime = block.timestamp;
                stream.totalReleases++;
                stream.metadata.lastAutoRelease = block.timestamp;
                
                // Check for milestone completion
                _checkMilestoneCompletion(streamId, availableBalanceSOMI);
                
                payable(stream.recipient).transfer(availableBalanceSOMI);
                
                uint256 gasUsed = gasStart.sub(gasleft());
                
                emit AutoReleaseExecuted(streamId, availableBalanceSOMI, block.timestamp, gasUsed);
                emit SOMIPaymentReceived(address(this), stream.recipient, availableBalanceSOMI, "Auto Release", block.timestamp);
                emit MicroPaymentProcessed(stream.recipient, availableBalanceSOMI, gasUsed, block.timestamp);
            }
        }
    }

    /**
     * @dev Batch release funds for multiple streams with SOMI
     */
    function batchReleaseFunds(uint256[] calldata streamIds) external nonReentrant {
        for (uint256 i = 0; i < streamIds.length; i++) {
            this.releaseFunds(streamIds[i]);
        }
    }

    /**
     * @dev Enhanced stream finalization with SOMI settlement
     */
    function finalizeStream(uint256 streamId) external onlyAuthorized {
        Stream storage stream = streams[streamId];
        require(stream.active && !stream.finalized, "Stream not active");
        
        uint256 gasStart = gasleft();
        
        stream.active = false;
        stream.finalized = true;
        
        // Transfer any remaining balance to recipient in SOMI
        if (stream.remainingBalanceSOMI > 0) {
            payable(stream.recipient).transfer(stream.remainingBalanceSOMI);
            stream.totalWithdrawnSOMI = stream.totalWithdrawnSOMI.add(stream.remainingBalanceSOMI);
            stream.remainingBalanceSOMI = 0;
        }
        
        // Distribute platform fee to treasury in SOMI
        if (stream.platformFeeAmountSOMI > 0 && treasury != address(0)) {
            payable(treasury).transfer(stream.platformFeeAmountSOMI);
            emit PlatformFeeWithdrawn(treasury, stream.platformFeeAmountSOMI, block.timestamp);
        }
        
        // Distribute creator royalty in SOMI
        if (stream.creatorRoyaltyAmountSOMI > 0 && stream.creatorAddress != address(0)) {
            payable(stream.creatorAddress).transfer(stream.creatorRoyaltyAmountSOMI);
            emit CreatorRoyaltyPaid(stream.creatorAddress, stream.creatorRoyaltyAmountSOMI, block.timestamp);
        }
        
        // Update analytics
        globalSOMIMetrics.completedStreams++;
        globalSOMIMetrics.totalFeesSOMI = globalSOMIMetrics.totalFeesSOMI.add(stream.platformFeeAmountSOMI);
        globalSOMIMetrics.totalRoyaltiesSOMI = globalSOMIMetrics.totalRoyaltiesSOMI.add(stream.creatorRoyaltyAmountSOMI);
        
        uint256 gasUsed = gasStart.sub(gasleft());
        
        emit StreamFinalized(
            streamId,
            stream.totalWithdrawnSOMI,
            stream.platformFeeAmountSOMI,
            stream.creatorRoyaltyAmountSOMI,
            block.timestamp,
            gasUsed
        );
    }

    // ============ DISPUTE RESOLUTION ============

    /**
     * @dev Create stream dispute with SOMI fee
     */
    function createDispute(uint256 streamId, string memory reason) external payable {
        Stream storage stream = streams[streamId];
        require(stream.active, "Stream not active");
        require(msg.sender == stream.sender || msg.sender == stream.recipient, "Not authorized");
        require(!stream.disputed, "Dispute already exists");
        require(msg.value >= disputeResolutionFeeSOMI, "Insufficient dispute fee");
        
        stream.disputed = true;
        globalSOMIMetrics.disputedStreams++;
        
        emit StreamDisputed(streamId, msg.sender, reason, block.timestamp, disputeResolutionFeeSOMI);
        emit SOMIPaymentReceived(msg.sender, address(this), disputeResolutionFeeSOMI, "Dispute Fee", block.timestamp);
    }

    /**
     * @dev Resolve stream dispute with SOMI refunds
     */
    function resolveDispute(
        uint256 streamId,
        bool resolvedInFavorOfRecipient,
        uint256 refundAmountSOMI
    ) external onlyDisputeResolver {
        Stream storage stream = streams[streamId];
        require(stream.disputed, "No dispute exists");
        
        uint256 gasStart = gasleft();
        
        if (refundAmountSOMI > 0) {
            if (resolvedInFavorOfRecipient) {
                payable(stream.recipient).transfer(refundAmountSOMI);
                emit SOMIPaymentReceived(address(this), stream.recipient, refundAmountSOMI, "Dispute Refund", block.timestamp);
            } else {
                payable(stream.sender).transfer(refundAmountSOMI);
                emit SOMIPaymentReceived(address(this), stream.sender, refundAmountSOMI, "Dispute Refund", block.timestamp);
            }
        }
        
        stream.active = false;
        stream.finalized = true;
        
        uint256 gasUsed = gasStart.sub(gasleft());
        
        emit DisputeResolved(streamId, msg.sender, resolvedInFavorOfRecipient, refundAmountSOMI, gasUsed);
    }

    // ============ MILESTONE FUNCTIONS ============

    /**
     * @dev Update milestone manually
     */
    function updateMilestone(uint256 streamId, uint256 milestoneIndex) external {
        Stream storage stream = streams[streamId];
        require(stream.active, "Stream not active");
        require(msg.sender == stream.sender || msg.sender == stream.recipient, "Not authorized");
        require(milestoneIndex < stream.milestones.length, "Invalid milestone");
        require(milestoneIndex == stream.currentMilestone, "Milestone out of order");
        
        stream.currentMilestone = milestoneIndex.add(1);
        
        emit MilestoneReached(streamId, milestoneIndex, stream.milestones[milestoneIndex], block.timestamp);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get comprehensive stream data
     */
    function getStream(uint256 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    /**
     * @dev Get SOMI stream analytics
     */
    function getSOMIStreamAnalytics(uint256 streamId) external view returns (
        uint256 totalStreamedSOMI,
        uint256 remainingBalanceSOMI,
        uint256 totalReleases,
        uint256 currentMilestone,
        bool isActive,
        bool isDisputed,
        uint256 gasUsed
    ) {
        Stream memory stream = streams[streamId];
        uint256 totalStreamedSOMI = stream.depositSOMI.sub(stream.remainingBalanceSOMI);
        
        return (
            totalStreamedSOMI,
            stream.remainingBalanceSOMI,
            stream.totalReleases,
            stream.currentMilestone,
            stream.active,
            stream.disputed,
            stream.gasUsed
        );
    }

    /**
     * @dev Get user SOMI analytics
     */
    function getUserSOMIMetrics(address user) external view returns (SOMIStreamMetrics memory) {
        return userSOMIMetrics[user];
    }

    /**
     * @dev Get global SOMI analytics
     */
    function getGlobalSOMIMetrics() external view returns (SOMIStreamMetrics memory) {
        return globalSOMIMetrics;
    }

    /**
     * @dev Get daily SOMI analytics
     */
    function getDailySOMIAnalytics(uint256 day) external view returns (
        uint256 volumeSOMI,
        uint256 streams,
        uint256 gasUsed
    ) {
        return (dailyVolumeSOMI[day], dailyStreams[day], dailyGasUsed[day]);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Calculate milestone-restricted amount
     */
    function _calculateMilestoneRestrictedAmount(uint256 streamId, uint256 availableAmountSOMI) internal view returns (uint256) {
        Stream memory stream = streams[streamId];
        
        if (stream.milestones.length == 0) {
            return availableAmountSOMI;
        }
        
        uint256 milestoneAmountSOMI = 0;
        for (uint256 i = 0; i <= stream.currentMilestone && i < stream.milestones.length; i++) {
            milestoneAmountSOMI = milestoneAmountSOMI.add(stream.milestones[i]);
        }
        
        return availableAmountSOMI > milestoneAmountSOMI ? milestoneAmountSOMI : availableAmountSOMI;
    }

    /**
     * @dev Check milestone completion
     */
    function _checkMilestoneCompletion(uint256 streamId, uint256 amountSOMI) internal {
        Stream storage stream = streams[streamId];
        
        if (stream.milestones.length > 0 && stream.currentMilestone < stream.milestones.length) {
            uint256 milestoneAmountSOMI = stream.milestones[stream.currentMilestone];
            if (stream.totalWithdrawnSOMI >= milestoneAmountSOMI) {
                stream.currentMilestone = stream.currentMilestone.add(1);
                emit MilestoneReached(streamId, stream.currentMilestone.sub(1), milestoneAmountSOMI, block.timestamp);
            }
        }
    }

    /**
     * @dev Update SOMI stream metrics
     */
    function _updateSOMIStreamMetrics(
        address sender,
        address recipient,
        uint256 amountSOMI,
        bool isNewStream
    ) internal {
        if (isNewStream) {
            userSOMIMetrics[sender].totalStreams++;
            userSOMIMetrics[recipient].totalStreams++;
            globalSOMIMetrics.totalStreams++;
            globalSOMIMetrics.activeStreams++;
        }
        
        userSOMIMetrics[sender].totalVolumeSOMI = userSOMIMetrics[sender].totalVolumeSOMI.add(amountSOMI);
        userSOMIMetrics[recipient].totalVolumeSOMI = userSOMIMetrics[recipient].totalVolumeSOMI.add(amountSOMI);
        globalSOMIMetrics.totalVolumeSOMI = globalSOMIMetrics.totalVolumeSOMI.add(amountSOMI);
    }

    /**
     * @dev Update daily SOMI analytics
     */
    function _updateDailySOMIAnalytics(uint256 volumeSOMI, uint256 streamCount, uint256 gasUsed) internal {
        uint256 day = block.timestamp / 86400; // Days since epoch
        dailyVolumeSOMI[day] = dailyVolumeSOMI[day].add(volumeSOMI);
        dailyStreams[day] = dailyStreams[day].add(streamCount);
        dailyGasUsed[day] = dailyGasUsed[day].add(gasUsed);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update platform fee percentage
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
     * @dev Update treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
    }

    /**
     * @dev Update dispute resolver
     */
    function updateDisputeResolver(address newResolver) external onlyOwner {
        require(newResolver != address(0), "Invalid resolver address");
        disputeResolver = newResolver;
    }

    /**
     * @dev Set collection creator
     */
    function setCollectionCreator(address nftContract, address creator) external onlyOwner {
        collectionCreators[nftContract] = creator;
    }

    /**
     * @dev Add authorized contract
     */
    function addAuthorizedContract(address contractAddr) external onlyOwner {
        authorizedContracts[contractAddr] = true;
    }

    /**
     * @dev Remove authorized contract
     */
    function removeAuthorizedContract(address contractAddr) external onlyOwner {
        authorizedContracts[contractAddr] = false;
    }

    /**
     * @dev Update maximum stream duration
     */
    function updateMaxStreamDuration(uint256 newMaxDuration) external onlyOwner {
        require(newMaxDuration >= MINIMUM_STREAM_DURATION, "Duration too short");
        maxStreamDuration = newMaxDuration;
    }

    /**
     * @dev Update minimum stream amount
     */
    function updateMinStreamAmount(uint256 newMinAmountSOMI) external onlyOwner {
        minStreamAmountSOMI = newMinAmountSOMI;
    }

    /**
     * @dev Update dispute resolution fee
     */
    function updateDisputeResolutionFee(uint256 newFeeSOMI) external onlyOwner {
        disputeResolutionFeeSOMI = newFeeSOMI;
    }

    /**
     * @dev Update gas price multiplier
     */
    function updateGasPriceMultiplier(uint256 newMultiplier) external onlyOwner {
        require(newMultiplier >= 100 && newMultiplier <= 200, "Invalid multiplier");
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
    function emergencyWithdrawSOMI(uint256 streamId) external onlyOwner {
        Stream storage stream = streams[streamId];
        require(stream.remainingBalanceSOMI > 0, "No balance to withdraw");
        
        uint256 amountSOMI = stream.remainingBalanceSOMI;
        stream.remainingBalanceSOMI = 0;
        stream.active = false;
        stream.finalized = true;
        
        payable(owner()).transfer(amountSOMI);
        emit SOMIPaymentReceived(address(this), owner(), amountSOMI, "Emergency Withdrawal", block.timestamp);
    }

    /**
     * @dev Withdraw platform fees in SOMI
     */
    function withdrawPlatformFeesSOMI() external onlyOwner {
        require(treasury != address(0), "Treasury not set");
        uint256 balanceSOMI = address(this).balance;
        require(balanceSOMI > 0, "No SOMI to withdraw");
        
        payable(treasury).transfer(balanceSOMI);
        emit PlatformFeeWithdrawn(treasury, balanceSOMI, block.timestamp);
    }

    /**
     * @dev Receive function for SOMI
     */
    receive() external payable {
        emit SOMIPaymentReceived(msg.sender, address(this), msg.value, "Direct Payment", block.timestamp);
    }
}
