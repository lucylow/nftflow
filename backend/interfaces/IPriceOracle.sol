// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPriceOracle
 * @dev Interface for price oracle to get real-time pricing data
 */
interface IPriceOracle {
    /**
     * @dev Get the current price of an NFT collection in wei per second
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID (optional, for individual pricing)
     * @return pricePerSecond The price per second in wei
     */
    function getPricePerSecond(address nftContract, uint256 tokenId) external view returns (uint256 pricePerSecond);

    /**
     * @dev Get the floor price of an NFT collection
     * @param nftContract The address of the NFT contract
     * @return floorPrice The floor price in wei
     */
    function getFloorPrice(address nftContract) external view returns (uint256 floorPrice);

    /**
     * @dev Update the price for an NFT
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID
     * @param pricePerSecond The new price per second in wei
     */
    function updatePrice(address nftContract, uint256 tokenId, uint256 pricePerSecond) external;

    /**
     * @dev Check if the oracle has price data for an NFT
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID
     * @return hasPrice True if price data exists
     */
    function hasPrice(address nftContract, uint256 tokenId) external view returns (bool hasPrice);
}

