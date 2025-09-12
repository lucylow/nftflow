// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SomniaPaymentStream
 * @dev Real-time micro-payment streaming optimized for Somnia Network
 * Leverages sub-cent fees for per-second payments and real-time streaming
 * Optimized for Somnia's 1-second block times and low transaction costs
 */
contract SomniaPaymentStream is Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;

    // ============ STRUCTS ============
    
    struct MicroStream {
        address sender;
        address recipient;
        uint256 ratePerSecond; // Can be very small due to low fees
        uint256 startTime;
        uint256 lastClaim;
        uint256 totalStreamed;
        bool active;
        string description;
        uint256 maxDuration; // Maximum stream duration
        uint256 minClaimAmount; // Minimum amount to claim
    }
    
    struct StreamStats {
        uint256 totalStreams;
        uint256 totalVolume;
        uint256 totalFees;
        uint256 averageStreamDuration;
        uint256 averageStreamRate;
    }
    
    struct UserStreamStats {
        uint256 totalStreamsCreated;
        uint256 totalStreamsReceived;
        uint256 totalVolumeStreamed;
        uint256 totalVolumeReceived;
        uint256 averageStreamRate;
        uint256 lastStreamTime;
    }

    // ============ STATE VARIABLES ============
    
    // Stream management
    mapping(uint256 => MicroStream) public microStreams;
    uint256 public nextStreamId = 1;
    
    // User statistics
    mapping(address => UserStreamStats) public userStats;
    mapping(address => uint256[]) public userStreams;
    mapping(address => uint256[]) public userReceivedStreams;
    
    // Platform statistics
    StreamStats public platformStats;
    
    // Fee configuration (optimized for Somnia's low costs)
    uint256 public platformFeePercentage = 25; // 0.25% (25 basis points)
    uint256 public minStreamRate = 1 wei; // 1 wei per second minimum
    uint256 public maxStreamRate = 1 ether; // 1 ether per second maximum
    uint256 public minStreamDuration = 60; // 1 minute minimum
    uint256 public maxStreamDuration = 31536000; // 1 year maximum
    
    // Gas optimization
    uint256 public gasPriceMultiplier = 100; // 1x for Somnia's low fees
    uint256 public maxGasPrice = 5 gwei; // Very low for Somnia
    
    // ============ EVENTS ============
    
    event MicroStreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 ratePerSecond,
        uint256 maxDuration,
        string description
    );
    
    event MicroPaymentClaimed(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event StreamCancelled(
        uint256 indexed streamId,
        address indexed sender,
        uint256 totalStreamed
    );
    
    event StreamCompleted(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 totalStreamed,
        uint256 duration
    );
    
    event StreamRateUpdated(
        uint256 indexed streamId,
        uint256 oldRate,
        uint256 newRate
    );
    
    event PlatformFeeUpdated(uint256 newFeePercentage);
    event StreamLimitsUpdated(
        uint256 newMinRate,
        uint256 newMaxRate,
        uint256 newMinDuration,
        uint256 newMaxDuration
    );

    // ============ MODIFIERS ============
    
    modifier onlyStreamSender(uint256 streamId) {
        require(microStreams[streamId].sender == msg.sender, "Not stream sender");
        _;
    }
    
    modifier onlyStreamRecipient(uint256 streamId) {
        require(microStreams[streamId].recipient == msg.sender, "Not stream recipient");
        _;
    }
    
    modifier streamExists(uint256 streamId) {
        require(streamId > 0 && streamId < nextStreamId, "Stream does not exist");
        _;
    }
    
    modifier streamActive(uint256 streamId) {
        require(microStreams[streamId].active, "Stream not active");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() Ownable() {
        platformStats = StreamStats({
            totalStreams: 0,
            totalVolume: 0,
            totalFees: 0,
            averageStreamDuration: 0,
            averageStreamRate: 0
        });
    }

    // ============ CORE STREAMING FUNCTIONS ============

    /**
     * @dev Create a micro-payment stream
     * Optimized for Somnia's sub-cent fees and fast finality
     */
    function createMicroStream(
        address recipient,
        uint256 ratePerSecond,
        uint256 maxDuration,
        string memory description
    ) external payable nonReentrant whenNotPaused {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot stream to self");
        require(ratePerSecond >= minStreamRate, "Rate too low");
        require(ratePerSecond <= maxStreamRate, "Rate too high");
        require(maxDuration >= minStreamDuration, "Duration too short");
        require(maxDuration <= maxStreamDuration, "Duration too long");
        require(bytes(description).length <= 200, "Description too long");
        
        // Calculate required payment for maximum duration
        uint256 maxPayment = ratePerSecond.mul(maxDuration);
        require(msg.value >= maxPayment, "Insufficient payment");
        
        uint256 streamId = nextStreamId++;
        
        microStreams[streamId] = MicroStream({
            sender: msg.sender,
            recipient: recipient,
            ratePerSecond: ratePerSecond,
            startTime: block.timestamp,
            lastClaim: block.timestamp,
            totalStreamed: 0,
            active: true,
            description: description,
            maxDuration: maxDuration,
            minClaimAmount: ratePerSecond.mul(10) // 10 seconds worth
        });
        
        // Update user statistics
        userStats[msg.sender].totalStreamsCreated = userStats[msg.sender].totalStreamsCreated.add(1);
        userStats[msg.sender].totalVolumeStreamed = userStats[msg.sender].totalVolumeStreamed.add(maxPayment);
        userStats[msg.sender].averageStreamRate = _calculateAverageStreamRate(msg.sender);
        userStats[msg.sender].lastStreamTime = block.timestamp;
        
        userStats[recipient].totalStreamsReceived = userStats[recipient].totalStreamsReceived.add(1);
        userStats[recipient].lastStreamTime = block.timestamp;
        
        // Update user stream lists
        userStreams[msg.sender].push(streamId);
        userReceivedStreams[recipient].push(streamId);
        
        // Update platform statistics
        platformStats.totalStreams = platformStats.totalStreams.add(1);
        platformStats.totalVolume = platformStats.totalVolume.add(maxPayment);
        platformStats.averageStreamRate = _calculatePlatformAverageRate();
        
        emit MicroStreamCreated(streamId, msg.sender, recipient, ratePerSecond, maxDuration, description);
    }

    /**
     * @dev Claim micro-payment from stream
     * Can be called frequently due to Somnia's low fees
     */
    function claimMicroPayment(uint256 streamId) external nonReentrant whenNotPaused 
        streamExists(streamId) streamActive(streamId) onlyStreamRecipient(streamId) {
        
        MicroStream storage stream = microStreams[streamId];
        
        // Calculate elapsed time since last claim
        uint256 elapsed = block.timestamp.sub(stream.lastClaim);
        require(elapsed > 0, "No time elapsed");
        
        // Calculate claimable amount
        uint256 claimableAmount = elapsed.mul(stream.ratePerSecond);
        
        // Check if stream has reached maximum duration
        uint256 totalElapsed = block.timestamp.sub(stream.startTime);
        if (totalElapsed >= stream.maxDuration) {
            // Stream completed, claim remaining amount
            claimableAmount = stream.ratePerSecond.mul(stream.maxDuration).sub(stream.totalStreamed);
            stream.active = false;
            
            emit StreamCompleted(streamId, stream.sender, stream.recipient, stream.totalStreamed.add(claimableAmount), totalElapsed);
        }
        
        require(claimableAmount > 0, "No amount to claim");
        require(claimableAmount >= stream.minClaimAmount, "Amount below minimum");
        
        // Calculate platform fee
        uint256 platformFee = claimableAmount.mul(platformFeePercentage).div(10000);
        uint256 netAmount = claimableAmount.sub(platformFee);
        
        // Update stream state
        stream.lastClaim = block.timestamp;
        stream.totalStreamed = stream.totalStreamed.add(claimableAmount);
        
        // Update user statistics
        userStats[stream.recipient].totalVolumeReceived = userStats[stream.recipient].totalVolumeReceived.add(netAmount);
        
        // Update platform statistics
        platformStats.totalFees = platformStats.totalFees.add(platformFee);
        
        // Transfer payment
        if (netAmount > 0) {
            payable(stream.recipient).transfer(netAmount);
        }
        
        // Transfer platform fee to owner
        if (platformFee > 0) {
            payable(owner()).transfer(platformFee);
        }
        
        emit MicroPaymentClaimed(streamId, stream.recipient, netAmount, block.timestamp);
    }

    /**
     * @dev Cancel stream and refund remaining amount
     */
    function cancelStream(uint256 streamId) external nonReentrant whenNotPaused 
        streamExists(streamId) streamActive(streamId) onlyStreamSender(streamId) {
        
        MicroStream storage stream = microStreams[streamId];
        
        // Calculate remaining amount
        uint256 totalElapsed = block.timestamp.sub(stream.startTime);
        uint256 totalStreamed = stream.totalStreamed;
        uint256 maxStreamAmount = stream.ratePerSecond.mul(stream.maxDuration);
        uint256 remainingAmount = maxStreamAmount.sub(totalStreamed);
        
        // Deactivate stream
        stream.active = false;
        
        // Refund remaining amount
        if (remainingAmount > 0) {
            payable(stream.sender).transfer(remainingAmount);
        }
        
        emit StreamCancelled(streamId, stream.sender, totalStreamed);
    }

    /**
     * @dev Update stream rate (only sender)
     */
    function updateStreamRate(uint256 streamId, uint256 newRate) external nonReentrant whenNotPaused 
        streamExists(streamId) streamActive(streamId) onlyStreamSender(streamId) {
        
        require(newRate >= minStreamRate, "Rate too low");
        require(newRate <= maxStreamRate, "Rate too high");
        
        MicroStream storage stream = microStreams[streamId];
        uint256 oldRate = stream.ratePerSecond;
        stream.ratePerSecond = newRate;
        
        emit StreamRateUpdated(streamId, oldRate, newRate);
    }

    /**
     * @dev Batch claim from multiple streams
     * Optimized for Somnia's high TPS
     */
    function batchClaimMicroPayments(uint256[] calldata streamIds) external nonReentrant whenNotPaused {
        require(streamIds.length > 0, "No streams provided");
        require(streamIds.length <= 100, "Too many streams"); // Reasonable limit
        
        uint256 totalClaimed = 0;
        uint256 totalFees = 0;
        
        for (uint256 i = 0; i < streamIds.length; i++) {
            uint256 streamId = streamIds[i];
            
            if (microStreams[streamId].recipient == msg.sender && microStreams[streamId].active) {
                uint256 claimableAmount = _calculateClaimableAmount(streamId);
                
                if (claimableAmount > 0) {
                    uint256 platformFee = claimableAmount.mul(platformFeePercentage).div(10000);
                    uint256 netAmount = claimableAmount.sub(platformFee);
                    
                    // Update stream state
                    microStreams[streamId].lastClaim = block.timestamp;
                    microStreams[streamId].totalStreamed = microStreams[streamId].totalStreamed.add(claimableAmount);
                    
                    totalClaimed = totalClaimed.add(netAmount);
                    totalFees = totalFees.add(platformFee);
                }
            }
        }
        
        // Transfer total claimed amount
        if (totalClaimed > 0) {
            payable(msg.sender).transfer(totalClaimed);
        }
        
        // Transfer total fees to owner
        if (totalFees > 0) {
            payable(owner()).transfer(totalFees);
        }
        
        // Update user statistics
        userStats[msg.sender].totalVolumeReceived = userStats[msg.sender].totalVolumeReceived.add(totalClaimed);
        
        // Update platform statistics
        platformStats.totalFees = platformStats.totalFees.add(totalFees);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get stream information
     */
    function getStream(uint256 streamId) external view streamExists(streamId) returns (MicroStream memory) {
        return microStreams[streamId];
    }

    /**
     * @dev Get claimable amount for a stream
     */
    function getClaimableAmount(uint256 streamId) external view streamExists(streamId) returns (uint256) {
        return _calculateClaimableAmount(streamId);
    }

    /**
     * @dev Get user stream statistics
     */
    function getUserStreamStats(address user) external view returns (UserStreamStats memory) {
        return userStats[user];
    }

    /**
     * @dev Get user's active streams
     */
    function getUserActiveStreams(address user) external view returns (uint256[] memory) {
        uint256[] memory activeStreams = new uint256[](userStreams[user].length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < userStreams[user].length; i++) {
            uint256 streamId = userStreams[user][i];
            if (microStreams[streamId].active) {
                activeStreams[count] = streamId;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeStreams[i];
        }
        
        return result;
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (StreamStats memory) {
        return platformStats;
    }

    /**
     * @dev Get stream limits and fees
     */
    function getStreamLimits() external view returns (
        uint256 minRate,
        uint256 maxRate,
        uint256 minDuration,
        uint256 maxDuration,
        uint256 platformFee
    ) {
        return (minStreamRate, maxStreamRate, minStreamDuration, maxStreamDuration, platformFeePercentage);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Calculate claimable amount for a stream
     */
    function _calculateClaimableAmount(uint256 streamId) internal view returns (uint256) {
        MicroStream memory stream = microStreams[streamId];
        
        if (!stream.active) return 0;
        
        uint256 elapsed = block.timestamp.sub(stream.lastClaim);
        if (elapsed == 0) return 0;
        
        uint256 claimableAmount = elapsed.mul(stream.ratePerSecond);
        
        // Check if stream has reached maximum duration
        uint256 totalElapsed = block.timestamp.sub(stream.startTime);
        if (totalElapsed >= stream.maxDuration) {
            uint256 maxStreamAmount = stream.ratePerSecond.mul(stream.maxDuration);
            claimableAmount = maxStreamAmount.sub(stream.totalStreamed);
        }
        
        return claimableAmount;
    }

    /**
     * @dev Calculate average stream rate for user
     */
    function _calculateAverageStreamRate(address user) internal view returns (uint256) {
        UserStreamStats memory stats = userStats[user];
        if (stats.totalStreamsCreated == 0) return 0;
        
        // This is a simplified calculation
        // In a real implementation, you'd track individual stream rates
        return stats.totalVolumeStreamed.div(stats.totalStreamsCreated);
    }

    /**
     * @dev Calculate platform average stream rate
     */
    function _calculatePlatformAverageRate() internal view returns (uint256) {
        if (platformStats.totalStreams == 0) return 0;
        return platformStats.totalVolume.div(platformStats.totalStreams);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update platform fee percentage
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = newFeePercentage;
        emit PlatformFeeUpdated(newFeePercentage);
    }

    /**
     * @dev Update stream limits
     */
    function updateStreamLimits(
        uint256 newMinRate,
        uint256 newMaxRate,
        uint256 newMinDuration,
        uint256 newMaxDuration
    ) external onlyOwner {
        require(newMinRate > 0, "Min rate must be greater than 0");
        require(newMaxRate >= newMinRate, "Max rate must be >= min rate");
        require(newMinDuration > 0, "Min duration must be greater than 0");
        require(newMaxDuration >= newMinDuration, "Max duration must be >= min duration");
        
        minStreamRate = newMinRate;
        maxStreamRate = newMaxRate;
        minStreamDuration = newMinDuration;
        maxStreamDuration = newMaxDuration;
        
        emit StreamLimitsUpdated(newMinRate, newMaxRate, newMinDuration, newMaxDuration);
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

