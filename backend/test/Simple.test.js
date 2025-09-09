const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Simple Contract Tests", function () {
  it("Should deploy PaymentStream successfully", async function () {
    const PaymentStream = await ethers.getContractFactory("PaymentStream");
    const paymentStream = await PaymentStream.deploy();
    
    expect(await paymentStream.getAddress()).to.be.properAddress;
  });

  it("Should deploy ReputationSystem successfully", async function () {
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const reputationSystem = await ReputationSystem.deploy();
    
    expect(await reputationSystem.getAddress()).to.be.properAddress;
  });

  it("Should deploy MockPriceOracle successfully", async function () {
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    const priceOracle = await MockPriceOracle.deploy();
    
    expect(await priceOracle.getAddress()).to.be.properAddress;
  });

  it("Should deploy MockERC721 successfully", async function () {
    const MockERC721 = await ethers.getContractFactory("MockERC721");
    const mockNFT = await MockERC721.deploy("TestNFT", "TNFT");
    
    expect(await mockNFT.getAddress()).to.be.properAddress;
  });

  it("Should deploy NFTFlow with all dependencies", async function () {
    // Deploy dependencies
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    const priceOracle = await MockPriceOracle.deploy();

    const PaymentStream = await ethers.getContractFactory("PaymentStream");
    const paymentStream = await PaymentStream.deploy();

    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const reputationSystem = await ReputationSystem.deploy();

    const UtilityTracker = await ethers.getContractFactory("UtilityTracker");
    const utilityTracker = await UtilityTracker.deploy();

    // Deploy NFTFlow
    const NFTFlow = await ethers.getContractFactory("NFTFlow");
    const nftFlow = await NFTFlow.deploy(
      await priceOracle.getAddress(),
      await paymentStream.getAddress(),
      await reputationSystem.getAddress(),
      await utilityTracker.getAddress()
    );

    expect(await nftFlow.getAddress()).to.be.properAddress;
  });
});
