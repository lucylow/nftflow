// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title NFTFlowDAO
 * @dev Decentralized Autonomous Organization for governing the NFTFlow rental marketplace
 * Uses ERC-721 ownership for voting power (1 NFT = 1 vote)
 */
contract NFTFlowDAO is Ownable, ReentrancyGuard, Pausable {
    // Proposal structure
    struct Proposal {
        uint256 id;
        string description;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        address proposer;
        ProposalType proposalType;
        bytes parameters; // Flexible parameters for different proposal types
        uint256 createdAt;
    }
    
    // Different types of proposals the DAO can handle
    enum ProposalType {
        FEE_CHANGE,         // Change platform fees
        COLLATERAL_UPDATE,  // Update collateral requirements
        REWARD_ADJUSTMENT,  // Adjust reward mechanisms
        TREASURY_MANAGEMENT,// Treasury fund allocation
        CONTRACT_UPGRADE,   // Upgrade core contracts
        PARAMETER_UPDATE,   // Update other platform parameters
        ORACLE_UPDATE,      // Update oracle parameters
        PAUSE_UNPAUSE       // Pause/unpause contracts
    }
    
    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public lastProposalTimestamp;
    
    uint256 public totalProposals;
    uint256 public votingDuration = 3 days; // Default voting period
    uint256 public proposalCooldown = 1 days; // Time between proposals from same address
    uint256 public quorumPercentage = 4; // 4% of total NFTs needed to pass
    uint256 public executionDelay = 1 days; // Delay before execution after voting ends
    
    // NFT contract that grants voting rights
    IERC721 public votingToken;
    
    // Platform contracts that the DAO can govern
    address public nftFlowContract;
    address public vrfRewarderContract;
    address public treasuryContract;
    address public priceOracleContract;
    
    // Treasury balance tracking
    uint256 public treasuryBalance;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, ProposalType proposalType);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower);
    event ProposalExecuted(uint256 indexed proposalId);
    event VotingDurationUpdated(uint256 newDuration);
    event QuorumUpdated(uint256 newQuorum);
    event TreasuryUpdated(uint256 newBalance);
    event ContractAddressUpdated(string contractName, address newAddress);
    
    // Custom errors
    error NoVotingPower();
    error VotingEnded();
    error AlreadyVoted();
    error ProposalNotActive();
    error ProposalNotPassed();
    error CooldownActive();
    error QuorumNotMet();
    error ExecutionDelayNotMet();
    error AlreadyExecuted();
    error InvalidProposalType();
    error InsufficientTreasuryBalance();
    
    /**
     * @dev Constructor initializes the DAO with necessary contracts
     * @param _votingToken Address of the ERC-721 token used for voting
     * @param _nftFlowContract Address of the main NFTFlow contract
     * @param _vrfRewarderContract Address of the VRF rewarder contract
     * @param _treasuryContract Address of the treasury contract
     * @param _priceOracleContract Address of the price oracle contract
     */
    constructor(
        address _votingToken,
        address _nftFlowContract,
        address _vrfRewarderContract,
        address _treasuryContract,
        address _priceOracleContract
    ) Ownable(msg.sender) {
        votingToken = IERC721(_votingToken);
        nftFlowContract = _nftFlowContract;
        vrfRewarderContract = _vrfRewarderContract;
        treasuryContract = _treasuryContract;
        priceOracleContract = _priceOracleContract;
    }
    
    /**
     * @notice Create a new proposal
     * @param description Description of the proposal
     * @param proposalType Type of proposal from ProposalType enum
     * @param parameters Encoded parameters for the proposal execution
     */
    function createProposal(
        string calldata description,
        ProposalType proposalType,
        bytes calldata parameters
    ) external whenNotPaused {
        // Check if user has voting power (owns at least one NFT)
        if (votingToken.balanceOf(msg.sender) == 0) {
            revert NoVotingPower();
        }
        
        // Check proposal cooldown
        if (block.timestamp < lastProposalTimestamp[msg.sender] + proposalCooldown) {
            revert CooldownActive();
        }
        
        // Validate proposal type
        if (uint256(proposalType) > uint256(ProposalType.PAUSE_UNPAUSE)) {
            revert InvalidProposalType();
        }
        
        // Create new proposal
        proposals[totalProposals] = Proposal({
            id: totalProposals,
            description: description,
            deadline: block.timestamp + votingDuration,
            yesVotes: 0,
            noVotes: 0,
            executed: false,
            proposer: msg.sender,
            proposalType: proposalType,
            parameters: parameters,
            createdAt: block.timestamp
        });
        
        lastProposalTimestamp[msg.sender] = block.timestamp;
        
        emit ProposalCreated(totalProposals, msg.sender, proposalType);
        totalProposals++;
    }
    
    /**
     * @notice Vote on a proposal
     * @param proposalId ID of the proposal to vote on
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) external whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        
        // Check if voting period has ended
        if (block.timestamp >= proposal.deadline) {
            revert VotingEnded();
        }
        
        // Check if already voted
        if (hasVoted[proposalId][msg.sender]) {
            revert AlreadyVoted();
        }
        
        // Calculate voting power (1 vote per NFT owned)
        uint256 votingPower = votingToken.balanceOf(msg.sender);
        if (votingPower == 0) {
            revert NoVotingPower();
        }
        
        // Record vote
        hasVoted[proposalId][msg.sender] = true;
        
        if (support) {
            proposal.yesVotes += votingPower;
        } else {
            proposal.noVotes += votingPower;
        }
        
        emit VoteCast(proposalId, msg.sender, support, votingPower);
    }
    
    /**
     * @notice Execute a proposal that has passed
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external nonReentrant whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        
        // Check if proposal is still active
        if (block.timestamp < proposal.deadline) {
            revert ProposalNotActive();
        }
        
        // Check if already executed
        if (proposal.executed) {
            revert AlreadyExecuted();
        }
        
        // Check execution delay
        if (block.timestamp < proposal.deadline + executionDelay) {
            revert ExecutionDelayNotMet();
        }
        
        // Check if proposal passed
        if (proposal.yesVotes <= proposal.noVotes) {
            revert ProposalNotPassed();
        }
        
        // Check quorum (minimum participation)
        uint256 totalSupply = votingToken.totalSupply();
        uint256 totalVotes = proposal.yesVotes + proposal.noVotes;
        if (totalVotes < (totalSupply * quorumPercentage) / 100) {
            revert QuorumNotMet();
        }
        
        // Execute proposal based on type
        if (proposal.proposalType == ProposalType.FEE_CHANGE) {
            _executeFeeChange(proposal.parameters);
        } else if (proposal.proposalType == ProposalType.COLLATERAL_UPDATE) {
            _executeCollateralUpdate(proposal.parameters);
        } else if (proposal.proposalType == ProposalType.REWARD_ADJUSTMENT) {
            _executeRewardAdjustment(proposal.parameters);
        } else if (proposal.proposalType == ProposalType.TREASURY_MANAGEMENT) {
            _executeTreasuryManagement(proposal.parameters);
        } else if (proposal.proposalType == ProposalType.CONTRACT_UPGRADE) {
            _executeContractUpgrade(proposal.parameters);
        } else if (proposal.proposalType == ProposalType.PARAMETER_UPDATE) {
            _executeParameterUpdate(proposal.parameters);
        } else if (proposal.proposalType == ProposalType.ORACLE_UPDATE) {
            _executeOracleUpdate(proposal.parameters);
        } else if (proposal.proposalType == ProposalType.PAUSE_UNPAUSE) {
            _executePauseUnpause(proposal.parameters);
        }
        
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }
    
    // --- Proposal Execution Functions ---
    
    function _executeFeeChange(bytes memory parameters) internal {
        (uint256 newFeePercentage, address feeRecipient) = abi.decode(parameters, (uint256, address));
        (bool success, ) = nftFlowContract.call(
            abi.encodeWithSignature("updatePlatformFee(uint256)", newFeePercentage)
        );
        require(success, "Fee change execution failed");
    }
    
    function _executeCollateralUpdate(bytes memory parameters) internal {
        (uint256 newCollateralMultiplier) = abi.decode(parameters, (uint256));
        (bool success, ) = nftFlowContract.call(
            abi.encodeWithSignature("setCollateralMultiplier(uint256)", newCollateralMultiplier)
        );
        require(success, "Collateral update execution failed");
    }
    
    function _executeRewardAdjustment(bytes memory parameters) internal {
        (uint256[] memory newRewardTiers, uint256[] memory newProbabilities) = 
            abi.decode(parameters, (uint256[], uint256[]));
        (bool success, ) = vrfRewarderContract.call(
            abi.encodeWithSignature(
                "setRewardParameters(uint256[],uint256[])",
                newRewardTiers,
                newProbabilities
            )
        );
        require(success, "Reward adjustment execution failed");
    }
    
    function _executeTreasuryManagement(bytes memory parameters) internal {
        (address recipient, uint256 amount, address tokenAddress) = 
            abi.decode(parameters, (address, uint256, address));
        
        if (tokenAddress == address(0)) {
            // Native token transfer
            require(address(this).balance >= amount, "Insufficient balance");
            payable(recipient).transfer(amount);
            treasuryBalance -= amount;
        } else {
            // ERC20 token transfer
            IERC20 token = IERC20(tokenAddress);
            require(token.balanceOf(address(this)) >= amount, "Insufficient token balance");
            token.transfer(recipient, amount);
        }
        
        emit TreasuryUpdated(treasuryBalance);
    }
    
    function _executeContractUpgrade(bytes memory parameters) internal {
        (address newContractAddress, bytes memory initializationData) = 
            abi.decode(parameters, (address, bytes));
        (bool success, ) = nftFlowContract.call(
            abi.encodeWithSignature("upgradeTo(address,bytes)", newContractAddress, initializationData)
        );
        require(success, "Contract upgrade execution failed");
    }
    
    function _executeParameterUpdate(bytes memory parameters) internal {
        (string memory parameterKey, bytes memory parameterValue) = 
            abi.decode(parameters, (string, bytes));
        (bool success, ) = nftFlowContract.call(
            abi.encodeWithSignature("setParameter(string,bytes)", parameterKey, parameterValue)
        );
        require(success, "Parameter update execution failed");
    }
    
    function _executeOracleUpdate(bytes memory parameters) internal {
        (uint256 newOracleFee, uint256 newMinPrice, uint256 newMaxPrice) = 
            abi.decode(parameters, (uint256, uint256, uint256));
        (bool success, ) = priceOracleContract.call(
            abi.encodeWithSignature(
                "setOracleParameters(uint256,uint256,uint256)",
                newOracleFee,
                newMinPrice,
                newMaxPrice
            )
        );
        require(success, "Oracle update execution failed");
    }
    
    function _executePauseUnpause(bytes memory parameters) internal {
        (address contractAddress, bool shouldPause) = abi.decode(parameters, (address, bool));
        string memory functionName = shouldPause ? "pause()" : "unpause()";
        (bool success, ) = contractAddress.call(abi.encodeWithSignature(functionName));
        require(success, "Pause/unpause execution failed");
    }
    
    // --- View Functions ---
    
    /**
     * @notice Check if a proposal has passed
     * @param proposalId ID of the proposal to check
     */
    function proposalPassed(uint256 proposalId) public view returns (bool) {
        Proposal memory proposal = proposals[proposalId];
        if (block.timestamp < proposal.deadline) return false;
        
        uint256 totalSupply = votingToken.totalSupply();
        uint256 totalVotes = proposal.yesVotes + proposal.noVotes;
        
        return proposal.yesVotes > proposal.noVotes && 
               totalVotes >= (totalSupply * quorumPercentage) / 100;
    }
    
    /**
     * @notice Get voting power of an address
     * @param voter Address to check voting power for
     */
    function getVotingPower(address voter) public view returns (uint256) {
        return votingToken.balanceOf(voter);
    }
    
    /**
     * @notice Get proposal details
     * @param proposalId ID of the proposal to get
     */
    function getProposal(uint256 proposalId) public view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    /**
     * @notice Get all proposals for an address
     * @param proposer Address of the proposer
     * @return Array of proposal IDs
     */
    function getProposalsByProposer(address proposer) external view returns (uint256[] memory) {
        uint256[] memory userProposals = new uint256[](totalProposals);
        uint256 count = 0;
        
        for (uint256 i = 0; i < totalProposals; i++) {
            if (proposals[i].proposer == proposer) {
                userProposals[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userProposals[i];
        }
        
        return result;
    }
    
    // --- Admin Functions ---
    
    /**
     * @notice Update voting duration (only owner)
     * @param newDuration New voting duration in seconds
     */
    function setVotingDuration(uint256 newDuration) external onlyOwner {
        require(newDuration >= 1 days && newDuration <= 30 days, "Invalid duration");
        votingDuration = newDuration;
        emit VotingDurationUpdated(newDuration);
    }
    
    /**
     * @notice Update quorum percentage (only owner)
     * @param newQuorum New quorum percentage (0-100)
     */
    function setQuorumPercentage(uint256 newQuorum) external onlyOwner {
        require(newQuorum > 0 && newQuorum <= 100, "Invalid quorum");
        quorumPercentage = newQuorum;
        emit QuorumUpdated(newQuorum);
    }
    
    /**
     * @notice Update execution delay (only owner)
     * @param newDelay New execution delay in seconds
     */
    function setExecutionDelay(uint256 newDelay) external onlyOwner {
        require(newDelay <= 7 days, "Delay too long");
        executionDelay = newDelay;
    }
    
    /**
     * @notice Update contract addresses (only owner)
     * @param contractName Name of the contract
     * @param newAddress New contract address
     */
    function updateContractAddress(string calldata contractName, address newAddress) external onlyOwner {
        if (keccak256(abi.encodePacked(contractName)) == keccak256(abi.encodePacked("nftFlow"))) {
            nftFlowContract = newAddress;
        } else if (keccak256(abi.encodePacked(contractName)) == keccak256(abi.encodePacked("vrfRewarder"))) {
            vrfRewarderContract = newAddress;
        } else if (keccak256(abi.encodePacked(contractName)) == keccak256(abi.encodePacked("treasury"))) {
            treasuryContract = newAddress;
        } else if (keccak256(abi.encodePacked(contractName)) == keccak256(abi.encodePacked("priceOracle"))) {
            priceOracleContract = newAddress;
        } else if (keccak256(abi.encodePacked(contractName)) == keccak256(abi.encodePacked("votingToken"))) {
            votingToken = IERC721(newAddress);
        }
        
        emit ContractAddressUpdated(contractName, newAddress);
    }
    
    /**
     * @notice Emergency function to cancel a proposal (only owner)
     * @param proposalId ID of the proposal to cancel
     */
    function emergencyCancel(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        proposal.executed = true;
    }
    
    /**
     * @notice Pause the DAO (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the DAO (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Allow the contract to receive funds for treasury management
    receive() external payable {
        treasuryBalance += msg.value;
        emit TreasuryUpdated(treasuryBalance);
    }
    
    /**
     * @notice Withdraw funds from treasury (only owner)
     * @param amount Amount to withdraw
     */
    function withdrawTreasury(uint256 amount) external onlyOwner {
        require(amount <= treasuryBalance, "Insufficient treasury balance");
        require(amount <= address(this).balance, "Insufficient contract balance");
        
        treasuryBalance -= amount;
        payable(owner()).transfer(amount);
        
        emit TreasuryUpdated(treasuryBalance);
    }
}
