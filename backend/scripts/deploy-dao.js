const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying NFTFlow DAO contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Governance Token
  console.log("\n1. Deploying GovernanceToken...");
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy(
    "NFTFlow Governance Token",
    "NFTGOV",
    "https://nftflow.io/metadata/governance/"
  );
  await governanceToken.waitForDeployment();
  const governanceTokenAddress = await governanceToken.getAddress();
  console.log("GovernanceToken deployed to:", governanceTokenAddress);

  // Deploy DIAPriceOracle
  console.log("\n2. Deploying DIAPriceOracle...");
  const DIAPriceOracle = await ethers.getContractFactory("DIAPriceOracle");
  const priceOracle = await DIAPriceOracle.deploy();
  await priceOracle.waitForDeployment();
  const priceOracleAddress = await priceOracle.getAddress();
  console.log("DIAPriceOracle deployed to:", priceOracleAddress);

  // Deploy mock contracts for testing (in production, these would be real contracts)
  console.log("\n3. Deploying mock contracts...");
  
  // Mock PaymentStream contract
  const MockPaymentStream = await ethers.getContractFactory("MockERC721");
  const paymentStream = await MockPaymentStream.deploy("Mock Payment Stream", "MPS");
  await paymentStream.waitForDeployment();
  const paymentStreamAddress = await paymentStream.getAddress();
  console.log("Mock PaymentStream deployed to:", paymentStreamAddress);

  // Mock Reputation contract
  const MockReputation = await ethers.getContractFactory("MockERC721");
  const reputation = await MockReputation.deploy("Mock Reputation", "MR");
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("Mock Reputation deployed to:", reputationAddress);

  // Mock UtilityTracker contract
  const MockUtilityTracker = await MockReputation.deploy("Mock Utility Tracker", "MUT");
  await MockUtilityTracker.waitForDeployment();
  const utilityTrackerAddress = await MockUtilityTracker.getAddress();
  console.log("Mock UtilityTracker deployed to:", utilityTrackerAddress);

  // Deploy NFTFlow contract
  console.log("\n4. Deploying NFTFlow...");
  const NFTFlow = await ethers.getContractFactory("NFTFlow");
  const nftFlow = await NFTFlow.deploy(
    priceOracleAddress,
    paymentStreamAddress,
    reputationAddress,
    utilityTrackerAddress
  );
  await nftFlow.waitForDeployment();
  const nftFlowAddress = await nftFlow.getAddress();
  console.log("NFTFlow deployed to:", nftFlowAddress);

  // Deploy VRF Rewarder (mock)
  console.log("\n5. Deploying VRF Rewarder...");
  const MockVRFRewarder = await MockReputation.deploy("Mock VRF Rewarder", "MVR");
  await MockVRFRewarder.waitForDeployment();
  const vrfRewarderAddress = await MockVRFRewarder.getAddress();
  console.log("Mock VRF Rewarder deployed to:", vrfRewarderAddress);

  // Deploy Treasury contract (simple contract that can hold funds)
  console.log("\n6. Deploying Treasury...");
  const Treasury = await ethers.getContractFactory("MockERC721");
  const treasury = await Treasury.deploy("Treasury", "TREAS");
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("Treasury deployed to:", treasuryAddress);

  // Deploy DAO contract
  console.log("\n7. Deploying NFTFlowDAO...");
  const NFTFlowDAO = await ethers.getContractFactory("NFTFlowDAO");
  const dao = await NFTFlowDAO.deploy(
    governanceTokenAddress,
    nftFlowAddress,
    vrfRewarderAddress,
    treasuryAddress,
    priceOracleAddress
  );
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  console.log("NFTFlowDAO deployed to:", daoAddress);

  // Set DAO contract in NFTFlow
  console.log("\n8. Setting DAO contract in NFTFlow...");
  await nftFlow.setDAOContract(daoAddress);
  console.log("DAO contract set in NFTFlow");

  // Set up initial governance token holders
  console.log("\n9. Setting up initial governance...");
  
  // Make deployer eligible for governance token
  await governanceToken.setEligibility(deployer.address, true);
  await governanceToken.mint();
  console.log("Deployer minted governance token");

  // Set some test addresses as eligible (for testing)
  const testAddresses = [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012"
  ];
  
  for (const address of testAddresses) {
    await governanceToken.setEligibility(address, true);
  }
  console.log("Test addresses made eligible for governance tokens");

  // Fund the DAO treasury with some test funds
  console.log("\n10. Funding DAO treasury...");
  const treasuryAmount = ethers.parseEther("1.0"); // 1 ETH
  await deployer.sendTransaction({
    to: daoAddress,
    value: treasuryAmount
  });
  console.log("DAO treasury funded with 1 ETH");

  console.log("\n=== Deployment Summary ===");
  console.log("GovernanceToken:", governanceTokenAddress);
  console.log("DIAPriceOracle:", priceOracleAddress);
  console.log("NFTFlow:", nftFlowAddress);
  console.log("NFTFlowDAO:", daoAddress);
  console.log("Treasury:", treasuryAddress);
  console.log("VRF Rewarder:", vrfRewarderAddress);
  console.log("Payment Stream:", paymentStreamAddress);
  console.log("Reputation:", reputationAddress);
  console.log("Utility Tracker:", utilityTrackerAddress);

  console.log("\n=== Next Steps ===");
  console.log("1. Verify contracts on Somnia explorer");
  console.log("2. Set up frontend integration");
  console.log("3. Create governance proposals");
  console.log("4. Distribute governance tokens to community");

  // Save deployment info to file
  const deploymentInfo = {
    network: "somnia",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      GovernanceToken: governanceTokenAddress,
      DIAPriceOracle: priceOracleAddress,
      NFTFlow: nftFlowAddress,
      NFTFlowDAO: daoAddress,
      Treasury: treasuryAddress,
      VRFRewarder: vrfRewarderAddress,
      PaymentStream: paymentStreamAddress,
      Reputation: reputationAddress,
      UtilityTracker: utilityTrackerAddress
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
