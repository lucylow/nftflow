// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IReputationSystem {
    function updateReputation(address user, bool rentalSuccessful) external;
    function getReputationScore(address user) external view returns (uint256);
    function getUserStats(address user) external view returns (
        uint256 score,
        uint256 totalRentals,
        uint256 successfulRentals,
        uint256 successRate,
        uint256 totalEarnings,
        uint256 lastActivity
    );
    function requiresCollateral(address user) external view returns (bool);
    function getCollateralMultiplier(address user) external view returns (uint256);
    function whitelistUser(address user, bool status) external;
}
