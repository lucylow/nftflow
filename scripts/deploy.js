const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentDir = `deployments/${networkName}`;
  
  console.log(`🚀 Deploying to ${networkName} (Chain ID: ${network.chainId})...`);
  
  // Ensure deployment directory exists
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.log("⚠️  Warning: Low balance, deployment might fail");
  }
  
  // Deploy PaymentStream implementation
  console.log("\n📦 Deploying PaymentStream implementation...");
  const PaymentStream = await ethers.getContractFactory("PaymentStream");
  const paymentStream = await PaymentStream.deploy();
  await paymentStream.deployed();
  console.log(`✅ PaymentStream deployed to: ${paymentStream.address}`);
  
  // Save deployment info
  saveDeployment(networkName, "PaymentStream", paymentStream, []);
  
  // Deploy PaymentStreamFactory
  console.log("\n📦 Deploying PaymentStreamFactory...");
  const PaymentStreamFactory = await ethers.getContractFactory("PaymentStreamFactory");
  const paymentStreamFactory = await PaymentStreamFactory.deploy(paymentStream.address);
  await paymentStreamFactory.deployed();
  console.log(`✅ PaymentStreamFactory deployed to: ${paymentStreamFactory.address}`);
  
  // Save deployment info
  saveDeployment(networkName, "PaymentStreamFactory", paymentStreamFactory, [paymentStream.address]);
  
  // Deploy ReputationSystem
  console.log("\n📦 Deploying ReputationSystem...");
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.deployed();
  console.log(`✅ ReputationSystem deployed to: ${reputationSystem.address}`);
  
  // Save deployment info
  saveDeployment(networkName, "ReputationSystem", reputationSystem, []);
  
  // Deploy MockPriceOracle
  console.log("\n📦 Deploying MockPriceOracle...");
  const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
  const mockPriceOracle = await MockPriceOracle.deploy();
  await mockPriceOracle.deployed();
  console.log(`✅ MockPriceOracle deployed to: ${mockPriceOracle.address}`);
  
  // Save deployment info
  saveDeployment(networkName, "MockPriceOracle", mockPriceOracle, []);
  
  // Deploy NFTFlowCore as UUPS proxy
  console.log("\n📦 Deploying NFTFlowCore (UUPS Proxy)...");
  const NFTFlowCore = await ethers.getContractFactory("NFTFlowCore");
  
  const treasuryAddress = process.env.TREASURY_ADDRESS || ethers.constants.AddressZero;
  console.log(`🏛️  Treasury address: ${treasuryAddress}`);
  
  const nftFlowCore = await upgrades.deployProxy(
    NFTFlowCore,
    [
      paymentStreamFactory.address,
      reputationSystem.address,
      mockPriceOracle.address,
      treasuryAddress
    ],
    { 
      initializer: "initialize", 
      kind: "uups",
      timeout: 0 // Disable timeout for large deployments
    }
  );
  await nftFlowCore.deployed();
  console.log(`✅ NFTFlowCore deployed to: ${nftFlowCore.address}`);
  
  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(nftFlowCore.address);
  console.log(`🔧 Implementation address: ${implementationAddress}`);
  
  // Save deployment info with constructor args
  const constructorArgs = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address", "address"],
    [paymentStreamFactory.address, reputationSystem.address, mockPriceOracle.address, treasuryAddress]
  );
  
  saveDeployment(networkName, "NFTFlowCore", nftFlowCore, constructorArgs);
  
  // Set NFTFlowCore address in ReputationSystem
  console.log("\n🔗 Setting NFTFlowCore address in ReputationSystem...");
  const setNftFlowCoreTx = await reputationSystem.setNFTFlowCore(nftFlowCore.address);
  await setNftFlowCoreTx.wait();
  console.log("✅ NFTFlowCore address set in ReputationSystem");
  
  // Initialize some test data if on testnet/localhost
  if (networkName === "localhost" || networkName === "testnet") {
    console.log("\n🧪 Initializing test data...");
    await initializeTestData(nftFlowCore, mockPriceOracle);
  }
  
  // Create deployment registry
  const deploymentRegistry = {
    network: networkName,
    chainId: network.chainId.toString(),
    contracts: {
      NFTFlowCore: nftFlowCore.address,
      PaymentStreamFactory: paymentStreamFactory.address,
      ReputationSystem: reputationSystem.address,
      PaymentStream: paymentStream.address,
      MockPriceOracle: mockPriceOracle.address
    },
    implementation: {
      NFTFlowCore: implementationAddress
    },
    timestamp: new Date().toISOString(),
    commitHash: process.env.GITHUB_SHA || "local",
    deployer: deployer.address,
    gasUsed: {
      PaymentStream: (await paymentStream.deployTransaction.wait()).gasUsed.toString(),
      PaymentStreamFactory: (await paymentStreamFactory.deployTransaction.wait()).gasUsed.toString(),
      ReputationSystem: (await reputationSystem.deployTransaction.wait()).gasUsed.toString(),
      MockPriceOracle: (await mockPriceOracle.deployTransaction.wait()).gasUsed.toString(),
      NFTFlowCore: (await nftFlowCore.deployTransaction.wait()).gasUsed.toString()
    }
  };
  
  fs.writeFileSync(
    path.join(deploymentDir, "deployment.json"),
    JSON.stringify(deploymentRegistry, null, 2)
  );
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Deployment Summary:");
  console.log(`Network: ${networkName}`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`NFTFlowCore: ${nftFlowCore.address}`);
  console.log(`PaymentStreamFactory: ${paymentStreamFactory.address}`);
  console.log(`ReputationSystem: ${reputationSystem.address}`);
  console.log(`PaymentStream: ${paymentStream.address}`);
  console.log(`MockPriceOracle: ${mockPriceOracle.address}`);
  
  console.log("\n📄 Deployment registry saved to:", path.join(deploymentDir, "deployment.json"));
  
  // Print verification commands
  console.log("\n🔍 Verification commands:");
  console.log(`npx hardhat verify --network ${networkName} ${paymentStream.address}`);
  console.log(`npx hardhat verify --network ${networkName} ${paymentStreamFactory.address} ${paymentStream.address}`);
  console.log(`npx hardhat verify --network ${networkName} ${reputationSystem.address}`);
  console.log(`npx hardhat verify --network ${networkName} ${mockPriceOracle.address}`);
  console.log(`npx hardhat verify --network ${networkName} ${nftFlowCore.address}`);
}

