// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IPriceOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockPriceOracle is IPriceOracle, Ownable {
    struct PriceData {
        uint256 pricePerSecond;
        uint256 lastUpdated;
        bool exists;
    }
    
    mapping(address => mapping(uint256 => PriceData)) public prices;
    
    // Default prices for different NFT types
    uint256 public constant DEFAULT_GAMING_NFT_PRICE = 0.000001 ether; // 0.000001 STT per second
    uint256 public constant DEFAULT_ART_NFT_PRICE = 0.000002 ether; // 0.000002 STT per second
    uint256 public constant DEFAULT_METAVERSE_NFT_PRICE = 0.000003 ether; // 0.000003 STT per second
    
    event PriceUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newPrice);
    
    constructor() Ownable() {}
    
    function getPrice(address nftContract, uint256 tokenId) external payable override returns (uint256 pricePerSecond) {
        PriceData memory priceData = prices[nftContract][tokenId];
        
        if (priceData.exists) {
            return priceData.pricePerSecond;
        }
        
        // Return default price based on tokenId (mock logic)
        if (tokenId % 3 == 0) {
            return DEFAULT_GAMING_NFT_PRICE;
        } else if (tokenId % 3 == 1) {
            return DEFAULT_ART_NFT_PRICE;
        } else {
            return DEFAULT_METAVERSE_NFT_PRICE;
        }
    }
    
    function updatePrice(address nftContract, uint256 tokenId, uint256 newPrice) external override {
        require(newPrice > 0, "Price must be greater than 0");
        require(msg.sender == owner(), "Only owner can update prices");
        
        prices[nftContract][tokenId] = PriceData({
            pricePerSecond: newPrice,
            lastUpdated: block.timestamp,
            exists: true
        });
        
        emit PriceUpdated(nftContract, tokenId, newPrice);
    }
    
    function getLastUpdated(address nftContract, uint256 tokenId) external view override returns (uint256 timestamp) {
        PriceData memory priceData = prices[nftContract][tokenId];
        return priceData.exists ? priceData.lastUpdated : 0;
    }
    
    function setDefaultPrices(
        uint256 gamingPrice,
        uint256 artPrice,
        uint256 metaversePrice
    ) external onlyOwner {
        // This would update the default prices, but since they're constants,
        // we'll just emit an event for demonstration
        emit PriceUpdated(address(0), 0, gamingPrice);
        emit PriceUpdated(address(0), 1, artPrice);
        emit PriceUpdated(address(0), 2, metaversePrice);
    }
    
    function batchUpdatePrices(
        address[] calldata nftContracts,
        uint256[] calldata tokenIds,
        uint256[] calldata newPrices
    ) external onlyOwner {
        require(nftContracts.length == tokenIds.length, "Arrays length mismatch");
        require(tokenIds.length == newPrices.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < nftContracts.length; i++) {
            require(newPrices[i] > 0, "Price must be greater than 0");
            
            prices[nftContracts[i]][tokenIds[i]] = PriceData({
                pricePerSecond: newPrices[i],
                lastUpdated: block.timestamp,
                exists: true
            });
            
            emit PriceUpdated(nftContracts[i], tokenIds[i], newPrices[i]);
        }
    }
}