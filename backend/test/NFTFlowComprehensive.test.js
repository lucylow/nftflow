const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("NFTFlow Comprehensive Test Suite", function () {
  // We define a fixture to reuse the same setup in every test
  async function deployNFTFlowFixture() {
    const [owner, lender, tenant, other, maliciousUser] = await ethers.getSigners();

    // Deploy mock ERC-4907 NFT
    const MockERC4907 = await ethers.getContractFactory("MockERC4907");
    const mockNFT = await MockERC4907.deploy();

    // Deploy reputation system
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const reputationSystem = await ReputationSystem.deploy();

    // Deploy price oracle
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    const priceOracle = await MockPriceOracle.deploy();

    // Deploy NFTFlow
    const NFTFlow = await ethers.getContractFactory("NFTFlowGasOptimized");
    const nftFlow = await NFTFlow.deploy(reputationSystem.target);

    // Set up contracts
    await reputationSystem.setRentalContract(nftFlow.target);

    // Mint NFTs to the lender
    await mockNFT.mint(lender.address, 1);
    await mockNFT.mint(lender.address, 2);
    await mockNFT.mint(lender.address, 3);

    return { 
      mockNFT, 
      nftFlow, 
      reputationSystem, 
      priceOracle, 
      owner, 
      lender, 
      tenant, 
      other, 
      maliciousUser 
    };
  }

  describe("Deployment and Initialization", function () {
    it("Should deploy all contracts correctly", async function () {
      const { nftFlow, reputationSystem, priceOracle } = await loadFixture(deployNFTFlowFixture);
      
      expect(await nftFlow.reputationSystem()).to.equal(reputationSystem.target);
      expect(await nftFlow.protocolFeePercentage()).to.equal(250); // 2.5%
    });

    it("Should set correct initial values", async function () {
      const { nftFlow } = await loadFixture(deployNFTFlowFixture);
      
      expect(await nftFlow.MAX_RENTAL_DURATION()).to.equal(30 * 24 * 60 * 60); // 30 days
      expect(await nftFlow.protocolFeePercentage()).to.equal(250);
    });
  });

  describe("Rental Creation - Happy Path", function () {
    it("Should create a rental successfully", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      // Approve NFTFlow to manage the NFT
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      // Set price in oracle
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600; // 1 hour
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // Create rental
      await expect(
        nftFlow.connect(tenant).rentNFT(
          mockNFT.target,
          1,
          duration,
          { value: totalPrice }
        )
      ).to.emit(nftFlow, "RentalCreated");
      
      // Check that user was set correctly
      expect(await mockNFT.userOf(1)).to.equal(tenant.address);
      
      // Check rental data
      const rental = await nftFlow.rentals(mockNFT.target, 1);
      expect(rental.lender).to.equal(lender.address);
      expect(rental.tenant).to.equal(tenant.address);
      expect(rental.active).to.be.true;
    });

    it("Should handle multiple rentals correctly", async function () {
      const { mockNFT, nftFlow, lender, tenant, other } = await loadFixture(deployNFTFlowFixture);
      
      // Approve NFTs
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      await mockNFT.connect(lender).approve(nftFlow.target, 2);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // First rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      
      // Second rental by different user
      await nftFlow.connect(other).rentNFT(mockNFT.target, 2, duration, { value: totalPrice });
      
      // Check both rentals
      const rental1 = await nftFlow.rentals(mockNFT.target, 1);
      const rental2 = await nftFlow.rentals(mockNFT.target, 2);
      
      expect(rental1.tenant).to.equal(tenant.address);
      expect(rental2.tenant).to.equal(other.address);
    });
  });

  describe("Rental Creation - Edge Cases", function () {
    it("Should fail with insufficient payment", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const insufficientPayment = pricePerSecond * BigInt(duration) - BigInt(1);
      
      await expect(
        nftFlow.connect(tenant).rentNFT(
          mockNFT.target,
          1,
          duration,
          { value: insufficientPayment }
        )
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail if NFT is already rented", async function () {
      const { mockNFT, nftFlow, lender, tenant, other } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // First rental should succeed
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      
      // Second rental should fail
      await expect(
        nftFlow.connect(other).rentNFT(mockNFT.target, 1, duration, { value: totalPrice })
      ).to.be.revertedWith("NFT already rented");
    });

    it("Should fail with zero duration", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      await expect(
        nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, 0, { value: 0 })
      ).to.be.revertedWith("Rental expiration must be in the future");
    });

    it("Should fail with duration exceeding maximum", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const maxDuration = await nftFlow.MAX_RENTAL_DURATION();
      const excessiveDuration = maxDuration + BigInt(1);
      
      await expect(
        nftFlow.connect(tenant).rentNFT(
          mockNFT.target, 
          1, 
          excessiveDuration, 
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Rental duration too long");
    });

    it("Should fail with past expiration time", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        nftFlow.connect(tenant).rentNFT(
          mockNFT.target, 
          1, 
          pastTime, 
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Rental expiration must be in the future");
    });
  });

  describe("Rental Completion", function () {
    it("Should complete rental after expiration", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // Create rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      
      // Fast forward time to after rental expiration
      await time.increase(duration + 1);
      
      // Complete rental
      await expect(
        nftFlow.completeRental(mockNFT.target, 1)
      ).to.emit(nftFlow, "RentalCompleted");
      
      // Check that user was cleared
      expect(await mockNFT.userOf(1)).to.equal(ethers.ZeroAddress);
      
      // Check rental is no longer active
      const rental = await nftFlow.rentals(mockNFT.target, 1);
      expect(rental.active).to.be.false;
    });

    it("Should fail to complete rental before expiration", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // Create rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      
      // Try to complete rental before expiration
      await expect(
        nftFlow.completeRental(mockNFT.target, 1)
      ).to.be.revertedWith("Rental period not ended");
    });

    it("Should fail to complete non-existent rental", async function () {
      const { mockNFT, nftFlow } = await loadFixture(deployNFTFlowFixture);
      
      await expect(
        nftFlow.completeRental(mockNFT.target, 999)
      ).to.be.revertedWith("Rental not active");
    });
  });

  describe("Reputation System Integration", function () {
    it("Should require collateral for new users", async function () {
      const { reputationSystem, tenant } = await loadFixture(deployNFTFlowFixture);
      
      const requiresCollateral = await reputationSystem.requiresCollateral(tenant.address);
      expect(requiresCollateral).to.be.true;
    });

    it("Should not require collateral for users with good reputation", async function () {
      const { reputationSystem, tenant } = await loadFixture(deployNFTFlowFixture);
      
      // Simulate several successful rentals
      for (let i = 0; i < 10; i++) {
        await reputationSystem.updateReputation(tenant.address, true);
      }
      
      const requiresCollateral = await reputationSystem.requiresCollateral(tenant.address);
      expect(requiresCollateral).to.be.false;
    });

    it("Should not require collateral for whitelisted users", async function () {
      const { reputationSystem, tenant } = await loadFixture(deployNFTFlowFixture);
      
      // Whitelist user
      await reputationSystem.whitelistUser(tenant.address);
      
      const requiresCollateral = await reputationSystem.requiresCollateral(tenant.address);
      expect(requiresCollateral).to.be.false;
    });

    it("Should update reputation on successful rental completion", async function () {
      const { mockNFT, nftFlow, reputationSystem, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // Create rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      
      // Complete rental
      await time.increase(duration + 1);
      await nftFlow.completeRental(mockNFT.target, 1);
      
      // Check reputation was updated
      const stats = await reputationSystem.getRentalStats(tenant.address);
      expect(stats.totalRentals).to.equal(1);
      expect(stats.successfulRentals).to.equal(1);
      expect(stats.successRate).to.equal(100);
    });
  });

  describe("Protocol Fee Management", function () {
    it("Should collect correct protocol fees", async function () {
      const { mockNFT, nftFlow, lender, tenant, owner } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      
      // Create rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      
      // Check that protocol fee was collected
      const contractBalance = await ethers.provider.getBalance(nftFlow.target);
      const expectedFee = (totalPrice * BigInt(250)) / BigInt(10000); // 2.5%
      expect(contractBalance).to.equal(expectedFee);
    });

    it("Should allow owner to withdraw fees", async function () {
      const { mockNFT, nftFlow, lender, tenant, owner } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // Create rental to generate fees
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      
      // Withdraw fees
      await nftFlow.connect(owner).withdrawFees();
      
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore);
    });

    it("Should prevent non-owner from withdrawing fees", async function () {
      const { nftFlow, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await expect(
        nftFlow.connect(tenant).withdrawFees()
      ).to.be.revertedWithCustomError(nftFlow, "OwnableUnauthorizedAccount");
    });
  });

  describe("Security and Access Control", function () {
    it("Should prevent unauthorized reputation updates", async function () {
      const { reputationSystem, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await expect(
        reputationSystem.connect(tenant).updateReputation(tenant.address, true)
      ).to.be.revertedWith("Caller is not the rental contract");
    });

    it("Should prevent unauthorized rental contract changes", async function () {
      const { reputationSystem, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await expect(
        reputationSystem.connect(tenant).setRentalContract(tenant.address)
      ).to.be.revertedWithCustomError(reputationSystem, "OwnableUnauthorizedAccount");
    });

    it("Should prevent unauthorized fee percentage changes", async function () {
      const { nftFlow, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await expect(
        nftFlow.connect(tenant).setProtocolFeePercentage(1000)
      ).to.be.revertedWithCustomError(nftFlow, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases and Stress Tests", function () {
    it("Should handle rental with maximum duration", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const maxDuration = await nftFlow.MAX_RENTAL_DURATION();
      const pricePerSecond = ethers.parseEther("0.0001");
      const totalPrice = pricePerSecond * maxDuration;
      
      await expect(
        nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, maxDuration, { value: totalPrice })
      ).to.emit(nftFlow, "RentalCreated");
    });

    it("Should handle rental with very high price", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("10"); // 10 ETH per second
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // This should fail unless the tenant has a huge balance
      await expect(
        nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice })
      ).to.be.reverted; // Will fail due to insufficient balance
    });

    it("Should handle multiple rapid rentals", async function () {
      const { mockNFT, nftFlow, lender, tenant, other } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      await mockNFT.connect(lender).approve(nftFlow.target, 2);
      await mockNFT.connect(lender).approve(nftFlow.target, 3);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // Create multiple rentals rapidly
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      await nftFlow.connect(other).rentNFT(mockNFT.target, 2, duration, { value: totalPrice });
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 3, duration, { value: totalPrice });
      
      // Check all rentals were created
      const rental1 = await nftFlow.rentals(mockNFT.target, 1);
      const rental2 = await nftFlow.rentals(mockNFT.target, 2);
      const rental3 = await nftFlow.rentals(mockNFT.target, 3);
      
      expect(rental1.active).to.be.true;
      expect(rental2.active).to.be.true;
      expect(rental3.active).to.be.true;
    });

    it("Should handle rental completion after long time", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // Create rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      
      // Fast forward a very long time
      await time.increase(duration + 365 * 24 * 60 * 60); // 1 year later
      
      // Complete rental
      await expect(
        nftFlow.completeRental(mockNFT.target, 1)
      ).to.emit(nftFlow, "RentalCompleted");
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should use MultiCall for efficient execution", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // Measure gas usage
      const tx = await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      const receipt = await tx.wait();
      
      // Gas usage should be reasonable (less than 200k gas)
      expect(receipt.gasUsed).to.be.lessThan(200000);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency NFT recovery", async function () {
      const { mockNFT, nftFlow, lender, tenant, owner } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // Create rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      
      // Fast forward past expiration + recovery period
      await time.increase(duration + 8 * 24 * 60 * 60); // 8 days
      
      // Emergency recover
      await expect(
        nftFlow.connect(owner).emergencyRecoverNFT(mockNFT.target, 1)
      ).to.not.be.reverted;
      
      // Check NFT user was cleared
      expect(await mockNFT.userOf(1)).to.equal(ethers.ZeroAddress);
    });

    it("Should prevent emergency recovery before recovery period", async function () {
      const { mockNFT, nftFlow, lender, tenant, owner } = await loadFixture(deployNFTFlowFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      
      // Create rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, duration, { value: totalPrice });
      
      // Fast forward past expiration but before recovery period
      await time.increase(duration + 6 * 24 * 60 * 60); // 6 days
      
      // Emergency recover should fail
      await expect(
        nftFlow.connect(owner).emergencyRecoverNFT(mockNFT.target, 1)
      ).to.be.revertedWith("Recovery period not reached");
    });
  });
});
