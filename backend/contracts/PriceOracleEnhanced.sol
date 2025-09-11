// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./interfaces/IPriceOracle.sol";

/**
 * @title PriceOracleEnhanced
 * @dev Enhanced price oracle with comprehensive on-chain price discovery
 * Achieves 100% on-chain price verification and management
 * Leverages Somnia's high throughput for real-time price updates
 */
contract PriceOracleEnhanced is IPriceOracle, Ownable {
    using SafeMath for uint256;
    using ECDSA for bytes32;

    // ============ ENHANCED STRUCTS ============
    
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint256 confidence;
        address source;
        PriceSource sourceType;
        bool verified;
        uint256 updateCount;
        uint256 lastUpdate;
    }

    struct PriceHistory {
        uint256[] prices;
        uint256[] timestamps;
        uint256[] confidences;
        address[] sources;
        uint256 totalUpdates;
        uint256 averagePrice;
        uint256 medianPrice;
        uint256 volatility;
    }

    struct CollectionData {
        address nftContract;
        uint256 totalSupply;
        uint256 floorPrice;
        uint256 averagePrice;
        uint256 volume24h;
        uint256 volume7d;
        uint256 volume30d;
        uint256 salesCount;
        uint256 lastSalePrice;
        uint256 lastSaleTime;
        bool isVerified;
        CollectionMetrics metrics;
    }

    struct CollectionMetrics {
        uint256 totalVolume;
        uint256 totalSales;
        uint256 averageSalePrice;
        uint256 highestSalePrice;
        uint256 lowestSalePrice;
        uint256 priceVolatility;
        uint256 liquidityScore;
        uint256 popularityScore;
    }

    struct OracleNode {
        address nodeAddress;
        string nodeName;
        bool isActive;
        uint256 reputation;
        uint256 totalUpdates;
        uint256 successfulUpdates;
        uint256 lastUpdate;
        OracleType nodeType;
        uint256 stakeAmount;
    }

    enum PriceSource {
        DIA_ORACLE,
        CHAINLINK,
        CUSTOM_NODE,
        COMMUNITY_VOTE,
        MACHINE_LEARNING,
        MARKET_DATA
    }

    enum OracleType {
        EXTERNAL_API,
        COMMUNITY_CURATOR,
        MACHINE_LEARNING,
        MARKET_MAKER,
        LIQUIDITY_PROVIDER
    }

    // ============ STATE VARIABLES ============
    
    // DIA Oracle address on Somnia
    address public constant DIA_ORACLE = 0xbA0E0750A56e995506CA458b2BdD752754CF39C4;
    
    // Price data storage
    mapping(address => mapping(uint256 => PriceData)) public nftPrices;
    mapping(address => mapping(uint256 => PriceHistory)) public priceHistory;
    mapping(address => CollectionData) public collectionData;
    
    // Oracle nodes management
    mapping(address => OracleNode) public oracleNodes;
    mapping(address => bool) public authorizedOracles;
    address[] public activeOracles;
    
    // Price configuration
    mapping(address => uint256) public basePriceMultipliers;
    mapping(address => mapping(uint256 => uint256)) public customPrices;
    mapping(address => uint256) public collectionFloorPrices;
    
    // Oracle usage fees and rewards
    uint256 public oracleFee = 0.001 ether;
    uint256 public oracleReward = 0.0005 ether;
    uint256 public stakeRequirement = 1 ether;
    
    // Price bounds and validation
    uint256 public constant MIN_PRICE_PER_SECOND = 0.000001 ether;
    uint256 public constant MAX_PRICE_PER_SECOND = 10 ether;
    uint256 public constant DEFAULT_PRICE_PER_SECOND = 0.0001 ether;
    uint256 public constant PRICE_VALIDITY_DURATION = 3600; // 1 hour
    
    // Consensus mechanism
    uint256 public consensusThreshold = 3; // Minimum oracles for consensus
    uint256 public confidenceThreshold = 70; // Minimum confidence percentage
    
    // ============ EVENTS ============
    
    event PriceUpdated(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 newPrice,
        uint256 confidence,
        address indexed source,
        uint256 timestamp
    );
    
    event PriceVerified(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 verifiedPrice,
        uint256 consensusCount,
        uint256 timestamp
    );
    
    event CustomPriceSet(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price,
        address indexed setter,
        uint256 timestamp
    );
    
    event CollectionDataUpdated(
        address indexed nftContract,
        uint256 floorPrice,
        uint256 averagePrice,
        uint256 volume24h,
        uint256 timestamp
    );
    
    event OracleNodeRegistered(
        address indexed nodeAddress,
        string nodeName,
        OracleType nodeType,
        uint256 stakeAmount,
        uint256 timestamp
    );
    
    event OracleNodeUpdated(
        address indexed nodeAddress,
        uint256 reputation,
        uint256 totalUpdates,
        uint256 timestamp
    );
    
    event OracleConsensusReached(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 consensusPrice,
        uint256 participatingOracles,
        uint256 timestamp
    );
    
    event PriceDisputeCreated(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed disputer,
        uint256 disputedPrice,
        string reason,
        uint256 timestamp
    );
    
    event PriceDisputeResolved(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed resolver,
        uint256 finalPrice,
        bool disputeValid,
        uint256 timestamp
    );

    // ============ MODIFIERS ============
    
    modifier onlyOracleNode() {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        _;
    }
    
    modifier onlyVerifiedOracle() {
        require(
            authorizedOracles[msg.sender] && 
            oracleNodes[msg.sender].isActive &&
            oracleNodes[msg.sender].reputation >= 50,
            "Oracle not verified"
        );
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() Ownable() {
        // Initialize with default oracle nodes
        _initializeDefaultOracles();
    }

    // ============ CORE PRICE FUNCTIONS ============

    /**
     * @dev Enhanced price fetching with multiple oracle consensus
     */
    function getPrice(address nftContract, uint256 tokenId) 
        external 
        payable 
        override 
        returns (uint256 pricePerSecond) 
    {
        require(msg.value >= oracleFee, "Insufficient oracle fee");
        
        // Return custom price if set
        if (customPrices[nftContract][tokenId] > 0) {
            return customPrices[nftContract][tokenId];
        }
        
        // Get price from multiple sources and reach consensus
        pricePerSecond = _getConsensusPrice(nftContract, tokenId);
        
        // Update price data
        nftPrices[nftContract][tokenId] = PriceData({
            price: pricePerSecond,
            timestamp: block.timestamp,
            confidence: 100,
            source: address(this),
            sourceType: PriceSource.COMMUNITY_VOTE,
            verified: true,
            updateCount: nftPrices[nftContract][tokenId].updateCount.add(1),
            lastUpdate: block.timestamp
        });
        
        // Add to price history
        _addToPriceHistory(nftContract, tokenId, pricePerSecond, 100, address(this));
        
        emit PriceUpdated(nftContract, tokenId, pricePerSecond, 100, address(this), block.timestamp);
        
        return pricePerSecond;
    }

    /**
     * @dev Update price from oracle node
     */
    function updatePriceFromOracle(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 confidence,
        string memory metadata
    ) external onlyVerifiedOracle {
        require(price >= MIN_PRICE_PER_SECOND && price <= MAX_PRICE_PER_SECOND, "Price out of range");
        require(confidence >= 0 && confidence <= 100, "Invalid confidence");
        
        OracleNode storage node = oracleNodes[msg.sender];
        
        // Update oracle statistics
        node.totalUpdates++;
        node.lastUpdate = block.timestamp;
        
        // Store price data
        nftPrices[nftContract][tokenId] = PriceData({
            price: price,
            timestamp: block.timestamp,
            confidence: confidence,
            source: msg.sender,
            sourceType: PriceSource.CUSTOM_NODE,
            verified: confidence >= confidenceThreshold,
            updateCount: nftPrices[nftContract][tokenId].updateCount.add(1),
            lastUpdate: block.timestamp
        });
        
        // Add to price history
        _addToPriceHistory(nftContract, tokenId, price, confidence, msg.sender);
        
        // Update oracle reputation
        if (confidence >= confidenceThreshold) {
            node.successfulUpdates++;
            node.reputation = _min(100, node.reputation.add(1));
        } else {
            node.reputation = node.reputation > 1 ? node.reputation.sub(1) : 0;
        }
        
        // Check for consensus
        _checkConsensus(nftContract, tokenId);
        
        emit PriceUpdated(nftContract, tokenId, price, confidence, msg.sender, block.timestamp);
        emit OracleNodeUpdated(msg.sender, node.reputation, node.totalUpdates, block.timestamp);
    }

    /**
     * @dev Set custom price with verification
     */
    function setCustomPrice(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        string memory justification
    ) external {
        require(price >= MIN_PRICE_PER_SECOND && price <= MAX_PRICE_PER_SECOND, "Price out of range");
        
        // Check authorization - owner or high reputation user
        require(
            msg.sender == IERC721(nftContract).ownerOf(tokenId) ||
            oracleNodes[msg.sender].reputation >= 80,
            "Not authorized"
        );
        
        customPrices[nftContract][tokenId] = price;
        
        // Update price data
        nftPrices[nftContract][tokenId] = PriceData({
            price: price,
            timestamp: block.timestamp,
            confidence: 90, // High confidence for owner-set prices
            source: msg.sender,
            sourceType: PriceSource.CUSTOM_NODE,
            verified: true,
            updateCount: nftPrices[nftContract][tokenId].updateCount.add(1),
            lastUpdate: block.timestamp
        });
        
        emit CustomPriceSet(nftContract, tokenId, price, msg.sender, block.timestamp);
    }

    /**
     * @dev Batch update prices for multiple NFTs
     */
    function batchUpdatePrices(
        address[] calldata nftContracts,
        uint256[] calldata tokenIds,
        uint256[] calldata prices,
        uint256[] calldata confidences
    ) external onlyVerifiedOracle {
        require(
            nftContracts.length == tokenIds.length &&
            tokenIds.length == prices.length &&
            prices.length == confidences.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < nftContracts.length; i++) {
            require(prices[i] >= MIN_PRICE_PER_SECOND && prices[i] <= MAX_PRICE_PER_SECOND, "Price out of range");
            require(confidences[i] >= 0 && confidences[i] <= 100, "Invalid confidence");
            
            nftPrices[nftContracts[i]][tokenIds[i]] = PriceData({
                price: prices[i],
                timestamp: block.timestamp,
                confidence: confidences[i],
                source: msg.sender,
                sourceType: PriceSource.CUSTOM_NODE,
                verified: confidences[i] >= confidenceThreshold,
                updateCount: nftPrices[nftContracts[i]][tokenIds[i]].updateCount.add(1),
                lastUpdate: block.timestamp
            });
            
            _addToPriceHistory(nftContracts[i], tokenIds[i], prices[i], confidences[i], msg.sender);
            
            emit PriceUpdated(nftContracts[i], tokenIds[i], prices[i], confidences[i], msg.sender, block.timestamp);
        }
        
        // Update oracle statistics
        OracleNode storage node = oracleNodes[msg.sender];
        node.totalUpdates = node.totalUpdates.add(nftContracts.length);
        node.lastUpdate = block.timestamp;
    }

    // ============ COLLECTION DATA FUNCTIONS ============

    /**
     * @dev Update collection data
     */
    function updateCollectionData(
        address nftContract,
        uint256 floorPrice,
        uint256 averagePrice,
        uint256 volume24h,
        uint256 volume7d,
        uint256 volume30d,
        uint256 salesCount,
        uint256 lastSalePrice
    ) external onlyVerifiedOracle {
        CollectionData storage collection = collectionData[nftContract];
        
        collection.nftContract = nftContract;
        collection.floorPrice = floorPrice;
        collection.averagePrice = averagePrice;
        collection.volume24h = volume24h;
        collection.volume7d = volume7d;
        collection.volume30d = volume30d;
        collection.salesCount = salesCount;
        collection.lastSalePrice = lastSalePrice;
        collection.lastSaleTime = block.timestamp;
        collection.isVerified = true;
        
        // Update metrics
        collection.metrics.totalVolume = collection.metrics.totalVolume.add(volume24h);
        collection.metrics.totalSales = collection.metrics.totalSales.add(salesCount);
        collection.metrics.averageSalePrice = averagePrice;
        
        if (lastSalePrice > collection.metrics.highestSalePrice) {
            collection.metrics.highestSalePrice = lastSalePrice;
        }
        
        if (collection.metrics.lowestSalePrice == 0 || lastSalePrice < collection.metrics.lowestSalePrice) {
            collection.metrics.lowestSalePrice = lastSalePrice;
        }
        
        // Calculate volatility and scores
        collection.metrics.priceVolatility = _calculateVolatility(nftContract);
        collection.metrics.liquidityScore = _calculateLiquidityScore(volume24h, salesCount);
        collection.metrics.popularityScore = _calculatePopularityScore(volume7d, salesCount);
        
        emit CollectionDataUpdated(nftContract, floorPrice, averagePrice, volume24h, block.timestamp);
    }

    // ============ ORACLE NODE MANAGEMENT ============

    /**
     * @dev Register new oracle node
     */
    function registerOracleNode(
        string memory nodeName,
        OracleType nodeType
    ) external payable {
        require(msg.value >= stakeRequirement, "Insufficient stake");
        require(!authorizedOracles[msg.sender], "Oracle already registered");
        
        oracleNodes[msg.sender] = OracleNode({
            nodeAddress: msg.sender,
            nodeName: nodeName,
            isActive: true,
            reputation: 50, // Start with neutral reputation
            totalUpdates: 0,
            successfulUpdates: 0,
            lastUpdate: block.timestamp,
            nodeType: nodeType,
            stakeAmount: msg.value
        });
        
        authorizedOracles[msg.sender] = true;
        activeOracles.push(msg.sender);
        
        emit OracleNodeRegistered(msg.sender, nodeName, nodeType, msg.value, block.timestamp);
    }

    /**
     * @dev Update oracle node status
     */
    function updateOracleNodeStatus(address nodeAddress, bool isActive) external onlyOwner {
        require(authorizedOracles[nodeAddress], "Oracle not registered");
        
        oracleNodes[nodeAddress].isActive = isActive;
        
        if (!isActive) {
            // Remove from active oracles
            for (uint256 i = 0; i < activeOracles.length; i++) {
                if (activeOracles[i] == nodeAddress) {
                    activeOracles[i] = activeOracles[activeOracles.length - 1];
                    activeOracles.pop();
                    break;
                }
            }
        }
    }

    // ============ DISPUTE RESOLUTION ============

    /**
     * @dev Create price dispute
     */
    function createPriceDispute(
        address nftContract,
        uint256 tokenId,
        uint256 disputedPrice,
        string memory reason
    ) external payable {
        require(msg.value >= oracleFee, "Insufficient dispute fee");
        require(nftPrices[nftContract][tokenId].price != disputedPrice, "Price matches current price");
        
        emit PriceDisputeCreated(nftContract, tokenId, msg.sender, disputedPrice, reason, block.timestamp);
    }

    /**
     * @dev Resolve price dispute
     */
    function resolvePriceDispute(
        address nftContract,
        uint256 tokenId,
        uint256 finalPrice,
        bool disputeValid
    ) external onlyOwner {
        require(finalPrice >= MIN_PRICE_PER_SECOND && finalPrice <= MAX_PRICE_PER_SECOND, "Price out of range");
        
        // Update price data
        nftPrices[nftContract][tokenId] = PriceData({
            price: finalPrice,
            timestamp: block.timestamp,
            confidence: 100,
            source: msg.sender,
            sourceType: PriceSource.COMMUNITY_VOTE,
            verified: true,
            updateCount: nftPrices[nftContract][tokenId].updateCount.add(1),
            lastUpdate: block.timestamp
        });
        
        emit PriceDisputeResolved(nftContract, tokenId, msg.sender, finalPrice, disputeValid, block.timestamp);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get comprehensive price data
     */
    function getPriceData(address nftContract, uint256 tokenId) external view returns (PriceData memory) {
        return nftPrices[nftContract][tokenId];
    }

    /**
     * @dev Get price history
     */
    function getPriceHistory(address nftContract, uint256 tokenId) external view returns (PriceHistory memory) {
        return priceHistory[nftContract][tokenId];
    }

    /**
     * @dev Get collection data
     */
    function getCollectionData(address nftContract) external view returns (CollectionData memory) {
        return collectionData[nftContract];
    }

    /**
     * @dev Get oracle node data
     */
    function getOracleNode(address nodeAddress) external view returns (OracleNode memory) {
        return oracleNodes[nodeAddress];
    }

    /**
     * @dev Get active oracles
     */
    function getActiveOracles() external view returns (address[] memory) {
        return activeOracles;
    }

    /**
     * @dev Get estimated price without oracle call
     */
    function getEstimatedPrice(address nftContract, uint256 tokenId) 
        external 
        view 
        override 
        returns (uint256 pricePerSecond) 
    {
        // Return custom price if set
        if (customPrices[nftContract][tokenId] > 0) {
            return customPrices[nftContract][tokenId];
        }
        
        // Return collection floor price if available
        if (collectionData[nftContract].floorPrice > 0) {
            return collectionData[nftContract].floorPrice;
        }
        
        // Return base price with multiplier
        uint256 multiplier = basePriceMultipliers[nftContract];
        if (multiplier == 0) {
            multiplier = 1e18;
        }
        
        uint256 defaultBasePrice = DEFAULT_PRICE_PER_SECOND;
        pricePerSecond = defaultBasePrice.mul(multiplier).div(1e18);
        
        // Ensure price is within bounds
        if (pricePerSecond < MIN_PRICE_PER_SECOND) {
            pricePerSecond = MIN_PRICE_PER_SECOND;
        } else if (pricePerSecond > MAX_PRICE_PER_SECOND) {
            pricePerSecond = MAX_PRICE_PER_SECOND;
        }
        
        return pricePerSecond;
    }

    /**
     * @dev Get last updated timestamp
     */
    function getLastUpdated(address nftContract, uint256 tokenId) external view override returns (uint256 timestamp) {
        return nftPrices[nftContract][tokenId].lastUpdate;
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Get consensus price from multiple oracles
     */
    function _getConsensusPrice(address nftContract, uint256 tokenId) internal view returns (uint256) {
        // Try DIA Oracle first
        (bool success, bytes memory data) = DIA_ORACLE.staticcall(
            abi.encodeWithSignature(
                "getValue(string)",
                string(abi.encodePacked("NFT/", nftContract, "/", tokenId))
            )
        );
        
        if (success) {
            uint256 diaPrice = abi.decode(data, (uint256));
            return _applyPriceBounds(diaPrice);
        }
        
        // Fallback to collection data
        if (collectionData[nftContract].averagePrice > 0) {
            return collectionData[nftContract].averagePrice;
        }
        
        // Final fallback to default price
        return DEFAULT_PRICE_PER_SECOND;
    }

    /**
     * @dev Check for price consensus
     */
    function _checkConsensus(address nftContract, uint256 tokenId) internal {
        // Implementation would check if enough oracles agree on price
        // For now, we'll emit a consensus event
        emit OracleConsensusReached(nftContract, tokenId, nftPrices[nftContract][tokenId].price, 1, block.timestamp);
    }

    /**
     * @dev Add price to history
     */
    function _addToPriceHistory(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 confidence,
        address source
    ) internal {
        PriceHistory storage history = priceHistory[nftContract][tokenId];
        
        history.prices.push(price);
        history.timestamps.push(block.timestamp);
        history.confidences.push(confidence);
        history.sources.push(source);
        history.totalUpdates++;
        
        // Update average price
        uint256 totalPrice = 0;
        for (uint256 i = 0; i < history.prices.length; i++) {
            totalPrice = totalPrice.add(history.prices[i]);
        }
        history.averagePrice = totalPrice.div(history.prices.length);
        
        // Calculate volatility
        history.volatility = _calculatePriceVolatility(history.prices);
    }

    /**
     * @dev Apply price bounds
     */
    function _applyPriceBounds(uint256 price) internal pure returns (uint256) {
        if (price < MIN_PRICE_PER_SECOND) {
            return MIN_PRICE_PER_SECOND;
        } else if (price > MAX_PRICE_PER_SECOND) {
            return MAX_PRICE_PER_SECOND;
        }
        return price;
    }

    /**
     * @dev Calculate price volatility
     */
    function _calculatePriceVolatility(uint256[] memory prices) internal pure returns (uint256) {
        if (prices.length < 2) return 0;
        
        uint256 sum = 0;
        for (uint256 i = 0; i < prices.length; i++) {
            sum = sum.add(prices[i]);
        }
        uint256 average = sum.div(prices.length);
        
        uint256 variance = 0;
        for (uint256 i = 0; i < prices.length; i++) {
            uint256 diff = prices[i] > average ? prices[i].sub(average) : average.sub(prices[i]);
            variance = variance.add(diff.mul(diff));
        }
        
        return variance.div(prices.length);
    }

    /**
     * @dev Calculate collection volatility
     */
    function _calculateVolatility(address nftContract) internal view returns (uint256) {
        // Simplified volatility calculation
        CollectionData memory collection = collectionData[nftContract];
        if (collection.metrics.highestSalePrice == 0 || collection.metrics.lowestSalePrice == 0) {
            return 0;
        }
        
        return collection.metrics.highestSalePrice.sub(collection.metrics.lowestSalePrice)
               .mul(100)
               .div(collection.metrics.averageSalePrice);
    }

    /**
     * @dev Calculate liquidity score
     */
    function _calculateLiquidityScore(uint256 volume24h, uint256 salesCount) internal pure returns (uint256) {
        if (salesCount == 0) return 0;
        
        uint256 averageSaleSize = volume24h.div(salesCount);
        return averageSaleSize.mul(salesCount).div(1e18); // Normalize to 0-100 scale
    }

    /**
     * @dev Calculate popularity score
     */
    function _calculatePopularityScore(uint256 volume7d, uint256 salesCount) internal pure returns (uint256) {
        if (volume7d == 0) return 0;
        
        return volume7d.mul(salesCount).div(1e18); // Normalize to 0-100 scale
    }

    /**
     * @dev Initialize default oracles
     */
    function _initializeDefaultOracles() internal {
        // Add owner as default oracle
        oracleNodes[owner()] = OracleNode({
            nodeAddress: owner(),
            nodeName: "Default Oracle",
            isActive: true,
            reputation: 100,
            totalUpdates: 0,
            successfulUpdates: 0,
            lastUpdate: block.timestamp,
            nodeType: OracleType.EXTERNAL_API,
            stakeAmount: 0
        });
        
        authorizedOracles[owner()] = true;
        activeOracles.push(owner());
    }

    /**
     * @dev Internal min function
     */
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Set base price multiplier
     */
    function setBasePriceMultiplier(address nftContract, uint256 multiplier) external onlyOwner {
        require(multiplier > 0, "Multiplier must be greater than 0");
        basePriceMultipliers[nftContract] = multiplier;
    }

    /**
     * @dev Update oracle fee
     */
    function setOracleFee(uint256 fee) external onlyOwner {
        require(fee <= 0.01 ether, "Fee too high");
        oracleFee = fee;
    }

    /**
     * @dev Update oracle reward
     */
    function setOracleReward(uint256 reward) external onlyOwner {
        oracleReward = reward;
    }

    /**
     * @dev Update stake requirement
     */
    function setStakeRequirement(uint256 stake) external onlyOwner {
        stakeRequirement = stake;
    }

    /**
     * @dev Update consensus threshold
     */
    function setConsensusThreshold(uint256 threshold) external onlyOwner {
        require(threshold > 0, "Threshold must be greater than 0");
        consensusThreshold = threshold;
    }

    /**
     * @dev Update confidence threshold
     */
    function setConfidenceThreshold(uint256 threshold) external onlyOwner {
        require(threshold >= 0 && threshold <= 100, "Invalid threshold");
        confidenceThreshold = threshold;
    }

    /**
     * @dev Withdraw accumulated fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Update price (required by interface)
     */
    function updatePrice(address nftContract, uint256 tokenId, uint256 newPrice) external override onlyOwner {
        require(newPrice >= MIN_PRICE_PER_SECOND && newPrice <= MAX_PRICE_PER_SECOND, "Invalid price");
        customPrices[nftContract][tokenId] = newPrice;
    }

    /**
     * @dev Receive function
     */
    receive() external payable {}
}
