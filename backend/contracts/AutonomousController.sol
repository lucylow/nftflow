// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// Minimal controller that allows authorized AGENT_ROLE to propose or perform limited actions.
/// Intended to be used behind a Timelock in production for sensitive operations.
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface INFTFlow {
    function setPricePerSecond(uint256 listingId, uint256 price) external;
    function setCollateral(address user, uint256 amount) external;
}

/**
 * @title AutonomousController
 * @dev Safe, role-based controller for AI agent actions on Somnia blockchain
 * @notice Part of NFTFlow's accessible AI agent dApp for Somnia AI Hackathon
 */
contract AutonomousController is AccessControl, Pausable {
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    INFTFlow public nftflow;

    event AgentPriceProposal(address indexed agent, uint256 indexed listingId, uint256 newPrice, string reasonCID);
    event AgentCollateralSet(address indexed agent, address indexed user, uint256 newCollateral, string reasonCID);
    event AgentExecuted(address indexed agent, string action, bytes data);
    event AgentRecommendation(uint256 indexed listingId, uint256 score, string reasoning);

    constructor(address nftflowAddr, address admin) {
        nftflow = INFTFlow(nftflowAddr);
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(ADMIN_ROLE, admin);
        _setupRole(GUARDIAN_ROLE, admin);
    }

    /// Agents call this to request a price change. Event is emitted so indexer + UI can show proposed changes.
    /// NOTE: in production, restrict or schedule heavy changes via TimelockController.
    function agentProposePrice(uint256 listingId, uint256 newPrice, string calldata reasonCID)
        external onlyRole(AGENT_ROLE) whenNotPaused
    {
        // on-chain bounds checks (example)
        require(newPrice <= 1e24 /* huge cap so not too restrictive */, "price too high");
        require(newPrice >= 1e12, "price too low"); // minimum viable price
        emit AgentPriceProposal(_msgSender(), listingId, newPrice, reasonCID);
    }

    /// Agents can emit recommendations without executing
    function agentRecommend(uint256 listingId, uint256 score, string calldata reasoning)
        external onlyRole(AGENT_ROLE) whenNotPaused
    {
        emit AgentRecommendation(listingId, score, reasoning);
    }

    /// Agents can call limited "safe" operations if granted AGENT_ROLE. Example: small collateral adjustments.
    function agentSetCollateral(address user, uint256 newCollateral, string calldata reasonCID)
        external onlyRole(AGENT_ROLE) whenNotPaused
    {
        // policy: only reduce up to 50% per call (example)
        // nftflow should enforce final invariants, controller is an optional front-door
        emit AgentCollateralSet(_msgSender(), user, newCollateral, reasonCID);
        // Commented out for now - implement once NFTFlow contract is updated
        // nftflow.setCollateral(user, newCollateral);
    }

    /// Optional execute hook to run a single action if AGENT_ROLE permitted (use cautiously)
    function agentExecute(bytes calldata encodedCall, string calldata reasonCID) 
        external onlyRole(AGENT_ROLE) whenNotPaused 
    {
        // Forward low-risk calls to nftflow as an example (NOT recommended for all production)
        // decoded selector check should be enforced here in production.
        (bool ok, ) = address(nftflow).call(encodedCall);
        require(ok, "forward failed");
        emit AgentExecuted(_msgSender(), "forward", encodedCall);
    }

    function guardianPause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
    }

    function guardianUnpause() external onlyRole(GUARDIAN_ROLE) {
        _unpause();
    }

    /// Grant agent role to a bot/service
    function grantAgentRole(address agent) external onlyRole(ADMIN_ROLE) {
        grantRole(AGENT_ROLE, agent);
    }

    /// Revoke agent role
    function revokeAgentRole(address agent) external onlyRole(ADMIN_ROLE) {
        revokeRole(AGENT_ROLE, agent);
    }
}
