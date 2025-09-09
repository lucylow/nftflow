const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationSystem", function () {
  let reputationSystem;
  let owner, user1, user2, authorizedContract;

  beforeEach(async function () {
    [owner, user1, user2, authorizedContract] = await ethers.getSigners();

    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    reputationSystem = await ReputationSystem.deploy();

    // Add authorized contract
    await reputationSystem.addAuthorizedContract(authorizedContract.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await reputationSystem.owner()).to.equal(owner.address);
    });

    it("Should initialize default achievements", async function () {
      const totalAchievements = await reputationSystem.getTotalAchievements();
      expect(totalAchievements).to.equal(5); // 5 default achievements

      const firstAchievement = await reputationSystem.getAchievement(0);
      expect(firstAchievement.name).to.equal("First Rental");
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to add authorized contracts", async function () {
      await reputationSystem.addAuthorizedContract(user1.address);
      expect(await reputationSystem.authorizedContracts(user1.address)).to.be.true;
    });

    it("Should allow owner to remove authorized contracts", async function () {
      await reputationSystem.removeAuthorizedContract(authorizedContract.address);
      expect(await reputationSystem.authorizedContracts(authorizedContract.address)).to.be.false;
    });

    it("Should reject unauthorized reputation updates", async function () {
      await expect(
        reputationSystem.connect(user1).updateReputation(user2.address, true)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Reputation Updates", function () {
    it("Should update reputation for successful rental", async function () {
      await expect(
        reputationSystem.connect(authorizedContract).updateReputation(user1.address, true)
      ).to.emit(reputationSystem, "ReputationUpdated");

      const reputation = await reputationSystem.getUserReputation(user1.address);
      expect(reputation.totalRentals).to.equal(1);
      expect(reputation.successfulRentals).to.equal(1);
      expect(reputation.reputationScore).to.equal(10); // REPUTATION_GAIN
    });

    it("Should update reputation for failed rental", async function () {
      // First give user some reputation
      await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      
      // Then fail a rental
      await expect(
        reputationSystem.connect(authorizedContract).updateReputation(user1.address, false)
      ).to.emit(reputationSystem, "ReputationUpdated");

      const reputation = await reputationSystem.getUserReputation(user1.address);
      expect(reputation.totalRentals).to.equal(2);
      expect(reputation.successfulRentals).to.equal(1);
      expect(reputation.reputationScore).to.equal(0); // 10 - 25 = 0 (capped at 0)
    });

    it("Should not allow reputation updates for blacklisted users", async function () {
      await reputationSystem.setUserBlacklisted(user1.address, true);

      await expect(
        reputationSystem.connect(authorizedContract).updateReputation(user1.address, true)
      ).to.be.revertedWith("User is blacklisted");
    });

    it("Should cap reputation score at maximum", async function () {
      // Update reputation many times to exceed maximum
      for (let i = 0; i < 150; i++) {
        await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      }

      const reputation = await reputationSystem.getUserReputation(user1.address);
      expect(reputation.reputationScore).to.equal(1000); // MAX_REPUTATION_SCORE
    });
  });

  describe("Collateral Multiplier", function () {
    it("Should return 200% multiplier for blacklisted users", async function () {
      await reputationSystem.setUserBlacklisted(user1.address, true);
      const multiplier = await reputationSystem.getCollateralMultiplier(user1.address);
      expect(multiplier).to.equal(20000); // 200%
    });

    it("Should return 0% multiplier for high reputation users", async function () {
      // Give user high reputation (800+)
      for (let i = 0; i < 80; i++) {
        await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      }

      const multiplier = await reputationSystem.getCollateralMultiplier(user1.address);
      expect(multiplier).to.equal(0); // No collateral needed
    });

    it("Should return 25% multiplier for mid reputation users", async function () {
      // Give user mid reputation (500-799)
      for (let i = 0; i < 50; i++) {
        await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      }

      const multiplier = await reputationSystem.getCollateralMultiplier(user1.address);
      expect(multiplier).to.equal(2500); // 25%
    });

    it("Should return 50% multiplier for low reputation users", async function () {
      // Give user low reputation (100-499)
      for (let i = 0; i < 10; i++) {
        await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      }

      const multiplier = await reputationSystem.getCollateralMultiplier(user1.address);
      expect(multiplier).to.equal(5000); // 50%
    });

    it("Should return 100% multiplier for new users", async function () {
      const multiplier = await reputationSystem.getCollateralMultiplier(user1.address);
      expect(multiplier).to.equal(10000); // 100%
    });
  });

  describe("Success Rate", function () {
    it("Should return 0% for users with no rentals", async function () {
      const successRate = await reputationSystem.getSuccessRate(user1.address);
      expect(successRate).to.equal(0);
    });

    it("Should calculate correct success rate", async function () {
      // 3 successful, 1 failed = 75%
      await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      await reputationSystem.connect(authorizedContract).updateReputation(user1.address, false);

      const successRate = await reputationSystem.getSuccessRate(user1.address);
      expect(successRate).to.equal(75);
    });

    it("Should return 100% for perfect record", async function () {
      await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);

      const successRate = await reputationSystem.getSuccessRate(user1.address);
      expect(successRate).to.equal(100);
    });
  });

  describe("Achievements", function () {
    it("Should unlock 'First Rental' achievement", async function () {
      await expect(
        reputationSystem.connect(authorizedContract).updateReputation(user1.address, true)
      ).to.emit(reputationSystem, "AchievementUnlocked")
        .withArgs(user1.address, 0, "First Rental");

      expect(await reputationSystem.hasAchievement(user1.address, 0)).to.be.true;
    });

    it("Should unlock 'Rental Novice' achievement", async function () {
      // Complete 10 rentals
      for (let i = 0; i < 10; i++) {
        await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      }

      expect(await reputationSystem.hasAchievement(user1.address, 1)).to.be.true;
    });

    it("Should unlock 'Perfect Record' achievement", async function () {
      // Complete 20 successful rentals
      for (let i = 0; i < 20; i++) {
        await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      }

      expect(await reputationSystem.hasAchievement(user1.address, 4)).to.be.true;
    });

    it("Should not unlock 'Perfect Record' with failed rentals", async function () {
      // Complete 19 successful + 1 failed = 20 total but not perfect
      for (let i = 0; i < 19; i++) {
        await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      }
      await reputationSystem.connect(authorizedContract).updateReputation(user1.address, false);

      expect(await reputationSystem.hasAchievement(user1.address, 4)).to.be.false;
    });

    it("Should return user's unlocked achievements", async function () {
      // Unlock first two achievements
      for (let i = 0; i < 10; i++) {
        await reputationSystem.connect(authorizedContract).updateReputation(user1.address, true);
      }

      const achievements = await reputationSystem.getUserAchievements(user1.address);
      expect(achievements).to.include(ethers.BigNumber.from(0)); // First Rental
      expect(achievements).to.include(ethers.BigNumber.from(1)); // Rental Novice
      expect(achievements.length).to.equal(2);
    });
  });

  describe("Blacklisting", function () {
    it("Should allow owner to blacklist users", async function () {
      await expect(
        reputationSystem.setUserBlacklisted(user1.address, true)
      ).to.emit(reputationSystem, "UserBlacklisted")
        .withArgs(user1.address, true);

      const reputation = await reputationSystem.getUserReputation(user1.address);
      expect(reputation.blacklisted).to.be.true;
    });

    it("Should allow owner to unblacklist users", async function () {
      await reputationSystem.setUserBlacklisted(user1.address, true);
      
      await expect(
        reputationSystem.setUserBlacklisted(user1.address, false)
      ).to.emit(reputationSystem, "UserBlacklisted")
        .withArgs(user1.address, false);

      const reputation = await reputationSystem.getUserReputation(user1.address);
      expect(reputation.blacklisted).to.be.false;
    });

    it("Should reject blacklisting by non-owner", async function () {
      await expect(
        reputationSystem.connect(user1).setUserBlacklisted(user2.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Achievement Management", function () {
    it("Should allow owner to create new achievements", async function () {
      await reputationSystem.createAchievement(
        "Test Achievement",
        "Test Description",
        5,
        100
      );

      const totalAchievements = await reputationSystem.getTotalAchievements();
      expect(totalAchievements).to.equal(6); // 5 default + 1 new

      const newAchievement = await reputationSystem.getAchievement(5);
      expect(newAchievement.name).to.equal("Test Achievement");
      expect(newAchievement.requirement).to.equal(5);
      expect(newAchievement.rewardPoints).to.equal(100);
    });

    it("Should reject achievement creation by non-owner", async function () {
      await expect(
        reputationSystem.connect(user1).createAchievement(
          "Test Achievement",
          "Test Description",
          5,
          100
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});

