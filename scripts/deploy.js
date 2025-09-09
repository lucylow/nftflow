const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy MockPriceOracle first
  console.log("\n1. Deploying MockPriceOracle...");
  const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
  const mockPriceOracle = await MockPriceOracle.deploy();
  await mockPriceOracle.waitForDeployment();
  const priceOracleAddress = await mockPriceOracle.getAddress();
  console.log("MockPriceOracle deployed to:", priceOracleAddress);

  // Deploy PaymentStream
  console.log("\n2. Deploying PaymentStream...");
  const PaymentStream = await ethers.getContractFactory("PaymentStream");
  const paymentStream = await PaymentStream.deploy();
  await paymentStream.waitForDeployment();
  const paymentStreamAddress = await paymentStream.getAddress();
  console.log("PaymentStream deployed to:", paymentStreamAddress);

  // Deploy ReputationSystem
  console.log("\n3. Deploying ReputationSystem...");
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.waitForDeployment();
  const reputationSystemAddress = await reputationSystem.getAddress();
  console.log("ReputationSystem deployed to:", reputationSystemAddress);

  // Deploy NFTFlow with dependencies
  console.log("\n4. Deploying NFTFlow...");
  const NFTFlow = await ethers.getContractFactory("NFTFlow");
  const nftFlow = await NFTFlow.deploy(
    priceOracleAddress,
    paymentStreamAddress,
    reputationSystemAddress
  );
  await nftFlow.waitForDeployment();
  const nftFlowAddress = await nftFlow.getAddress();
  console.log("NFTFlow deployed to:", nftFlowAddress);

  // Deploy MockERC721 for testing
  console.log("\n5. Deploying MockERC721...");
  const MockERC721 = await ethers.getContractFactory("MockERC721");
  const mockERC721 = await MockERC721.deploy("Test NFT Collection", "TNC");
  await mockERC721.waitForDeployment();
  const mockERC721Address = await mockERC721.getAddress();
  console.log("MockERC721 deployed to:", mockERC721Address);

  // Authorize NFTFlow contract in ReputationSystem
  console.log("\n6. Authorizing NFTFlow in ReputationSystem...");
  await reputationSystem.addAuthorizedContract(nftFlowAddress);
  console.log("NFTFlow authorized in ReputationSystem");

  // Set up some test data
  console.log("\n7. Setting up test data...");
  
  // Mint some test NFTs
  await mockERC721.safeMint(deployer.address);
  await mockERC721.safeMint(deployer.address);
  await mockERC721.safeMint(deployer.address);
  console.log("Minted 3 test NFTs");

  // Set prices in oracle
  await mockPriceOracle.updatePrice(mockERC721Address, 0, ethers.parseEther("0.000001"));
  await mockPriceOracle.updatePrice(mockERC721Address, 1, ethers.parseEther("0.000002"));
  await mockPriceOracle.updatePrice(mockERC721Address, 2, ethers.parseEther("0.000003"));
  console.log("Set prices for test NFTs");

  // Approve NFTFlow to manage NFTs
  await mockERC721.setApprovalForAll(nftFlowAddress, true);
  console.log("Approved NFTFlow to manage NFTs");

  // List one NFT for rental
  await nftFlow.listForRental(
    mockERC721Address,
    0,
    ethers.parseEther("0.000001"),
    3600, // 1 hour
    2592000, // 30 days
    ethers.parseEther("1.0") // 1 STT collateral
  );
  console.log("Listed NFT #0 for rental");

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("MockPriceOracle:", priceOracleAddress);
  console.log("PaymentStream:", paymentStreamAddress);
  console.log("ReputationSystem:", reputationSystemAddress);
  console.log("NFTFlow:", nftFlowAddress);
  console.log("MockERC721:", mockERC721Address);

  console.log("\n=== ENVIRONMENT VARIABLES ===");
  console.log("REACT_APP_NFTFLOW_ADDRESS=" + nftFlowAddress);
  console.log("REACT_APP_PAYMENT_STREAM_ADDRESS=" + paymentStreamAddress);
  console.log("REACT_APP_REPUTATION_SYSTEM_ADDRESS=" + reputationSystemAddress);
  console.log("REACT_APP_PRICE_ORACLE_ADDRESS=" + priceOracleAddress);
  console.log("REACT_APP_MOCK_ERC721_ADDRESS=" + mockERC721Address);

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
