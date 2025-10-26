const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Gas Optimization Tests", function () {
  let NFTFlowCore, PaymentStreamFactory, ReputationSystem, MockPriceOracle;
  let nftFlowCore, paymentStreamFactory, reputationSystem, mockPriceOracle;
  let owner, lender, tenant;
  
  before(async function () {
    [owner, lender, tenant] = await ethers.getSigners();
    
    // Deploy contracts
    const PaymentStream = await ethers.getContractFactory("PaymentStream");
    const paymentStream = await PaymentStream.deploy();
    
    PaymentStreamFactory = await ethers.getContractFactory("PaymentStreamFactory");
    paymentStreamFactory = await PaymentStreamFactory.deploy(paymentStream.address);
    
    ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    reputationSystem = await ReputationSystem.deploy();
    
    MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    mockPriceOracle = await MockPriceOracle.deploy();
    
    NFTFlowCore = await ethers.getContractFactory("NFTFlowCore");
    nftFlowCore = await upgrades.deployProxy(
      NFTFlowCore,
      [paymentStreamFactory.address, reputationSystem.address, mockPriceOracle.address, owner.address],
      { initializer: "initialize" }
    );
    
    // Set NFTFlowCore in ReputationSystem
    await reputationSystem.setNFTFlowCore(nftFlowCore.address);
  });
  
  it("Should optimize gas for rental creation", async function () {
    const gasLimit = 200000;
    
    const tx = await nftFlowCore.connect(lender).createRental(
      ethers.constants.AddressZero, // Mock NFT address
      1, // tokenId
      ethers.utils.parseEther("0.0001"), // pricePerSecond
      3600, // minDuration (1 hour)
      86400 // maxDuration (1 day)
    );
    
    const receipt = await tx.wait();
    console.log("Rental creation gas used:", receipt.gasUsed.toString());
    
    expect(receipt.gasUsed).to.be.lt(gasLimit);
  });
  
  it("Should optimize gas for batch operations", async function () {
    const nftContracts = [
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero
    ];
    
    const tokenIds = [1, 2, 3];
    const pricePerSeconds = [
      ethers.utils.parseEther("0.0001"),
      ethers.utils.parseEther("0.0002"),
      ethers.utils.parseEther("0.0003")
    ];
    
    const minDurations = [3600, 3600, 3600];
    const maxDurations = [86400, 86400, 86400];
    
    const tx = await nftFlowCore.connect(lender).batchCreateRentals(
      nftContracts,
      tokenIds,
      pricePerSeconds,
      minDurations,
      maxDurations
    );
    
    const receipt = await tx.wait();
    console.log("Batch rental creation gas used:", receipt.gasUsed.toString());
    
    // Should be less than 3x individual rental creation
    expect(receipt.gasUsed).to.be.lt(600000);
  });
  
  it("Should use custom errors for gas efficiency", async function () {
    try {
      await nftFlowCore.connect(lender).createRental(
        ethers.constants.AddressZero,
        1,
        0, // Invalid price
        3600,
        86400
      );
      expect.fail("Should have reverted");
    } catch (error) {
      expect(error.message).to.include("InvalidPrice()");
    }
  });
});
