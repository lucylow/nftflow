// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockReputation
 * @notice Mock implementation of ReputationSystem for testing AutonomousController
 */
contract MockReputation {
    mapping(address => uint256) public reputationScores;
    
    uint256 public lastUser;
    uint256 public lastDelta;
    
    event ReputationUpdated(address indexed user, uint256 delta);
    
    function updateReputation(address user, uint256 delta) external {
        reputationScores[user] += delta;
        lastUser = user;
        lastDelta = delta;
        emit ReputationUpdated(user, delta);
    }
    
    function getReputation(address user) external view returns (uint256) {
        return reputationScores[user];
    }
}

