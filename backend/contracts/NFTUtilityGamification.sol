// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NFTUtilityGamification
 * @dev Gamification system for NFT utility tracking and rewards
 * Adds fun, competitive elements to NFT rentals
 */
contract NFTUtilityGamification is Ownable, ReentrancyGuard {
    
    // Achievement types
    enum AchievementType {
        FIRST_RENTAL,           // First successful rental
        POWER_USER,             // 10+ successful rentals
        COLLECTOR,              // Rented 5+ different NFT types
        SPEED_DEMON,            // Completed rental in <1 minute
        HIGH_ROLLER,            // Spent 1+ ETH on rentals
        COMMUNITY_BUILDER,      // Referred 5+ users
        UTILITY_EXPLORER,       // Tried 3+ different utility types
        STREAK_MASTER,          // 7+ day rental streak
        MICRO_RENTER,           // 100+ micro-rentals (<1 hour)
        NFT_WHISPERER           // Rented same NFT 10+ times
    }
    
    struct Achievement {
        AchievementType achievementType;
        string name;
        string description;
        uint256 points;
        bool isActive;
    }
    
    struct UserProfile {
        uint256 totalPoints;
        uint256 rentalCount;
        uint256 totalSpent;
        uint256 streakDays;
        uint256 lastRentalTime;
        mapping(AchievementType => bool) achievements;
        uint256[] achievementHistory;
    }
    
    struct LeaderboardEntry {
        address user;
        uint256 points;
        uint256 rank;
    }
    
    // State variables
    mapping(address => UserProfile) public userProfiles;
    mapping(AchievementType => Achievement) public achievements;
    mapping(uint256 => address[]) public leaderboard; // rank => users
    mapping(address => uint256) public userRank;
    
    uint256 public totalUsers;
    uint256 public constant LEADERBOARD_SIZE = 100;
    
    // Events
    event AchievementUnlocked(
        address indexed user,
        AchievementType indexed achievementType,
        uint256 points
    );
    
    event PointsEarned(
        address indexed user,
        uint256 points,
        string reason
    );
    
    event LeaderboardUpdated(
        address indexed user,
        uint256 newRank,
        uint256 totalPoints
    );
    
    constructor() {
        _initializeAchievements();
    }
    
    /**
     * @dev Initialize achievement definitions
     */
    function _initializeAchievements() private {
        achievements[AchievementType.FIRST_RENTAL] = Achievement({
            achievementType: AchievementType.FIRST_RENTAL,
            name: "First Steps",
            description: "Complete your first NFT rental",
            points: 100,
            isActive: true
        });
        
        achievements[AchievementType.POWER_USER] = Achievement({
            achievementType: AchievementType.POWER_USER,
            name: "Power User",
            description: "Complete 10+ successful rentals",
            points: 500,
            isActive: true
        });
        
        achievements[AchievementType.COLLECTOR] = Achievement({
            achievementType: AchievementType.COLLECTOR,
            name: "NFT Collector",
            description: "Rent 5+ different types of NFTs",
            points: 300,
            isActive: true
        });
        
        achievements[AchievementType.SPEED_DEMON] = Achievement({
            achievementType: AchievementType.SPEED_DEMON,
            name: "Speed Demon",
            description: "Complete a rental in under 1 minute",
            points: 200,
            isActive: true
        });
        
        achievements[AchievementType.HIGH_ROLLER] = Achievement({
            achievementType: AchievementType.HIGH_ROLLER,
            name: "High Roller",
            description: "Spend 1+ ETH on rentals",
            points: 1000,
            isActive: true
        });
        
        achievements[AchievementType.COMMUNITY_BUILDER] = Achievement({
            achievementType: AchievementType.COMMUNITY_BUILDER,
            name: "Community Builder",
            description: "Refer 5+ users to the platform",
            points: 750,
            isActive: true
        });
        
        achievements[AchievementType.UTILITY_EXPLORER] = Achievement({
            achievementType: AchievementType.UTILITY_EXPLORER,
            name: "Utility Explorer",
            description: "Try 3+ different utility types",
            points: 400,
            isActive: true
        });
        
        achievements[AchievementType.STREAK_MASTER] = Achievement({
            achievementType: AchievementType.STREAK_MASTER,
            name: "Streak Master",
            description: "Maintain 7+ day rental streak",
            points: 600,
            isActive: true
        });
        
        achievements[AchievementType.MICRO_RENTER] = Achievement({
            achievementType: AchievementType.MICRO_RENTER,
            name: "Micro Renter",
            description: "Complete 100+ micro-rentals (<1 hour)",
            points: 800,
            isActive: true
        });
        
        achievements[AchievementType.NFT_WHISPERER] = Achievement({
            achievementType: AchievementType.NFT_WHISPERER,
            name: "NFT Whisperer",
            description: "Rent the same NFT 10+ times",
            points: 350,
            isActive: true
        });
    }
    
    /**
     * @dev Record a successful rental and check for achievements
     * @param user User address
     * @param rentalValue Value of the rental in wei
     * @param duration Duration of rental in seconds
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     */
    function recordRental(
        address user,
        uint256 rentalValue,
        uint256 duration,
        address nftContract,
        uint256 tokenId
    ) external onlyOwner {
        UserProfile storage profile = userProfiles[user];
        
        // Update basic stats
        profile.rentalCount++;
        profile.totalSpent += rentalValue;
        profile.lastRentalTime = block.timestamp;
        
        // Award base points for rental
        uint256 basePoints = _calculateBasePoints(rentalValue, duration);
        profile.totalPoints += basePoints;
        
        emit PointsEarned(user, basePoints, "Rental completed");
        
        // Check for achievements
        _checkAchievements(user, rentalValue, duration, nftContract, tokenId);
        
        // Update leaderboard
        _updateLeaderboard(user);
    }
    
    /**
     * @dev Calculate base points for a rental
     */
    function _calculateBasePoints(uint256 rentalValue, uint256 duration) private pure returns (uint256) {
        // Base points: 1 point per 0.001 ETH spent + bonus for micro-rentals
        uint256 basePoints = rentalValue / 1e15; // Convert wei to 0.001 ETH
        
        // Micro-rental bonus (rentals < 1 hour)
        if (duration < 3600) {
            basePoints = basePoints * 2; // Double points for micro-rentals
        }
        
        return basePoints;
    }
    
    /**
     * @dev Check and unlock achievements for a user
     */
    function _checkAchievements(
        address user,
        uint256 rentalValue,
        uint256 duration,
        address nftContract,
        uint256 tokenId
    ) private {
        UserProfile storage profile = userProfiles[user];
        
        // First Rental
        if (profile.rentalCount == 1 && !profile.achievements[AchievementType.FIRST_RENTAL]) {
            _unlockAchievement(user, AchievementType.FIRST_RENTAL);
        }
        
        // Power User
        if (profile.rentalCount >= 10 && !profile.achievements[AchievementType.POWER_USER]) {
            _unlockAchievement(user, AchievementType.POWER_USER);
        }
        
        // Speed Demon (rental < 1 minute)
        if (duration < 60 && !profile.achievements[AchievementType.SPEED_DEMON]) {
            _unlockAchievement(user, AchievementType.SPEED_DEMON);
        }
        
        // High Roller (spent 1+ ETH)
        if (profile.totalSpent >= 1 ether && !profile.achievements[AchievementType.HIGH_ROLLER]) {
            _unlockAchievement(user, AchievementType.HIGH_ROLLER);
        }
        
        // Micro Renter (100+ micro-rentals)
        if (duration < 3600 && profile.rentalCount >= 100 && !profile.achievements[AchievementType.MICRO_RENTER]) {
            _unlockAchievement(user, AchievementType.MICRO_RENTER);
        }
    }
    
    /**
     * @dev Unlock an achievement for a user
     */
    function _unlockAchievement(address user, AchievementType achievementType) private {
        UserProfile storage profile = userProfiles[user];
        Achievement storage achievement = achievements[achievementType];
        
        require(!profile.achievements[achievementType], "Achievement already unlocked");
        require(achievement.isActive, "Achievement not active");
        
        profile.achievements[achievementType] = true;
        profile.achievementHistory.push(uint256(achievementType));
        profile.totalPoints += achievement.points;
        
        emit AchievementUnlocked(user, achievementType, achievement.points);
    }
    
    /**
     * @dev Update leaderboard rankings
     */
    function _updateLeaderboard(address user) private {
        UserProfile storage profile = userProfiles[user];
        uint256 currentRank = userRank[user];
        uint256 newRank = _calculateRank(user, profile.totalPoints);
        
        if (newRank != currentRank) {
            // Remove from old rank
            if (currentRank > 0) {
                _removeFromLeaderboard(user, currentRank);
            }
            
            // Add to new rank
            if (newRank <= LEADERBOARD_SIZE) {
                leaderboard[newRank].push(user);
                userRank[user] = newRank;
                
                emit LeaderboardUpdated(user, newRank, profile.totalPoints);
            }
        }
    }
    
    /**
     * @dev Calculate user's rank based on points
     */
    function _calculateRank(address user, uint256 points) private view returns (uint256) {
        uint256 rank = 1;
        
        for (uint256 i = 1; i <= LEADERBOARD_SIZE; i++) {
            for (uint256 j = 0; j < leaderboard[i].length; j++) {
                if (leaderboard[i][j] != user && userProfiles[leaderboard[i][j]].totalPoints > points) {
                    rank++;
                }
            }
        }
        
        return rank;
    }
    
    /**
     * @dev Remove user from leaderboard at specific rank
     */
    function _removeFromLeaderboard(address user, uint256 rank) private {
        address[] storage rankUsers = leaderboard[rank];
        for (uint256 i = 0; i < rankUsers.length; i++) {
            if (rankUsers[i] == user) {
                rankUsers[i] = rankUsers[rankUsers.length - 1];
                rankUsers.pop();
                break;
            }
        }
        userRank[user] = 0;
    }
    
    /**
     * @dev Get user profile information
     */
    function getUserProfile(address user) external view returns (
        uint256 totalPoints,
        uint256 rentalCount,
        uint256 totalSpent,
        uint256 streakDays,
        uint256 rank
    ) {
        UserProfile storage profile = userProfiles[user];
        return (
            profile.totalPoints,
            profile.rentalCount,
            profile.totalSpent,
            profile.streakDays,
            userRank[user]
        );
    }
    
    /**
     * @dev Get user's achievements
     */
    function getUserAchievements(address user) external view returns (AchievementType[] memory) {
        UserProfile storage profile = userProfiles[user];
        AchievementType[] memory unlockedAchievements = new AchievementType[](profile.achievementHistory.length);
        
        for (uint256 i = 0; i < profile.achievementHistory.length; i++) {
            unlockedAchievements[i] = AchievementType(profile.achievementHistory[i]);
        }
        
        return unlockedAchievements;
    }
    
    /**
     * @dev Get top leaderboard entries
     */
    function getTopLeaderboard(uint256 count) external view returns (LeaderboardEntry[] memory) {
        require(count <= LEADERBOARD_SIZE, "Count too large");
        
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](count);
        uint256 entryIndex = 0;
        
        for (uint256 rank = 1; rank <= LEADERBOARD_SIZE && entryIndex < count; rank++) {
            for (uint256 i = 0; i < leaderboard[rank].length && entryIndex < count; i++) {
                address user = leaderboard[rank][i];
                entries[entryIndex] = LeaderboardEntry({
                    user: user,
                    points: userProfiles[user].totalPoints,
                    rank: rank
                });
                entryIndex++;
            }
        }
        
        return entries;
    }
    
    /**
     * @dev Get achievement details
     */
    function getAchievement(AchievementType achievementType) external view returns (Achievement memory) {
        return achievements[achievementType];
    }
    
    /**
     * @dev Check if user has specific achievement
     */
    function hasAchievement(address user, AchievementType achievementType) external view returns (bool) {
        return userProfiles[user].achievements[achievementType];
    }
}
