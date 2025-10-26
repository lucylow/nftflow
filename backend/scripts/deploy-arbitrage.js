// backend/scripts/deploy-arbitrage.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const ArbitrageRouter = await hre.ethers.getContractFactory("ArbitrageRouter");
  const router = await ArbitrageRouter.deploy(deployer.address); // make deployer admin for dev
  await router.deployed();
  console.log("ArbitrageRouter deployed to:", router.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
