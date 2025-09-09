// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPriceOracle {
    /// @notice Get the rental price per second for an NFT
    /// @param nftContract The address of the NFT contract
    /// @param tokenId The token ID of the NFT
    /// @return pricePerSecond The rental price per second in wei
    function getPrice(address nftContract, uint256 tokenId) external payable returns (uint256 pricePerSecond);
    
    /// @notice Update the price for an NFT
    /// @param nftContract The address of the NFT contract
    /// @param tokenId The token ID of the NFT
    /// @param newPrice The new rental price per second in wei
    function updatePrice(address nftContract, uint256 tokenId, uint256 newPrice) external;
    
    /// @notice Get the last updated timestamp for an NFT price
    /// @param nftContract The address of the NFT contract
    /// @param tokenId The token ID of the NFT
    /// @return timestamp The last updated timestamp
    function getLastUpdated(address nftContract, uint256 tokenId) external view returns (uint256 timestamp);
}
