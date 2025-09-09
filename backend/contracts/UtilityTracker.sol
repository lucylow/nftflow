// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UtilityTracker
 * @dev Tracks NFT utility consumption and provides analytics for utility-based pricing
 * This contract enables dynamic pricing based on actual utility usage patterns
 */
contract UtilityTracker is ReentrancyGuard, Ownable {

    // Struct to track utility usage
    struct UtilityUsage {
        address nftContract;
        uint256 tokenId;
        address user;
        uint256 startTime;
        uint256 endTime;
        uint256 utilityType; // 0: Gaming, 1: Art, 2: Metaverse, 3: Real-world
        uint256 utilityValue; // Measured utility consumed
        bool completed;
    }

    // Struct for utility analytics
    struct UtilityAnalytics {
        uint256 totalUsageTime;
        uint256 totalRentals;
        uint256 averageRentalDuration;
        uint256 peakUsageHours; // Most popular rental duration
        uint256 utilityScore; // Calculated utility score (0-100)
        uint256 lastUsed;
    }

    // State variables
    mapping(uint256 => UtilityUsage) public utilityUsages;
    mapping(bytes32 => UtilityAnalytics) public nftAnalytics;
    mapping(address => uint256[]) public userUtilityHistory;
    mapping(address => uint256) public userUtilityScore;
    
    uint256 public nextUsageId;
    uint256 public constant MAX_UTILITY_SCORE = 100;
    
    // Utility type constants
    uint256 public constant GAMING_UTILITY = 0;
    uint256 public constant ART_UTILITY = 1;
    uint256 public constant METAVERSE_UTILITY = 2;
    uint256 public constant REAL_WORLD_UTILITY = 3;

    // Events
    event UtilityUsageRecorded(
        uint256 indexed usageId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address user,
        uint256 utilityType,
        uint256 duration,
        uint256 utilityValue
    );
    
    event UtilityAnalyticsUpdated(
        bytes32 indexed nftKey,
        uint256 utilityScore,
        uint256 totalUsageTime,
        uint256 totalRentals
    );

    /**
     * @dev Record utility usage for an NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID
     * @param user User who consumed the utility
     * @param startTime When utility usage started
     * @param endTime When utility usage ended
     * @param utilityType Type of utility consumed
     * @param utilityValue Amount of utility consumed
     */
    function recordUtilityUsage(
        address nftContract,
        uint256 tokenId,
        address user,
        uint256 startTime,
        uint256 endTime,
        uint256 utilityType,
        uint256 utilityValue
    ) external onlyOwner nonReentrant {
        require(endTime > startTime, "Invalid time range");
        require(utilityType <= REAL_WORLD_UTILITY, "Invalid utility type");
        require(utilityValue > 0, "Utility value must be greater than 0");

        uint256 usageId = nextUsageId++;
        uint256 duration = endTime - startTime;

        utilityUsages[usageId] = UtilityUsage({
            nftContract: nftContract,
            tokenId: tokenId,
            user: user,
            startTime: startTime,
            endTime: endTime,
            utilityType: utilityType,
            utilityValue: utilityValue,
            completed: true
        });

        userUtilityHistory[user].push(usageId);

        // Update NFT analytics
        bytes32 nftKey = keccak256(abi.encodePacked(nftContract, tokenId));
        _updateNFTAnalytics(nftKey, duration, utilityValue);

        // Update user utility score
        _updateUserUtilityScore(user, duration, utilityValue);

        emit UtilityUsageRecorded(usageId, nftContract, tokenId, user, utilityType, duration, utilityValue);
    }

    /**
     * @dev Get utility analytics for an NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID
     * @return UtilityAnalytics struct
     */
    function getNFTAnalytics(address nftContract, uint256 tokenId) external view returns (UtilityAnalytics memory) {
        bytes32 nftKey = keccak256(abi.encodePacked(nftContract, tokenId));
        return nftAnalytics[nftKey];
    }

    /**
     * @dev Get user's utility score
     * @param user User address
     * @return User's utility score (0-100)
     */
    function getUserUtilityScore(address user) external view returns (uint256) {
        return userUtilityScore[user];
    }

    /**
     * @dev Get utility-based pricing recommendation
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID
     * @param basePrice Base price per second
     * @return Recommended price per second based on utility analytics
     */
    function getUtilityBasedPrice(
        address nftContract,
        uint256 tokenId,
        uint256 basePrice
    ) external view returns (uint256) {
        bytes32 nftKey = keccak256(abi.encodePacked(nftContract, tokenId));
        UtilityAnalytics memory analytics = nftAnalytics[nftKey];
        
        if (analytics.totalRentals == 0) {
            return basePrice; // No data, use base price
        }

        // Calculate price multiplier based on utility score
        uint256 priceMultiplier = 100 + (analytics.utilityScore / 2); // 100-150% of base price
        
        return (basePrice * priceMultiplier) / 100;
    }

    /**
     * @dev Get popular rental durations for an NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID
     * @return Most popular rental duration in seconds
     */
    function getPopularRentalDuration(address nftContract, uint256 tokenId) external view returns (uint256) {
        bytes32 nftKey = keccak256(abi.encodePacked(nftContract, tokenId));
        return nftAnalytics[nftKey].peakUsageHours;
    }

    /**
     * @dev Check if an NFT has high utility demand
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID
     * @return True if NFT has high utility demand
     */
    function hasHighUtilityDemand(address nftContract, uint256 tokenId) external view returns (bool) {
        bytes32 nftKey = keccak256(abi.encodePacked(nftContract, tokenId));
        UtilityAnalytics memory analytics = nftAnalytics[nftKey];
        
        return analytics.utilityScore > 70 && analytics.totalRentals > 10;
    }

    /**
     * @dev Get utility usage history for a user
     * @param user User address
     * @return Array of usage IDs
     */
    function getUserUtilityHistory(address user) external view returns (uint256[] memory) {
        return userUtilityHistory[user];
    }

    /**
     * @dev Get utility usage details
     * @param usageId Usage ID
     * @return UtilityUsage struct
     */
    function getUtilityUsage(uint256 usageId) external view returns (UtilityUsage memory) {
        return utilityUsages[usageId];
    }

    /**
     * @dev Update NFT analytics based on new usage
     * @param nftKey NFT key (hash of contract + tokenId)
     * @param duration Duration of usage
     * @param utilityValue Utility value consumed
     */
    function _updateNFTAnalytics(bytes32 nftKey, uint256 duration, uint256 utilityValue) internal {
        UtilityAnalytics storage analytics = nftAnalytics[nftKey];
        
        analytics.totalUsageTime += duration;
        analytics.totalRentals += 1;
        analytics.averageRentalDuration = analytics.totalUsageTime / analytics.totalRentals;
        analytics.lastUsed = block.timestamp;
        
        // Update peak usage hours (simplified - tracks most common duration)
        if (duration > analytics.peakUsageHours) {
            analytics.peakUsageHours = duration;
        }
        
        // Calculate utility score based on usage patterns
        uint256 usageFrequency = analytics.totalRentals;
        uint256 averageDuration = analytics.averageRentalDuration;
        uint256 recency = block.timestamp - analytics.lastUsed;
        
        // Simple utility score calculation (0-100)
        uint256 frequencyScore = (usageFrequency * 10) > 100 ? 100 : (usageFrequency * 10);
        uint256 durationScore = (averageDuration / 3600) > 50 ? 50 : (averageDuration / 3600); // Max 50 for duration
        uint256 recencyScore = recency < 7 days ? 50 : 0; // Bonus for recent usage
        
        analytics.utilityScore = (frequencyScore + durationScore + recencyScore) > MAX_UTILITY_SCORE 
            ? MAX_UTILITY_SCORE 
            : (frequencyScore + durationScore + recencyScore);

        emit UtilityAnalyticsUpdated(nftKey, analytics.utilityScore, analytics.totalUsageTime, analytics.totalRentals);
    }

    /**
     * @dev Update user utility score based on usage
     * @param user User address
     * @param duration Duration of usage
     * @param utilityValue Utility value consumed
     */
    function _updateUserUtilityScore(address user, uint256 duration, uint256 utilityValue) internal {
        uint256 currentScore = userUtilityScore[user];
        
        // Increase score based on usage duration and value
        uint256 scoreIncrease = (duration / 3600) + (utilityValue / 100); // Hours + utility value bonus
        
        userUtilityScore[user] = (currentScore + scoreIncrease) > MAX_UTILITY_SCORE 
            ? MAX_UTILITY_SCORE 
            : (currentScore + scoreIncrease);
    }

    /**
     * @dev Get utility type name
     * @param utilityType Utility type number
     * @return Utility type name
     */
    function getUtilityTypeName(uint256 utilityType) external pure returns (string memory) {
        if (utilityType == GAMING_UTILITY) return "Gaming";
        if (utilityType == ART_UTILITY) return "Art";
        if (utilityType == METAVERSE_UTILITY) return "Metaverse";
        if (utilityType == REAL_WORLD_UTILITY) return "Real World";
        return "Unknown";
    }
}
