// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockNFTFlow
 * @notice Mock implementation of NFTFlow for testing AutonomousController
 */
contract MockNFTFlow {
    mapping(uint256 => uint256) public prices;
    mapping(address => uint256) public collaterals;
    
    uint256 public lastListingId;
    address public lastUser;
    uint256 public lastPrice;
    uint256 public lastCollateral;
    
    event PriceUpdated(uint256 indexed listingId, uint256 newPrice);
    event CollateralUpdated(address indexed user, uint256 newCollateral);
    
    function setPricePerSecond(uint256 listingId, uint256 price) external {
        prices[listingId] = price;
        lastListingId = listingId;
        lastPrice = price;
        emit PriceUpdated(listingId, price);
    }
    
    function setCollateral(address user, uint256 collateral) external {
        collaterals[user] = collateral;
        lastUser = user;
        lastCollateral = collateral;
        emit CollateralUpdated(user, collateral);
    }
    
    function getPrice(uint256 listingId) external view returns (uint256) {
        return prices[listingId];
    }
    
    function getCollateral(address user) external view returns (uint256) {
        return collaterals[user];
    }
}

