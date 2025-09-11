// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IPriceOracle.sol";

/**
 * @title DynamicPricingEngine
 * @dev AI-powered dynamic pricing system based on real-time demand and utilization
 * Leverages Somnia's high TPS for real-time price updates
 */
contract DynamicPricingEngine is Ownable, ReentrancyGuard {
    
    // Pricing data structure
    struct PricingData {
        uint256 basePrice;
        uint256 currentPrice;
        uint256 utilizationRate; // 0-10000 (basis points)
        uint256 demandScore; // 0-10000 (basis points)
        uint256 timeOfDayMultiplier; // 0-10000 (basis points)
        uint256 lastUpdate;
        uint256 totalRentals;
        uint256 activeRentals;
        uint256 averageRentalDuration;
    }
    
    // Time-based pricing tiers
    struct TimeTier {
        uint256 startHour; // 0-23
        uint256 endHour;   // 0-23
        uint256 multiplier; // Basis points (10000 = 1x)
        string name;
    }
    
    // Demand factors
    struct DemandFactors {
        uint256 rentalFrequency; // Rentals per hour
        uint256 averageDuration; // Average rental duration
        uint256 uniqueRenters; // Unique renters in last 24h
        uint256 priceElasticity; // How price affects demand
        uint256 marketTrend; // Overall market trend
    }
    
    // State variables
    mapping(address => mapping(uint256 => PricingData)) public nftPricing;
    mapping(address => uint256) public collectionBasePrices;
    mapping(address => uint256) public collectionMultipliers;
    
    TimeTier[] public timeTiers;
    DemandFactors public globalDemandFactors;
    
    // Pricing parameters
    uint256 public constant MIN_PRICE_MULTIPLIER = 100; // 1% minimum
    uint256 public constant MAX_PRICE_MULTIPLIER = 10000; // 100x maximum
    uint256 public constant PRICE_UPDATE_INTERVAL = 300; // 5 minutes
    uint256 public constant DEMAND_DECAY_RATE = 95; // 5% decay per hour
    
    // Events
    event PriceUpdated(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 utilizationRate,
        uint256 demandScore
    );
    
    event DemandFactorsUpdated(
        uint256 rentalFrequency,
        uint256 averageDuration,
        uint256 uniqueRenters,
        uint256 priceElasticity,
        uint256 marketTrend
    );
    
    event TimeTierAdded(
        uint256 startHour,
        uint256 endHour,
        uint256 multiplier,
        string name
    );
    
    constructor() {
        _initializeTimeTiers();
        _initializeDemandFactors();
    }
    
    /**
     * @dev Get dynamic price for NFT
     * @param nftContract NFT contract address
     * @param tokenId NFT token ID
     * @return price Dynamic price per second
     */
    function getDynamicPrice(address nftContract, uint256 tokenId) 
        external 
        view 
        returns (uint256 price) 
    {
        PricingData memory pricing = nftPricing[nftContract][tokenId];
        
        if (pricing.basePrice == 0) {
            // Use collection base price if individual pricing not set
            pricing.basePrice = collectionBasePrices[nftContract];
            if (pricing.basePrice == 0) {
                pricing.basePrice = 0.00001 ether; // Default price
            }
        }
        
        // Calculate time-based multiplier
        uint256 timeMultiplier = _getTimeOfDayMultiplier();
        
        // Calculate demand-based multiplier
        uint256 demandMultiplier = _calculateDemandMultiplier(pricing);
        
        // Calculate utilization multiplier
        uint256 utilizationMultiplier = _calculateUtilizationMultiplier(pricing);
        
        // Apply all multipliers
        price = pricing.basePrice;
        price = (price * timeMultiplier) / 10000;
        price = (price * demandMultiplier) / 10000;
        price = (price * utilizationMultiplier) / 10000;
        
        // Ensure price is within bounds
        if (price < 0.000001 ether) price = 0.000001 ether;
        if (price > 1 ether) price = 1 ether;
        
        return price;
    }
    
    /**
     * @dev Update pricing data for NFT
     * @param nftContract NFT contract address
     * @param tokenId NFT token ID
     * @param basePrice Base price per second
     */
    function updatePricingData(
        address nftContract,
        uint256 tokenId,
        uint256 basePrice
    ) external onlyOwner {
        require(basePrice >= 0.000001 ether, "Price too low");
        require(basePrice <= 1 ether, "Price too high");
        
        PricingData storage pricing = nftPricing[nftContract][tokenId];
        uint256 oldPrice = pricing.currentPrice;
        
        pricing.basePrice = basePrice;
        pricing.currentPrice = basePrice;
        pricing.lastUpdate = block.timestamp;
        
        emit PriceUpdated(nftContract, tokenId, oldPrice, basePrice, 0, 0);
    }
    
    /**
     * @dev Record rental activity for dynamic pricing
     * @param nftContract NFT contract address
     * @param tokenId NFT token ID
     * @param duration Rental duration in seconds
     * @param pricePaid Price paid for rental
     */
    function recordRentalActivity(
        address nftContract,
        uint256 tokenId,
        uint256 duration,
        uint256 pricePaid
    ) external {
        PricingData storage pricing = nftPricing[nftContract][tokenId];
        
        // Update rental statistics
        pricing.totalRentals++;
        pricing.averageRentalDuration = 
            (pricing.averageRentalDuration * (pricing.totalRentals - 1) + duration) / 
            pricing.totalRentals;
        
        // Update utilization rate
        uint256 currentUtilization = _calculateCurrentUtilization(nftContract, tokenId);
        pricing.utilizationRate = currentUtilization;
        
        // Update demand score
        pricing.demandScore = _calculateDemandScore(nftContract, tokenId);
        
        // Update price based on new data
        _updateDynamicPrice(nftContract, tokenId);
    }
    
    /**
     * @dev Update global demand factors
     * @param rentalFrequency Rentals per hour
     * @param averageDuration Average rental duration
     * @param uniqueRenters Unique renters in last 24h
     * @param priceElasticity Price elasticity factor
     * @param marketTrend Overall market trend
     */
    function updateDemandFactors(
        uint256 rentalFrequency,
        uint256 averageDuration,
        uint256 uniqueRenters,
        uint256 priceElasticity,
        uint256 marketTrend
    ) external onlyOwner {
        globalDemandFactors = DemandFactors({
            rentalFrequency: rentalFrequency,
            averageDuration: averageDuration,
            uniqueRenters: uniqueRenters,
            priceElasticity: priceElasticity,
            marketTrend: marketTrend
        });
        
        emit DemandFactorsUpdated(
            rentalFrequency,
            averageDuration,
            uniqueRenters,
            priceElasticity,
            marketTrend
        );
    }
    
    /**
     * @dev Add time-based pricing tier
     * @param startHour Start hour (0-23)
     * @param endHour End hour (0-23)
     * @param multiplier Price multiplier in basis points
     * @param name Tier name
     */
    function addTimeTier(
        uint256 startHour,
        uint256 endHour,
        uint256 multiplier,
        string memory name
    ) external onlyOwner {
        require(startHour < 24 && endHour < 24, "Invalid hour");
        require(multiplier >= MIN_PRICE_MULTIPLIER && multiplier <= MAX_PRICE_MULTIPLIER, "Invalid multiplier");
        
        timeTiers.push(TimeTier({
            startHour: startHour,
            endHour: endHour,
            multiplier: multiplier,
            name: name
        }));
        
        emit TimeTierAdded(startHour, endHour, multiplier, name);
    }
    
    /**
     * @dev Set collection base price
     * @param nftContract NFT contract address
     * @param basePrice Base price per second
     */
    function setCollectionBasePrice(address nftContract, uint256 basePrice) external onlyOwner {
        require(basePrice >= 0.000001 ether, "Price too low");
        require(basePrice <= 1 ether, "Price too high");
        
        collectionBasePrices[nftContract] = basePrice;
    }
    
    /**
     * @dev Set collection multiplier
     * @param nftContract NFT contract address
     * @param multiplier Collection multiplier in basis points
     */
    function setCollectionMultiplier(address nftContract, uint256 multiplier) external onlyOwner {
        require(multiplier >= MIN_PRICE_MULTIPLIER && multiplier <= MAX_PRICE_MULTIPLIER, "Invalid multiplier");
        
        collectionMultipliers[nftContract] = multiplier;
    }
    
    /**
     * @dev Get time of day multiplier
     * @return multiplier Time-based price multiplier
     */
    function _getTimeOfDayMultiplier() internal view returns (uint256 multiplier) {
        uint256 currentHour = (block.timestamp / 3600) % 24;
        
        for (uint256 i = 0; i < timeTiers.length; i++) {
            TimeTier memory tier = timeTiers[i];
            
            if (tier.startHour <= tier.endHour) {
                // Normal case: start <= end
                if (currentHour >= tier.startHour && currentHour <= tier.endHour) {
                    return tier.multiplier;
                }
            } else {
                // Wraparound case: start > end (e.g., 22-6 for night hours)
                if (currentHour >= tier.startHour || currentHour <= tier.endHour) {
                    return tier.multiplier;
                }
            }
        }
        
        return 10000; // Default 1x multiplier
    }
    
    /**
     * @dev Calculate demand-based multiplier
     * @param pricing Pricing data
     * @return multiplier Demand-based price multiplier
     */
    function _calculateDemandMultiplier(PricingData memory pricing) internal view returns (uint256 multiplier) {
        // Base multiplier from demand score
        uint256 baseMultiplier = 10000 + (pricing.demandScore / 100); // 1% per 100 demand points
        
        // Apply global demand factors
        if (globalDemandFactors.rentalFrequency > 100) { // High frequency
            baseMultiplier = (baseMultiplier * 11000) / 10000; // +10%
        }
        
        if (globalDemandFactors.marketTrend > 5000) { // Bullish trend
            baseMultiplier = (baseMultiplier * 10500) / 10000; // +5%
        } else if (globalDemandFactors.marketTrend < 5000) { // Bearish trend
            baseMultiplier = (baseMultiplier * 9500) / 10000; // -5%
        }
        
        // Apply price elasticity
        if (pricing.currentPrice > pricing.basePrice) {
            // Price is above base, check if demand is still high
            if (pricing.demandScore > 7000) {
                baseMultiplier = (baseMultiplier * 10200) / 10000; // +2% for high demand despite high price
            } else {
                baseMultiplier = (baseMultiplier * 9800) / 10000; // -2% for low demand with high price
            }
        }
        
        // Ensure within bounds
        if (baseMultiplier < MIN_PRICE_MULTIPLIER) baseMultiplier = MIN_PRICE_MULTIPLIER;
        if (baseMultiplier > MAX_PRICE_MULTIPLIER) baseMultiplier = MAX_PRICE_MULTIPLIER;
        
        return baseMultiplier;
    }
    
    /**
     * @dev Calculate utilization-based multiplier
     * @param pricing Pricing data
     * @return multiplier Utilization-based price multiplier
     */
    function _calculateUtilizationMultiplier(PricingData memory pricing) internal pure returns (uint256 multiplier) {
        if (pricing.utilizationRate >= 9000) { // 90%+ utilization
            return 12000; // +20%
        } else if (pricing.utilizationRate >= 7000) { // 70%+ utilization
            return 11000; // +10%
        } else if (pricing.utilizationRate >= 5000) { // 50%+ utilization
            return 10500; // +5%
        } else if (pricing.utilizationRate >= 3000) { // 30%+ utilization
            return 10000; // No change
        } else if (pricing.utilizationRate >= 1000) { // 10%+ utilization
            return 9500; // -5%
        } else { // <10% utilization
            return 9000; // -10%
        }
    }
    
    /**
     * @dev Calculate current utilization rate
     * @param nftContract NFT contract address
     * @param tokenId NFT token ID
     * @return utilizationRate Current utilization rate in basis points
     */
    function _calculateCurrentUtilization(address nftContract, uint256 tokenId) internal view returns (uint256 utilizationRate) {
        // This would integrate with the rental contract to get active rentals
        // For now, return a mock value
        return 5000; // 50% utilization
    }
    
    /**
     * @dev Calculate demand score
     * @param nftContract NFT contract address
     * @param tokenId NFT token ID
     * @return demandScore Demand score in basis points
     */
    function _calculateDemandScore(address nftContract, uint256 tokenId) internal view returns (uint256 demandScore) {
        PricingData memory pricing = nftPricing[nftContract][tokenId];
        
        // Base score from rental frequency
        uint256 frequencyScore = (pricing.totalRentals * 1000) / 100; // 10 points per rental
        
        // Duration score (longer rentals = higher demand)
        uint256 durationScore = (pricing.averageRentalDuration * 100) / 3600; // 1 point per hour
        
        // Utilization score
        uint256 utilizationScore = pricing.utilizationRate;
        
        // Combine scores
        demandScore = (frequencyScore + durationScore + utilizationScore) / 3;
        
        // Apply decay over time
        uint256 timeSinceUpdate = block.timestamp - pricing.lastUpdate;
        uint256 decayFactor = (DEMAND_DECAY_RATE ** (timeSinceUpdate / 3600)) / (100 ** (timeSinceUpdate / 3600));
        demandScore = (demandScore * decayFactor) / 10000;
        
        // Ensure within bounds
        if (demandScore > 10000) demandScore = 10000;
        
        return demandScore;
    }
    
    /**
     * @dev Update dynamic price for NFT
     * @param nftContract NFT contract address
     * @param tokenId NFT token ID
     */
    function _updateDynamicPrice(address nftContract, uint256 tokenId) internal {
        PricingData storage pricing = nftPricing[nftContract][tokenId];
        
        if (pricing.basePrice == 0) return;
        
        uint256 oldPrice = pricing.currentPrice;
        
        // Calculate new price
        uint256 timeMultiplier = _getTimeOfDayMultiplier();
        uint256 demandMultiplier = _calculateDemandMultiplier(pricing);
        uint256 utilizationMultiplier = _calculateUtilizationMultiplier(pricing);
        
        uint256 newPrice = pricing.basePrice;
        newPrice = (newPrice * timeMultiplier) / 10000;
        newPrice = (newPrice * demandMultiplier) / 10000;
        newPrice = (newPrice * utilizationMultiplier) / 10000;
        
        // Ensure within bounds
        if (newPrice < 0.000001 ether) newPrice = 0.000001 ether;
        if (newPrice > 1 ether) newPrice = 1 ether;
        
        pricing.currentPrice = newPrice;
        pricing.lastUpdate = block.timestamp;
        
        emit PriceUpdated(
            nftContract,
            tokenId,
            oldPrice,
            newPrice,
            pricing.utilizationRate,
            pricing.demandScore
        );
    }
    
    /**
     * @dev Initialize default time tiers
     */
    function _initializeTimeTiers() internal {
        timeTiers.push(TimeTier({
            startHour: 0,
            endHour: 6,
            multiplier: 8000, // 0.8x - Night discount
            name: "Night Hours"
        }));
        
        timeTiers.push(TimeTier({
            startHour: 6,
            endHour: 12,
            multiplier: 10000, // 1x - Morning
            name: "Morning Hours"
        }));
        
        timeTiers.push(TimeTier({
            startHour: 12,
            endHour: 18,
            multiplier: 12000, // 1.2x - Afternoon premium
            name: "Afternoon Peak"
        }));
        
        timeTiers.push(TimeTier({
            startHour: 18,
            endHour: 24,
            multiplier: 15000, // 1.5x - Evening premium
            name: "Evening Peak"
        }));
    }
    
    /**
     * @dev Initialize default demand factors
     */
    function _initializeDemandFactors() internal {
        globalDemandFactors = DemandFactors({
            rentalFrequency: 50, // 50 rentals per hour
            averageDuration: 3600, // 1 hour average
            uniqueRenters: 1000, // 1000 unique renters
            priceElasticity: 5000, // Neutral elasticity
            marketTrend: 5000 // Neutral trend
        });
    }
    
    /**
     * @dev Get pricing data for NFT
     * @param nftContract NFT contract address
     * @param tokenId NFT token ID
     * @return pricing Pricing data
     */
    function getPricingData(address nftContract, uint256 tokenId) 
        external 
        view 
        returns (PricingData memory pricing) 
    {
        return nftPricing[nftContract][tokenId];
    }
    
    /**
     * @dev Get all time tiers
     * @return tiers Array of time tiers
     */
    function getAllTimeTiers() external view returns (TimeTier[] memory tiers) {
        return timeTiers;
    }
    
    /**
     * @dev Get global demand factors
     * @return factors Global demand factors
     */
    function getGlobalDemandFactors() external view returns (DemandFactors memory factors) {
        return globalDemandFactors;
    }
}

