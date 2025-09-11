// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ReputationSystemEnhanced
 * @dev Enhanced on-chain reputation system with comprehensive tracking
 * Achieves 100% on-chain reputation management with advanced features
 * Leverages Somnia's low storage costs for detailed reputation data
 */
contract ReputationSystemEnhanced is Ownable {
    using SafeMath for uint256;
    using ECDSA for bytes32;

    // ============ ENHANCED STRUCTS ============
    
    struct Reputation {
        uint256 score;
        uint256 totalRentals;
        uint256 successfulRentals;
        uint256 totalEarnings;
        uint256 totalSpent;
        uint256 lastUpdate;
        bool isWhitelisted;
        bool isBlacklisted;
        bool isVerified;
        uint256 collateralMultiplier;
        uint256 reputationTier;
        ReputationMetrics metrics;
        AchievementData achievements;
        GovernanceData governance;
    }

    struct ReputationMetrics {
        uint256 averageRentalDuration;
        uint256 longestRentalDuration;
        uint256 shortestRentalDuration;
        uint256 totalRentalTime;
        uint256 onTimeCompletions;
        uint256 earlyCompletions;
        uint256 lateCompletions;
        uint256 disputeCount;
        uint256 disputeWins;
        uint256 referralCount;
        uint256 referralEarnings;
    }

    struct AchievementData {
        uint256[] unlockedAchievements;
        uint256 totalAchievements;
        uint256 achievementScore;
        mapping(uint256 => bool) hasAchievement;
        mapping(uint256 => uint256) achievementTimestamp;
    }

    struct GovernanceData {
        uint256 governanceTokens;
        uint256 proposalsCreated;
        uint256 proposalsVoted;
        uint256 successfulProposals;
        uint256 votingPower;
        bool isDelegate;
        address delegateTo;
        uint256 delegatedVotingPower;
    }

    struct Achievement {
        uint256 id;
        string name;
        string description;
        uint256 requiredRentals;
        uint256 requiredEarnings;
        uint256 requiredScore;
        uint256 rewardAmount;
        bool isActive;
        AchievementType achievementType;
    }

    struct ReputationEvent {
        uint256 timestamp;
        string eventType;
        uint256 scoreChange;
        uint256 newScore;
        string description;
    }

    enum AchievementType {
        RENTAL_COUNT,
        EARNINGS_THRESHOLD,
        SCORE_THRESHOLD,
        SPECIAL_EVENT,
        GOVERNANCE_PARTICIPATION
    }

    // ============ STATE VARIABLES ============
    
    mapping(address => Reputation) public reputations;
    mapping(address => ReputationEvent[]) public reputationHistory;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => mapping(uint256 => bool)) public userAchievements;
    mapping(address => uint256[]) public userAchievementList;
    
    // Authorized contracts
    mapping(address => bool) public authorizedContracts;
    address public rentalContract;
    
    // Reputation constants
    uint256 public constant REPUTATION_GAIN = 10;
    uint256 public constant REPUTATION_LOSS = 20;
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant COLLATERAL_FREE_THRESHOLD = 750;
    uint256 public constant REDUCED_COLLATERAL_THRESHOLD = 500;
    uint256 public constant VERIFIED_THRESHOLD = 600;
    
    // Achievement system
    uint256 public nextAchievementId;
    uint256 public totalAchievements;
    
    // Governance integration
    mapping(address => uint256) public governanceTokenBalances;
    mapping(address => bool) public governanceDelegates;
    
    // ============ EVENTS ============
    
    event ReputationUpdated(
        address indexed user,
        uint256 newScore,
        bool success,
        string reason,
        uint256 timestamp
    );
    
    event UserWhitelisted(address indexed user, uint256 timestamp);
    event UserBlacklisted(address indexed user, uint256 timestamp);
    event UserVerified(address indexed user, uint256 timestamp);
    
    event CollateralMultiplierUpdated(
        address indexed user,
        uint256 multiplier,
        uint256 timestamp
    );
    
    event AchievementUnlocked(
        address indexed user,
        uint256 indexed achievementId,
        string achievementName,
        uint256 rewardAmount,
        uint256 timestamp
    );
    
    event AchievementCreated(
        uint256 indexed achievementId,
        string name,
        AchievementType achievementType,
        uint256 timestamp
    );
    
    event ReputationEventAdded(
        address indexed user,
        string eventType,
        uint256 scoreChange,
        uint256 timestamp
    );
    
    event GovernanceDataUpdated(
        address indexed user,
        uint256 governanceTokens,
        uint256 votingPower,
        uint256 timestamp
    );

    // ============ MODIFIERS ============
    
    modifier onlyRentalContract() {
        require(msg.sender == rentalContract, "Caller is not the rental contract");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == rentalContract || 
            authorizedContracts[msg.sender] || 
            msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() Ownable() {
        _initializeDefaultAchievements();
    }

    // ============ CORE REPUTATION FUNCTIONS ============

    /**
     * @dev Enhanced reputation update with comprehensive tracking
     */
    function updateReputation(
        address user,
        bool success,
        uint256 rentalDuration,
        uint256 rentalAmount,
        string memory reason
    ) external onlyAuthorized {
        Reputation storage rep = reputations[user];
        
        // Initialize reputation if first time
        if (rep.lastUpdate == 0) {
            _initializeReputation(rep);
        }
        
        // Update basic metrics
        rep.totalRentals++;
        rep.totalRentalTime = rep.totalRentalTime.add(rentalDuration);
        
        if (success) {
            rep.successfulRentals++;
            rep.totalEarnings = rep.totalEarnings.add(rentalAmount);
            rep.onTimeCompletions++;
            rep.score = _min(MAX_SCORE, rep.score.add(REPUTATION_GAIN));
        } else {
            rep.score = rep.score > REPUTATION_LOSS ? 
                rep.score.sub(REPUTATION_LOSS) : 0;
        }
        
        // Update duration metrics
        if (rentalDuration > rep.metrics.longestRentalDuration) {
            rep.metrics.longestRentalDuration = rentalDuration;
        }
        if (rep.metrics.shortestRentalDuration == 0 || rentalDuration < rep.metrics.shortestRentalDuration) {
            rep.metrics.shortestRentalDuration = rentalDuration;
        }
        rep.metrics.averageRentalDuration = rep.totalRentalTime.div(rep.totalRentals);
        
        // Update collateral multiplier
        rep.collateralMultiplier = _calculateCollateralMultiplier(rep.score);
        rep.reputationTier = _calculateReputationTier(rep.score);
        
        // Check for verification eligibility
        if (rep.score >= VERIFIED_THRESHOLD && !rep.isVerified) {
            rep.isVerified = true;
            emit UserVerified(user, block.timestamp);
        }
        
        rep.lastUpdate = block.timestamp;
        
        // Add to reputation history
        _addReputationEvent(user, success ? "RENTAL_SUCCESS" : "RENTAL_FAILURE", 
                          success ? REPUTATION_GAIN : -int256(REPUTATION_LOSS), reason);
        
        // Check for achievement unlocks
        _checkAchievementUnlocks(user);
        
        emit ReputationUpdated(user, rep.score, success, reason, block.timestamp);
    }

    /**
     * @dev Update dispute resolution reputation
     */
    function updateDisputeReputation(
        address user,
        bool wonDispute,
        uint256 disputeAmount
    ) external onlyAuthorized {
        Reputation storage rep = reputations[user];
        require(rep.lastUpdate > 0, "User not initialized");
        
        rep.metrics.disputeCount++;
        
        if (wonDispute) {
            rep.metrics.disputeWins++;
            rep.score = _min(MAX_SCORE, rep.score.add(15)); // Higher gain for dispute wins
        } else {
            rep.score = rep.score > 25 ? rep.score.sub(25) : 0; // Higher loss for dispute losses
        }
        
        rep.collateralMultiplier = _calculateCollateralMultiplier(rep.score);
        rep.reputationTier = _calculateReputationTier(rep.score);
        rep.lastUpdate = block.timestamp;
        
        _addReputationEvent(user, wonDispute ? "DISPUTE_WIN" : "DISPUTE_LOSS", 
                          wonDispute ? 15 : -25, "Dispute resolution");
        
        emit ReputationUpdated(user, rep.score, wonDispute, "Dispute resolution", block.timestamp);
    }

    /**
     * @dev Update referral reputation
     */
    function updateReferralReputation(
        address referrer,
        address referred,
        uint256 referralEarnings
    ) external onlyAuthorized {
        Reputation storage rep = reputations[referrer];
        require(rep.lastUpdate > 0, "Referrer not initialized");
        
        rep.metrics.referralCount++;
        rep.metrics.referralEarnings = rep.metrics.referralEarnings.add(referralEarnings);
        rep.score = _min(MAX_SCORE, rep.score.add(5)); // Small gain for referrals
        
        rep.collateralMultiplier = _calculateCollateralMultiplier(rep.score);
        rep.reputationTier = _calculateReputationTier(rep.score);
        rep.lastUpdate = block.timestamp;
        
        _addReputationEvent(referrer, "REFERRAL_EARNINGS", 5, "Referral bonus");
        
        emit ReputationUpdated(referrer, rep.score, true, "Referral bonus", block.timestamp);
    }

    // ============ ACHIEVEMENT SYSTEM ============

    /**
     * @dev Create new achievement
     */
    function createAchievement(
        string memory name,
        string memory description,
        uint256 requiredRentals,
        uint256 requiredEarnings,
        uint256 requiredScore,
        uint256 rewardAmount,
        AchievementType achievementType
    ) external onlyOwner {
        uint256 achievementId = nextAchievementId++;
        
        achievements[achievementId] = Achievement({
            id: achievementId,
            name: name,
            description: description,
            requiredRentals: requiredRentals,
            requiredEarnings: requiredEarnings,
            requiredScore: requiredScore,
            rewardAmount: rewardAmount,
            isActive: true,
            achievementType: achievementType
        });
        
        totalAchievements++;
        
        emit AchievementCreated(achievementId, name, achievementType, block.timestamp);
    }

    /**
     * @dev Check and unlock achievements for user
     */
    function _checkAchievementUnlocks(address user) internal {
        Reputation storage rep = reputations[user];
        
        for (uint256 i = 0; i < nextAchievementId; i++) {
            Achievement memory achievement = achievements[i];
            
            if (!achievement.isActive || userAchievements[user][i]) {
                continue;
            }
            
            bool eligible = false;
            
            if (achievement.achievementType == AchievementType.RENTAL_COUNT) {
                eligible = rep.totalRentals >= achievement.requiredRentals;
            } else if (achievement.achievementType == AchievementType.EARNINGS_THRESHOLD) {
                eligible = rep.totalEarnings >= achievement.requiredEarnings;
            } else if (achievement.achievementType == AchievementType.SCORE_THRESHOLD) {
                eligible = rep.score >= achievement.requiredScore;
            }
            
            if (eligible) {
                _unlockAchievement(user, i);
            }
        }
    }

    /**
     * @dev Unlock achievement for user
     */
    function _unlockAchievement(address user, uint256 achievementId) internal {
        Achievement memory achievement = achievements[achievementId];
        
        userAchievements[user][achievementId] = true;
        userAchievementList[user].push(achievementId);
        
        Reputation storage rep = reputations[user];
        rep.achievements.unlockedAchievements.push(achievementId);
        rep.achievements.totalAchievements++;
        rep.achievements.achievementScore = rep.achievements.achievementScore.add(achievement.rewardAmount);
        rep.achievements.achievementTimestamp[achievementId] = block.timestamp;
        
        // Award governance tokens for achievements
        if (achievement.rewardAmount > 0) {
            governanceTokenBalances[user] = governanceTokenBalances[user].add(achievement.rewardAmount);
            rep.governance.governanceTokens = rep.governance.governanceTokens.add(achievement.rewardAmount);
        }
        
        emit AchievementUnlocked(user, achievementId, achievement.name, achievement.rewardAmount, block.timestamp);
    }

    // ============ GOVERNANCE INTEGRATION ============

    /**
     * @dev Update governance token balance
     */
    function updateGovernanceTokens(address user, uint256 amount) external onlyAuthorized {
        Reputation storage rep = reputations[user];
        require(rep.lastUpdate > 0, "User not initialized");
        
        governanceTokenBalances[user] = amount;
        rep.governance.governanceTokens = amount;
        rep.governance.votingPower = _calculateVotingPower(user);
        
        emit GovernanceDataUpdated(user, amount, rep.governance.votingPower, block.timestamp);
    }

    /**
     * @dev Delegate voting power
     */
    function delegateVotingPower(address delegate) external {
        require(delegate != msg.sender, "Cannot delegate to self");
        require(reputations[msg.sender].lastUpdate > 0, "User not initialized");
        
        Reputation storage rep = reputations[msg.sender];
        rep.governance.isDelegate = true;
        rep.governance.delegateTo = delegate;
        
        Reputation storage delegateRep = reputations[delegate];
        delegateRep.governance.delegatedVotingPower = delegateRep.governance.delegatedVotingPower.add(rep.governance.votingPower);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get comprehensive reputation data
     */
    function getReputationData(address user) external view returns (
        uint256 score,
        uint256 totalRentals,
        uint256 successfulRentals,
        uint256 totalEarnings,
        uint256 collateralMultiplier,
        uint256 reputationTier,
        bool isVerified,
        bool isWhitelisted,
        bool isBlacklisted
    ) {
        Reputation memory rep = reputations[user];
        return (
            rep.score,
            rep.totalRentals,
            rep.successfulRentals,
            rep.totalEarnings,
            rep.collateralMultiplier,
            rep.reputationTier,
            rep.isVerified,
            rep.isWhitelisted,
            rep.isBlacklisted
        );
    }

    /**
     * @dev Get reputation metrics
     */
    function getReputationMetrics(address user) external view returns (
        uint256 averageRentalDuration,
        uint256 longestRentalDuration,
        uint256 shortestRentalDuration,
        uint256 onTimeCompletions,
        uint256 disputeCount,
        uint256 disputeWins,
        uint256 referralCount,
        uint256 referralEarnings
    ) {
        Reputation memory rep = reputations[user];
        return (
            rep.metrics.averageRentalDuration,
            rep.metrics.longestRentalDuration,
            rep.metrics.shortestRentalDuration,
            rep.metrics.onTimeCompletions,
            rep.metrics.disputeCount,
            rep.metrics.disputeWins,
            rep.metrics.referralCount,
            rep.metrics.referralEarnings
        );
    }

    /**
     * @dev Get user achievements
     */
    function getUserAchievements(address user) external view returns (
        uint256[] memory achievementIds,
        string[] memory achievementNames,
        uint256 totalAchievements,
        uint256 achievementScore
    ) {
        Reputation memory rep = reputations[user];
        uint256[] memory ids = userAchievementList[user];
        string[] memory names = new string[](ids.length);
        
        for (uint256 i = 0; i < ids.length; i++) {
            names[i] = achievements[ids[i]].name;
        }
        
        return (ids, names, rep.achievements.totalAchievements, rep.achievements.achievementScore);
    }

    /**
     * @dev Get reputation history
     */
    function getReputationHistory(address user) external view returns (ReputationEvent[] memory) {
        return reputationHistory[user];
    }

    /**
     * @dev Get governance data
     */
    function getGovernanceData(address user) external view returns (
        uint256 governanceTokens,
        uint256 votingPower,
        uint256 proposalsCreated,
        uint256 proposalsVoted,
        bool isDelegate,
        address delegateTo
    ) {
        Reputation memory rep = reputations[user];
        return (
            rep.governance.governanceTokens,
            rep.governance.votingPower,
            rep.governance.proposalsCreated,
            rep.governance.proposalsVoted,
            rep.governance.isDelegate,
            rep.governance.delegateTo
        );
    }

    /**
     * @dev Check if user requires collateral
     */
    function requiresCollateral(address user) external view returns (bool) {
        Reputation memory rep = reputations[user];
        
        if (rep.isBlacklisted) {
            return true;
        }
        
        return !(rep.isWhitelisted || rep.score >= COLLATERAL_FREE_THRESHOLD);
    }

    /**
     * @dev Get collateral multiplier
     */
    function getCollateralMultiplier(address user) external view returns (uint256) {
        Reputation memory rep = reputations[user];
        
        if (rep.isBlacklisted) {
            return 100;
        }
        
        if (rep.isWhitelisted) {
            return 0;
        }
        
        return rep.collateralMultiplier;
    }

    /**
     * @dev Get reputation score
     */
    function getReputationScore(address user) external view returns (uint256) {
        return reputations[user].score;
    }

    /**
     * @dev Get reputation tier
     */
    function getReputationTier(address user) external view returns (uint256) {
        return reputations[user].reputationTier;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Whitelist user
     */
    function whitelistUser(address user) external onlyOwner {
        Reputation storage rep = reputations[user];
        rep.isWhitelisted = true;
        rep.isBlacklisted = false;
        rep.collateralMultiplier = 0;
        
        emit UserWhitelisted(user, block.timestamp);
    }

    /**
     * @dev Blacklist user
     */
    function blacklistUser(address user) external onlyOwner {
        Reputation storage rep = reputations[user];
        rep.isBlacklisted = true;
        rep.isWhitelisted = false;
        rep.collateralMultiplier = 100;
        
        emit UserBlacklisted(user, block.timestamp);
    }

    /**
     * @dev Set rental contract
     */
    function setRentalContract(address _rentalContract) external onlyOwner {
        rentalContract = _rentalContract;
    }

    /**
     * @dev Add authorized contract
     */
    function addAuthorizedContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = true;
    }

    /**
     * @dev Remove authorized contract
     */
    function removeAuthorizedContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = false;
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Initialize reputation for new user
     */
    function _initializeReputation(Reputation storage rep) internal {
        rep.score = 500; // Start with neutral score
        rep.collateralMultiplier = 100; // Full collateral required
        rep.reputationTier = 0; // New user tier
        rep.isVerified = false;
        rep.isWhitelisted = false;
        rep.isBlacklisted = false;
        rep.lastUpdate = block.timestamp;
    }

    /**
     * @dev Calculate collateral multiplier based on score
     */
    function _calculateCollateralMultiplier(uint256 score) internal pure returns (uint256) {
        if (score >= COLLATERAL_FREE_THRESHOLD) {
            return 0; // No collateral required
        } else if (score >= REDUCED_COLLATERAL_THRESHOLD) {
            return 100 - ((score - REDUCED_COLLATERAL_THRESHOLD) * 100) / (COLLATERAL_FREE_THRESHOLD - REDUCED_COLLATERAL_THRESHOLD);
        } else {
            return 100; // Full collateral required
        }
    }

    /**
     * @dev Calculate reputation tier
     */
    function _calculateReputationTier(uint256 score) internal pure returns (uint256) {
        if (score >= 900) return 4; // Elite
        if (score >= 750) return 3; // Trusted
        if (score >= 600) return 2; // Verified
        if (score >= 400) return 1; // Standard
        return 0; // New/Risk
    }

    /**
     * @dev Calculate voting power
     */
    function _calculateVotingPower(address user) internal view returns (uint256) {
        Reputation memory rep = reputations[user];
        uint256 basePower = rep.governance.governanceTokens;
        uint256 reputationBonus = rep.score / 10; // 1% bonus per 10 reputation points
        uint256 achievementBonus = rep.achievements.achievementScore / 100; // 1% bonus per 100 achievement points
        
        return basePower.add(reputationBonus).add(achievementBonus);
    }

    /**
     * @dev Add reputation event to history
     */
    function _addReputationEvent(
        address user,
        string memory eventType,
        int256 scoreChange,
        string memory description
    ) internal {
        ReputationEvent memory event = ReputationEvent({
            timestamp: block.timestamp,
            eventType: eventType,
            scoreChange: uint256(scoreChange),
            newScore: reputations[user].score,
            description: description
        });
        
        reputationHistory[user].push(event);
        
        emit ReputationEventAdded(user, eventType, uint256(scoreChange), block.timestamp);
    }

    /**
     * @dev Initialize default achievements
     */
    function _initializeDefaultAchievements() internal {
        // First Rental Achievement
        achievements[0] = Achievement({
            id: 0,
            name: "First Rental",
            description: "Complete your first NFT rental",
            requiredRentals: 1,
            requiredEarnings: 0,
            requiredScore: 0,
            rewardAmount: 10,
            isActive: true,
            achievementType: AchievementType.RENTAL_COUNT
        });
        
        // Rental Novice Achievement
        achievements[1] = Achievement({
            id: 1,
            name: "Rental Novice",
            description: "Complete 5 successful rentals",
            requiredRentals: 5,
            requiredEarnings: 0,
            requiredScore: 0,
            rewardAmount: 25,
            isActive: true,
            achievementType: AchievementType.RENTAL_COUNT
        });
        
        // Trusted Renter Achievement
        achievements[2] = Achievement({
            id: 2,
            name: "Trusted Renter",
            description: "Achieve a reputation score of 750",
            requiredRentals: 0,
            requiredEarnings: 0,
            requiredScore: 750,
            rewardAmount: 50,
            isActive: true,
            achievementType: AchievementType.SCORE_THRESHOLD
        });
        
        // High Earner Achievement
        achievements[3] = Achievement({
            id: 3,
            name: "High Earner",
            description: "Earn 1 ETH from rentals",
            requiredRentals: 0,
            requiredEarnings: 1 ether,
            requiredScore: 0,
            rewardAmount: 100,
            isActive: true,
            achievementType: AchievementType.EARNINGS_THRESHOLD
        });
        
        nextAchievementId = 4;
        totalAchievements = 4;
    }

    /**
     * @dev Internal min function
     */
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
