// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title NFTFlowGovernance
 * @dev Decentralized governance system for NFTFlow platform
 * @notice Manages proposals, voting, and execution of platform changes
 */
contract NFTFlowGovernance is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        ProposalType proposalType;
        bytes proposalData;
        uint256 votingPowerRequired;
        uint256 votingStartBlock;
        uint256 votingEndBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        ProposalStatus status;
        uint256 createdAt;
        uint256 executedAt;
    }
    
    // Vote structure
    struct Vote {
        address voter;
        VoteChoice choice;
        uint256 votingPower;
        uint256 timestamp;
    }
    
    // Enums
    enum ProposalType {
        PROTOCOL_UPGRADE,
        PARAMETER_CHANGE,
        TREASURY_ALLOCATION,
        COMMUNITY_INITIATIVE,
        EMERGENCY_PAUSE
    }
    
    enum ProposalStatus {
        DRAFT,
        ACTIVE,
        PASSED,
        REJECTED,
        EXECUTED,
        CANCELLED
    }
    
    enum VoteChoice {
        FOR,
        AGAINST,
        ABSTAIN
    }
    
    // Storage
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Vote[]) public proposalVotes;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(address => uint256) public votingPower;
    mapping(address => bool) public authorizedExecutors;
    
    Counters.Counter private _proposalIdCounter;
    
    // Constants
    uint256 public constant MIN_VOTING_DURATION = 17280; // ~3 days in blocks
    uint256 public constant MAX_VOTING_DURATION = 120960; // ~21 days in blocks
    uint256 public constant EXECUTION_DELAY = 17280; // ~3 days in blocks
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 1000; // Minimum voting power to create proposal
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, ProposalType proposalType);
    event ProposalActivated(uint256 indexed proposalId, uint256 votingStartBlock, uint256 votingEndBlock);
    event VoteCast(uint256 indexed proposalId, address indexed voter, VoteChoice choice, uint256 votingPower);
    event ProposalExecuted(uint256 indexed proposalId, address indexed executor);
    event ProposalCancelled(uint256 indexed proposalId, address indexed canceller);
    event VotingPowerUpdated(address indexed voter, uint256 newVotingPower);
    event ExecutorAuthorized(address indexed executor);
    event ExecutorRevoked(address indexed executor);
    
    // Modifiers
    modifier onlyAuthorizedExecutor() {
        require(authorizedExecutors[msg.sender] || msg.sender == owner(), "Not authorized executor");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposals[proposalId].id != 0, "Proposal does not exist");
        _;
    }
    
    modifier proposalActive(uint256 proposalId) {
        require(proposals[proposalId].status == ProposalStatus.ACTIVE, "Proposal not active");
        _;
    }
    
    modifier votingPeriod(uint256 proposalId) {
        Proposal memory proposal = proposals[proposalId];
        require(
            block.number >= proposal.votingStartBlock && 
            block.number <= proposal.votingEndBlock,
            "Not in voting period"
        );
        _;
    }
    
    constructor() {
        authorizedExecutors[msg.sender] = true;
    }
    
    /**
     * @dev Create a new governance proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param proposalType Type of proposal
     * @param proposalData Encoded proposal data
     * @param votingDuration Duration of voting period in blocks
     */
    function createProposal(
        string calldata title,
        string calldata description,
        ProposalType proposalType,
        bytes calldata proposalData,
        uint256 votingDuration
    ) external {
        require(votingPower[msg.sender] >= MIN_PROPOSAL_THRESHOLD, "Insufficient voting power");
        require(votingDuration >= MIN_VOTING_DURATION && votingDuration <= MAX_VOTING_DURATION, "Invalid voting duration");
        
        _proposalIdCounter.increment();
        uint256 proposalId = _proposalIdCounter.current();
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            proposalType: proposalType,
            proposalData: proposalData,
            votingPowerRequired: calculateRequiredVotingPower(proposalType),
            votingStartBlock: 0,
            votingEndBlock: 0,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            status: ProposalStatus.DRAFT,
            createdAt: block.timestamp,
            executedAt: 0
        });
        
        emit ProposalCreated(proposalId, msg.sender, proposalType);
    }
    
    /**
     * @dev Activate a proposal for voting
     * @param proposalId Proposal ID to activate
     */
    function activateProposal(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.DRAFT, "Proposal not in draft status");
        require(msg.sender == proposal.proposer || msg.sender == owner(), "Not authorized to activate");
        
        proposal.status = ProposalStatus.ACTIVE;
        proposal.votingStartBlock = block.number;
        proposal.votingEndBlock = block.number + getVotingDuration(proposal.proposalType);
        
        emit ProposalActivated(proposalId, proposal.votingStartBlock, proposal.votingEndBlock);
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId Proposal ID
     * @param choice Vote choice
     */
    function castVote(uint256 proposalId, VoteChoice choice) external 
        proposalExists(proposalId) 
        proposalActive(proposalId) 
        votingPeriod(proposalId) 
    {
        require(!hasVoted[msg.sender][proposalId], "Already voted");
        require(votingPower[msg.sender] > 0, "No voting power");
        
        Proposal storage proposal = proposals[proposalId];
        uint256 voterPower = votingPower[msg.sender];
        
        // Record vote
        proposalVotes[proposalId].push(Vote({
            voter: msg.sender,
            choice: choice,
            votingPower: voterPower,
            timestamp: block.timestamp
        }));
        
        hasVoted[msg.sender][proposalId] = true;
        
        // Update vote counts
        if (choice == VoteChoice.FOR) {
            proposal.forVotes += voterPower;
        } else if (choice == VoteChoice.AGAINST) {
            proposal.againstVotes += voterPower;
        } else {
            proposal.abstainVotes += voterPower;
        }
        
        emit VoteCast(proposalId, msg.sender, choice, voterPower);
        
        // Check if proposal can be finalized
        _checkProposalFinalization(proposalId);
    }
    
    /**
     * @dev Execute a passed proposal
     * @param proposalId Proposal ID to execute
     */
    function executeProposal(uint256 proposalId) external 
        proposalExists(proposalId) 
        onlyAuthorizedExecutor 
        nonReentrant 
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.PASSED, "Proposal not passed");
        require(block.number >= proposal.votingEndBlock + EXECUTION_DELAY, "Execution delay not met");
        
        proposal.status = ProposalStatus.EXECUTED;
        proposal.executedAt = block.timestamp;
        
        // Execute proposal based on type
        _executeProposal(proposal);
        
        emit ProposalExecuted(proposalId, msg.sender);
    }
    
    /**
     * @dev Cancel a proposal (only proposer or owner)
     * @param proposalId Proposal ID to cancel
     */
    function cancelProposal(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized to cancel"
        );
        require(
            proposal.status == ProposalStatus.DRAFT || proposal.status == ProposalStatus.ACTIVE,
            "Cannot cancel this proposal"
        );
        
        proposal.status = ProposalStatus.CANCELLED;
        
        emit ProposalCancelled(proposalId, msg.sender);
    }
    
    /**
     * @dev Update voting power for a user
     * @param user User address
     * @param newVotingPower New voting power
     */
    function updateVotingPower(address user, uint256 newVotingPower) external onlyOwner {
        votingPower[user] = newVotingPower;
        emit VotingPowerUpdated(user, newVotingPower);
    }
    
    /**
     * @dev Authorize an executor
     * @param executor Address to authorize
     */
    function authorizeExecutor(address executor) external onlyOwner {
        authorizedExecutors[executor] = true;
        emit ExecutorAuthorized(executor);
    }
    
    /**
     * @dev Revoke executor authorization
     * @param executor Address to revoke
     */
    function revokeExecutor(address executor) external onlyOwner {
        authorizedExecutors[executor] = false;
        emit ExecutorRevoked(executor);
    }
    
    /**
     * @dev Get proposal details
     * @param proposalId Proposal ID
     * @return proposal Proposal data
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    /**
     * @dev Get votes for a proposal
     * @param proposalId Proposal ID
     * @return votes Array of votes
     */
    function getProposalVotes(uint256 proposalId) external view returns (Vote[] memory) {
        return proposalVotes[proposalId];
    }
    
    /**
     * @dev Get user's voting power
     * @param user User address
     * @return voting power
     */
    function getUserVotingPower(address user) external view returns (uint256) {
        return votingPower[user];
    }
    
    /**
     * @dev Check if user has voted on a proposal
     * @param user User address
     * @param proposalId Proposal ID
     * @return true if voted
     */
    function hasUserVoted(address user, uint256 proposalId) external view returns (bool) {
        return hasVoted[user][proposalId];
    }
    
    /**
     * @dev Get proposal state
     * @param proposalId Proposal ID
     * @return status Current status
     * @return canVote Whether voting is currently allowed
     * @return canExecute Whether proposal can be executed
     */
    function getProposalState(uint256 proposalId) external view returns (
        ProposalStatus status,
        bool canVote,
        bool canExecute
    ) {
        Proposal memory proposal = proposals[proposalId];
        
        canVote = proposal.status == ProposalStatus.ACTIVE && 
                 block.number >= proposal.votingStartBlock && 
                 block.number <= proposal.votingEndBlock;
        
        canExecute = proposal.status == ProposalStatus.PASSED && 
                    block.number >= proposal.votingEndBlock + EXECUTION_DELAY;
        
        return (proposal.status, canVote, canExecute);
    }
    
    /**
     * @dev Calculate required voting power for proposal type
     * @param proposalType Type of proposal
     * @return required voting power
     */
    function calculateRequiredVotingPower(ProposalType proposalType) internal pure returns (uint256) {
        if (proposalType == ProposalType.EMERGENCY_PAUSE) {
            return 10000; // Higher threshold for emergency actions
        } else if (proposalType == ProposalType.PROTOCOL_UPGRADE) {
            return 5000; // High threshold for protocol upgrades
        } else if (proposalType == ProposalType.TREASURY_ALLOCATION) {
            return 3000; // Medium threshold for treasury actions
        } else {
            return 1000; // Lower threshold for parameter changes
        }
    }
    
    /**
     * @dev Get voting duration for proposal type
     * @param proposalType Type of proposal
     * @return voting duration in blocks
     */
    function getVotingDuration(ProposalType proposalType) internal pure returns (uint256) {
        if (proposalType == ProposalType.EMERGENCY_PAUSE) {
            return MIN_VOTING_DURATION; // Shorter for emergency actions
        } else if (proposalType == ProposalType.PROTOCOL_UPGRADE) {
            return MAX_VOTING_DURATION; // Longer for major changes
        } else {
            return MIN_VOTING_DURATION * 2; // Standard duration
        }
    }
    
    /**
     * @dev Check if proposal should be finalized
     * @param proposalId Proposal ID
     */
    function _checkProposalFinalization(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        
        if (block.number > proposal.votingEndBlock) {
            uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
            
            if (totalVotes >= proposal.votingPowerRequired) {
                if (proposal.forVotes > proposal.againstVotes) {
                    proposal.status = ProposalStatus.PASSED;
                } else {
                    proposal.status = ProposalStatus.REJECTED;
                }
            } else {
                proposal.status = ProposalStatus.REJECTED; // Not enough participation
            }
        }
    }
    
    /**
     * @dev Execute proposal based on type
     * @param proposal Proposal to execute
     */
    function _executeProposal(Proposal memory proposal) internal {
        // In a real implementation, this would interact with other contracts
        // based on the proposal type and data
        
        if (proposal.proposalType == ProposalType.PROTOCOL_UPGRADE) {
            // Execute protocol upgrade
        } else if (proposal.proposalType == ProposalType.PARAMETER_CHANGE) {
            // Update protocol parameters
        } else if (proposal.proposalType == ProposalType.TREASURY_ALLOCATION) {
            // Execute treasury allocation
        } else if (proposal.proposalType == ProposalType.COMMUNITY_INITIATIVE) {
            // Execute community initiative
        } else if (proposal.proposalType == ProposalType.EMERGENCY_PAUSE) {
            // Execute emergency pause
        }
    }
    
    /**
     * @dev Get contract version
     * @return version string
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
