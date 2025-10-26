// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AIAgentManager
 * @dev Manages autonomous AI agents on Somnia blockchain
 * @notice This contract tracks AI agent actions and provides on-chain governance
 */
contract AIAgentManager is Ownable, ReentrancyGuard {
    struct AIAgent {
        address agentAddress;
        string agentType; // "pricing", "recommendation", "collateral"
        bool isActive;
        uint256 lastActionTimestamp;
        uint256 totalActions;
        uint256 successfulActions;
    }
    
    struct AgentAction {
        uint256 agentId;
        string actionType;
        bytes data;
        uint256 timestamp;
        bool success;
    }
    
    mapping(uint256 => AIAgent) public agents;
    mapping(uint256 => AgentAction[]) public agentActionHistory;
    uint256 public nextAgentId;
    
    event AgentRegistered(uint256 indexed agentId, address indexed agentAddress, string agentType);
    event AgentActionExecuted(uint256 indexed agentId, string actionType, bool success);
    event AgentStatusChanged(uint256 indexed agentId, bool isActive);
    
    /**
     * @dev Register a new AI agent
     * @param _agentAddress The address of the agent
     * @param _agentType The type of agent (pricing, recommendation, collateral)
     */
    function registerAgent(
        address _agentAddress,
        string memory _agentType
    ) external onlyOwner returns (uint256) {
        require(_agentAddress != address(0), "Invalid agent address");
        
        uint256 agentId = nextAgentId++;
        
        agents[agentId] = AIAgent({
            agentAddress: _agentAddress,
            agentType: _agentType,
            isActive: true,
            lastActionTimestamp: block.timestamp,
            totalActions: 0,
            successfulActions: 0
        });
        
        emit AgentRegistered(agentId, _agentAddress, _agentType);
        return agentId;
    }
    
    /**
     * @dev Execute an autonomous agent action
     * @param _agentId The ID of the agent
     * @param _actionType The type of action
     * @param _data The action data
     */
    function executeAgentAction(
        uint256 _agentId,
        string memory _actionType,
        bytes memory _data
    ) external nonReentrant {
        AIAgent storage agent = agents[_agentId];
        require(agent.isActive, "Agent is not active");
        require(msg.sender == agent.agentAddress, "Unauthorized agent");
        require(bytes(_actionType).length > 0, "Invalid action type");
        
        // Record action
        AgentAction memory action = AgentAction({
            agentId: _agentId,
            actionType: _actionType,
            data: _data,
            timestamp: block.timestamp,
            success: true
        });
        
        agentActionHistory[_agentId].push(action);
        
        // Update agent stats
        agent.totalActions++;
        agent.successfulActions++;
        agent.lastActionTimestamp = block.timestamp;
        
        emit AgentActionExecuted(_agentId, _actionType, true);
    }
    
    /**
     * @dev Get agent performance metrics
     * @param _agentId The ID of the agent
     * @return totalActions The total number of actions performed
     * @return successfulActions The number of successful actions
     * @return successRate The success rate in percentage
     * @return lastActionTimestamp The timestamp of the last action
     */
    function getAgentMetrics(uint256 _agentId) external view returns (
        uint256 totalActions,
        uint256 successfulActions,
        uint256 successRate,
        uint256 lastActionTimestamp
    ) {
        AIAgent memory agent = agents[_agentId];
        
        totalActions = agent.totalActions;
        successfulActions = agent.successfulActions;
        successRate = agent.totalActions > 0 
            ? (agent.successfulActions * 100) / agent.totalActions 
            : 0;
        lastActionTimestamp = agent.lastActionTimestamp;
    }
    
    /**
     * @dev Get agent action history
     * @param _agentId The ID of the agent
     * @return actions The array of agent actions
     */
    function getAgentActionHistory(uint256 _agentId) external view returns (AgentAction[] memory) {
        return agentActionHistory[_agentId];
    }
    
    /**
     * @dev Toggle agent active status
     * @param _agentId The ID of the agent
     * @param _isActive The new status
     */
    function setAgentStatus(uint256 _agentId, bool _isActive) external onlyOwner {
        require(agents[_agentId].agentAddress != address(0), "Agent does not exist");
        agents[_agentId].isActive = _isActive;
        emit AgentStatusChanged(_agentId, _isActive);
    }
    
    /**
     * @dev Get the number of registered agents
     * @return count The number of registered agents
     */
    function getAgentCount() external view returns (uint256) {
        return nextAgentId;
    }
    
    /**
     * @dev Check if an agent is active
     * @param _agentId The ID of the agent
     * @return isActive Whether the agent is active
     */
    function isAgentActive(uint256 _agentId) external view returns (bool) {
        return agents[_agentId].isActive;
    }
}

