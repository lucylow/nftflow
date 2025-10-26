const { ethers } = require("hardhat");

async function main() {
  console.log("🔐 Starting ownership transfer process...");
  
  // Get contract instances
  const NFTFlowCore = await ethers.getContractFactory("NFTFlowCore");
  const nftFlowCore = await NFTFlowCore.attach(process.env.NFTFLOW_CORE_ADDRESS);
  
  const PaymentStreamFactory = await ethers.getContractFactory("PaymentStreamFactory");
  const paymentStreamFactory = await PaymentStreamFactory.attach(process.env.PAYMENT_STREAM_FACTORY_ADDRESS);
  
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.attach(process.env.REPUTATION_SYSTEM_ADDRESS);
  
  // Multisig address (Gnosis Safe)
  const multisigAddress = process.env.MULTISIG_ADDRESS;
  const timelockAddress = process.env.TIMELOCK_ADDRESS;
  
  if (!multisigAddress || !timelockAddress) {
    throw new Error("MULTISIG_ADDRESS and TIMELOCK_ADDRESS must be set in environment variables");
  }
  
  console.log("📋 Contract addresses:");
  console.log(`NFTFlowCore: ${process.env.NFTFLOW_CORE_ADDRESS}`);
  console.log(`PaymentStreamFactory: ${process.env.PAYMENT_STREAM_FACTORY_ADDRESS}`);
  console.log(`ReputationSystem: ${process.env.REPUTATION_SYSTEM_ADDRESS}`);
  console.log(`Multisig: ${multisigAddress}`);
  console.log(`Timelock: ${timelockAddress}`);
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  // Check current owners
  console.log("\n🔍 Checking current ownership...");
  const nftFlowOwner = await nftFlowCore.owner();
  const paymentStreamOwner = await paymentStreamFactory.owner();
  const reputationOwner = await reputationSystem.owner();
  
  console.log(`NFTFlowCore owner: ${nftFlowOwner}`);
  console.log(`PaymentStreamFactory owner: ${paymentStreamOwner}`);
  console.log(`ReputationSystem owner: ${reputationOwner}`);
  
  // Transfer NFTFlowCore ownership to timelock
  if (nftFlowOwner.toLowerCase() !== timelockAddress.toLowerCase()) {
    console.log("\n🔄 Transferring NFTFlowCore ownership to timelock...");
    const tx1 = await nftFlowCore.transferOwnership(timelockAddress);
    await tx1.wait();
    console.log("✅ NFTFlowCore ownership transferred to timelock");
  } else {
    console.log("✅ NFTFlowCore already owned by timelock");
  }
  
  // Transfer PaymentStreamFactory ownership to timelock
  if (paymentStreamOwner.toLowerCase() !== timelockAddress.toLowerCase()) {
    console.log("\n🔄 Transferring PaymentStreamFactory ownership to timelock...");
    const tx2 = await paymentStreamFactory.transferOwnership(timelockAddress);
    await tx2.wait();
    console.log("✅ PaymentStreamFactory ownership transferred to timelock");
  } else {
    console.log("✅ PaymentStreamFactory already owned by timelock");
  }
  
  // Transfer ReputationSystem ownership to timelock
  if (reputationOwner.toLowerCase() !== timelockAddress.toLowerCase()) {
    console.log("\n🔄 Transferring ReputationSystem ownership to timelock...");
    const tx3 = await reputationSystem.transferOwnership(timelockAddress);
    await tx3.wait();
    console.log("✅ ReputationSystem ownership transferred to timelock");
  } else {
    console.log("✅ ReputationSystem already owned by timelock");
  }
  
  // Setup timelock roles
  console.log("\n🔧 Setting up timelock roles...");
  const timelock = await ethers.getContractAt("TimelockController", timelockAddress);
  
  // Get role hashes
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();
  
  console.log(`PROPOSER_ROLE: ${PROPOSER_ROLE}`);
  console.log(`EXECUTOR_ROLE: ${EXECUTOR_ROLE}`);
  console.log(`ADMIN_ROLE: ${ADMIN_ROLE}`);
  
  // Check if multisig already has roles
  const hasProposerRole = await timelock.hasRole(PROPOSER_ROLE, multisigAddress);
  const hasExecutorRole = await timelock.hasRole(EXECUTOR_ROLE, multisigAddress);
  const hasAdminRole = await timelock.hasRole(ADMIN_ROLE, multisigAddress);
  
  console.log(`Multisig has PROPOSER_ROLE: ${hasProposerRole}`);
  console.log(`Multisig has EXECUTOR_ROLE: ${hasExecutorRole}`);
  console.log(`Multisig has ADMIN_ROLE: ${hasAdminRole}`);
  
  // Grant proposer role to multisig
  if (!hasProposerRole) {
    console.log("\n🔄 Granting PROPOSER_ROLE to multisig...");
    const tx4 = await timelock.grantRole(PROPOSER_ROLE, multisigAddress);
    await tx4.wait();
    console.log("✅ Granted PROPOSER_ROLE to multisig");
  } else {
    console.log("✅ Multisig already has PROPOSER_ROLE");
  }
  
  // Grant executor role to multisig
  if (!hasExecutorRole) {
    console.log("\n🔄 Granting EXECUTOR_ROLE to multisig...");
    const tx5 = await timelock.grantRole(EXECUTOR_ROLE, multisigAddress);
    await tx5.wait();
    console.log("✅ Granted EXECUTOR_ROLE to multisig");
  } else {
    console.log("✅ Multisig already has EXECUTOR_ROLE");
  }
  
  // Revoke deployer roles
  console.log("\n🔄 Revoking deployer roles from timelock...");
  const deployerHasProposerRole = await timelock.hasRole(PROPOSER_ROLE, deployer.address);
  const deployerHasExecutorRole = await timelock.hasRole(EXECUTOR_ROLE, deployer.address);
  const deployerHasAdminRole = await timelock.hasRole(ADMIN_ROLE, deployer.address);
  
  if (deployerHasProposerRole) {
    const tx6 = await timelock.revokeRole(PROPOSER_ROLE, deployer.address);
    await tx6.wait();
    console.log("✅ Revoked PROPOSER_ROLE from deployer");
  }
  
  if (deployerHasExecutorRole) {
    const tx7 = await timelock.revokeRole(EXECUTOR_ROLE, deployer.address);
    await tx7.wait();
    console.log("✅ Revoked EXECUTOR_ROLE from deployer");
  }
  
  if (deployerHasAdminRole) {
    const tx8 = await timelock.revokeRole(ADMIN_ROLE, deployer.address);
    await tx8.wait();
    console.log("✅ Revoked ADMIN_ROLE from deployer");
  }
  
  // Final verification
  console.log("\n🔍 Final ownership verification...");
  const finalNftFlowOwner = await nftFlowCore.owner();
  const finalPaymentStreamOwner = await paymentStreamFactory.owner();
  const finalReputationOwner = await reputationSystem.owner();
  
  console.log(`NFTFlowCore owner: ${finalNftFlowOwner}`);
  console.log(`PaymentStreamFactory owner: ${finalPaymentStreamOwner}`);
  console.log(`ReputationSystem owner: ${finalReputationOwner}`);
  
  const finalMultisigHasProposerRole = await timelock.hasRole(PROPOSER_ROLE, multisigAddress);
  const finalMultisigHasExecutorRole = await timelock.hasRole(EXECUTOR_ROLE, multisigAddress);
  
  console.log(`Multisig has PROPOSER_ROLE: ${finalMultisigHasProposerRole}`);
  console.log(`Multisig has EXECUTOR_ROLE: ${finalMultisigHasExecutorRole}`);
  
  // Verify all transfers were successful
  const allTransfersSuccessful = 
    finalNftFlowOwner.toLowerCase() === timelockAddress.toLowerCase() &&
    finalPaymentStreamOwner.toLowerCase() === timelockAddress.toLowerCase() &&
    finalReputationOwner.toLowerCase() === timelockAddress.toLowerCase() &&
    finalMultisigHasProposerRole &&
    finalMultisigHasExecutorRole;
  
  if (allTransfersSuccessful) {
    console.log("\n🎉 All ownership transfers completed successfully!");
    console.log("🔐 Contracts are now secured with multisig governance");
  } else {
    console.log("\n❌ Some ownership transfers failed. Please check the logs above.");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Ownership transfer failed:", error);
    process.exit(1);
  });
