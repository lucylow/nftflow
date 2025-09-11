// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title PaymentStreamEnhanced
 * @dev Enhanced payment streaming contract with maximum on-chain impact
 * Achieves 100% on-chain payment processing with real-time operations
 * Leverages Somnia's high throughput for micro-payment streaming
 */
contract PaymentStreamEnhanced is ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;
    using ECDSA for bytes32;

    // ============ ENHANCED STRUCTS ============
    
    struct Stream {
        address sender;
        address recipient;
        uint256 deposit;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 stopTime;
        uint256 remainingBalance;
        uint256 totalWithdrawn;
        bool active;
        bool finalized;
        bool disputed;
        uint256 platformFeeAmount;
        uint256 creatorRoyaltyAmount;
        address creatorAddress;
        uint256[] milestones; // On-chain milestone tracking
        uint256 currentMilestone;
        StreamType streamType;
        uint256 lastReleaseTime;
        uint256 totalReleases;
        StreamMetadata metadata;
    }

    struct StreamMetadata {
        string description;
        string category;
        uint256 priority; // Higher priority streams get processed first
        bool autoRelease; // Automatic release enabled
        uint256 releaseInterval; // Seconds between auto-releases
        uint256 lastAutoRelease;
    }

    struct Milestone {
        uint256 timestamp;
        uint256 amount;
        bool reached;
        string description;
    }

    struct StreamAnalytics {
        uint256 totalStreams;
        uint256 totalVolume;
        uint256 activeStreams;
        uint256 completedStreams;
        uint256 disputedStreams;
        uint256 totalFees;
        uint256 totalRoyalties;
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
    mapping(address => StreamAnalytics) public userAnalytics;
    
    uint256 public nextStreamId;
    uint256 public constant MINIMUM_STREAM_DURATION = 1; // 1 second
    uint256 public constant BASIS_POINTS = 10000;
    
    // Enhanced fee structure
    uint256 public platformFeePercentage = 250; // 2.5%
    uint256 public creatorRoyaltyPercentage = 50; // 0.5%
    uint256 public disputeResolutionFee = 0.01 ether;
    
    address public treasury;
    address public disputeResolver;
    mapping(address => address) public collectionCreators;
    
    // Security and automation
    mapping(address => bool) public authorizedContracts;
    mapping(address => bool) public autoReleaseEnabled;
    uint256 public maxStreamDuration = 31536000; // 1 year
    uint256 public minStreamAmount = 0.000001 ether; // Minimum viable stream
    
    // On-chain analytics
    StreamAnalytics public globalAnalytics;
    mapping(uint256 => uint256) public dailyVolume;
    mapping(uint256 => uint256) public dailyStreams;
    
    // ============ EVENTS ============
    
    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 deposit,
        uint256 ratePerSecond,
        uint256 startTime,
        uint256 stopTime,
        StreamType streamType,
        uint256[] milestones
    );
    
    event StreamWithdrawn(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount,
        uint256 totalWithdrawn,
        uint256 timestamp
    );
    
    event StreamCancelled(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 senderBalance,
        uint256 recipientBalance,
        uint256 timestamp
    );
    
    event StreamFinalized(
        uint256 indexed streamId,
        uint256 totalPaid,
        uint256 platformFeeCollected,
        uint256 creatorRoyaltyCollected,
        uint256 timestamp
    );
    
    event MilestoneReached(
        uint256 indexed streamId,
        uint256 milestoneIndex,
        uint256 amount,
        uint256 timestamp
    );
    
    event AutoReleaseExecuted(
        uint256 indexed streamId,
        uint256 amount,
        uint256 timestamp
    );
    
    event StreamDisputed(
        uint256 indexed streamId,
        address indexed disputer,
        string reason,
        uint256 timestamp
    );
    
    event DisputeResolved(
        uint256 indexed streamId,
        address indexed resolver,
        bool resolvedInFavorOfRecipient,
        uint256 refundAmount
    );
    
    event PlatformFeeWithdrawn(
        address indexed treasury,
        uint256 amount,
        uint256 timestamp
    );
    
    event CreatorRoyaltyPaid(
        address indexed creator,
        uint256 amount,
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

    // ============ CONSTRUCTOR ============
    
    constructor(address _treasury, address _disputeResolver) Ownable() {
        treasury = _treasury != address(0) ? _treasury : msg.sender;
        disputeResolver = _disputeResolver != address(0) ? _disputeResolver : msg.sender;
    }

    // ============ CORE STREAMING FUNCTIONS ============

    /**
     * @dev Create enhanced payment stream with milestone tracking
     */
    function createStream(
        address recipient,
        uint256 startTime,
        uint256 stopTime,
        address nftContract,
        uint256[] memory milestones
    ) external payable nonReentrant whenNotPaused returns (uint256 streamId) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot stream to self");
        require(msg.value >= minStreamAmount, "Deposit too small");
        require(startTime >= block.timestamp, "Start time in the past");
        require(stopTime > startTime, "Stop time before start time");
        
        uint256 duration = stopTime.sub(startTime);
        require(duration >= MINIMUM_STREAM_DURATION, "Duration too short");
        require(duration <= maxStreamDuration, "Duration too long");
        
        // Calculate enhanced fees
        uint256 platformFeeAmount = msg.value.mul(platformFeePercentage).div(BASIS_POINTS);
        uint256 creatorRoyaltyAmount = msg.value.mul(creatorRoyaltyPercentage).div(BASIS_POINTS);
        uint256 netAmount = msg.value.sub(platformFeeAmount).sub(creatorRoyaltyAmount);
        
        uint256 ratePerSecond = netAmount.div(duration);
        require(ratePerSecond > 0, "Rate per second must be greater than 0");

        streamId = nextStreamId++;
        
        // Create stream metadata
        StreamMetadata memory metadata = StreamMetadata({
            description: "NFT Rental Payment Stream",
            category: "Rental",
            priority: 1,
            autoRelease: true,
            releaseInterval: 3600, // 1 hour auto-release
            lastAutoRelease: startTime
        });
        
        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            deposit: netAmount,
            ratePerSecond: ratePerSecond,
            startTime: startTime,
            stopTime: stopTime,
            remainingBalance: netAmount,
            totalWithdrawn: 0,
            active: true,
            finalized: false,
            disputed: false,
            platformFeeAmount: platformFeeAmount,
            creatorRoyaltyAmount: creatorRoyaltyAmount,
            creatorAddress: collectionCreators[nftContract],
            milestones: milestones,
            currentMilestone: 0,
            streamType: StreamType.RENTAL,
            lastReleaseTime: startTime,
            totalReleases: 0,
            metadata: metadata
        });

        // Update tracking arrays
        senderStreams[msg.sender].push(streamId);
        recipientStreams[recipient].push(streamId);
        if (collectionCreators[nftContract] != address(0)) {
            creatorStreams[collectionCreators[nftContract]].push(streamId);
        }
        
        // Update analytics
        _updateStreamAnalytics(msg.sender, recipient, msg.value, true);
        _updateDailyAnalytics(msg.value, 1);
        
        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            netAmount,
            ratePerSecond,
            startTime,
            stopTime,
            StreamType.RENTAL,
            milestones
        );
        
        return streamId;
    }

    /**
     * @dev Enhanced balance calculation with milestone consideration
     */
    function balanceOf(uint256 streamId) external view returns (uint256) {
        Stream memory stream = streams[streamId];
        require(stream.sender != address(0), "Stream does not exist");
        
        if (block.timestamp <= stream.startTime) {
            return 0;
        }
        
        if (block.timestamp >= stream.stopTime) {
            return stream.remainingBalance;
        }
        
        uint256 elapsedTime = block.timestamp.sub(stream.startTime);
        uint256 availableAmount = elapsedTime.mul(stream.ratePerSecond);
        uint256 totalWithdrawn = stream.deposit.sub(stream.remainingBalance);
        
        // Check milestone restrictions
        uint256 milestoneRestrictedAmount = _calculateMilestoneRestrictedAmount(streamId, availableAmount);
        
        return milestoneRestrictedAmount.sub(totalWithdrawn);
    }

    /**
     * @dev Enhanced withdrawal with milestone tracking
     */
    function withdrawFromStream(uint256 streamId, uint256 amount) external nonReentrant whenNotPaused {
        Stream storage stream = streams[streamId];
        require(stream.recipient == msg.sender, "Not the recipient");
        require(stream.active && !stream.finalized, "Stream not active");
        require(!stream.disputed, "Stream under dispute");
        
        uint256 availableBalance = this.balanceOf(streamId);
        require(availableBalance > 0, "No funds available");
        
        uint256 withdrawAmount = amount == 0 ? availableBalance : amount;
        require(withdrawAmount <= availableBalance, "Insufficient balance");
        require(withdrawAmount <= stream.remainingBalance, "Exceeds remaining balance");
        
        // Update stream state
        stream.remainingBalance = stream.remainingBalance.sub(withdrawAmount);
        stream.totalWithdrawn = stream.totalWithdrawn.add(withdrawAmount);
        stream.lastReleaseTime = block.timestamp;
        stream.totalReleases++;
        
        // Check for milestone completion
        _checkMilestoneCompletion(streamId, withdrawAmount);
        
        // Transfer funds
        payable(msg.sender).transfer(withdrawAmount);
        
        // Update analytics
        _updateStreamAnalytics(stream.sender, msg.sender, withdrawAmount, false);
        
        emit StreamWithdrawn(streamId, msg.sender, withdrawAmount, stream.totalWithdrawn, block.timestamp);
    }

    /**
     * @dev Automatic fund release for enabled streams
     */
    function releaseFunds(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(stream.active && !stream.finalized, "Stream not active");
        require(block.timestamp >= stream.startTime, "Stream not started");
        require(!stream.disputed, "Stream under dispute");
        
        // Check if auto-release is enabled and interval has passed
        if (stream.metadata.autoRelease && 
            block.timestamp >= stream.metadata.lastAutoRelease.add(stream.metadata.releaseInterval)) {
            
            uint256 availableBalance = this.balanceOf(streamId);
            if (availableBalance > 0) {
                stream.remainingBalance = stream.remainingBalance.sub(availableBalance);
                stream.totalWithdrawn = stream.totalWithdrawn.add(availableBalance);
                stream.lastReleaseTime = block.timestamp;
                stream.totalReleases++;
                stream.metadata.lastAutoRelease = block.timestamp;
                
                // Check for milestone completion
                _checkMilestoneCompletion(streamId, availableBalance);
                
                payable(stream.recipient).transfer(availableBalance);
                
                emit AutoReleaseExecuted(streamId, availableBalance, block.timestamp);
            }
        }
    }

    /**
     * @dev Batch release funds for multiple streams
     */
    function batchReleaseFunds(uint256[] calldata streamIds) external nonReentrant {
        for (uint256 i = 0; i < streamIds.length; i++) {
            this.releaseFunds(streamIds[i]);
        }
    }

    /**
     * @dev Enhanced stream finalization with comprehensive settlement
     */
    function finalizeStream(uint256 streamId) external onlyAuthorized {
        Stream storage stream = streams[streamId];
        require(stream.active && !stream.finalized, "Stream not active");
        
        stream.active = false;
        stream.finalized = true;
        
        // Transfer any remaining balance to recipient
        if (stream.remainingBalance > 0) {
            payable(stream.recipient).transfer(stream.remainingBalance);
            stream.totalWithdrawn = stream.totalWithdrawn.add(stream.remainingBalance);
            stream.remainingBalance = 0;
        }
        
        // Distribute platform fee to treasury
        if (stream.platformFeeAmount > 0 && treasury != address(0)) {
            payable(treasury).transfer(stream.platformFeeAmount);
            emit PlatformFeeWithdrawn(treasury, stream.platformFeeAmount, block.timestamp);
        }
        
        // Distribute creator royalty
        if (stream.creatorRoyaltyAmount > 0 && stream.creatorAddress != address(0)) {
            payable(stream.creatorAddress).transfer(stream.creatorRoyaltyAmount);
            emit CreatorRoyaltyPaid(stream.creatorAddress, stream.creatorRoyaltyAmount, block.timestamp);
        }
        
        // Update analytics
        globalAnalytics.completedStreams++;
        globalAnalytics.totalFees = globalAnalytics.totalFees.add(stream.platformFeeAmount);
        globalAnalytics.totalRoyalties = globalAnalytics.totalRoyalties.add(stream.creatorRoyaltyAmount);
        
        emit StreamFinalized(
            streamId,
            stream.totalWithdrawn,
            stream.platformFeeAmount,
            stream.creatorRoyaltyAmount,
            block.timestamp
        );
    }

    // ============ DISPUTE RESOLUTION ============

    /**
     * @dev Create stream dispute
     */
    function createDispute(uint256 streamId, string memory reason) external payable {
        Stream storage stream = streams[streamId];
        require(stream.active, "Stream not active");
        require(msg.sender == stream.sender || msg.sender == stream.recipient, "Not authorized");
        require(!stream.disputed, "Dispute already exists");
        require(msg.value >= disputeResolutionFee, "Insufficient dispute fee");
        
        stream.disputed = true;
        globalAnalytics.disputedStreams++;
        
        emit StreamDisputed(streamId, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Resolve stream dispute
     */
    function resolveDispute(
        uint256 streamId,
        bool resolvedInFavorOfRecipient,
        uint256 refundAmount
    ) external onlyDisputeResolver {
        Stream storage stream = streams[streamId];
        require(stream.disputed, "No dispute exists");
        
        if (refundAmount > 0) {
            if (resolvedInFavorOfRecipient) {
                payable(stream.recipient).transfer(refundAmount);
            } else {
                payable(stream.sender).transfer(refundAmount);
            }
        }
        
        stream.active = false;
        stream.finalized = true;
        
        emit DisputeResolved(streamId, msg.sender, resolvedInFavorOfRecipient, refundAmount);
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
     * @dev Get stream analytics
     */
    function getStreamAnalytics(uint256 streamId) external view returns (
        uint256 totalStreamed,
        uint256 remainingBalance,
        uint256 totalReleases,
        uint256 currentMilestone,
        bool isActive,
        bool isDisputed
    ) {
        Stream memory stream = streams[streamId];
        uint256 totalStreamed = stream.deposit.sub(stream.remainingBalance);
        
        return (
            totalStreamed,
            stream.remainingBalance,
            stream.totalReleases,
            stream.currentMilestone,
            stream.active,
            stream.disputed
        );
    }

    /**
     * @dev Get user analytics
     */
    function getUserAnalytics(address user) external view returns (StreamAnalytics memory) {
        return userAnalytics[user];
    }

    /**
     * @dev Get global analytics
     */
    function getGlobalAnalytics() external view returns (StreamAnalytics memory) {
        return globalAnalytics;
    }

    /**
     * @dev Get daily analytics
     */
    function getDailyAnalytics(uint256 day) external view returns (
        uint256 volume,
        uint256 streams
    ) {
        return (dailyVolume[day], dailyStreams[day]);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Calculate milestone-restricted amount
     */
    function _calculateMilestoneRestrictedAmount(uint256 streamId, uint256 availableAmount) internal view returns (uint256) {
        Stream memory stream = streams[streamId];
        
        if (stream.milestones.length == 0) {
            return availableAmount;
        }
        
        uint256 milestoneAmount = 0;
        for (uint256 i = 0; i <= stream.currentMilestone && i < stream.milestones.length; i++) {
            milestoneAmount = milestoneAmount.add(stream.milestones[i]);
        }
        
        return availableAmount > milestoneAmount ? milestoneAmount : availableAmount;
    }

    /**
     * @dev Check milestone completion
     */
    function _checkMilestoneCompletion(uint256 streamId, uint256 amount) internal {
        Stream storage stream = streams[streamId];
        
        if (stream.milestones.length > 0 && stream.currentMilestone < stream.milestones.length) {
            uint256 milestoneAmount = stream.milestones[stream.currentMilestone];
            if (stream.totalWithdrawn >= milestoneAmount) {
                stream.currentMilestone = stream.currentMilestone.add(1);
                emit MilestoneReached(streamId, stream.currentMilestone.sub(1), milestoneAmount, block.timestamp);
            }
        }
    }

    /**
     * @dev Update stream analytics
     */
    function _updateStreamAnalytics(
        address sender,
        address recipient,
        uint256 amount,
        bool isNewStream
    ) internal {
        if (isNewStream) {
            userAnalytics[sender].totalStreams++;
            userAnalytics[recipient].totalStreams++;
            globalAnalytics.totalStreams++;
            globalAnalytics.activeStreams++;
        }
        
        userAnalytics[sender].totalVolume = userAnalytics[sender].totalVolume.add(amount);
        userAnalytics[recipient].totalVolume = userAnalytics[recipient].totalVolume.add(amount);
        globalAnalytics.totalVolume = globalAnalytics.totalVolume.add(amount);
    }

    /**
     * @dev Update daily analytics
     */
    function _updateDailyAnalytics(uint256 volume, uint256 streamCount) internal {
        uint256 day = block.timestamp / 86400; // Days since epoch
        dailyVolume[day] = dailyVolume[day].add(volume);
        dailyStreams[day] = dailyStreams[day].add(streamCount);
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
    function updateMinStreamAmount(uint256 newMinAmount) external onlyOwner {
        minStreamAmount = newMinAmount;
    }

    /**
     * @dev Update dispute resolution fee
     */
    function updateDisputeResolutionFee(uint256 newFee) external onlyOwner {
        disputeResolutionFee = newFee;
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
     * @dev Emergency withdraw
     */
    function emergencyWithdraw(uint256 streamId) external onlyOwner {
        Stream storage stream = streams[streamId];
        require(stream.remainingBalance > 0, "No balance to withdraw");
        
        uint256 amount = stream.remainingBalance;
        stream.remainingBalance = 0;
        stream.active = false;
        stream.finalized = true;
        
        payable(owner()).transfer(amount);
    }

    /**
     * @dev Receive function
     */
    receive() external payable {}
}
