// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationSystem
 * @dev Contract for managing user reputation and collateral requirements
 * Higher reputation users get reduced collateral requirements
 */
contract ReputationSystem is Ownable {

    struct UserReputation {
        uint256 totalRentals;
        uint256 successfulRentals;
        uint256 reputationScore;
        uint256 lastUpdated;
        bool blacklisted;
    }

    struct Achievement {
        string name;
        string description;
        uint256 requirement;
        uint256 rewardPoints;
        bool active;
    }

    // State variables
    mapping(address => UserReputation) public userReputations;
    mapping(address => mapping(uint256 => bool)) public userAchievements;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => bool) public authorizedContracts;
    
    uint256 public constant MAX_REPUTATION_SCORE = 1000;
    uint256 public constant REPUTATION_GAIN = 10;
    uint256 public constant REPUTATION_LOSS = 25;
    uint256 public constant REPUTATION_THRESHOLD_LOW = 100;
    uint256 public constant REPUTATION_THRESHOLD_MID = 500;
    uint256 public constant REPUTATION_THRESHOLD_HIGH = 800;
    
    uint256 public nextAchievementId;
    
    // Events
    event ReputationUpdated(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        bool success
    );
    
    event AchievementUnlocked(
        address indexed user,
        uint256 indexed achievementId,
        string achievementName
    );
    
    event UserBlacklisted(
        address indexed user,
        bool blacklisted
    );

    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() {
        // Initialize default achievements
        _createAchievement("First Rental", "Complete your first rental", 1, 50);
        _createAchievement("Rental Novice", "Complete 10 rentals", 10, 100);
        _createAchievement("Rental Expert", "Complete 50 rentals", 50, 200);
        _createAchievement("Rental Master", "Complete 100 rentals", 100, 300);
        _createAchievement("Perfect Record", "Maintain 100% success rate with 20+ rentals", 20, 500);
    }

    /**
     * @dev Update user reputation after a rental
     * @param user User address
     * @param success Whether the rental was successful
     */
    function updateReputation(address user, bool success) external onlyAuthorized {
        require(!userReputations[user].blacklisted, "User is blacklisted");
        
        UserReputation storage reputation = userReputations[user];
        uint256 oldScore = reputation.reputationScore;
        
        reputation.totalRentals = reputation.totalRentals + 1;
        
        if (success) {
            reputation.successfulRentals = reputation.successfulRentals + 1;
            reputation.reputationScore = _min(
                MAX_REPUTATION_SCORE,
                reputation.reputationScore + REPUTATION_GAIN
            );
        } else {
            reputation.reputationScore = reputation.reputationScore > REPUTATION_LOSS 
                ? reputation.reputationScore - REPUTATION_LOSS 
                : 0;
        }
        
        reputation.lastUpdated = block.timestamp;
        
        // Check for achievements
        _checkAchievements(user);
        
        emit ReputationUpdated(user, oldScore, reputation.reputationScore, success);
    }

    /**
     * @dev Calculate collateral multiplier based on reputation
     * @param user User address
     * @return Multiplier in basis points (10000 = 100%)
     */
    function getCollateralMultiplier(address user) external view returns (uint256) {
        if (userReputations[user].blacklisted) {
            return 20000; // 200% for blacklisted users
        }
        
        uint256 score = userReputations[user].reputationScore;
        
        if (score >= REPUTATION_THRESHOLD_HIGH) {
            return 0; // No collateral needed
        } else if (score >= REPUTATION_THRESHOLD_MID) {
            return 2500; // 25% collateral
        } else if (score >= REPUTATION_THRESHOLD_LOW) {
            return 5000; // 50% collateral
        } else {
            return 10000; // 100% collateral
        }
    }

    /**
     * @dev Get user reputation details
     * @param user User address
     * @return UserReputation struct
     */
    function getUserReputation(address user) external view returns (UserReputation memory) {
        return userReputations[user];
    }

    /**
     * @dev Get user success rate as percentage
     * @param user User address
     * @return Success rate (0-100)
     */
    function getSuccessRate(address user) external view returns (uint256) {
        UserReputation memory reputation = userReputations[user];
        if (reputation.totalRentals == 0) {
            return 0;
        }
        return reputation.successfulRentals * 100 / reputation.totalRentals;
    }

    /**
     * @dev Check if user has unlocked an achievement
     * @param user User address
     * @param achievementId Achievement ID
     * @return True if unlocked
     */
    function hasAchievement(address user, uint256 achievementId) external view returns (bool) {
        return userAchievements[user][achievementId];
    }

    /**
     * @dev Get achievement details
     * @param achievementId Achievement ID
     * @return Achievement struct
     */
    function getAchievement(uint256 achievementId) external view returns (Achievement memory) {
        return achievements[achievementId];
    }

    /**
     * @dev Blacklist or unblacklist a user (only owner)
     * @param user User address
     * @param blacklisted True to blacklist, false to unblacklist
     */
    function setUserBlacklisted(address user, bool blacklisted) external onlyOwner {
        userReputations[user].blacklisted = blacklisted;
        emit UserBlacklisted(user, blacklisted);
    }

    /**
     * @dev Add authorized contract (only owner)
     * @param contractAddr Contract address to authorize
     */
    function addAuthorizedContract(address contractAddr) external onlyOwner {
        authorizedContracts[contractAddr] = true;
    }

    /**
     * @dev Remove authorized contract (only owner)
     * @param contractAddr Contract address to remove
     */
    function removeAuthorizedContract(address contractAddr) external onlyOwner {
        authorizedContracts[contractAddr] = false;
    }

    /**
     * @dev Create a new achievement (only owner)
     * @param name Achievement name
     * @param description Achievement description
     * @param requirement Requirement to unlock
     * @param rewardPoints Reputation points reward
     */
    function createAchievement(
        string memory name,
        string memory description,
        uint256 requirement,
        uint256 rewardPoints
    ) external onlyOwner {
        _createAchievement(name, description, requirement, rewardPoints);
    }

    /**
     * @dev Internal function to create achievement
     */
    function _createAchievement(
        string memory name,
        string memory description,
        uint256 requirement,
        uint256 rewardPoints
    ) internal {
        uint256 achievementId = nextAchievementId++;
        achievements[achievementId] = Achievement({
            name: name,
            description: description,
            requirement: requirement,
            rewardPoints: rewardPoints,
            active: true
        });
    }

    /**
     * @dev Check and unlock achievements for a user
     * @param user User address
     */
    function _checkAchievements(address user) internal {
        UserReputation memory reputation = userReputations[user];
        
        // Check rental count achievements
        for (uint256 i = 0; i < nextAchievementId; i++) {
            if (!achievements[i].active || userAchievements[user][i]) {
                continue;
            }
            
            bool unlocked = false;
            
            // First Rental
            if (i == 0 && reputation.totalRentals >= 1) {
                unlocked = true;
            }
            // Rental Novice
            else if (i == 1 && reputation.totalRentals >= 10) {
                unlocked = true;
            }
            // Rental Expert
            else if (i == 2 && reputation.totalRentals >= 50) {
                unlocked = true;
            }
            // Rental Master
            else if (i == 3 && reputation.totalRentals >= 100) {
                unlocked = true;
            }
            // Perfect Record
            else if (i == 4 && reputation.totalRentals >= 20 && 
                     reputation.successfulRentals == reputation.totalRentals) {
                unlocked = true;
            }
            
            if (unlocked) {
                userAchievements[user][i] = true;
                userReputations[user].reputationScore = _min(
                    MAX_REPUTATION_SCORE,
                    userReputations[user].reputationScore + achievements[i].rewardPoints
                );
                
                emit AchievementUnlocked(user, i, achievements[i].name);
            }
        }
    }

    /**
     * @dev Get minimum of two numbers
     */
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Get user's unlocked achievements
     * @param user User address
     * @return Array of achievement IDs
     */
    function getUserAchievements(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count unlocked achievements
        for (uint256 i = 0; i < nextAchievementId; i++) {
            if (userAchievements[user][i]) {
                count++;
            }
        }
        
        // Create array of unlocked achievement IDs
        uint256[] memory unlockedAchievements = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < nextAchievementId; i++) {
            if (userAchievements[user][i]) {
                unlockedAchievements[index] = i;
                index++;
            }
        }
        
        return unlockedAchievements;
    }

    /**
     * @dev Get total number of achievements
     * @return Total achievement count
     */
    function getTotalAchievements() external view returns (uint256) {
        return nextAchievementId;
    }
}

