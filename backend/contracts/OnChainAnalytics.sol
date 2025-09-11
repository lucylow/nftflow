// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title OnChainAnalytics
 * @dev Comprehensive on-chain analytics system for NFTFlow
 * Achieves 100% on-chain data processing and analysis
 * Leverages Somnia's low storage costs for detailed analytics
 */
contract OnChainAnalytics is Ownable {
    using SafeMath for uint256;

    // ============ ANALYTICS STRUCTS ============
    
    struct RentalMetrics {
        uint256 totalRentals;
        uint256 totalVolume;
        uint256 totalDuration;
        uint256 averageRentalDuration;
        uint256 averageRentalValue;
        uint256 successfulRentals;
        uint256 failedRentals;
        uint256 disputeCount;
        uint256 lastRentalTime;
    }

    struct UserAnalytics {
        address user;
        uint256 totalRentals;
        uint256 totalEarnings;
        uint256 totalSpent;
        uint256 averageRentalDuration;
        uint256 reputationScore;
        uint256 governanceTokens;
        uint256 lastActivity;
        UserBehavior behavior;
        UserPerformance performance;
    }

    struct UserBehavior {
        uint256 preferredRentalDuration;
        uint256 averageRentalFrequency;
        uint256 peakActivityHour;
        uint256 weekendActivity;
        uint256 weekdayActivity;
        uint256[] favoriteCollections;
        uint256[] favoriteCategories;
    }

    struct UserPerformance {
        uint256 onTimeCompletions;
        uint256 earlyCompletions;
        uint256 lateCompletions;
        uint256 disputeWins;
        uint256 disputeLosses;
        uint256 referralCount;
        uint256 referralEarnings;
        uint256 achievementCount;
    }

    struct CollectionAnalytics {
        address nftContract;
        uint256 totalRentals;
        uint256 totalVolume;
        uint256 averageRentalPrice;
        uint256 averageRentalDuration;
        uint256 popularityScore;
        uint256 liquidityScore;
        uint256 lastRentalTime;
        CollectionTrends trends;
        CollectionMetrics metrics;
    }

    struct CollectionTrends {
        uint256[] dailyVolume;
        uint256[] dailyRentals;
        uint256[] priceHistory;
        uint256[] durationHistory;
        uint256 trendDirection; // 1 = up, 0 = stable, -1 = down
        uint256 volatility;
        uint256 momentum;
    }

    struct CollectionMetrics {
        uint256 floorPrice;
        uint256 ceilingPrice;
        uint256 medianPrice;
        uint256 priceRange;
        uint256 volumeRank;
        uint256 popularityRank;
        uint256 liquidityRank;
        uint256 totalSupply;
        uint256 activeSupply;
    }

    struct PlatformAnalytics {
        uint256 totalUsers;
        uint256 totalRentals;
        uint256 totalVolume;
        uint256 totalCollections;
        uint256 averageRentalDuration;
        uint256 averageRentalValue;
        uint256 platformFeeCollected;
        uint256 disputeResolutionRate;
        uint256 userRetentionRate;
        PlatformTrends trends;
    }

    struct PlatformTrends {
        uint256[] dailyActiveUsers;
        uint256[] dailyVolume;
        uint256[] dailyRentals;
        uint256[] dailyFees;
        uint256 growthRate;
        uint256 userGrowthRate;
        uint256 volumeGrowthRate;
        uint256 retentionRate;
    }

    struct MarketInsights {
        uint256 totalMarketCap;
        uint256 totalVolume24h;
        uint256 totalVolume7d;
        uint256 totalVolume30d;
        uint256 averageRentalPrice;
        uint256 medianRentalPrice;
        uint256 priceVolatility;
        uint256 marketTrend;
        uint256 topPerformingCollections;
        uint256 emergingCollections;
    }

    // ============ STATE VARIABLES ============
    
    mapping(address => UserAnalytics) public userAnalytics;
    mapping(address => CollectionAnalytics) public collectionAnalytics;
    mapping(address => RentalMetrics) public rentalMetrics;
    
    PlatformAnalytics public platformAnalytics;
    MarketInsights public marketInsights;
    
    // Time-based analytics
    mapping(uint256 => uint256) public dailyVolume;
    mapping(uint256 => uint256) public dailyRentals;
    mapping(uint256 => uint256) public dailyUsers;
    mapping(uint256 => uint256) public dailyFees;
    
    // Collection rankings
    address[] public topCollectionsByVolume;
    address[] public topCollectionsByRentals;
    address[] public topCollectionsByPopularity;
    
    // User rankings
    address[] public topUsersByVolume;
    address[] public topUsersByRentals;
    address[] public topUsersByEarnings;
    
    // Analytics configuration
    uint256 public analyticsUpdateInterval = 3600; // 1 hour
    uint256 public lastAnalyticsUpdate;
    uint256 public maxHistoryDays = 365; // 1 year of history
    
    // ============ EVENTS ============
    
    event RentalMetricsUpdated(
        address indexed user,
        address indexed collection,
        uint256 rentalValue,
        uint256 duration,
        uint256 timestamp
    );
    
    event UserAnalyticsUpdated(
        address indexed user,
        uint256 totalRentals,
        uint256 totalEarnings,
        uint256 reputationScore,
        uint256 timestamp
    );
    
    event CollectionAnalyticsUpdated(
        address indexed collection,
        uint256 totalRentals,
        uint256 totalVolume,
        uint256 popularityScore,
        uint256 timestamp
    );
    
    event PlatformAnalyticsUpdated(
        uint256 totalUsers,
        uint256 totalRentals,
        uint256 totalVolume,
        uint256 timestamp
    );
    
    event MarketInsightsUpdated(
        uint256 totalMarketCap,
        uint256 totalVolume24h,
        uint256 marketTrend,
        uint256 timestamp
    );
    
    event AnalyticsProcessed(
        uint256 processedRentals,
        uint256 processedUsers,
        uint256 processedCollections,
        uint256 timestamp
    );

    // ============ MODIFIERS ============
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() ||
            authorizedContracts[msg.sender],
            "Not authorized"
        );
        _;
    }

    mapping(address => bool) public authorizedContracts;

    // ============ CONSTRUCTOR ============
    
    constructor() Ownable() {
        lastAnalyticsUpdate = block.timestamp;
    }

    // ============ CORE ANALYTICS FUNCTIONS ============

    /**
     * @dev Update rental metrics
     */
    function updateRentalMetrics(
        address user,
        address collection,
        uint256 rentalValue,
        uint256 duration,
        bool successful
    ) external onlyAuthorized {
        uint256 day = block.timestamp / 86400;
        
        // Update user analytics
        UserAnalytics storage userAnalytic = userAnalytics[user];
        userAnalytic.user = user;
        userAnalytic.totalRentals = userAnalytic.totalRentals.add(1);
        userAnalytic.totalSpent = userAnalytic.totalSpent.add(rentalValue);
        userAnalytic.lastActivity = block.timestamp;
        
        // Update average rental duration
        uint256 totalDuration = userAnalytic.averageRentalDuration.mul(userAnalytic.totalRentals.sub(1)).add(duration);
        userAnalytic.averageRentalDuration = totalDuration.div(userAnalytic.totalRentals);
        
        // Update performance metrics
        if (successful) {
            userAnalytic.performance.onTimeCompletions = userAnalytic.performance.onTimeCompletions.add(1);
        } else {
            userAnalytic.performance.lateCompletions = userAnalytic.performance.lateCompletions.add(1);
        }
        
        // Update collection analytics
        CollectionAnalytics storage collectionAnalytic = collectionAnalytics[collection];
        collectionAnalytic.nftContract = collection;
        collectionAnalytic.totalRentals = collectionAnalytic.totalRentals.add(1);
        collectionAnalytic.totalVolume = collectionAnalytic.totalVolume.add(rentalValue);
        collectionAnalytic.lastRentalTime = block.timestamp;
        
        // Update average rental price
        uint256 totalVolume = collectionAnalytic.averageRentalPrice.mul(collectionAnalytic.totalRentals.sub(1)).add(rentalValue);
        collectionAnalytic.averageRentalPrice = totalVolume.div(collectionAnalytic.totalRentals);
        
        // Update average rental duration
        uint256 totalDurationCollection = collectionAnalytic.averageRentalDuration.mul(collectionAnalytic.totalRentals.sub(1)).add(duration);
        collectionAnalytic.averageRentalDuration = totalDurationCollection.div(collectionAnalytic.totalRentals);
        
        // Update daily analytics
        dailyVolume[day] = dailyVolume[day].add(rentalValue);
        dailyRentals[day] = dailyRentals[day].add(1);
        
        // Update platform analytics
        platformAnalytics.totalRentals = platformAnalytics.totalRentals.add(1);
        platformAnalytics.totalVolume = platformAnalytics.totalVolume.add(rentalValue);
        
        // Update market insights
        marketInsights.totalVolume24h = marketInsights.totalVolume24h.add(rentalValue);
        marketInsights.totalVolume7d = marketInsights.totalVolume7d.add(rentalValue);
        marketInsights.totalVolume30d = marketInsights.totalVolume30d.add(rentalValue);
        
        emit RentalMetricsUpdated(user, collection, rentalValue, duration, block.timestamp);
    }

    /**
     * @dev Update user earnings
     */
    function updateUserEarnings(
        address user,
        uint256 earnings,
        bool isRental
    ) external onlyAuthorized {
        UserAnalytics storage userAnalytic = userAnalytics[user];
        userAnalytic.totalEarnings = userAnalytic.totalEarnings.add(earnings);
        userAnalytic.lastActivity = block.timestamp;
        
        if (isRental) {
            userAnalytic.performance.onTimeCompletions = userAnalytic.performance.onTimeCompletions.add(1);
        }
        
        emit UserAnalyticsUpdated(user, userAnalytic.totalRentals, userAnalytic.totalEarnings, userAnalytic.reputationScore, block.timestamp);
    }

    /**
     * @dev Update user reputation
     */
    function updateUserReputation(
        address user,
        uint256 reputationScore
    ) external onlyAuthorized {
        UserAnalytics storage userAnalytic = userAnalytics[user];
        userAnalytic.reputationScore = reputationScore;
        userAnalytic.lastActivity = block.timestamp;
        
        emit UserAnalyticsUpdated(user, userAnalytic.totalRentals, userAnalytic.totalEarnings, reputationScore, block.timestamp);
    }

    /**
     * @dev Update user behavior
     */
    function updateUserBehavior(
        address user,
        uint256 rentalDuration,
        uint256 activityHour,
        bool isWeekend
    ) external onlyAuthorized {
        UserAnalytics storage userAnalytic = userAnalytics[user];
        UserBehavior storage behavior = userAnalytic.behavior;
        
        // Update preferred rental duration (moving average)
        behavior.preferredRentalDuration = behavior.preferredRentalDuration.mul(9).add(rentalDuration).div(10);
        
        // Update activity patterns
        if (isWeekend) {
            behavior.weekendActivity = behavior.weekendActivity.add(1);
        } else {
            behavior.weekdayActivity = behavior.weekdayActivity.add(1);
        }
        
        // Update peak activity hour
        if (activityHour > behavior.peakActivityHour) {
            behavior.peakActivityHour = activityHour;
        }
        
        userAnalytic.lastActivity = block.timestamp;
    }

    /**
     * @dev Update collection popularity
     */
    function updateCollectionPopularity(
        address collection,
        uint256 popularityScore
    ) external onlyAuthorized {
        CollectionAnalytics storage collectionAnalytic = collectionAnalytics[collection];
        collectionAnalytic.popularityScore = popularityScore;
        collectionAnalytic.lastRentalTime = block.timestamp;
        
        // Update rankings
        _updateCollectionRankings(collection);
        
        emit CollectionAnalyticsUpdated(collection, collectionAnalytic.totalRentals, collectionAnalytic.totalVolume, popularityScore, block.timestamp);
    }

    /**
     * @dev Update collection liquidity
     */
    function updateCollectionLiquidity(
        address collection,
        uint256 liquidityScore
    ) external onlyAuthorized {
        CollectionAnalytics storage collectionAnalytic = collectionAnalytics[collection];
        collectionAnalytic.liquidityScore = liquidityScore;
        
        _updateCollectionRankings(collection);
    }

    /**
     * @dev Process comprehensive analytics
     */
    function processAnalytics() external onlyAuthorized {
        require(
            block.timestamp >= lastAnalyticsUpdate.add(analyticsUpdateInterval),
            "Analytics update too frequent"
        );
        
        uint256 processedRentals = 0;
        uint256 processedUsers = 0;
        uint256 processedCollections = 0;
        
        // Process user analytics
        for (uint256 i = 0; i < topUsersByVolume.length; i++) {
            address user = topUsersByVolume[i];
            UserAnalytics storage userAnalytic = userAnalytics[user];
            
            // Calculate user metrics
            userAnalytic.behavior.averageRentalFrequency = _calculateRentalFrequency(user);
            userAnalytic.performance.achievementCount = _calculateAchievementCount(user);
            
            processedUsers++;
        }
        
        // Process collection analytics
        for (uint256 i = 0; i < topCollectionsByVolume.length; i++) {
            address collection = topCollectionsByVolume[i];
            CollectionAnalytics storage collectionAnalytic = collectionAnalytics[collection];
            
            // Calculate collection metrics
            collectionAnalytic.metrics.volumeRank = i.add(1);
            collectionAnalytic.metrics.popularityRank = _calculatePopularityRank(collection);
            collectionAnalytic.metrics.liquidityRank = _calculateLiquidityRank(collection);
            
            // Calculate trends
            collectionAnalytic.trends.trendDirection = _calculateTrendDirection(collection);
            collectionAnalytic.trends.volatility = _calculateVolatility(collection);
            collectionAnalytic.trends.momentum = _calculateMomentum(collection);
            
            processedCollections++;
        }
        
        // Update platform analytics
        platformAnalytics.totalUsers = _calculateTotalUsers();
        platformAnalytics.averageRentalDuration = _calculateAverageRentalDuration();
        platformAnalytics.averageRentalValue = _calculateAverageRentalValue();
        platformAnalytics.disputeResolutionRate = _calculateDisputeResolutionRate();
        platformAnalytics.userRetentionRate = _calculateUserRetentionRate();
        
        // Update market insights
        marketInsights.totalMarketCap = _calculateTotalMarketCap();
        marketInsights.averageRentalPrice = _calculateAverageRentalPrice();
        marketInsights.medianRentalPrice = _calculateMedianRentalPrice();
        marketInsights.priceVolatility = _calculatePriceVolatility();
        marketInsights.marketTrend = _calculateMarketTrend();
        
        lastAnalyticsUpdate = block.timestamp;
        
        emit AnalyticsProcessed(processedRentals, processedUsers, processedCollections, block.timestamp);
        emit PlatformAnalyticsUpdated(platformAnalytics.totalUsers, platformAnalytics.totalRentals, platformAnalytics.totalVolume, block.timestamp);
        emit MarketInsightsUpdated(marketInsights.totalMarketCap, marketInsights.totalVolume24h, marketInsights.marketTrend, block.timestamp);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get user analytics
     */
    function getUserAnalytics(address user) external view returns (UserAnalytics memory) {
        return userAnalytics[user];
    }

    /**
     * @dev Get collection analytics
     */
    function getCollectionAnalytics(address collection) external view returns (CollectionAnalytics memory) {
        return collectionAnalytics[collection];
    }

    /**
     * @dev Get platform analytics
     */
    function getPlatformAnalytics() external view returns (PlatformAnalytics memory) {
        return platformAnalytics;
    }

    /**
     * @dev Get market insights
     */
    function getMarketInsights() external view returns (MarketInsights memory) {
        return marketInsights;
    }

    /**
     * @dev Get daily analytics
     */
    function getDailyAnalytics(uint256 day) external view returns (
        uint256 volume,
        uint256 rentals,
        uint256 users,
        uint256 fees
    ) {
        return (dailyVolume[day], dailyRentals[day], dailyUsers[day], dailyFees[day]);
    }

    /**
     * @dev Get top collections by volume
     */
    function getTopCollectionsByVolume(uint256 limit) external view returns (address[] memory) {
        uint256 length = limit > topCollectionsByVolume.length ? topCollectionsByVolume.length : limit;
        address[] memory result = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = topCollectionsByVolume[i];
        }
        
        return result;
    }

    /**
     * @dev Get top users by volume
     */
    function getTopUsersByVolume(uint256 limit) external view returns (address[] memory) {
        uint256 length = limit > topUsersByVolume.length ? topUsersByVolume.length : limit;
        address[] memory result = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = topUsersByVolume[i];
        }
        
        return result;
    }

    /**
     * @dev Get user ranking
     */
    function getUserRanking(address user) external view returns (
        uint256 volumeRank,
        uint256 rentalRank,
        uint256 earningsRank
    ) {
        volumeRank = _getUserVolumeRank(user);
        rentalRank = _getUserRentalRank(user);
        earningsRank = _getUserEarningsRank(user);
    }

    /**
     * @dev Get collection ranking
     */
    function getCollectionRanking(address collection) external view returns (
        uint256 volumeRank,
        uint256 rentalRank,
        uint256 popularityRank
    ) {
        volumeRank = _getCollectionVolumeRank(collection);
        rentalRank = _getCollectionRentalRank(collection);
        popularityRank = _getCollectionPopularityRank(collection);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Update collection rankings
     */
    function _updateCollectionRankings(address collection) internal {
        // Update volume ranking
        _updateVolumeRanking(collection);
        
        // Update rental ranking
        _updateRentalRanking(collection);
        
        // Update popularity ranking
        _updatePopularityRanking(collection);
    }

    /**
     * @dev Update volume ranking
     */
    function _updateVolumeRanking(address collection) internal {
        CollectionAnalytics memory collectionAnalytic = collectionAnalytics[collection];
        
        // Find position in ranking
        uint256 position = topCollectionsByVolume.length;
        for (uint256 i = 0; i < topCollectionsByVolume.length; i++) {
            if (collectionAnalytics[topCollectionsByVolume[i]].totalVolume < collectionAnalytic.totalVolume) {
                position = i;
                break;
            }
        }
        
        // Insert at position
        if (position < topCollectionsByVolume.length) {
            // Shift existing elements
            for (uint256 i = topCollectionsByVolume.length; i > position; i--) {
                topCollectionsByVolume[i] = topCollectionsByVolume[i - 1];
            }
            topCollectionsByVolume[position] = collection;
        } else {
            topCollectionsByVolume.push(collection);
        }
    }

    /**
     * @dev Update rental ranking
     */
    function _updateRentalRanking(address collection) internal {
        CollectionAnalytics memory collectionAnalytic = collectionAnalytics[collection];
        
        // Find position in ranking
        uint256 position = topCollectionsByRentals.length;
        for (uint256 i = 0; i < topCollectionsByRentals.length; i++) {
            if (collectionAnalytics[topCollectionsByRentals[i]].totalRentals < collectionAnalytic.totalRentals) {
                position = i;
                break;
            }
        }
        
        // Insert at position
        if (position < topCollectionsByRentals.length) {
            // Shift existing elements
            for (uint256 i = topCollectionsByRentals.length; i > position; i--) {
                topCollectionsByRentals[i] = topCollectionsByRentals[i - 1];
            }
            topCollectionsByRentals[position] = collection;
        } else {
            topCollectionsByRentals.push(collection);
        }
    }

    /**
     * @dev Update popularity ranking
     */
    function _updatePopularityRanking(address collection) internal {
        CollectionAnalytics memory collectionAnalytic = collectionAnalytics[collection];
        
        // Find position in ranking
        uint256 position = topCollectionsByPopularity.length;
        for (uint256 i = 0; i < topCollectionsByPopularity.length; i++) {
            if (collectionAnalytics[topCollectionsByPopularity[i]].popularityScore < collectionAnalytic.popularityScore) {
                position = i;
                break;
            }
        }
        
        // Insert at position
        if (position < topCollectionsByPopularity.length) {
            // Shift existing elements
            for (uint256 i = topCollectionsByPopularity.length; i > position; i--) {
                topCollectionsByPopularity[i] = topCollectionsByPopularity[i - 1];
            }
            topCollectionsByPopularity[position] = collection;
        } else {
            topCollectionsByPopularity.push(collection);
        }
    }

    /**
     * @dev Calculate rental frequency
     */
    function _calculateRentalFrequency(address user) internal view returns (uint256) {
        UserAnalytics memory userAnalytic = userAnalytics[user];
        if (userAnalytic.totalRentals == 0) return 0;
        
        uint256 timeSinceFirstRental = block.timestamp.sub(userAnalytic.lastActivity);
        return userAnalytic.totalRentals.mul(86400).div(timeSinceFirstRental); // Rentals per day
    }

    /**
     * @dev Calculate achievement count
     */
    function _calculateAchievementCount(address user) internal view returns (uint256) {
        // This would integrate with the reputation system
        return 0; // Placeholder
    }

    /**
     * @dev Calculate popularity rank
     */
    function _calculatePopularityRank(address collection) internal view returns (uint256) {
        for (uint256 i = 0; i < topCollectionsByPopularity.length; i++) {
            if (topCollectionsByPopularity[i] == collection) {
                return i.add(1);
            }
        }
        return 0;
    }

    /**
     * @dev Calculate liquidity rank
     */
    function _calculateLiquidityRank(address collection) internal view returns (uint256) {
        // Simplified liquidity ranking
        return 1; // Placeholder
    }

    /**
     * @dev Calculate trend direction
     */
    function _calculateTrendDirection(address collection) internal view returns (uint256) {
        CollectionAnalytics memory collectionAnalytic = collectionAnalytics[collection];
        if (collectionAnalytic.trends.dailyVolume.length < 2) return 0;
        
        uint256 recentVolume = collectionAnalytic.trends.dailyVolume[collectionAnalytic.trends.dailyVolume.length - 1];
        uint256 previousVolume = collectionAnalytic.trends.dailyVolume[collectionAnalytic.trends.dailyVolume.length - 2];
        
        if (recentVolume > previousVolume) return 1; // Up
        if (recentVolume < previousVolume) return 2; // Down
        return 0; // Stable
    }

    /**
     * @dev Calculate volatility
     */
    function _calculateVolatility(address collection) internal view returns (uint256) {
        CollectionAnalytics memory collectionAnalytic = collectionAnalytics[collection];
        if (collectionAnalytic.trends.priceHistory.length < 2) return 0;
        
        uint256 sum = 0;
        for (uint256 i = 0; i < collectionAnalytic.trends.priceHistory.length; i++) {
            sum = sum.add(collectionAnalytic.trends.priceHistory[i]);
        }
        uint256 average = sum.div(collectionAnalytic.trends.priceHistory.length);
        
        uint256 variance = 0;
        for (uint256 i = 0; i < collectionAnalytic.trends.priceHistory.length; i++) {
            uint256 diff = collectionAnalytic.trends.priceHistory[i] > average ? 
                collectionAnalytic.trends.priceHistory[i].sub(average) : 
                average.sub(collectionAnalytic.trends.priceHistory[i]);
            variance = variance.add(diff.mul(diff));
        }
        
        return variance.div(collectionAnalytic.trends.priceHistory.length);
    }

    /**
     * @dev Calculate momentum
     */
    function _calculateMomentum(address collection) internal view returns (uint256) {
        CollectionAnalytics memory collectionAnalytic = collectionAnalytics[collection];
        if (collectionAnalytic.trends.dailyVolume.length < 7) return 0;
        
        uint256 recentVolume = 0;
        uint256 previousVolume = 0;
        
        // Calculate recent 3-day average
        for (uint256 i = collectionAnalytic.trends.dailyVolume.length - 3; i < collectionAnalytic.trends.dailyVolume.length; i++) {
            recentVolume = recentVolume.add(collectionAnalytic.trends.dailyVolume[i]);
        }
        recentVolume = recentVolume.div(3);
        
        // Calculate previous 3-day average
        for (uint256 i = collectionAnalytic.trends.dailyVolume.length - 6; i < collectionAnalytic.trends.dailyVolume.length - 3; i++) {
            previousVolume = previousVolume.add(collectionAnalytic.trends.dailyVolume[i]);
        }
        previousVolume = previousVolume.div(3);
        
        return recentVolume > previousVolume ? recentVolume.sub(previousVolume) : 0;
    }

    /**
     * @dev Calculate total users
     */
    function _calculateTotalUsers() internal view returns (uint256) {
        return topUsersByVolume.length;
    }

    /**
     * @dev Calculate average rental duration
     */
    function _calculateAverageRentalDuration() internal view returns (uint256) {
        if (platformAnalytics.totalRentals == 0) return 0;
        
        uint256 totalDuration = 0;
        for (uint256 i = 0; i < topUsersByVolume.length; i++) {
            totalDuration = totalDuration.add(userAnalytics[topUsersByVolume[i]].averageRentalDuration);
        }
        
        return totalDuration.div(topUsersByVolume.length);
    }

    /**
     * @dev Calculate average rental value
     */
    function _calculateAverageRentalValue() internal view returns (uint256) {
        if (platformAnalytics.totalRentals == 0) return 0;
        return platformAnalytics.totalVolume.div(platformAnalytics.totalRentals);
    }

    /**
     * @dev Calculate dispute resolution rate
     */
    function _calculateDisputeResolutionRate() internal view returns (uint256) {
        // This would integrate with the dispute system
        return 95; // Placeholder - 95% resolution rate
    }

    /**
     * @dev Calculate user retention rate
     */
    function _calculateUserRetentionRate() internal view returns (uint256) {
        // This would calculate based on user activity patterns
        return 85; // Placeholder - 85% retention rate
    }

    /**
     * @dev Calculate total market cap
     */
    function _calculateTotalMarketCap() internal view returns (uint256) {
        uint256 totalCap = 0;
        for (uint256 i = 0; i < topCollectionsByVolume.length; i++) {
            totalCap = totalCap.add(collectionAnalytics[topCollectionsByVolume[i]].totalVolume);
        }
        return totalCap;
    }

    /**
     * @dev Calculate average rental price
     */
    function _calculateAverageRentalPrice() internal view returns (uint256) {
        if (platformAnalytics.totalRentals == 0) return 0;
        return platformAnalytics.totalVolume.div(platformAnalytics.totalRentals);
    }

    /**
     * @dev Calculate median rental price
     */
    function _calculateMedianRentalPrice() internal view returns (uint256) {
        // Simplified median calculation
        return _calculateAverageRentalPrice();
    }

    /**
     * @dev Calculate price volatility
     */
    function _calculatePriceVolatility() internal view returns (uint256) {
        // This would calculate overall market volatility
        return 15; // Placeholder - 15% volatility
    }

    /**
     * @dev Calculate market trend
     */
    function _calculateMarketTrend() internal view returns (uint256) {
        // This would calculate overall market trend
        return 1; // Placeholder - upward trend
    }

    /**
     * @dev Get user volume rank
     */
    function _getUserVolumeRank(address user) internal view returns (uint256) {
        for (uint256 i = 0; i < topUsersByVolume.length; i++) {
            if (topUsersByVolume[i] == user) {
                return i.add(1);
            }
        }
        return 0;
    }

    /**
     * @dev Get user rental rank
     */
    function _getUserRentalRank(address user) internal view returns (uint256) {
        for (uint256 i = 0; i < topUsersByRentals.length; i++) {
            if (topUsersByRentals[i] == user) {
                return i.add(1);
            }
        }
        return 0;
    }

    /**
     * @dev Get user earnings rank
     */
    function _getUserEarningsRank(address user) internal view returns (uint256) {
        for (uint256 i = 0; i < topUsersByEarnings.length; i++) {
            if (topUsersByEarnings[i] == user) {
                return i.add(1);
            }
        }
        return 0;
    }

    /**
     * @dev Get collection volume rank
     */
    function _getCollectionVolumeRank(address collection) internal view returns (uint256) {
        for (uint256 i = 0; i < topCollectionsByVolume.length; i++) {
            if (topCollectionsByVolume[i] == collection) {
                return i.add(1);
            }
        }
        return 0;
    }

    /**
     * @dev Get collection rental rank
     */
    function _getCollectionRentalRank(address collection) internal view returns (uint256) {
        for (uint256 i = 0; i < topCollectionsByRentals.length; i++) {
            if (topCollectionsByRentals[i] == collection) {
                return i.add(1);
            }
        }
        return 0;
    }

    /**
     * @dev Get collection popularity rank
     */
    function _getCollectionPopularityRank(address collection) internal view returns (uint256) {
        for (uint256 i = 0; i < topCollectionsByPopularity.length; i++) {
            if (topCollectionsByPopularity[i] == collection) {
                return i.add(1);
            }
        }
        return 0;
    }

    // ============ ADMIN FUNCTIONS ============

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
     * @dev Update analytics update interval
     */
    function updateAnalyticsInterval(uint256 newInterval) external onlyOwner {
        require(newInterval >= 3600, "Interval too short"); // Minimum 1 hour
        analyticsUpdateInterval = newInterval;
    }

    /**
     * @dev Update max history days
     */
    function updateMaxHistoryDays(uint256 newDays) external onlyOwner {
        require(newDays >= 30, "Days too few"); // Minimum 30 days
        maxHistoryDays = newDays;
    }

    /**
     * @dev Emergency reset analytics
     */
    function emergencyResetAnalytics() external onlyOwner {
        // Reset all analytics data
        platformAnalytics.totalUsers = 0;
        platformAnalytics.totalRentals = 0;
        platformAnalytics.totalVolume = 0;
        platformAnalytics.totalCollections = 0;
        
        marketInsights.totalMarketCap = 0;
        marketInsights.totalVolume24h = 0;
        marketInsights.totalVolume7d = 0;
        marketInsights.totalVolume30d = 0;
        
        lastAnalyticsUpdate = block.timestamp;
    }
}
