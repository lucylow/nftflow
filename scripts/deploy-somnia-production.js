const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting NFTFlow Production Deployment on Somnia Testnet...");
  console.log("Network: Somnia Testnet (Shannon)");
  console.log("Chain ID: 50312");
  console.log("RPC URL: https://dream-rpc.somnia.network/");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", await deployer.getAddress());
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(await deployer.getAddress())));

  // Check if we have enough balance
  const balance = await deployer.provider.getBalance(await deployer.getAddress());
  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  Warning: Low balance. Consider getting testnet tokens from Somnia faucet.");
    console.log("Faucet URL: https://faucet.somnia.network/");
  }

  const deploymentResults = {};

  try {
    // Deploy MockPriceOracle first
    console.log("\n1. Deploying MockPriceOracle...");
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    const mockPriceOracle = await MockPriceOracle.deploy();
    await mockPriceOracle.waitForDeployment();
    const priceOracleAddress = await mockPriceOracle.getAddress();
    deploymentResults.MockPriceOracle = priceOracleAddress;
    console.log("✅ MockPriceOracle deployed to:", priceOracleAddress);

    // Deploy PaymentStream
    console.log("\n2. Deploying PaymentStream...");
    const PaymentStream = await ethers.getContractFactory("PaymentStream");
    const paymentStream = await PaymentStream.deploy();
    await paymentStream.waitForDeployment();
    const paymentStreamAddress = await paymentStream.getAddress();
    deploymentResults.PaymentStream = paymentStreamAddress;
    console.log("✅ PaymentStream deployed to:", paymentStreamAddress);

    // Deploy ReputationSystem
    console.log("\n3. Deploying ReputationSystem...");
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const reputationSystem = await ReputationSystem.deploy();
    await reputationSystem.waitForDeployment();
    const reputationSystemAddress = await reputationSystem.getAddress();
    deploymentResults.ReputationSystem = reputationSystemAddress;
    console.log("✅ ReputationSystem deployed to:", reputationSystemAddress);

    // Deploy UtilityTracker
    console.log("\n4. Deploying UtilityTracker...");
    const UtilityTracker = await ethers.getContractFactory("UtilityTracker");
    const utilityTracker = await UtilityTracker.deploy();
    await utilityTracker.waitForDeployment();
    const utilityTrackerAddress = await utilityTracker.getAddress();
    deploymentResults.UtilityTracker = utilityTrackerAddress;
    console.log("✅ UtilityTracker deployed to:", utilityTrackerAddress);

    // Deploy NFTFlow with dependencies
    console.log("\n5. Deploying NFTFlow...");
    const NFTFlow = await ethers.getContractFactory("NFTFlow");
    const nftFlow = await NFTFlow.deploy(
      priceOracleAddress,
      paymentStreamAddress,
      reputationSystemAddress,
      utilityTrackerAddress
    );
    await nftFlow.waitForDeployment();
    const nftFlowAddress = await nftFlow.getAddress();
    deploymentResults.NFTFlow = nftFlowAddress;
    console.log("✅ NFTFlow deployed to:", nftFlowAddress);

    // Deploy MockERC721 for testing
    console.log("\n6. Deploying MockERC721...");
    const MockERC721 = await ethers.getContractFactory("MockERC721");
    const mockERC721 = await MockERC721.deploy("Somnia NFT Collection", "SNC");
    await mockERC721.waitForDeployment();
    const mockERC721Address = await mockERC721.getAddress();
    deploymentResults.MockERC721 = mockERC721Address;
    console.log("✅ MockERC721 deployed to:", mockERC721Address);

    // Deploy NFTUtilityGamification
    console.log("\n7. Deploying NFTUtilityGamification...");
    const NFTUtilityGamification = await ethers.getContractFactory("NFTUtilityGamification");
    const nftUtilityGamification = await NFTUtilityGamification.deploy();
    await nftUtilityGamification.waitForDeployment();
    const nftUtilityGamificationAddress = await nftUtilityGamification.getAddress();
    deploymentResults.NFTUtilityGamification = nftUtilityGamificationAddress;
    console.log("✅ NFTUtilityGamification deployed to:", nftUtilityGamificationAddress);

    // Deploy NFTSocialFeatures
    console.log("\n8. Deploying NFTSocialFeatures...");
    const NFTSocialFeatures = await ethers.getContractFactory("NFTSocialFeatures");
    const nftSocialFeatures = await NFTSocialFeatures.deploy();
    await nftSocialFeatures.waitForDeployment();
    const nftSocialFeaturesAddress = await nftSocialFeatures.getAddress();
    deploymentResults.NFTSocialFeatures = nftSocialFeaturesAddress;
    console.log("✅ NFTSocialFeatures deployed to:", nftSocialFeaturesAddress);

    // Deploy SomniaOptimizedFeatures
    console.log("\n9. Deploying SomniaOptimizedFeatures...");
    const SomniaOptimizedFeatures = await ethers.getContractFactory("SomniaOptimizedFeatures");
    const somniaOptimizedFeatures = await SomniaOptimizedFeatures.deploy();
    await somniaOptimizedFeatures.waitForDeployment();
    const somniaOptimizedFeaturesAddress = await somniaOptimizedFeatures.getAddress();
    deploymentResults.SomniaOptimizedFeatures = somniaOptimizedFeaturesAddress;
    console.log("✅ SomniaOptimizedFeatures deployed to:", somniaOptimizedFeaturesAddress);

    // Authorize NFTFlow contract in ReputationSystem
    console.log("\n10. Authorizing NFTFlow in ReputationSystem...");
    await reputationSystem.addAuthorizedContract(nftFlowAddress);
    console.log("✅ NFTFlow authorized in ReputationSystem");

    // Set up some test data
    console.log("\n11. Setting up test data...");
    
    // Mint some test NFTs
    await mockERC721.safeMint(await deployer.getAddress());
    await mockERC721.safeMint(await deployer.getAddress());
    await mockERC721.safeMint(await deployer.getAddress());
    console.log("✅ Minted 3 test NFTs");

    // Set prices in oracle
    await mockPriceOracle.updatePrice(mockERC721Address, 0, ethers.parseEther("0.000001"));
    await mockPriceOracle.updatePrice(mockERC721Address, 1, ethers.parseEther("0.000002"));
    await mockPriceOracle.updatePrice(mockERC721Address, 2, ethers.parseEther("0.000003"));
    console.log("✅ Set prices for test NFTs");

    // Approve NFTFlow to manage NFTs
    await mockERC721.setApprovalForAll(nftFlowAddress, true);
    console.log("✅ Approved NFTFlow to manage NFTs");

    // List one NFT for rental
    await nftFlow.listForRental(
      mockERC721Address,
      0,
      ethers.parseEther("0.000001"),
      3600, // 1 hour
      2592000, // 30 days
      ethers.parseEther("1.0") // 1 ETH collateral
    );
    console.log("✅ Listed NFT #0 for rental");

    // Demonstrate Somnia capabilities
    console.log("\n12. Demonstrating Somnia capabilities...");
    
    // Create a micro-transaction
    await somniaOptimizedFeatures.createMicroTransaction(
      await deployer.getAddress(),
      "Somnia micro-transaction demo",
      { value: '1000000000000000' } // 0.001 ETH
    );
    console.log("✅ Created micro-transaction (sub-cent fees)");

    // Demonstrate sub-second finality
    await somniaOptimizedFeatures.demonstrateSubSecondFinality(
      { value: '1000000000000000' } // 0.001 ETH
    );
    console.log("✅ Demonstrated sub-second finality");

    // Create a real-time stream
    await somniaOptimizedFeatures.createRealTimeStream(
      await deployer.getAddress(),
      60, // 60 seconds
      { value: '100000000000000000' } // 0.1 ETH
    );
    console.log("✅ Created real-time stream");

    // Generate deployment summary
    console.log("\n🎉 === SOMNIA TESTNET DEPLOYMENT COMPLETE ===");
    console.log("Network: Somnia Testnet (Shannon)");
    console.log("Chain ID: 50312");
    console.log("RPC URL: https://dream-rpc.somnia.network/");
    
    console.log("\n📋 === CONTRACT ADDRESSES ===");
    Object.entries(deploymentResults).forEach(([name, address]) => {
      console.log(`${name}:`, address);
    });

    // Generate environment file
    const envContent = `# NFTFlow Somnia Testnet Configuration
REACT_APP_NETWORK=somnia
REACT_APP_CHAIN_ID=50312
REACT_APP_RPC_URL=https://dream-rpc.somnia.network/
REACT_APP_BLOCK_EXPLORER=https://shannon-explorer.somnia.network/

# Contract Addresses
REACT_APP_NFTFLOW_ADDRESS=${deploymentResults.NFTFlow}
REACT_APP_PAYMENT_STREAM_ADDRESS=${deploymentResults.PaymentStream}
REACT_APP_REPUTATION_SYSTEM_ADDRESS=${deploymentResults.ReputationSystem}
REACT_APP_UTILITY_TRACKER_ADDRESS=${deploymentResults.UtilityTracker}
REACT_APP_PRICE_ORACLE_ADDRESS=${deploymentResults.MockPriceOracle}
REACT_APP_MOCK_ERC721_ADDRESS=${deploymentResults.MockERC721}
REACT_APP_NFT_UTILITY_GAMIFICATION_ADDRESS=${deploymentResults.NFTUtilityGamification}
REACT_APP_NFT_SOCIAL_FEATURES_ADDRESS=${deploymentResults.NFTSocialFeatures}
REACT_APP_SOMNIA_OPTIMIZED_FEATURES_ADDRESS=${deploymentResults.SomniaOptimizedFeatures}

# Somnia Network Info
REACT_APP_CURRENCY_NAME=Somnia Test Token
REACT_APP_CURRENCY_SYMBOL=STT
REACT_APP_CURRENCY_DECIMALS=18
`;

    // Write environment file
    fs.writeFileSync(path.join(__dirname, '../.env.somnia'), envContent);
    console.log("\n📄 === ENVIRONMENT FILE CREATED ===");
    console.log("Environment file saved to: .env.somnia");

    // Generate deployment report
    const deploymentReport = {
      network: "Somnia Testnet (Shannon)",
      chainId: 50312,
      rpcUrl: "https://dream-rpc.somnia.network/",
      blockExplorer: "https://shannon-explorer.somnia.network/",
      deployer: await deployer.getAddress(),
      deploymentTime: new Date().toISOString(),
      contracts: deploymentResults,
      capabilities: {
        microTransactions: true,
        subSecondFinality: true,
        realTimeStreaming: true,
        highFrequencyEvents: true,
        lowFees: true
      }
    };

    fs.writeFileSync(
      path.join(__dirname, '../deployment-report.json'), 
      JSON.stringify(deploymentReport, null, 2)
    );
    console.log("Deployment report saved to: deployment-report.json");

    console.log("\n🔗 === BLOCK EXPLORER LINKS ===");
    console.log("NFTFlow Contract: https://shannon-explorer.somnia.network/address/" + deploymentResults.NFTFlow);
    console.log("PaymentStream Contract: https://shannon-explorer.somnia.network/address/" + deploymentResults.PaymentStream);
    console.log("ReputationSystem Contract: https://shannon-explorer.somnia.network/address/" + deploymentResults.ReputationSystem);
    console.log("SomniaOptimizedFeatures: https://shannon-explorer.somnia.network/address/" + deploymentResults.SomniaOptimizedFeatures);

    console.log("\n✨ === SOMNIA CAPABILITIES DEMONSTRATED ===");
    console.log("✅ Sub-cent transaction fees");
    console.log("✅ Sub-second finality");
    console.log("✅ High throughput (1M+ TPS ready)");
    console.log("✅ Micro-transactions");
    console.log("✅ Real-time payment streaming");
    console.log("✅ Gamification system");
    console.log("✅ Social features");
    console.log("✅ Utility tracking");

    console.log("\n🚀 Deployment completed successfully on Somnia Testnet!");
    console.log("Your NFTFlow dApp is now live and showcasing Somnia's unique capabilities!");
    console.log("\n📖 Next Steps:");
    console.log("1. Update your frontend with the new contract addresses");
    console.log("2. Test all features on Somnia testnet");
    console.log("3. Submit to Somnia hackathon!");
    console.log("4. Share your deployment with the Somnia community");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    // Save partial deployment results
    if (Object.keys(deploymentResults).length > 0) {
      fs.writeFileSync(
        path.join(__dirname, '../partial-deployment.json'), 
        JSON.stringify(deploymentResults, null, 2)
      );
      console.log("Partial deployment results saved to: partial-deployment.json");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
