const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting NFTFlow Advanced Features Deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy ReputationSystem
  console.log("📊 Deploying ReputationSystem...");
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.waitForDeployment();
  console.log("✅ ReputationSystem deployed to:", await reputationSystem.getAddress());

  // Deploy DIAPriceOracle
  console.log("💰 Deploying DIAPriceOracle...");
  const DIAPriceOracle = await ethers.getContractFactory("DIAPriceOracle");
  const priceOracle = await DIAPriceOracle.deploy();
  await priceOracle.waitForDeployment();
  console.log("✅ DIAPriceOracle deployed to:", await priceOracle.getAddress());

  // Deploy NFTFlowGasOptimized
  console.log("⚡ Deploying NFTFlowGasOptimized...");
  const NFTFlowGasOptimized = await ethers.getContractFactory("NFTFlowGasOptimized");
  const nftFlow = await NFTFlowGasOptimized.deploy(await reputationSystem.getAddress());
  await nftFlow.waitForDeployment();
  console.log("✅ NFTFlowGasOptimized deployed to:", await nftFlow.getAddress());

  // Set rental contract in reputation system
  console.log("🔗 Setting rental contract in ReputationSystem...");
  await reputationSystem.setRentalContract(await nftFlow.getAddress());
  console.log("✅ Rental contract set");

  // Deploy MockERC4907 for testing
  console.log("🎨 Deploying MockERC4907...");
  const MockERC4907 = await ethers.getContractFactory("MockERC4907");
  const mockNFT = await MockERC4907.deploy();
  await mockNFT.waitForDeployment();
  console.log("✅ MockERC4907 deployed to:", await mockNFT.getAddress());

  // Mint some test NFTs
  console.log("🎯 Minting test NFTs...");
  await mockNFT.mint(deployer.address, 1);
  await mockNFT.mint(deployer.address, 2);
  await mockNFT.mint(deployer.address, 3);
  console.log("✅ Test NFTs minted");

  // Set up some initial reputation data
  console.log("⭐ Setting up initial reputation data...");
  await reputationSystem.whitelistUser(deployer.address);
  console.log("✅ Deployer whitelisted");

  // Set some base price multipliers
  console.log("💎 Setting base price multipliers...");
  await priceOracle.setBasePriceMultiplier(await mockNFT.getAddress(), ethers.parseEther("1.5"));
  console.log("✅ Base price multiplier set");

  // Display deployment summary
  console.log("\n🎉 Deployment Summary:");
  console.log("========================");
  console.log("ReputationSystem:", await reputationSystem.getAddress());
  console.log("DIAPriceOracle:", await priceOracle.getAddress());
  console.log("NFTFlowGasOptimized:", await nftFlow.getAddress());
  console.log("MockERC4907:", await mockNFT.getAddress());
  console.log("MultiCallV3:", "0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223");

  // Save deployment info
  const deploymentInfo = {
    network: await deployer.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
      ReputationSystem: await reputationSystem.getAddress(),
      DIAPriceOracle: await priceOracle.getAddress(),
      NFTFlowGasOptimized: await nftFlow.getAddress(),
      MockERC4907: await mockNFT.getAddress(),
      MultiCallV3: "0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223"
    },
    timestamp: new Date().toISOString(),
    gasUsed: {
      ReputationSystem: (await reputationSystem.deploymentTransaction())?.gasLimit?.toString(),
      DIAPriceOracle: (await priceOracle.deploymentTransaction())?.gasLimit?.toString(),
      NFTFlowGasOptimized: (await nftFlow.deploymentTransaction())?.gasLimit?.toString(),
      MockERC4907: (await mockNFT.deploymentTransaction())?.gasLimit?.toString()
    }
  };

  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'deployments', `${deploymentInfo.network.name}-${Date.now()}.json`);
  
  // Ensure deployments directory exists
  const deploymentsDir = path.dirname(deploymentPath);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${deploymentPath}`);

  // Display next steps
  console.log("\n🔧 Next Steps:");
  console.log("==============");
  console.log("1. Update contract addresses in src/config/contracts.ts");
  console.log("2. Run the test suite: npx hardhat test");
  console.log("3. Verify contracts on block explorer");
  console.log("4. Deploy frontend with new contract addresses");
  console.log("5. Test all features in the UI");

  console.log("\n✨ Advanced Features Deployment Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
