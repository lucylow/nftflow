// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title NFTFlowLoyalty
 * @dev Points and rewards system for NFTFlow platform
 * @notice Manages loyalty points, tiers, and reward distribution
 */
contract NFTFlowLoyalty is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Reward structure
    struct Reward {
        uint256 id;
        string name;
        string description;
        uint256 pointsCost;
        uint256 quantity;
        uint256 quantityRedeemed;
        RewardType rewardType;
        string rewardData; // JSON string with reward details
        bool active;
        uint256 createdAt;
    }
    
    // User tier structure
    struct UserTier {
        uint256 tier;
        uint256 pointsBalance;
        uint256 pointsEarnedTotal;
        uint256 lastEarned;
        uint256 discountPercentage;
    }
    
    // Point transaction structure
    struct PointTransaction {
        uint256 id;
        address user;
        uint256 points;
        TransactionType transactionType;
        string reason;
        string referenceId;
        uint256 timestamp;
    }
    
    // Enums
    enum RewardType {
        TOKEN_AIRDROP,
        NFT_AIRDROP,
        DISCOUNT_CODE,
        PREMIUM_FEATURES,
        CUSTOM_REWARD
    }
    
    enum TransactionType {
        EARN,
        SPEND,
        REFUND,
        BONUS
    }
    
    // Tier constants
    uint256 public constant TIER_BRONZE = 0;
    uint256 public constant TIER_SILVER = 1;
    uint256 public constant TIER_GOLD = 2;
    uint256 public constant TIER_PLATINUM = 3;
    uint256 public constant TIER_DIAMOND = 4;
    
    // Storage mappings
    mapping(address => UserTier) public userTiers;
    mapping(uint256 => Reward) public rewards;
    mapping(address => mapping(uint256 => bool)) public claimedRewards;
    mapping(address => PointTransaction[]) public userTransactions;
    
    // Tier configuration
    uint256[] public tierThresholds = [0, 1000, 5000, 15000, 50000];
    uint256[] public tierDiscounts = [0, 5, 15, 25, 50]; // Percentage discounts
    
    // Counters
    Counters.Counter private _rewardIdCounter;
    Counters.Counter private _transactionIdCounter;
    
    // External contracts
    IERC20 public somniaToken;
    IERC721 public nftContract;
    
    // Events
    event PointsEarned(address indexed user, uint256 points, string reason, string referenceId);
    event PointsSpent(address indexed user, uint256 points, uint256 rewardId);
    event TierUpgraded(address indexed user, uint256 oldTier, uint256 newTier);
    event RewardAdded(uint256 rewardId, string name, uint256 pointsCost, RewardType rewardType);
    event RewardClaimed(address indexed user, uint256 rewardId, RewardType rewardType);
    event RewardDeactivated(uint256 rewardId);
    
    // Modifiers
    modifier onlyAuthorized() {
        require(msg.sender == owner() || isAuthorizedCaller(msg.sender), "Not authorized");
        _;
    }
    
    modifier rewardExists(uint256 rewardId) {
        require(rewards[rewardId].id != 0, "Reward does not exist");
        _;
    }
    
    modifier rewardActive(uint256 rewardId) {
        require(rewards[rewardId].active, "Reward not active");
        _;
    }
    
    constructor(address _somniaToken, address _nftContract) {
        somniaToken = IERC20(_somniaToken);
        nftContract = IERC721(_nftContract);
    }
    
    /**
     * @dev Earn points for a user
     * @param user User address
     * @param points Points to award
     * @param reason Reason for earning points
     * @param referenceId Reference ID for tracking
     */
    function earnPoints(
        address user,
        uint256 points,
        string calldata reason,
        string calldata referenceId
    ) external onlyAuthorized {
        require(points > 0, "Points must be greater than 0");
        
        UserTier storage userTier = userTiers[user];
        uint256 oldTier = userTier.tier;
        
        // Update points
        userTier.pointsBalance += points;
        userTier.pointsEarnedTotal += points;
        userTier.lastEarned = block.timestamp;
        
        // Check for tier upgrade
        uint256 newTier = _calculateTier(userTier.pointsBalance);
        if (newTier > oldTier) {
            userTier.tier = newTier;
            userTier.discountPercentage = tierDiscounts[newTier];
            emit TierUpgraded(user, oldTier, newTier);
        }
        
        // Record transaction
        _recordTransaction(user, points, TransactionType.EARN, reason, referenceId);
        
        emit PointsEarned(user, points, reason, referenceId);
    }
    
    /**
     * @dev Spend points to claim a reward
     * @param rewardId Reward ID to claim
     */
    function claimReward(uint256 rewardId) external nonReentrant rewardExists(rewardId) rewardActive(rewardId) {
        Reward storage reward = rewards[rewardId];
        address user = msg.sender;
        
        require(reward.quantity > reward.quantityRedeemed, "Reward out of stock");
        require(userTiers[user].pointsBalance >= reward.pointsCost, "Insufficient points");
        require(!claimedRewards[user][rewardId], "Reward already claimed");
        
        // Deduct points
        userTiers[user].pointsBalance -= reward.pointsCost;
        reward.quantityRedeemed += 1;
        claimedRewards[user][rewardId] = true;
        
        // Record transaction
        _recordTransaction(user, reward.pointsCost, TransactionType.SPEND, "Reward claimed", string(abi.encodePacked("reward_", rewardId)));
        
        // Distribute reward
        _distributeReward(user, reward);
        
        emit PointsSpent(user, reward.pointsCost, rewardId);
        emit RewardClaimed(user, rewardId, reward.rewardType);
    }
    
    /**
     * @dev Add a new reward
     * @param name Reward name
     * @param description Reward description
     * @param pointsCost Points required to claim
     * @param quantity Total quantity available
     * @param rewardType Type of reward
     * @param rewardData Reward data (JSON string)
     */
    function addReward(
        string calldata name,
        string calldata description,
        uint256 pointsCost,
        uint256 quantity,
        RewardType rewardType,
        string calldata rewardData
    ) external onlyOwner {
        _rewardIdCounter.increment();
        uint256 rewardId = _rewardIdCounter.current();
        
        rewards[rewardId] = Reward({
            id: rewardId,
            name: name,
            description: description,
            pointsCost: pointsCost,
            quantity: quantity,
            quantityRedeemed: 0,
            rewardType: rewardType,
            rewardData: rewardData,
            active: true,
            createdAt: block.timestamp
        });
        
        emit RewardAdded(rewardId, name, pointsCost, rewardType);
    }
    
    /**
     * @dev Deactivate a reward
     * @param rewardId Reward ID to deactivate
     */
    function deactivateReward(uint256 rewardId) external onlyOwner rewardExists(rewardId) {
        rewards[rewardId].active = false;
        emit RewardDeactivated(rewardId);
    }
    
    /**
     * @dev Get user tier information
     * @param user User address
     * @return tier Current tier
     * @return pointsBalance Current points balance
     * @return pointsEarnedTotal Total points earned
     * @return discountPercentage Discount percentage
     */
    function getUserTierInfo(address user) external view returns (
        uint256 tier,
        uint256 pointsBalance,
        uint256 pointsEarnedTotal,
        uint256 discountPercentage
    ) {
        UserTier memory userTier = userTiers[user];
        return (userTier.tier, userTier.pointsBalance, userTier.pointsEarnedTotal, userTier.discountPercentage);
    }
    
    /**
     * @dev Get user discount percentage
     * @param user User address
     * @return discount percentage
     */
    function getUserDiscount(address user) external view returns (uint256) {
        return userTiers[user].discountPercentage;
    }
    
    /**
     * @dev Get available rewards
     * @return activeRewards Array of active rewards
     */
    function getAvailableRewards() external view returns (Reward[] memory) {
        uint256 activeCount = 0;
        
        // Count active rewards
        for (uint256 i = 1; i <= _rewardIdCounter.current(); i++) {
            if (rewards[i].active && rewards[i].quantity > rewards[i].quantityRedeemed) {
                activeCount++;
            }
        }
        
        // Create array of active rewards
        Reward[] memory activeRewards = new Reward[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _rewardIdCounter.current(); i++) {
            if (rewards[i].active && rewards[i].quantity > rewards[i].quantityRedeemed) {
                activeRewards[index] = rewards[i];
                index++;
            }
        }
        
        return activeRewards;
    }
    
    /**
     * @dev Get user transaction history
     * @param user User address
     * @param limit Maximum number of transactions to return
     * @return transactions Array of transactions
     */
    function getUserTransactions(address user, uint256 limit) external view returns (PointTransaction[] memory) {
        PointTransaction[] memory userTxs = userTransactions[user];
        uint256 length = userTxs.length;
        
        if (limit > 0 && limit < length) {
            length = limit;
        }
        
        PointTransaction[] memory result = new PointTransaction[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = userTxs[userTxs.length - 1 - i]; // Return most recent first
        }
        
        return result;
    }
    
    /**
     * @dev Check if user can claim reward
     * @param user User address
     * @param rewardId Reward ID
     * @return canClaim true if user can claim
     * @return reason reason if cannot claim
     */
    function canClaimReward(address user, uint256 rewardId) external view returns (bool canClaim, string memory reason) {
        if (!rewards[rewardId].active) {
            return (false, "Reward not active");
        }
        
        if (rewards[rewardId].quantity <= rewards[rewardId].quantityRedeemed) {
            return (false, "Reward out of stock");
        }
        
        if (userTiers[user].pointsBalance < rewards[rewardId].pointsCost) {
            return (false, "Insufficient points");
        }
        
        if (claimedRewards[user][rewardId]) {
            return (false, "Reward already claimed");
        }
        
        return (true, "Can claim");
    }
    
    /**
     * @dev Calculate tier based on points
     * @param points User's points balance
     * @return tier calculated tier
     */
    function _calculateTier(uint256 points) internal view returns (uint256) {
        for (uint256 i = tierThresholds.length - 1; i >= 0; i--) {
            if (points >= tierThresholds[i]) {
                return i;
            }
        }
        return 0;
    }
    
    /**
     * @dev Distribute reward based on type
     * @param user User address
     * @param reward Reward to distribute
     */
    function _distributeReward(address user, Reward memory reward) internal {
        if (reward.rewardType == RewardType.TOKEN_AIRDROP) {
            // Parse reward data for token amount and transfer
            // Implementation would depend on reward data format
        } else if (reward.rewardType == RewardType.NFT_AIRDROP) {
            // Mint NFT to user
            // Implementation would depend on NFT contract
        } else if (reward.rewardType == RewardType.DISCOUNT_CODE) {
            // Generate and provide discount code
            // Implementation would depend on discount system
        }
        // Other reward types would be implemented as needed
    }
    
    /**
     * @dev Record point transaction
     * @param user User address
     * @param points Points amount
     * @param transactionType Type of transaction
     * @param reason Reason for transaction
     * @param referenceId Reference ID
     */
    function _recordTransaction(
        address user,
        uint256 points,
        TransactionType transactionType,
        string memory reason,
        string memory referenceId
    ) internal {
        _transactionIdCounter.increment();
        
        PointTransaction memory transaction = PointTransaction({
            id: _transactionIdCounter.current(),
            user: user,
            points: points,
            transactionType: transactionType,
            reason: reason,
            referenceId: referenceId,
            timestamp: block.timestamp
        });
        
        userTransactions[user].push(transaction);
    }
    
    /**
     * @dev Check if caller is authorized
     * @param caller Caller address
     * @return true if authorized
     */
    function isAuthorizedCaller(address caller) internal pure returns (bool) {
        // Add logic to check if caller is authorized
        // This could include checking against a whitelist or other contracts
        return false;
    }
    
    /**
     * @dev Update tier thresholds (only owner)
     * @param newThresholds New tier thresholds
     */
    function updateTierThresholds(uint256[] calldata newThresholds) external onlyOwner {
        require(newThresholds.length == tierDiscounts.length, "Invalid thresholds length");
        tierThresholds = newThresholds;
    }
    
    /**
     * @dev Update tier discounts (only owner)
     * @param newDiscounts New tier discounts
     */
    function updateTierDiscounts(uint256[] calldata newDiscounts) external onlyOwner {
        require(newDiscounts.length == tierThresholds.length, "Invalid discounts length");
        tierDiscounts = newDiscounts;
    }
    
    /**
     * @dev Get contract version
     * @return version string
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
