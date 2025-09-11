const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTFlowDAO", function () {
  let dao, governanceToken, nftFlow, priceOracle;
  let owner, user1, user2, user3;
  let mockContracts;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy Governance Token
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy(
      "NFTFlow Governance Token",
      "NFTGOV",
      "https://nftflow.io/metadata/governance/"
    );

    // Deploy DIAPriceOracle
    const DIAPriceOracle = await ethers.getContractFactory("DIAPriceOracle");
    priceOracle = await DIAPriceOracle.deploy();

    // Deploy mock contracts
    const MockContract = await ethers.getContractFactory("MockERC721");
    const paymentStream = await MockContract.deploy("Mock Payment Stream", "MPS");
    const reputation = await MockContract.deploy("Mock Reputation", "MR");
    const utilityTracker = await MockContract.deploy("Mock Utility Tracker", "MUT");
    const vrfRewarder = await MockContract.deploy("Mock VRF Rewarder", "MVR");
    const treasury = await MockContract.deploy("Treasury", "TREAS");

    // Deploy NFTFlow contract
    const NFTFlow = await ethers.getContractFactory("NFTFlow");
    nftFlow = await NFTFlow.deploy(
      await priceOracle.getAddress(),
      await paymentStream.getAddress(),
      await reputation.getAddress(),
      await utilityTracker.getAddress()
    );

    // Deploy DAO contract
    const NFTFlowDAO = await ethers.getContractFactory("NFTFlowDAO");
    dao = await NFTFlowDAO.deploy(
      await governanceToken.getAddress(),
      await nftFlow.getAddress(),
      await vrfRewarder.getAddress(),
      await treasury.getAddress(),
      await priceOracle.getAddress()
    );

    // Set DAO contract in NFTFlow
    await nftFlow.setDAOContract(await dao.getAddress());

    // Set up governance token holders
    await governanceToken.setEligibility(owner.address, true);
    await governanceToken.setEligibility(user1.address, true);
    await governanceToken.setEligibility(user2.address, true);
    await governanceToken.setEligibility(user3.address, true);

    // Mint governance tokens
    await governanceToken.mint();
    await governanceToken.connect(user1).mint();
    await governanceToken.connect(user2).mint();
    await governanceToken.connect(user3).mint();

    // Fund DAO treasury
    await owner.sendTransaction({
      to: await dao.getAddress(),
      value: ethers.parseEther("1.0")
    });

    mockContracts = {
      paymentStream: await paymentStream.getAddress(),
      reputation: await reputation.getAddress(),
      utilityTracker: await utilityTracker.getAddress(),
      vrfRewarder: await vrfRewarder.getAddress(),
      treasury: await treasury.getAddress()
    };
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await dao.votingDuration()).to.equal(3 * 24 * 60 * 60); // 3 days
      expect(await dao.quorumPercentage()).to.equal(4); // 4%
      expect(await dao.totalProposals()).to.equal(0);
    });

    it("Should set the correct contract addresses", async function () {
      expect(await dao.votingToken()).to.equal(await governanceToken.getAddress());
      expect(await dao.nftFlowContract()).to.equal(await nftFlow.getAddress());
    });
  });

  describe("Proposal Creation", function () {
    it("Should allow users with governance tokens to create proposals", async function () {
      const description = "Test proposal";
      const proposalType = 0; // FEE_CHANGE
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [300, user1.address]
      );

      await expect(dao.connect(user1).createProposal(description, proposalType, parameters))
        .to.emit(dao, "ProposalCreated")
        .withArgs(0, user1.address, proposalType);

      const proposal = await dao.getProposal(0);
      expect(proposal.description).to.equal(description);
      expect(proposal.proposer).to.equal(user1.address);
      expect(proposal.proposalType).to.equal(proposalType);
    });

    it("Should not allow users without governance tokens to create proposals", async function () {
      const [userWithoutToken] = await ethers.getSigners();
      
      const description = "Test proposal";
      const proposalType = 0;
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [300, user1.address]
      );

      await expect(
        dao.connect(userWithoutToken).createProposal(description, proposalType, parameters)
      ).to.be.revertedWithCustomError(dao, "NoVotingPower");
    });

    it("Should enforce proposal cooldown", async function () {
      const description = "Test proposal";
      const proposalType = 0;
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [300, user1.address]
      );

      // Create first proposal
      await dao.connect(user1).createProposal(description, proposalType, parameters);

      // Try to create second proposal immediately
      await expect(
        dao.connect(user1).createProposal(description, proposalType, parameters)
      ).to.be.revertedWithCustomError(dao, "CooldownActive");
    });
  });

  describe("Voting", function () {
    let proposalId;

    beforeEach(async function () {
      const description = "Test proposal";
      const proposalType = 0; // FEE_CHANGE
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [300, user1.address]
      );

      await dao.connect(user1).createProposal(description, proposalType, parameters);
      proposalId = 0;
    });

    it("Should allow users with governance tokens to vote", async function () {
      await expect(dao.connect(user2).vote(proposalId, true))
        .to.emit(dao, "VoteCast")
        .withArgs(proposalId, user2.address, true, 1);

      const proposal = await dao.getProposal(proposalId);
      expect(proposal.yesVotes).to.equal(1);
    });

    it("Should not allow users without governance tokens to vote", async function () {
      const [userWithoutToken] = await ethers.getSigners();

      await expect(
        dao.connect(userWithoutToken).vote(proposalId, true)
      ).to.be.revertedWithCustomError(dao, "NoVotingPower");
    });

    it("Should not allow double voting", async function () {
      await dao.connect(user2).vote(proposalId, true);

      await expect(
        dao.connect(user2).vote(proposalId, false)
      ).to.be.revertedWithCustomError(dao, "AlreadyVoted");
    });

    it("Should not allow voting after deadline", async function () {
      // Fast forward past voting deadline
      await ethers.provider.send("evm_increaseTime", [4 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await expect(
        dao.connect(user2).vote(proposalId, true)
      ).to.be.revertedWithCustomError(dao, "VotingEnded");
    });

    it("Should calculate voting power correctly", async function () {
      // User2 has 1 token, so 1 vote
      await dao.connect(user2).vote(proposalId, true);
      
      // Mint another token to user2
      await governanceToken.connect(user2).mint();
      
      // User2 should still only be able to vote once
      await expect(
        dao.connect(user2).vote(proposalId, false)
      ).to.be.revertedWithCustomError(dao, "AlreadyVoted");
    });
  });

  describe("Proposal Execution", function () {
    let proposalId;

    beforeEach(async function () {
      const description = "Test fee change proposal";
      const proposalType = 0; // FEE_CHANGE
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [300, user1.address] // 3% fee
      );

      await dao.connect(user1).createProposal(description, proposalType, parameters);
      proposalId = 0;

      // Vote yes on the proposal
      await dao.connect(user1).vote(proposalId, true);
      await dao.connect(user2).vote(proposalId, true);
      await dao.connect(user3).vote(proposalId, true);
    });

    it("Should execute a passed proposal after delay", async function () {
      // Fast forward past voting deadline and execution delay
      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await expect(dao.executeProposal(proposalId))
        .to.emit(dao, "ProposalExecuted")
        .withArgs(proposalId);

      const proposal = await dao.getProposal(proposalId);
      expect(proposal.executed).to.be.true;
    });

    it("Should not execute proposal before delay", async function () {
      // Fast forward past voting deadline but not execution delay
      await ethers.provider.send("evm_increaseTime", [4 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await expect(
        dao.executeProposal(proposalId)
      ).to.be.revertedWithCustomError(dao, "ExecutionDelayNotMet");
    });

    it("Should not execute a failed proposal", async function () {
      // Create a new proposal that will fail
      const description = "Test failed proposal";
      const proposalType = 0;
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [500, user1.address]
      );

      await dao.connect(user1).createProposal(description, proposalType, parameters);
      const failedProposalId = 1;

      // Vote no on the proposal
      await dao.connect(user1).vote(failedProposalId, false);
      await dao.connect(user2).vote(failedProposalId, false);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await expect(
        dao.executeProposal(failedProposalId)
      ).to.be.revertedWithCustomError(dao, "ProposalNotPassed");
    });

    it("Should not execute proposal twice", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      // Execute first time
      await dao.executeProposal(proposalId);

      // Try to execute again
      await expect(
        dao.executeProposal(proposalId)
      ).to.be.revertedWithCustomError(dao, "AlreadyExecuted");
    });
  });

  describe("Different Proposal Types", function () {
    it("Should handle fee change proposals", async function () {
      const description = "Change platform fee to 3%";
      const proposalType = 0; // FEE_CHANGE
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [300, user1.address]
      );

      await dao.connect(user1).createProposal(description, proposalType, parameters);
      
      // Vote and execute
      await dao.connect(user1).vote(0, true);
      await dao.connect(user2).vote(0, true);
      
      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await dao.executeProposal(0);
      
      // Check that fee was updated
      const platformFee = await nftFlow.platformFeePercentage();
      expect(platformFee).to.equal(300);
    });

    it("Should handle collateral update proposals", async function () {
      const description = "Update collateral multiplier to 3x";
      const proposalType = 1; // COLLATERAL_UPDATE
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [3]
      );

      await dao.connect(user1).createProposal(description, proposalType, parameters);
      
      // Vote and execute
      await dao.connect(user1).vote(0, true);
      await dao.connect(user2).vote(0, true);
      
      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await dao.executeProposal(0);
      
      // Check that collateral multiplier was updated
      const collateralMultiplier = await nftFlow.collateralMultiplier();
      expect(collateralMultiplier).to.equal(3);
    });

    it("Should handle treasury management proposals", async function () {
      const description = "Allocate 0.1 ETH from treasury";
      const proposalType = 3; // TREASURY_MANAGEMENT
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "address"],
        [user1.address, ethers.parseEther("0.1"), ethers.ZeroAddress]
      );

      const initialBalance = await ethers.provider.getBalance(user1.address);

      await dao.connect(user1).createProposal(description, proposalType, parameters);
      
      // Vote and execute
      await dao.connect(user1).vote(0, true);
      await dao.connect(user2).vote(0, true);
      
      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await dao.executeProposal(0);
      
      // Check that funds were transferred
      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update voting duration", async function () {
      await dao.setVotingDuration(7 * 24 * 60 * 60); // 7 days
      expect(await dao.votingDuration()).to.equal(7 * 24 * 60 * 60);
    });

    it("Should allow owner to update quorum percentage", async function () {
      await dao.setQuorumPercentage(10); // 10%
      expect(await dao.quorumPercentage()).to.equal(10);
    });

    it("Should allow owner to update contract addresses", async function () {
      const newAddress = user1.address;
      await dao.updateContractAddress("nftFlow", newAddress);
      expect(await dao.nftFlowContract()).to.equal(newAddress);
    });

    it("Should allow owner to emergency cancel proposals", async function () {
      const description = "Test proposal";
      const proposalType = 0;
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [300, user1.address]
      );

      await dao.connect(user1).createProposal(description, proposalType, parameters);
      
      await dao.emergencyCancel(0);
      const proposal = await dao.getProposal(0);
      expect(proposal.executed).to.be.true;
    });

    it("Should not allow non-owners to call admin functions", async function () {
      await expect(
        dao.connect(user1).setVotingDuration(7 * 24 * 60 * 60)
      ).to.be.revertedWithCustomError(dao, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      await dao.pause();
      expect(await dao.paused()).to.be.true;
      
      await dao.unpause();
      expect(await dao.paused()).to.be.false;
    });

    it("Should not allow proposal creation when paused", async function () {
      await dao.pause();
      
      const description = "Test proposal";
      const proposalType = 0;
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [300, user1.address]
      );

      await expect(
        dao.connect(user1).createProposal(description, proposalType, parameters)
      ).to.be.revertedWithCustomError(dao, "EnforcedPause");
    });
  });

  describe("View Functions", function () {
    it("Should return correct voting power", async function () {
      expect(await dao.getVotingPower(user1.address)).to.equal(1);
      expect(await dao.getVotingPower(user2.address)).to.equal(1);
    });

    it("Should return correct proposal status", async function () {
      const description = "Test proposal";
      const proposalType = 0;
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [300, user1.address]
      );

      await dao.connect(user1).createProposal(description, proposalType, parameters);
      
      const proposal = await dao.getProposal(0);
      expect(proposal.description).to.equal(description);
      expect(proposal.proposer).to.equal(user1.address);
      expect(proposal.executed).to.be.false;
    });

    it("Should return proposals by proposer", async function () {
      const description = "Test proposal";
      const proposalType = 0;
      const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address"],
        [300, user1.address]
      );

      await dao.connect(user1).createProposal(description, proposalType, parameters);
      await dao.connect(user2).createProposal(description, proposalType, parameters);
      
      const user1Proposals = await dao.getProposalsByProposer(user1.address);
      const user2Proposals = await dao.getProposalsByProposer(user2.address);
      
      expect(user1Proposals.length).to.equal(1);
      expect(user2Proposals.length).to.equal(1);
      expect(user1Proposals[0]).to.equal(0);
      expect(user2Proposals[0]).to.equal(1);
    });
  });
});