function saveDeployment(networkName, contractName, contract, args) {
  const deploymentDir = `deployments/${networkName}`;
  
  // Save contract address
  fs.writeFileSync(
    path.join(deploymentDir, `${contractName}.address`),
    contract.address
  );
  
  // Save constructor arguments
  if (args && args.length > 0) {
    fs.writeFileSync(
      path.join(deploymentDir, `${contractName}.constructor-args`),
      ethers.utils.hexlify(args)
    );
  }
  
  // Save deployment transaction
  const deploymentTx = contract.deployTransaction;
  if (deploymentTx) {
    const txInfo = {
      hash: deploymentTx.hash,
      blockNumber: deploymentTx.blockNumber,
      from: deploymentTx.from,
      gasLimit: deploymentTx.gasLimit.toString(),
      gasPrice: deploymentTx.gasPrice.toString(),
      value: deploymentTx.value.toString()
    };
    
    fs.writeFileSync(
      path.join(deploymentDir, `${contractName}.deployment-tx`),
      JSON.stringify(txInfo, null, 2)
    );
  }
  
  // Save ABI
  const contractFactory = contract.interface;
  fs.writeFileSync(
    path.join(deploymentDir, `${contractName}.abi.json`),
    JSON.stringify(contractFactory.format("json"), null, 2)
  );
}

async function initializeTestData(nftFlowCore, mockPriceOracle) {
  try {
    // Set some mock prices
    const mockPrices = [
      { nftContract: ethers.constants.AddressZero, tokenId: 1, price: ethers.utils.parseEther("0.1") },
      { nftContract: ethers.constants.AddressZero, tokenId: 2, price: ethers.utils.parseEther("0.2") },
      { nftContract: ethers.constants.AddressZero, tokenId: 3, price: ethers.utils.parseEther("0.3") }
    ];
    
    for (const priceData of mockPrices) {
      await mockPriceOracle.setPrice(
        priceData.nftContract,
        priceData.tokenId,
        priceData.price
      );
    }
    
    console.log("✅ Test prices set in MockPriceOracle");
  } catch (error) {
    console.log("⚠️  Failed to initialize test data:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });