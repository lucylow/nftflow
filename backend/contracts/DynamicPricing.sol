// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IPriceOracle.sol";
import "./ReputationSystem.sol";

/**
 * @title DynamicPricing
 * @dev Implements dynamic pricing algorithm with demand-based multipliers and reputation discounts
 * Based on market conditions, utilization rates, and user reputation
 */
contract DynamicPricing is Ownable, ReentrancyGuard {

    struct PricingData {
        uint256 basePrice;
        uint256 utilizationRate; // Basis points (10000 = 100%)
        uint256 lastUpdate;
        uint256 rentalCount;
        uint256 totalRentalTime;
        uint256 rollingWindowStart;
    }

    struct CollectionPricing {
        uint256 floorPrice;
        uint256 averagePrice;
        uint256 lastSalePrice;
        uint256 rarityScore;
        uint256 lastUpdate;
    }

    // State variables
    mapping(address => mapping(uint256 => PricingData)) public nftPricingData;
    mapping(address => CollectionPricing) public collectionPricing;
    mapping(address => bool) public authorizedContracts;
    
    IPriceOracle public priceOracle;
    ReputationSystem public reputationSystem;
    
    // Pricing parameters
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant HIGH_UTILIZATION_THRESHOLD = 8000; // 80%
    uint256 public constant LOW_UTILIZATION_THRESHOLD = 2000;  // 20%
    uint256 public constant ROLLING_WINDOW = 7 days;
    
    // Multipliers (in basis points)
    uint256 public highDemandMultiplier = 15000; // 1.5x
    uint256 public lowDemandMultiplier = 7500;   // 0.75x
    uint256 public maxMultiplier = 20000;        // 2.0x
    uint256 public minMultiplier = 5000;         // 0.5x
    
    // Reputation discounts (in basis points)
    uint256 public highReputationDiscount = 500;  // 5%
    uint256 public midReputationDiscount = 250;   // 2.5%
    uint256 public lowReputationDiscount = 100;   // 1%
    
    // Oracle-based pricing parameters
    uint256 public oraclePriceMultiplier = 11; // 0.000000011 (100% APR equivalent)
    uint256 public constant ORACLE_DIVISOR = 1000000000; // 1e9
    
    // Events
    event PricingDataUpdated(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 newUtilizationRate,
        uint256 newPrice
    );
    
    event CollectionPricingUpdated(
        address indexed nftContract,
        uint256 floorPrice,
        uint256 averagePrice,
        uint256 lastSalePrice
    );
    
    event PricingParametersUpdated(
        uint256 highDemandMultiplier,
        uint256 lowDemandMultiplier,
        uint256 maxMultiplier,
        uint256 minMultiplier
    );

    modifier onlyAuthorized() {
        require(
            authorizedContracts[msg.sender] || 
            msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    constructor(address _priceOracle, address _reputationSystem) {
        priceOracle = IPriceOracle(_priceOracle);
        reputationSystem = ReputationSystem(_reputationSystem);
    }

    /**
     * @dev Get dynamic price for an NFT based on market conditions and user reputation
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID
     * @param basePrice Base price per second
     * @param user User address for reputation-based discounts
     * @return Dynamic price per second
     */
    function getDynamicPrice(
        address nftContract,
        uint256 tokenId,
        uint256 basePrice,
        address user
    ) external view returns (uint256) {
        // Start with base price
        uint256 dynamicPrice = basePrice;
        
        // Apply utilization-based multiplier
        uint256 utilizationMultiplier = _getUtilizationMultiplier(nftContract, tokenId);
        dynamicPrice = dynamicPrice * utilizationMultiplier / BASIS_POINTS;
        
        // Apply oracle-based pricing if available
        uint256 oraclePrice = _getOracleBasedPrice(nftContract, tokenId);
        if (oraclePrice > 0) {
            // Blend oracle price with current price (70% current, 30% oracle)
            dynamicPrice = (dynamicPrice * 7000 + oraclePrice * 3000) / BASIS_POINTS;
        }
        
        // Apply reputation-based discount
        uint256 reputationDiscount = _getReputationDiscount(user);
        if (reputationDiscount > 0) {
            dynamicPrice = dynamicPrice * (BASIS_POINTS - reputationDiscount) / BASIS_POINTS;
        }
        
        // Ensure price is within bounds
        uint256 minPrice = basePrice * minMultiplier / BASIS_POINTS;
        uint256 maxPrice = basePrice * maxMultiplier / BASIS_POINTS;
        
        if (dynamicPrice < minPrice) {
            dynamicPrice = minPrice;
        } else if (dynamicPrice > maxPrice) {
            dynamicPrice = maxPrice;
        }
        
        return dynamicPrice;
    }

    /**
     * @dev Update pricing data after a rental
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID
     * @param rentalDuration Duration of the rental in seconds
     * @param pricePerSecond Price per second of the rental
     */
    function updatePricingData(
        address nftContract,
        uint256 tokenId,
        uint256 rentalDuration,
        uint256 pricePerSecond
    ) external onlyAuthorized {
        PricingData storage data = nftPricingData[nftContract][tokenId];
        
        // Update rolling window if needed
        if (block.timestamp - data.rollingWindowStart > ROLLING_WINDOW) {
            data.rollingWindowStart = block.timestamp - ROLLING_WINDOW;
            data.rentalCount = 0;
            data.totalRentalTime = 0;
        }
        
        // Update rental statistics
        data.rentalCount++;
        data.totalRentalTime += rentalDuration;
        data.lastUpdate = block.timestamp;
        
        // Calculate utilization rate
        uint256 windowDuration = block.timestamp - data.rollingWindowStart;
        if (windowDuration > 0) {
            data.utilizationRate = (data.totalRentalTime * BASIS_POINTS) / windowDuration;
        }
        
        emit PricingDataUpdated(nftContract, tokenId, data.utilizationRate, pricePerSecond);
    }

    /**
     * @dev Update collection pricing data from oracle
     * @param nftContract Address of the NFT contract
     */
    function updateCollectionPricing(address nftContract) external onlyAuthorized {
        try priceOracle.getFloorPrice(nftContract) returns (uint256 floorPrice) {
            try priceOracle.getAveragePrice(nftContract) returns (uint256 averagePrice) {
                try priceOracle.getLastSalePrice(nftContract) returns (uint256 lastSalePrice) {
                    collectionPricing[nftContract] = CollectionPricing({
                        floorPrice: floorPrice,
                        averagePrice: averagePrice,
                        lastSalePrice: lastSalePrice,
                        rarityScore: 0, // Would need additional oracle for rarity
                        lastUpdate: block.timestamp
                    });
                    
                    emit CollectionPricingUpdated(nftContract, floorPrice, averagePrice, lastSalePrice);
                } catch {
                    // Handle oracle failure gracefully
                }
            } catch {
                // Handle oracle failure gracefully
            }
        } catch {
            // Handle oracle failure gracefully
        }
    }

    /**
     * @dev Get utilization-based price multiplier
     */
    function _getUtilizationMultiplier(
        address nftContract,
        uint256 tokenId
    ) internal view returns (uint256) {
        PricingData memory data = nftPricingData[nftContract][tokenId];
        
        if (data.utilizationRate >= HIGH_UTILIZATION_THRESHOLD) {
            return highDemandMultiplier;
        } else if (data.utilizationRate <= LOW_UTILIZATION_THRESHOLD) {
            return lowDemandMultiplier;
        } else {
            // Linear interpolation between thresholds
            uint256 range = HIGH_UTILIZATION_THRESHOLD - LOW_UTILIZATION_THRESHOLD;
            uint256 position = data.utilizationRate - LOW_UTILIZATION_THRESHOLD;
            uint256 multiplierRange = highDemandMultiplier - lowDemandMultiplier;
            
            return lowDemandMultiplier + (multiplierRange * position / range);
        }
    }

    /**
     * @dev Get oracle-based price suggestion
     */
    function _getOracleBasedPrice(
        address nftContract,
        uint256 /* tokenId */
    ) internal view returns (uint256) {
        CollectionPricing memory collection = collectionPricing[nftContract];
        
        // Use last sale price if available, otherwise use average price
        uint256 referencePrice = collection.lastSalePrice > 0 
            ? collection.lastSalePrice 
            : collection.averagePrice;
        
        if (referencePrice == 0) {
            return 0;
        }
        
        // Calculate suggested price: (OraclePrice * 0.000000011) / 3600
        // This suggests a rate that would equate to 100% APR if rented continuously
        return (referencePrice * oraclePriceMultiplier) / (ORACLE_DIVISOR * 3600);
    }

    /**
     * @dev Get reputation-based discount
     */
    function _getReputationDiscount(address user) internal view returns (uint256) {
        if (address(reputationSystem) == address(0)) {
            return 0;
        }
        
        try reputationSystem.getReputationScore(user) returns (uint256 reputationScore) {
            if (reputationScore >= 800) {
                return highReputationDiscount;
            } else if (reputationScore >= 500) {
                return midReputationDiscount;
            } else if (reputationScore >= 100) {
                return lowReputationDiscount;
            }
        } catch {
            // Handle reputation system failure gracefully
        }
        
        return 0;
    }

    /**
     * @dev Get current utilization rate for an NFT
     */
    function getUtilizationRate(address nftContract, uint256 tokenId) external view returns (uint256) {
        return nftPricingData[nftContract][tokenId].utilizationRate;
    }

    /**
     * @dev Get pricing data for an NFT
     */
    function getPricingData(address nftContract, uint256 tokenId) external view returns (PricingData memory) {
        return nftPricingData[nftContract][tokenId];
    }

    /**
     * @dev Get collection pricing data
     */
    function getCollectionPricing(address nftContract) external view returns (CollectionPricing memory) {
        return collectionPricing[nftContract];
    }

    /**
     * @dev Check if an NFT has high utility demand
     */
    function hasHighUtilityDemand(address nftContract, uint256 tokenId) external view returns (bool) {
        return nftPricingData[nftContract][tokenId].utilizationRate >= HIGH_UTILIZATION_THRESHOLD;
    }

    /**
     * @dev Get suggested price based on oracle data
     */
    function getSuggestedPrice(address nftContract, uint256 /* tokenId */) external view returns (uint256) {
        return _getOracleBasedPrice(nftContract, 0);
    }

    /**
     * @dev Update pricing parameters (only owner)
     */
    function updatePricingParameters(
        uint256 _highDemandMultiplier,
        uint256 _lowDemandMultiplier,
        uint256 _maxMultiplier,
        uint256 _minMultiplier
    ) external onlyOwner {
        require(_maxMultiplier >= _minMultiplier, "Invalid multiplier range");
        require(_highDemandMultiplier >= _lowDemandMultiplier, "Invalid demand multiplier range");
        
        highDemandMultiplier = _highDemandMultiplier;
        lowDemandMultiplier = _lowDemandMultiplier;
        maxMultiplier = _maxMultiplier;
        minMultiplier = _minMultiplier;
        
        emit PricingParametersUpdated(_highDemandMultiplier, _lowDemandMultiplier, _maxMultiplier, _minMultiplier);
    }

    /**
     * @dev Update reputation discount percentages
     */
    function updateReputationDiscounts(
        uint256 _highReputationDiscount,
        uint256 _midReputationDiscount,
        uint256 _lowReputationDiscount
    ) external onlyOwner {
        require(_highReputationDiscount <= 1000, "Discount too high"); // Max 10%
        require(_midReputationDiscount <= 1000, "Discount too high");
        require(_lowReputationDiscount <= 1000, "Discount too high");
        
        highReputationDiscount = _highReputationDiscount;
        midReputationDiscount = _midReputationDiscount;
        lowReputationDiscount = _lowReputationDiscount;
    }

    /**
     * @dev Update oracle price multiplier
     */
    function updateOraclePriceMultiplier(uint256 _multiplier) external onlyOwner {
        require(_multiplier > 0, "Multiplier must be positive");
        oraclePriceMultiplier = _multiplier;
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
     * @dev Update price oracle address
     */
    function updatePriceOracle(address _priceOracle) external onlyOwner {
        require(_priceOracle != address(0), "Invalid oracle address");
        priceOracle = IPriceOracle(_priceOracle);
    }

    /**
     * @dev Update reputation system address
     */
    function updateReputationSystem(address _reputationSystem) external onlyOwner {
        reputationSystem = ReputationSystem(_reputationSystem);
    }

    /**
     * @dev Get comprehensive pricing information for an NFT
     */
    function getComprehensivePricing(
        address nftContract,
        uint256 tokenId,
        uint256 basePrice,
        address user
    ) external view returns (
        uint256 dynamicPrice,
        uint256 utilizationRate,
        uint256 utilizationMultiplier,
        uint256 oraclePrice,
        uint256 reputationDiscount,
        uint256 finalPrice
    ) {
        PricingData memory data = nftPricingData[nftContract][tokenId];
        utilizationRate = data.utilizationRate;
        utilizationMultiplier = _getUtilizationMultiplier(nftContract, tokenId);
        oraclePrice = _getOracleBasedPrice(nftContract, tokenId);
        reputationDiscount = _getReputationDiscount(user);
        
        // Calculate final price
        dynamicPrice = basePrice * utilizationMultiplier / BASIS_POINTS;
        
        if (oraclePrice > 0) {
            dynamicPrice = (dynamicPrice * 7000 + oraclePrice * 3000) / BASIS_POINTS;
        }
        
        if (reputationDiscount > 0) {
            dynamicPrice = dynamicPrice * (BASIS_POINTS - reputationDiscount) / BASIS_POINTS;
        }
        
        // Apply bounds
        uint256 minPrice = basePrice * minMultiplier / BASIS_POINTS;
        uint256 maxPrice = basePrice * maxMultiplier / BASIS_POINTS;
        
        if (dynamicPrice < minPrice) {
            finalPrice = minPrice;
        } else if (dynamicPrice > maxPrice) {
            finalPrice = maxPrice;
        } else {
            finalPrice = dynamicPrice;
        }
    }
}
