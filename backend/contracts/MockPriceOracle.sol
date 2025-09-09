// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IPriceOracle.sol";

/**
 * @title MockPriceOracle
 * @dev Mock price oracle contract for testing purposes
 */
contract MockPriceOracle is IPriceOracle {
    mapping(address => mapping(uint256 => uint256)) private prices;
    mapping(address => uint256) private floorPrices;
    mapping(address => mapping(uint256 => bool)) private hasPriceData;

    function getPricePerSecond(address nftContract, uint256 tokenId) 
        external 
        view 
        override 
        returns (uint256 pricePerSecond) 
    {
        if (hasPriceData[nftContract][tokenId]) {
            return prices[nftContract][tokenId];
        }
        // Default price for testing
        return 1e15; // 0.001 ETH per second
    }

    function getFloorPrice(address nftContract) 
        external 
        view 
        override 
        returns (uint256 floorPrice) 
    {
        return floorPrices[nftContract] > 0 ? floorPrices[nftContract] : 1e18; // 1 ETH default
    }

    function updatePrice(address nftContract, uint256 tokenId, uint256 pricePerSecond) 
        external 
        override 
    {
        prices[nftContract][tokenId] = pricePerSecond;
        hasPriceData[nftContract][tokenId] = true;
    }

    function hasPrice(address nftContract, uint256 tokenId) 
        external 
        view 
        override 
        returns (bool) 
    {
        return hasPriceData[nftContract][tokenId];
    }

    // Additional functions for testing
    function setFloorPrice(address nftContract, uint256 floorPrice) external {
        floorPrices[nftContract] = floorPrice;
    }
}

