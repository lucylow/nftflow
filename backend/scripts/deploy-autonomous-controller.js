// deploy-autonomous-controller.js
const hre = require("hardhat");

async function main() {
  const NFTFlowAddr = process.env.NFTFLOW_ADDRESS || "0x59b670e9fA9D0A427751Af201D676719a970857b";
  const [deployer] = await hre.ethers.getSigners();
  const admin = process.env.ADMIN_ADDRESS || deployer.address;

  console.log("Deploying AutonomousController with account:", deployer.address);
  console.log("NFTFlow address:", NFTFlowAddr);
  console.log("Admin address:", admin);

  const Controller = await hre.ethers.getContractFactory("AutonomousController");
  const controller = await Controller.deploy(NFTFlowAddr, admin);
  
  await controller.waitForDeployment();
  const address = await controller.getAddress();
  console.log("✅ AutonomousController deployed to:", address);

  // Grant agent role to deployer for testing (optional - remove in production)
  const AGENT_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("AGENT_ROLE"));
  await controller.grantRole(AGENT_ROLE, deployer.address);
  console.log("✅ Granted AGENT_ROLE to deployer");
  
  console.log("\n📝 Update your .env with:");
  console.log(`AUTONOMOUS_CONTROLLER=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
