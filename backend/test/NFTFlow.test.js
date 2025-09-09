const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTFlow", function () {
  let nftFlow, paymentStream, reputationSystem, mockNFT, priceOracle;
  let owner, renter, nftOwner, otherAccount;

  beforeEach(async function () {
    [owner, renter, nftOwner, otherAccount] = await ethers.getSigners();

    // Deploy mock contracts
    const MockNFT = await ethers.getContractFactory("MockERC721");
    mockNFT = await MockNFT.deploy("TestNFT", "TNFT");

    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    priceOracle = await MockPriceOracle.deploy();

    // Deploy PaymentStream
    const PaymentStream = await ethers.getContractFactory("PaymentStream");
    paymentStream = await PaymentStream.deploy();

    // Deploy ReputationSystem
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    reputationSystem = await ReputationSystem.deploy();

    // Deploy NFTFlow
    // Deploy UtilityTracker
    const UtilityTracker = await ethers.getContractFactory("UtilityTracker");
    const utilityTracker = await UtilityTracker.deploy();
    await utilityTracker.waitForDeployment();

    const NFTFlow = await ethers.getContractFactory("NFTFlowGasOptimized");
    nftFlow = await NFTFlow.deploy(await reputationSystem.getAddress());

    // Authorize NFTFlow in ReputationSystem
    await reputationSystem.addAuthorizedContract(await nftFlow.getAddress());

    // Mint NFT to nftOwner
    await mockNFT.mint(await nftOwner.getAddress(), 1);
    await mockNFT.connect(nftOwner).setApprovalForAll(await nftFlow.getAddress(), true);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftFlow.owner()).to.equal(await owner.getAddress());
    });

    it("Should set the correct contract addresses", async function () {
      expect(await nftFlow.priceOracle()).to.equal(priceOracle.address);
      expect(await nftFlow.paymentStreamContract()).to.equal(paymentStream.address);
      expect(await nftFlow.reputationContract()).to.equal(reputationSystem.address);
    });
  });

  describe("Listing NFTs", function () {
    it("Should allow NFT owner to list for rental", async function () {
      const pricePerSecond = ethers.parseEther("0.001");
      const minDuration = 3600; // 1 hour
      const maxDuration = 86400; // 1 day
      const collateral = ethers.parseEther("0.1");

      await expect(
        nftFlow.connect(nftOwner).listForRental(
          mockNFT.address,
          1,
          pricePerSecond,
          minDuration,
          maxDuration,
          collateral
        )
      ).to.emit(nftFlow, "RentalListed");
    });

    it("Should reject listing from non-owner", async function () {
      const pricePerSecond = ethers.parseEther("0.001");
      const minDuration = 3600;
      const maxDuration = 86400;
      const collateral = ethers.parseEther("0.1");

      await expect(
        nftFlow.connect(renter).listForRental(
          mockNFT.address,
          1,
          pricePerSecond,
          minDuration,
          maxDuration,
          collateral
        )
      ).to.be.revertedWith("Not token owner");
    });

    it("Should reject invalid duration ranges", async function () {
      const pricePerSecond = ethers.parseEther("0.001");
      const minDuration = 86400; // 1 day
      const maxDuration = 3600; // 1 hour (invalid: min > max)
      const collateral = ethers.parseEther("0.1");

      await expect(
        nftFlow.connect(nftOwner).listForRental(
          mockNFT.address,
          1,
          pricePerSecond,
          minDuration,
          maxDuration,
          collateral
        )
      ).to.be.revertedWith("Invalid duration range");
    });
  });

  describe("Renting NFTs", function () {
    let listingId;

    beforeEach(async function () {
      const pricePerSecond = ethers.parseEther("0.001");
      const minDuration = 3600;
      const maxDuration = 86400;
      const collateral = ethers.parseEther("0.1");

      const tx = await nftFlow.connect(nftOwner).listForRental(
        mockNFT.address,
        1,
        pricePerSecond,
        minDuration,
        maxDuration,
        collateral
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "RentalListed");
      listingId = event.args.listingId;
    });

    it("Should allow renting with sufficient payment", async function () {
      const duration = 3600; // 1 hour
      const pricePerSecond = ethers.parseEther("0.001");
      const totalCost = pricePerSecond.mul(duration);
      const collateral = ethers.parseEther("0.1");
      const totalPayment = totalCost.add(collateral);

      await expect(
        nftFlow.connect(renter).rentNFT(listingId, duration, {
          value: totalPayment
        })
      ).to.emit(nftFlow, "RentalCreated");
    });

    it("Should reject rental with insufficient payment", async function () {
      const duration = 3600;
      const insufficientPayment = ethers.parseEther("0.01");

      await expect(
        nftFlow.connect(renter).rentNFT(listingId, duration, {
          value: insufficientPayment
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject rental duration outside allowed range", async function () {
      const shortDuration = 1800; // 30 minutes (too short)
      const pricePerSecond = ethers.parseEther("0.001");
      const totalCost = pricePerSecond.mul(shortDuration);
      const collateral = ethers.parseEther("0.1");

      await expect(
        nftFlow.connect(renter).rentNFT(shortDuration, duration, {
          value: totalCost.add(collateral)
        })
      ).to.be.revertedWith("Duration too short");
    });
  });

  describe("Collateral Management", function () {
    it("Should allow users to deposit collateral", async function () {
      const depositAmount = ethers.parseEther("1.0");

      await expect(
        nftFlow.connect(renter).depositCollateral({
          value: depositAmount
        })
      ).to.emit(nftFlow, "CollateralDeposited")
        .withArgs(renter.address, depositAmount);

      expect(await nftFlow.userCollateralBalance(renter.address))
        .to.equal(depositAmount);
    });

    it("Should allow users to withdraw collateral", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const withdrawAmount = ethers.parseEther("0.5");

      // Deposit first
      await nftFlow.connect(renter).depositCollateral({
        value: depositAmount
      });

      // Then withdraw
      await expect(
        nftFlow.connect(renter).withdrawCollateral(withdrawAmount)
      ).to.emit(nftFlow, "CollateralWithdrawn")
        .withArgs(renter.address, withdrawAmount);

      expect(await nftFlow.userCollateralBalance(renter.address))
        .to.equal(depositAmount.sub(withdrawAmount));
    });

    it("Should reject withdrawal of more than available balance", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const excessiveWithdraw = ethers.parseEther("2.0");

      await nftFlow.connect(renter).depositCollateral({
        value: depositAmount
      });

      await expect(
        nftFlow.connect(renter).withdrawCollateral(excessiveWithdraw)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Platform Management", function () {
    it("Should allow owner to pause and unpause", async function () {
      await nftFlow.pause();
      expect(await nftFlow.paused()).to.be.true;

      await nftFlow.unpause();
      expect(await nftFlow.paused()).to.be.false;
    });

    it("Should allow owner to update platform fee", async function () {
      const newFee = 500; // 5%
      await nftFlow.updatePlatformFee(newFee);
      expect(await nftFlow.platformFeePercentage()).to.equal(newFee);
    });

    it("Should reject excessive platform fee", async function () {
      const excessiveFee = 1500; // 15% (too high)
      await expect(
        nftFlow.updatePlatformFee(excessiveFee)
      ).to.be.revertedWith("Fee too high");
    });

    it("Should allow owner to withdraw platform fees", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      // Simulate some platform fees in the contract
      await owner.sendTransaction({
        to: nftFlow.address,
        value: ethers.parseEther("1.0")
      });

      await nftFlow.withdrawPlatformFees();
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});

