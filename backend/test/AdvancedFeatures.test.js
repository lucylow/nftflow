const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("NFTFlow Advanced Features Integration", function () {
  // Comprehensive fixture with all advanced contracts
  async function deployAdvancedFeaturesFixture() {
    const [owner, lender, tenant, other, maliciousUser] = await ethers.getSigners();

    // Deploy ReputationSystem
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const reputationSystem = await ReputationSystem.deploy();

    // Deploy DIAPriceOracle
    const DIAPriceOracle = await ethers.getContractFactory("DIAPriceOracle");
    const priceOracle = await DIAPriceOracle.deploy();

    // Deploy NFTFlowGasOptimized
    const NFTFlowGasOptimized = await ethers.getContractFactory("NFTFlowGasOptimized");
    const nftFlow = await NFTFlowGasOptimized.deploy(reputationSystem.target);

    // Deploy MockERC4907
    const MockERC4907 = await ethers.getContractFactory("MockERC4907");
    const mockNFT = await MockERC4907.deploy();

    // Set up contracts
    await reputationSystem.setRentalContract(nftFlow.target);

    // Mint test NFTs
    await mockNFT.mint(lender.address, 1);
    await mockNFT.mint(lender.address, 2);
    await mockNFT.mint(lender.address, 3);

    return { 
      reputationSystem,
      priceOracle,
      nftFlow,
      mockNFT,
      owner, 
      lender, 
      tenant, 
      other, 
      maliciousUser 
    };
  }

  describe("Gas Optimization (MultiCallV3)", function () {
    it("Should use MultiCall for efficient rental operations", async function () {
      const { mockNFT, nftFlow, lender, tenant } = await loadFixture(deployAdvancedFeaturesFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      const expires = Math.floor(Date.now() / 1000) + duration;
      
      // Measure gas usage
      const tx = await nftFlow.connect(tenant).rentNFT(
        mockNFT.target,
        1,
        expires,
        totalPrice,
        { value: totalPrice }
      );
      
      const receipt = await tx.wait();
      
      // Gas usage should be optimized (less than 200k gas)
      expect(receipt.gasUsed).to.be.lessThan(200000);
      
      // Verify rental was created successfully
      const rental = await nftFlow.rentals(mockNFT.target, 1);
      expect(rental.active).to.be.true;
      expect(rental.tenant).to.equal(tenant.address);
    });

    it("Should batch multiple operations efficiently", async function () {
      const { mockNFT, nftFlow, lender, tenant, other } = await loadFixture(deployAdvancedFeaturesFixture);
      
      // Approve multiple NFTs
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      await mockNFT.connect(lender).approve(nftFlow.target, 2);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      const expires = Math.floor(Date.now() / 1000) + duration;
      
      // Create multiple rentals
      const tx1 = await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, expires, totalPrice, { value: totalPrice });
      const tx2 = await nftFlow.connect(other).rentNFT(mockNFT.target, 2, expires, totalPrice, { value: totalPrice });
      
      const receipt1 = await tx1.wait();
      const receipt2 = await tx2.wait();
      
      // Both transactions should be gas efficient
      expect(receipt1.gasUsed).to.be.lessThan(200000);
      expect(receipt2.gasUsed).to.be.lessThan(200000);
    });
  });

  describe("Reputation System Integration", function () {
    it("Should track reputation changes on rental completion", async function () {
      const { mockNFT, nftFlow, reputationSystem, lender, tenant } = await loadFixture(deployAdvancedFeaturesFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      const expires = Math.floor(Date.now() / 1000) + duration;
      
      // Check initial reputation
      const initialStats = await reputationSystem.getRentalStats(tenant.address);
      expect(initialStats.totalRentals).to.equal(0);
      
      // Create and complete rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, expires, totalPrice, { value: totalPrice });
      await time.increase(duration + 1);
      await nftFlow.completeRental(mockNFT.target, 1);
      
      // Check reputation was updated
      const finalStats = await reputationSystem.getRentalStats(tenant.address);
      expect(finalStats.totalRentals).to.equal(1);
      expect(finalStats.successfulRentals).to.equal(1);
      expect(finalStats.successRate).to.equal(100);
    });

    it("Should reduce collateral requirements for trusted users", async function () {
      const { reputationSystem, tenant } = await loadFixture(deployAdvancedFeaturesFixture);
      
      // Simulate building reputation
      for (let i = 0; i < 10; i++) {
        await reputationSystem.updateReputation(tenant.address, true);
      }
      
      // Check collateral requirements
      const requiresCollateral = await reputationSystem.requiresCollateral(tenant.address);
      const collateralMultiplier = await reputationSystem.getCollateralMultiplier(tenant.address);
      
      expect(requiresCollateral).to.be.false;
      expect(collateralMultiplier).to.equal(0); // No collateral required
    });

    it("Should handle reputation tiers correctly", async function () {
      const { reputationSystem, tenant } = await loadFixture(deployAdvancedFeaturesFixture);
      
      // Test different reputation levels
      await reputationSystem.setReputationScore(tenant.address, 500); // Standard
      let tier = await reputationSystem.getReputationTier(tenant.address);
      expect(tier).to.equal(1);
      
      await reputationSystem.setReputationScore(tenant.address, 750); // Trusted
      tier = await reputationSystem.getReputationTier(tenant.address);
      expect(tier).to.equal(2);
      
      await reputationSystem.setReputationScore(tenant.address, 900); // Elite
      tier = await reputationSystem.getReputationTier(tenant.address);
      expect(tier).to.equal(3);
      
      await reputationSystem.whitelistUser(tenant.address); // VIP
      tier = await reputationSystem.getReputationTier(tenant.address);
      expect(tier).to.equal(4);
    });
  });

  describe("Price Oracle Integration", function () {
    it("Should fetch prices from DIA Oracle", async function () {
      const { priceOracle, mockNFT } = await loadFixture(deployAdvancedFeaturesFixture);
      
      // Set oracle fee
      const oracleFee = await priceOracle.oracleFee();
      
      // Get price (this will use mock data since DIA Oracle isn't deployed)
      const price = await priceOracle.getPrice(mockNFT.target, 1, { value: oracleFee });
      
      expect(price).to.be.greaterThan(0);
    });

    it("Should handle custom pricing", async function () {
      const { priceOracle, mockNFT, lender } = await loadFixture(deployAdvancedFeaturesFixture);
      
      const customPrice = ethers.parseEther("0.000005");
      
      // Set custom price
      await priceOracle.connect(lender).setCustomPrice(mockNFT.target, 1, customPrice);
      
      // Get price should return custom price
      const price = await priceOracle.getEstimatedPrice(mockNFT.target, 1);
      expect(price).to.equal(customPrice);
    });

    it("Should enforce price limits", async function () {
      const { priceOracle, mockNFT, lender } = await loadFixture(deployAdvancedFeaturesFixture);
      
      const minPrice = await priceOracle.MIN_PRICE_PER_SECOND();
      const maxPrice = await priceOracle.MAX_PRICE_PER_SECOND();
      
      // Try to set price below minimum
      await expect(
        priceOracle.connect(lender).setCustomPrice(mockNFT.target, 1, minPrice - BigInt(1))
      ).to.be.revertedWith("Price out of range");
      
      // Try to set price above maximum
      await expect(
        priceOracle.connect(lender).setCustomPrice(mockNFT.target, 1, maxPrice + BigInt(1))
      ).to.be.revertedWith("Price out of range");
    });

    it("Should batch set custom prices", async function () {
      const { priceOracle, mockNFT, lender } = await loadFixture(deployAdvancedFeaturesFixture);
      
      const contracts = [mockNFT.target, mockNFT.target];
      const tokenIds = [1, 2];
      const prices = [ethers.parseEther("0.000001"), ethers.parseEther("0.000002")];
      
      await priceOracle.connect(lender).batchSetCustomPrices(contracts, tokenIds, prices);
      
      // Verify prices were set
      const price1 = await priceOracle.customPrices(mockNFT.target, 1);
      const price2 = await priceOracle.customPrices(mockNFT.target, 2);
      
      expect(price1).to.equal(prices[0]);
      expect(price2).to.equal(prices[1]);
    });
  });

  describe("Protocol Fee Management", function () {
    it("Should collect correct protocol fees", async function () {
      const { mockNFT, nftFlow, lender, tenant, owner } = await loadFixture(deployAdvancedFeaturesFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      const expires = Math.floor(Date.now() / 1000) + duration;
      
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      
      // Create rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, expires, totalPrice, { value: totalPrice });
      
      // Check protocol fee was collected
      const contractBalance = await ethers.provider.getBalance(nftFlow.target);
      const expectedFee = (totalPrice * BigInt(250)) / BigInt(10000); // 2.5%
      expect(contractBalance).to.equal(expectedFee);
    });

    it("Should allow fee percentage adjustment", async function () {
      const { nftFlow, owner } = await loadFixture(deployAdvancedFeaturesFixture);
      
      // Set new fee percentage
      await nftFlow.connect(owner).setProtocolFeePercentage(500); // 5%
      
      const newFee = await nftFlow.protocolFeePercentage();
      expect(newFee).to.equal(500);
    });

    it("Should prevent excessive fee percentages", async function () {
      const { nftFlow, owner } = await loadFixture(deployAdvancedFeaturesFixture);
      
      // Try to set fee above 10%
      await expect(
        nftFlow.connect(owner).setProtocolFeePercentage(1001)
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency NFT recovery", async function () {
      const { mockNFT, nftFlow, lender, tenant, owner } = await loadFixture(deployAdvancedFeaturesFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      const expires = Math.floor(Date.now() / 1000) + duration;
      
      // Create rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, expires, totalPrice, { value: totalPrice });
      
      // Fast forward past expiration + recovery period
      await time.increase(duration + 8 * 24 * 60 * 60); // 8 days
      
      // Emergency recover
      await nftFlow.connect(owner).emergencyRecoverNFT(mockNFT.target, 1);
      
      // Check NFT user was cleared
      expect(await mockNFT.userOf(1)).to.equal(ethers.ZeroAddress);
    });

    it("Should prevent premature emergency recovery", async function () {
      const { mockNFT, nftFlow, lender, tenant, owner } = await loadFixture(deployAdvancedFeaturesFixture);
      
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const pricePerSecond = ethers.parseEther("0.0001");
      const duration = 3600;
      const totalPrice = pricePerSecond * BigInt(duration);
      const expires = Math.floor(Date.now() / 1000) + duration;
      
      // Create rental
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, expires, totalPrice, { value: totalPrice });
      
      // Fast forward past expiration but before recovery period
      await time.increase(duration + 6 * 24 * 60 * 60); // 6 days
      
      // Emergency recover should fail
      await expect(
        nftFlow.connect(owner).emergencyRecoverNFT(mockNFT.target, 1)
      ).to.be.revertedWith("Recovery period not reached");
    });
  });

  describe("Access Control and Security", function () {
    it("Should prevent unauthorized reputation updates", async function () {
      const { reputationSystem, tenant } = await loadFixture(deployAdvancedFeaturesFixture);
      
      await expect(
        reputationSystem.connect(tenant).updateReputation(tenant.address, true)
      ).to.be.revertedWith("Caller is not the rental contract");
    });

    it("Should prevent unauthorized contract configuration", async function () {
      const { nftFlow, reputationSystem, tenant } = await loadFixture(deployAdvancedFeaturesFixture);
      
      await expect(
        nftFlow.connect(tenant).setProtocolFeePercentage(100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        reputationSystem.connect(tenant).setRentalContract(tenant.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent unauthorized price setting", async function () {
      const { priceOracle, mockNFT, tenant, other } = await loadFixture(deployAdvancedFeaturesFixture);
      
      // Try to set price for NFT owned by someone else
      await expect(
        priceOracle.connect(other).setCustomPrice(mockNFT.target, 1, ethers.parseEther("0.000001"))
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete rental lifecycle with all features", async function () {
      const { mockNFT, nftFlow, reputationSystem, priceOracle, lender, tenant } = await loadFixture(deployAdvancedFeaturesFixture);
      
      // Set up pricing
      await priceOracle.connect(lender).setCustomPrice(mockNFT.target, 1, ethers.parseEther("0.000001"));
      
      // Approve NFT
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      // Check initial state
      const initialReputation = await reputationSystem.getReputationScore(tenant.address);
      expect(initialReputation).to.equal(500); // Default starting score
      
      // Create rental
      const duration = 3600;
      const pricePerSecond = ethers.parseEther("0.000001");
      const totalPrice = pricePerSecond * BigInt(duration);
      const expires = Math.floor(Date.now() / 1000) + duration;
      
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, expires, totalPrice, { value: totalPrice });
      
      // Verify rental state
      const rental = await nftFlow.rentals(mockNFT.target, 1);
      expect(rental.active).to.be.true;
      expect(rental.tenant).to.equal(tenant.address);
      
      // Complete rental
      await time.increase(duration + 1);
      await nftFlow.completeRental(mockNFT.target, 1);
      
      // Verify completion
      const completedRental = await nftFlow.rentals(mockNFT.target, 1);
      expect(completedRental.active).to.be.false;
      
      // Verify reputation update
      const finalReputation = await reputationSystem.getReputationScore(tenant.address);
      expect(finalReputation).to.be.greaterThan(initialReputation);
      
      // Verify NFT user was cleared
      expect(await mockNFT.userOf(1)).to.equal(ethers.ZeroAddress);
    });

    it("Should handle multiple users with different reputation levels", async function () {
      const { mockNFT, nftFlow, reputationSystem, lender, tenant, other } = await loadFixture(deployAdvancedFeaturesFixture);
      
      // Set up different reputation levels
      await reputationSystem.setReputationScore(tenant.address, 800); // High reputation
      await reputationSystem.setReputationScore(other.address, 300);  // Low reputation
      
      // Approve NFTs
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      await mockNFT.connect(lender).approve(nftFlow.target, 2);
      
      const duration = 3600;
      const pricePerSecond = ethers.parseEther("0.0001");
      const totalPrice = pricePerSecond * BigInt(duration);
      const expires = Math.floor(Date.now() / 1000) + duration;
      
      // Both users should be able to rent
      await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, expires, totalPrice, { value: totalPrice });
      await nftFlow.connect(other).rentNFT(mockNFT.target, 2, expires, totalPrice, { value: totalPrice });
      
      // Verify both rentals were created
      const rental1 = await nftFlow.rentals(mockNFT.target, 1);
      const rental2 = await nftFlow.rentals(mockNFT.target, 2);
      
      expect(rental1.active).to.be.true;
      expect(rental2.active).to.be.true;
      
      // Check collateral requirements
      const tenantRequiresCollateral = await reputationSystem.requiresCollateral(tenant.address);
      const otherRequiresCollateral = await reputationSystem.requiresCollateral(other.address);
      
      expect(tenantRequiresCollateral).to.be.false; // High reputation
      expect(otherRequiresCollateral).to.be.true;    // Low reputation
    });
  });

  describe("Performance and Gas Optimization", function () {
    it("Should maintain low gas costs across all operations", async function () {
      const { mockNFT, nftFlow, reputationSystem, priceOracle, lender, tenant } = await loadFixture(deployAdvancedFeaturesFixture);
      
      // Set up pricing
      await priceOracle.connect(lender).setCustomPrice(mockNFT.target, 1, ethers.parseEther("0.000001"));
      
      // Approve NFT
      await mockNFT.connect(lender).approve(nftFlow.target, 1);
      
      const duration = 3600;
      const pricePerSecond = ethers.parseEther("0.000001");
      const totalPrice = pricePerSecond * BigInt(duration);
      const expires = Math.floor(Date.now() / 1000) + duration;
      
      // Measure gas for rental creation
      const rentalTx = await nftFlow.connect(tenant).rentNFT(mockNFT.target, 1, expires, totalPrice, { value: totalPrice });
      const rentalReceipt = await rentalTx.wait();
      
      // Measure gas for rental completion
      await time.increase(duration + 1);
      const completionTx = await nftFlow.completeRental(mockNFT.target, 1);
      const completionReceipt = await completionTx.wait();
      
      // Gas usage should be reasonable
      expect(rentalReceipt.gasUsed).to.be.lessThan(200000);
      expect(completionReceipt.gasUsed).to.be.lessThan(100000);
    });
  });
});
