const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AutonomousController", function () {
  async function deployContractsFixture() {
    const [deployer, admin, guardian, agent, user] = await ethers.getSigners();

    // Deploy mock NFTFlow
    const MockNFTFlow = await ethers.getContractFactory("MockNFTFlow");
    const mockNFTFlow = await MockNFTFlow.deploy();
    await mockNFTFlow.deployed();

    // Deploy mock ReputationSystem
    const MockReputation = await ethers.getContractFactory("MockReputation");
    const mockReputation = await MockReputation.deploy();
    await mockReputation.deployed();

    // Deploy AutonomousController
    const AutonomousController = await ethers.getContractFactory("AutonomousController");
    const controller = await AutonomousController.deploy(
      mockNFTFlow.address,
      mockReputation.address,
      admin.address,
      guardian.address
    );
    await controller.deployed();

    // Set up roles
    const AGENT_ROLE = await controller.AGENT_ROLE();
    await controller.connect(admin).grantRole(AGENT_ROLE, agent.address);

    return {
      controller,
      mockNFTFlow,
      mockReputation,
      deployer,
      admin,
      guardian,
      agent,
      user,
    };
  }

  describe("Deployment", function () {
    it("Should deploy with correct initial state", async function () {
      const { controller, admin, guardian } = await loadFixture(deployContractsFixture);

      expect(await controller.hasRole(await controller.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
      expect(await controller.hasRole(await controller.GUARDIAN_ROLE(), guardian.address)).to.be.true;
      expect(await controller.paused()).to.be.true;
    });

    it("Should revert with zero addresses", async function () {
      const { mockNFTFlow } = await loadFixture(deployContractsFixture);
      const AutonomousController = await ethers.getContractFactory("AutonomousController");

      await expect(
        AutonomousController.deploy(
          ethers.constants.AddressZero,
          mockNFTFlow.address,
          mockNFTFlow.address,
          mockNFTFlow.address
        )
      ).to.be.revertedWithCustomError(controller, "InvalidAddress");

      await expect(
        AutonomousController.deploy(
          mockNFTFlow.address,
          ethers.constants.AddressZero,
          mockNFTFlow.address,
          mockNFTFlow.address
        )
      ).to.be.revertedWithCustomError(controller, "InvalidAddress");
    });
  });

  describe("Pause/Unpause", function () {
    it("Guardian should pause and unpause", async function () {
      const { controller, guardian, agent } = await loadFixture(deployContractsFixture);

      // Initially paused
      expect(await controller.paused()).to.be.true;

      // Unpause
      await controller.connect(guardian).guardianUnpause();
      expect(await controller.paused()).to.be.false;

      // Pause again
      await controller.connect(guardian).guardianPause();
      expect(await controller.paused()).to.be.true;
    });

    it("Non-guardian should not pause", async function () {
      const { controller, agent } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      await expect(
        controller.connect(agent).guardianPause()
      ).to.be.revertedWith("AccessControl");
    });
  });

  describe("Price Updates", function () {
    it("Agent should update price within bounds", async function () {
      const { controller, agent, mockNFTFlow, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      const listingId = 1;
      const oldPrice = ethers.utils.parseEther("1.0");
      const newPrice = ethers.utils.parseEther("1.04"); // 4% increase
      const reasonCID = "QmHash123";

      await expect(
        controller.connect(agent).agentSetPrice(listingId, oldPrice, newPrice, reasonCID)
      ).to.emit(controller, "AutonomousPriceExecuted");
    });

    it("Should revert if price change exceeds 5%", async function () {
      const { controller, agent, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      const listingId = 1;
      const oldPrice = ethers.utils.parseEther("1.0");
      const newPrice = ethers.utils.parseEther("1.10"); // 10% increase

      await expect(
        controller.connect(agent).agentSetPrice(listingId, oldPrice, newPrice, "reason")
      ).to.be.revertedWithCustomError(controller, "ExceedsDeltaLimit");
    });

    it("Should revert when paused", async function () {
      const { controller, agent } = await loadFixture(deployContractsFixture);

      const listingId = 1;
      const oldPrice = ethers.utils.parseEther("1.0");
      const newPrice = ethers.utils.parseEther("1.04");

      await expect(
        controller.connect(agent).agentSetPrice(listingId, oldPrice, newPrice, "reason")
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should enforce rate limit", async function () {
      const { controller, agent, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      const listingId = 1;
      const oldPrice = ethers.utils.parseEther("1.0");
      const newPrice = ethers.utils.parseEther("1.04");

      await controller.connect(agent).agentSetPrice(listingId, oldPrice, newPrice, "reason");

      await expect(
        controller.connect(agent).agentSetPrice(listingId, oldPrice, newPrice, "reason")
      ).to.be.revertedWithCustomError(controller, "RateLimitExceeded");
    });
  });

  describe("Collateral Updates", function () {
    it("Agent should update collateral within bounds", async function () {
      const { controller, agent, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      const oldCollateral = ethers.utils.parseEther("2.0");
      const newCollateral = ethers.utils.parseEther("1.5"); // 25% reduction
      const reasonCID = "QmHash456";

      await expect(
        controller.connect(agent).agentSetCollateral(agent.address, oldCollateral, newCollateral, reasonCID)
      ).to.emit(controller, "AutonomousCollateralExecuted");
    });

    it("Should revert if collateral reduction exceeds 50%", async function () {
      const { controller, agent, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      const oldCollateral = ethers.utils.parseEther("2.0");
      const newCollateral = ethers.utils.parseEther("0.8"); // 60% reduction

      await expect(
        controller.connect(agent).agentSetCollateral(agent.address, oldCollateral, newCollateral, "reason")
      ).to.be.revertedWithCustomError(controller, "ExceedsDeltaLimit");
    });
  });

  describe("Reputation Updates", function () {
    it("Agent should update reputation within bounds", async function () {
      const { controller, agent, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      const delta = 10;
      const reasonCID = "QmHash789";

      await expect(
        controller.connect(agent).agentUpdateReputation(agent.address, delta, reasonCID)
      ).to.emit(controller, "AutonomousReputationUpdate");
    });

    it("Should revert if delta exceeds maximum", async function () {
      const { controller, agent, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      const delta = 150; // Exceeds default max of 100

      await expect(
        controller.connect(agent).agentUpdateReputation(agent.address, delta, "reason")
      ).to.be.revertedWithCustomError(controller, "ExceedsDeltaLimit");
    });

    it("Should revert with zero delta", async function () {
      const { controller, agent, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      await expect(
        controller.connect(agent).agentUpdateReputation(agent.address, 0, "reason")
      ).to.be.revertedWithCustomError(controller, "ExceedsDeltaLimit");
    });
  });

  describe("Governance Functions", function () {
    it("Admin should update bounds", async function () {
      const { controller, admin } = await loadFixture(deployContractsFixture);

      await expect(
        controller.connect(admin).setBounds(600, 60)
      ).to.emit(controller, "BoundsUpdated");

      expect(await controller.maxPriceChangePercent()).to.equal(600);
      expect(await controller.maxCollateralReductionPercent()).to.equal(60);
    });

    it("Should revert with invalid bounds", async function () {
      const { controller, admin } = await loadFixture(deployContractsFixture);

      await expect(
        controller.connect(admin).setBounds(1500, 50) // 15% too high
      ).to.be.revertedWithCustomError(controller, "InvalidBounds");

      await expect(
        controller.connect(admin).setBounds(500, 150) // 150% too high
      ).to.be.revertedWithCustomError(controller, "InvalidBounds");
    });

    it("Admin should update rate limit", async function () {
      const { controller, admin } = await loadFixture(deployContractsFixture);

      await expect(
        controller.connect(admin).setRateLimit(300)
      ).to.emit(controller, "RateLimitUpdated");

      expect(await controller.rateLimitInterval()).to.equal(300);
    });

    it("Should revert with rate limit too short", async function () {
      const { controller, admin } = await loadFixture(deployContractsFixture);

      await expect(
        controller.connect(admin).setRateLimit(30) // Less than minimum 60
      ).to.be.revertedWithCustomError(controller, "InvalidBounds");
    });
  });

  describe("Access Control", function () {
    it("Only agent should execute autonomous actions", async function () {
      const { controller, guardian, user } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      await expect(
        controller.connect(user).agentSetPrice(1, ethers.utils.parseEther("1.0"), ethers.utils.parseEther("1.04"), "reason")
      ).to.be.revertedWith("AccessControl");
    });

    it("Admin should grant and revoke agent role", async function () {
      const { controller, admin, agent } = await loadFixture(deployContractsFixture);

      await controller.connect(admin).grantAgentRole(agent.address);
      expect(await controller.isAgent(agent.address)).to.be.true;

      await controller.connect(admin).revokeAgentRole(agent.address);
      expect(await controller.isAgent(agent.address)).to.be.false;
    });
  });

  describe("Events", function () {
    it("Should emit AgentProposal event on price update", async function () {
      const { controller, agent, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      const listingId = 1;
      const oldPrice = ethers.utils.parseEther("1.0");
      const newPrice = ethers.utils.parseEther("1.04");
      const reasonCID = "QmTest";

      await expect(
        controller.connect(agent).agentSetPrice(listingId, oldPrice, newPrice, reasonCID)
      )
        .to.emit(controller, "AgentProposal")
        .withArgs(
          agent.address,
          controller.PRICE_UPDATE(),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes(reasonCID)),
          anyValue,
          anyValue
        )
        .to.emit(controller, "AutonomousPriceExecuted");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very small price changes", async function () {
      const { controller, agent, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      const oldPrice = ethers.utils.parseEther("1.0");
      const newPrice = ethers.utils.parseEther("1.01"); // 1% increase

      await expect(
        controller.connect(agent).agentSetPrice(1, oldPrice, newPrice, "reason")
      ).to.emit(controller, "AutonomousPriceExecuted");
    });

    it("Should handle price decreases", async function () {
      const { controller, agent, guardian } = await loadFixture(deployContractsFixture);

      await controller.connect(guardian).guardianUnpause();

      const oldPrice = ethers.utils.parseEther("1.0");
      const newPrice = ethers.utils.parseEther("0.96"); // 4% decrease

      await expect(
        controller.connect(agent).agentSetPrice(1, oldPrice, newPrice, "reason")
      ).to.emit(controller, "AutonomousPriceExecuted");
    });
  });
});

// Helper function for expect events
const anyValue = () => true;

