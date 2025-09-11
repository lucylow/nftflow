// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title AchievementSystem
 * @dev On-chain achievement system with badges, rewards, and social features
 * Tracks user milestones and provides gamification elements
 */
contract AchievementSystem is Ownable, ReentrancyGuard {
    
    // Achievement structure
    struct Achievement {
        string name;
        string description;
        string imageUri;
        uint256 requirement;
        uint256 reward; // STT reward
        uint256 xpReward; // Experience points
        bool isActive;
        bool isRare; // Rare achievements have special effects
        uint256 maxHolders; // 0 = unlimited
        uint256 currentHolders;
        uint256 category; // 0: Rental, 1: Social, 2: Trading, 3: Special
    }
    
    // User achievement data
    struct UserAchievement {
        string achievementName;
        uint256 unlockedAt;
        uint256 xpEarned;
        bool isActive;
    }
    
    // User profile
    struct UserProfile {
        uint256 totalXP;
        uint256 level;
        uint256 totalAchievements;
        uint256 rentalCount;
        uint256 socialShares;
        uint256 tradingVolume;
        uint256 lastActivity;
        string[] unlockedAchievements;
        mapping(string => UserAchievement) achievementData;
    }
    
    // Achievement categories
    enum AchievementCategory {
        RENTAL,     // 0: Rental-related achievements
        SOCIAL,     // 1: Social sharing and community
        TRADING,    // 2: Trading and volume
        SPECIAL     // 3: Special events and rare
    }
    
    // State variables
    mapping(string => Achievement) public achievements;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => uint256) public userLevels;
    mapping(address => uint256) public userXP;
    
    string[] public achievementNames;
    address[] public allUsers;
    mapping(address => bool) public isUserRegistered;
    
    // XP and leveling system
    uint256 public constant XP_PER_LEVEL = 1000;
    uint256 public constant MAX_LEVEL = 100;
    uint256 public constant RENTAL_XP = 10;
    uint256 public constant SOCIAL_XP = 5;
    uint256 public constant TRADING_XP = 20;
    
    // Events
    event AchievementUnlocked(
        address indexed user,
        string indexed achievementName,
        uint256 xpEarned,
        uint256 reward
    );
    
    event UserLevelUp(
        address indexed user,
        uint256 oldLevel,
        uint256 newLevel,
        uint256 totalXP
    );
    
    event AchievementCreated(
        string indexed achievementName,
        uint256 requirement,
        uint256 reward,
        uint256 category
    );
    
    event SocialShare(
        address indexed user,
        string platform,
        uint256 rentalId,
        uint256 xpEarned
    );
    
    constructor() {
        _initializeDefaultAchievements();
    }
    
    /**
     * @dev Register user for achievement tracking
     * @param user User address
     */
    function registerUser(address user) external {
        require(!isUserRegistered[user], "User already registered");
        
        isUserRegistered[user] = true;
        allUsers.push(user);
        
        userProfiles[user].level = 1;
        userProfiles[user].totalXP = 0;
        userProfiles[user].totalAchievements = 0;
        userProfiles[user].rentalCount = 0;
        userProfiles[user].socialShares = 0;
        userProfiles[user].tradingVolume = 0;
        userProfiles[user].lastActivity = block.timestamp;
    }
    
    /**
     * @dev Record rental activity and check achievements
     * @param user User address
     * @param duration Rental duration in seconds
     * @param pricePaid Price paid for rental
     */
    function recordRentalActivity(
        address user,
        uint256 duration,
        uint256 pricePaid
    ) external {
        require(isUserRegistered[user], "User not registered");
        
        UserProfile storage profile = userProfiles[user];
        profile.rentalCount++;
        profile.tradingVolume += pricePaid;
        profile.lastActivity = block.timestamp;
        
        // Award XP for rental
        uint256 xpEarned = RENTAL_XP + (duration / 3600); // Bonus XP for longer rentals
        _addXP(user, xpEarned);
        
        // Check rental achievements
        _checkRentalAchievements(user);
    }
    
    /**
     * @dev Record social sharing activity
     * @param user User address
     * @param platform Platform name (Twitter, Discord, etc.)
     * @param rentalId Rental ID being shared
     */
    function recordSocialShare(
        address user,
        string memory platform,
        uint256 rentalId
    ) external {
        require(isUserRegistered[user], "User not registered");
        
        UserProfile storage profile = userProfiles[user];
        profile.socialShares++;
        profile.lastActivity = block.timestamp;
        
        // Award XP for social sharing
        uint256 xpEarned = SOCIAL_XP;
        _addXP(user, xpEarned);
        
        emit SocialShare(user, platform, rentalId, xpEarned);
        
        // Check social achievements
        _checkSocialAchievements(user);
    }
    
    /**
     * @dev Create new achievement
     * @param name Achievement name
     * @param description Achievement description
     * @param imageUri Image URI for achievement badge
     * @param requirement Requirement to unlock
     * @param reward STT reward
     * @param xpReward XP reward
     * @param category Achievement category
     * @param isRare Whether achievement is rare
     * @param maxHolders Maximum number of holders (0 = unlimited)
     */
    function createAchievement(
        string memory name,
        string memory description,
        string memory imageUri,
        uint256 requirement,
        uint256 reward,
        uint256 xpReward,
        uint256 category,
        bool isRare,
        uint256 maxHolders
    ) external onlyOwner {
        require(bytes(name).length > 0, "Name required");
        require(requirement > 0, "Requirement must be positive");
        require(category <= 3, "Invalid category");
        
        achievements[name] = Achievement({
            name: name,
            description: description,
            imageUri: imageUri,
            requirement: requirement,
            reward: reward,
            xpReward: xpReward,
            isActive: true,
            isRare: isRare,
            maxHolders: maxHolders,
            currentHolders: 0,
            category: category
        });
        
        achievementNames.push(name);
        
        emit AchievementCreated(name, requirement, reward, category);
    }
    
    /**
     * @dev Unlock achievement for user
     * @param user User address
     * @param achievementName Achievement name
     */
    function unlockAchievement(address user, string memory achievementName) external {
        require(isUserRegistered[user], "User not registered");
        require(achievements[achievementName].isActive, "Achievement not active");
        require(!_hasAchievement(user, achievementName), "Achievement already unlocked");
        
        Achievement storage achievement = achievements[achievementName];
        
        // Check if achievement has max holders
        if (achievement.maxHolders > 0 && achievement.currentHolders >= achievement.maxHolders) {
            revert("Achievement max holders reached");
        }
        
        // Check if user meets requirement
        require(_checkRequirement(user, achievementName), "Requirement not met");
        
        // Unlock achievement
        userProfiles[user].unlockedAchievements.push(achievementName);
        userProfiles[user].totalAchievements++;
        userProfiles[user].achievementData[achievementName] = UserAchievement({
            achievementName: achievementName,
            unlockedAt: block.timestamp,
            xpEarned: achievement.xpReward,
            isActive: true
        });
        
        achievement.currentHolders++;
        
        // Award XP and reward
        _addXP(user, achievement.xpReward);
        if (achievement.reward > 0) {
            payable(user).transfer(achievement.reward);
        }
        
        emit AchievementUnlocked(user, achievementName, achievement.xpReward, achievement.reward);
    }
    
    /**
     * @dev Get user's achievement data
     * @param user User address
     * @return profile User profile data
     * @return unlockedAchievements Array of unlocked achievement names
     */
    function getUserAchievements(address user) 
        external 
        view 
        returns (
            UserProfile memory profile,
            string[] memory unlockedAchievements
        ) 
    {
        require(isUserRegistered[user], "User not registered");
        
        profile = userProfiles[user];
        unlockedAchievements = profile.unlockedAchievements;
    }
    
    /**
     * @dev Get user's level and XP
     * @param user User address
     * @return level User level
     * @return xp User XP
     * @return xpToNext XP needed for next level
     */
    function getUserLevel(address user) 
        external 
        view 
        returns (
            uint256 level,
            uint256 xp,
            uint256 xpToNext
        ) 
    {
        require(isUserRegistered[user], "User not registered");
        
        level = userProfiles[user].level;
        xp = userProfiles[user].totalXP;
        xpToNext = (level * XP_PER_LEVEL) - xp;
    }
    
    /**
     * @dev Get leaderboard data
     * @param limit Number of users to return
     * @return users Array of user addresses
     * @return levels Array of user levels
     * @return xpArray Array of user XP
     */
    function getLeaderboard(uint256 limit) 
        external 
        view 
        returns (
            address[] memory users,
            uint256[] memory levels,
            uint256[] memory xpArray
        ) 
    {
        uint256 userCount = allUsers.length;
        uint256 resultCount = limit > userCount ? userCount : limit;
        
        users = new address[](resultCount);
        levels = new uint256[](resultCount);
        xpArray = new uint256[](resultCount);
        
        // Simple implementation - in production, would use sorting
        for (uint256 i = 0; i < resultCount; i++) {
            address user = allUsers[i];
            users[i] = user;
            levels[i] = userProfiles[user].level;
            xpArray[i] = userProfiles[user].totalXP;
        }
    }
    
    /**
     * @dev Add XP to user and check for level up
     * @param user User address
     * @param xpAmount XP amount to add
     */
    function _addXP(address user, uint256 xpAmount) internal {
        UserProfile storage profile = userProfiles[user];
        uint256 oldLevel = profile.level;
        
        profile.totalXP += xpAmount;
        
        // Calculate new level
        uint256 newLevel = (profile.totalXP / XP_PER_LEVEL) + 1;
        if (newLevel > MAX_LEVEL) newLevel = MAX_LEVEL;
        
        if (newLevel > oldLevel) {
            profile.level = newLevel;
            emit UserLevelUp(user, oldLevel, newLevel, profile.totalXP);
        }
    }
    
    /**
     * @dev Check if user has specific achievement
     * @param user User address
     * @param achievementName Achievement name
     * @return has True if user has achievement
     */
    function _hasAchievement(address user, string memory achievementName) internal view returns (bool has) {
        string[] memory userAchievements = userProfiles[user].unlockedAchievements;
        
        for (uint256 i = 0; i < userAchievements.length; i++) {
            if (keccak256(bytes(userAchievements[i])) == keccak256(bytes(achievementName))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Check if user meets achievement requirement
     * @param user User address
     * @param achievementName Achievement name
     * @return meets True if requirement is met
     */
    function _checkRequirement(address user, string memory achievementName) internal view returns (bool meets) {
        Achievement memory achievement = achievements[achievementName];
        UserProfile memory profile = userProfiles[user];
        
        if (achievement.category == uint256(AchievementCategory.RENTAL)) {
            return profile.rentalCount >= achievement.requirement;
        } else if (achievement.category == uint256(AchievementCategory.SOCIAL)) {
            return profile.socialShares >= achievement.requirement;
        } else if (achievement.category == uint256(AchievementCategory.TRADING)) {
            return profile.tradingVolume >= achievement.requirement;
        }
        
        return false;
    }
    
    /**
     * @dev Check rental achievements
     * @param user User address
     */
    function _checkRentalAchievements(address user) internal {
        UserProfile memory profile = userProfiles[user];
        
        // Check rental count achievements
        if (profile.rentalCount >= 10 && !_hasAchievement(user, "Rental Novice")) {
            unlockAchievement(user, "Rental Novice");
        }
        
        if (profile.rentalCount >= 100 && !_hasAchievement(user, "Rental Master")) {
            unlockAchievement(user, "Rental Master");
        }
        
        if (profile.rentalCount >= 1000 && !_hasAchievement(user, "Rental Legend")) {
            unlockAchievement(user, "Rental Legend");
        }
        
        // Check trading volume achievements
        if (profile.tradingVolume >= 10 ether && !_hasAchievement(user, "Big Spender")) {
            unlockAchievement(user, "Big Spender");
        }
        
        if (profile.tradingVolume >= 100 ether && !_hasAchievement(user, "High Roller")) {
            unlockAchievement(user, "High Roller");
        }
    }
    
    /**
     * @dev Check social achievements
     * @param user User address
     */
    function _checkSocialAchievements(address user) internal {
        UserProfile memory profile = userProfiles[user];
        
        // Check social sharing achievements
        if (profile.socialShares >= 10 && !_hasAchievement(user, "Social Butterfly")) {
            unlockAchievement(user, "Social Butterfly");
        }
        
        if (profile.socialShares >= 100 && !_hasAchievement(user, "Influencer")) {
            unlockAchievement(user, "Influencer");
        }
    }
    
    /**
     * @dev Initialize default achievements
     */
    function _initializeDefaultAchievements() internal {
        // Rental achievements
        achievements["Rental Novice"] = Achievement({
            name: "Rental Novice",
            description: "Complete your first 10 rentals",
            imageUri: "https://nftflow.com/achievements/rental-novice.png",
            requirement: 10,
            reward: 0.01 ether,
            xpReward: 100,
            isActive: true,
            isRare: false,
            maxHolders: 0,
            currentHolders: 0,
            category: 0
        });
        
        achievements["Rental Master"] = Achievement({
            name: "Rental Master",
            description: "Complete 100 rentals",
            imageUri: "https://nftflow.com/achievements/rental-master.png",
            requirement: 100,
            reward: 0.1 ether,
            xpReward: 500,
            isActive: true,
            isRare: false,
            maxHolders: 0,
            currentHolders: 0,
            category: 0
        });
        
        achievements["Rental Legend"] = Achievement({
            name: "Rental Legend",
            description: "Complete 1000 rentals",
            imageUri: "https://nftflow.com/achievements/rental-legend.png",
            requirement: 1000,
            reward: 1 ether,
            xpReward: 2000,
            isActive: true,
            isRare: true,
            maxHolders: 0,
            currentHolders: 0,
            category: 0
        });
        
        // Social achievements
        achievements["Social Butterfly"] = Achievement({
            name: "Social Butterfly",
            description: "Share 10 rentals on social media",
            imageUri: "https://nftflow.com/achievements/social-butterfly.png",
            requirement: 10,
            reward: 0.005 ether,
            xpReward: 50,
            isActive: true,
            isRare: false,
            maxHolders: 0,
            currentHolders: 0,
            category: 1
        });
        
        achievements["Influencer"] = Achievement({
            name: "Influencer",
            description: "Share 100 rentals on social media",
            imageUri: "https://nftflow.com/achievements/influencer.png",
            requirement: 100,
            reward: 0.05 ether,
            xpReward: 250,
            isActive: true,
            isRare: false,
            maxHolders: 0,
            currentHolders: 0,
            category: 1
        });
        
        // Trading achievements
        achievements["Big Spender"] = Achievement({
            name: "Big Spender",
            description: "Spend 10 STT on rentals",
            imageUri: "https://nftflow.com/achievements/big-spender.png",
            requirement: 10 ether,
            reward: 0.1 ether,
            xpReward: 200,
            isActive: true,
            isRare: false,
            maxHolders: 0,
            currentHolders: 0,
            category: 2
        });
        
        achievements["High Roller"] = Achievement({
            name: "High Roller",
            description: "Spend 100 STT on rentals",
            imageUri: "https://nftflow.com/achievements/high-roller.png",
            requirement: 100 ether,
            reward: 1 ether,
            xpReward: 1000,
            isActive: true,
            isRare: true,
            maxHolders: 0,
            currentHolders: 0,
            category: 2
        });
        
        // Add to achievement names array
        achievementNames.push("Rental Novice");
        achievementNames.push("Rental Master");
        achievementNames.push("Rental Legend");
        achievementNames.push("Social Butterfly");
        achievementNames.push("Influencer");
        achievementNames.push("Big Spender");
        achievementNames.push("High Roller");
    }
    
    /**
     * @dev Get all achievement names
     * @return names Array of achievement names
     */
    function getAllAchievementNames() external view returns (string[] memory names) {
        return achievementNames;
    }
    
    /**
     * @dev Get achievement details
     * @param achievementName Achievement name
     * @return achievement Achievement details
     */
    function getAchievement(string memory achievementName) external view returns (Achievement memory achievement) {
        return achievements[achievementName];
    }
    
    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

