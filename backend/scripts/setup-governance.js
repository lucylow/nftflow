const { ethers } = require("hardhat");

async function main() {
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  
  const [deployer] = await ethers.getSigners();
  console.log("Setting up governance with account:", deployer.address);

  // Get contract instances
  const GovernanceToken = await ethers.getContractAt("GovernanceToken", deploymentInfo.contracts.GovernanceToken);
  const DAO = await ethers.getContractAt("NFTFlowDAO", deploymentInfo.contracts.NFTFlowDAO);
  const NFTFlow = await ethers.getContractAt("NFTFlow", deploymentInfo.contracts.NFTFlow);

  console.log("\n=== Current Governance Status ===");
  
  // Check governance token supply
  const totalSupply = await GovernanceToken.totalSupply();
  console.log("Total governance tokens minted:", totalSupply.toString());
  
  // Check DAO parameters
  const votingDuration = await DAO.votingDuration();
  const quorumPercentage = await DAO.quorumPercentage();
  const treasuryBalance = await ethers.provider.getBalance(deploymentInfo.contracts.NFTFlowDAO);
  
  console.log("Voting duration:", votingDuration.toString(), "seconds");
  console.log("Quorum percentage:", quorumPercentage.toString(), "%");
  console.log("Treasury balance:", ethers.formatEther(treasuryBalance), "ETH");

  // Create some example proposals
  console.log("\n=== Creating Example Proposals ===");
  
  // Proposal 1: Reduce platform fee from 2.5% to 2%
  console.log("\n1. Creating fee reduction proposal...");
  const feeReductionParams = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "address"],
    [200, deployer.address] // 2% fee, deployer as recipient
  );
  
  const tx1 = await DAO.createProposal(
    "Reduce platform fee from 2.5% to 2% to increase user adoption",
    0, // FEE_CHANGE
    feeReductionParams
  );
  await tx1.wait();
  console.log("Fee reduction proposal created");

  // Proposal 2: Increase collateral multiplier
  console.log("\n2. Creating collateral update proposal...");
  const collateralParams = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256"],
    [3] // 3x collateral multiplier
  );
  
  const tx2 = await DAO.createProposal(
    "Increase collateral multiplier from 2x to 3x for better security",
    1, // COLLATERAL_UPDATE
    collateralParams
  );
  await tx2.wait();
  console.log("Collateral update proposal created");

  // Proposal 3: Treasury management
  console.log("\n3. Creating treasury management proposal...");
  const treasuryParams = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint256", "address"],
    [deployer.address, ethers.parseEther("0.1"), ethers.ZeroAddress] // 0.1 ETH to deployer
  );
  
  const tx3 = await DAO.createProposal(
    "Allocate 0.1 ETH from treasury for development incentives",
    3, // TREASURY_MANAGEMENT
    treasuryParams
  );
  await tx3.wait();
  console.log("Treasury management proposal created");

  // Vote on proposals
  console.log("\n=== Voting on Proposals ===");
  
  // Vote yes on all proposals (deployer has 1 vote)
  for (let i = 0; i < 3; i++) {
    console.log(`\nVoting on proposal ${i}...`);
    const tx = await DAO.vote(i, true);
    await tx.wait();
    console.log(`Voted YES on proposal ${i}`);
  }

  // Check proposal status
  console.log("\n=== Proposal Status ===");
  for (let i = 0; i < 3; i++) {
    const proposal = await DAO.getProposal(i);
    const passed = await DAO.proposalPassed(i);
    
    console.log(`\nProposal ${i}:`);
    console.log("  Description:", proposal.description);
    console.log("  Type:", proposal.proposalType);
    console.log("  Yes votes:", proposal.yesVotes.toString());
    console.log("  No votes:", proposal.noVotes.toString());
    console.log("  Deadline:", new Date(Number(proposal.deadline) * 1000).toISOString());
    console.log("  Passed:", passed);
    console.log("  Executed:", proposal.executed);
  }

  // Fast forward time to allow execution (for testing)
  console.log("\n=== Fast Forwarding Time for Testing ===");
  console.log("Note: In a real scenario, you would wait for the actual voting period to end");
  
  // Increase time by 4 days (voting period + execution delay)
  await ethers.provider.send("evm_increaseTime", [4 * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine");

  // Execute proposals
  console.log("\n=== Executing Proposals ===");
  for (let i = 0; i < 3; i++) {
    const proposal = await DAO.getProposal(i);
    if (!proposal.executed) {
      try {
        console.log(`\nExecuting proposal ${i}...`);
        const tx = await DAO.executeProposal(i);
        await tx.wait();
        console.log(`Proposal ${i} executed successfully`);
      } catch (error) {
        console.log(`Failed to execute proposal ${i}:`, error.message);
      }
    }
  }

  // Check final status
  console.log("\n=== Final Status ===");
  const finalTreasuryBalance = await ethers.provider.getBalance(deploymentInfo.contracts.NFTFlowDAO);
  console.log("Final treasury balance:", ethers.formatEther(finalTreasuryBalance), "ETH");
  
  const platformFee = await NFTFlow.platformFeePercentage();
  console.log("Platform fee percentage:", platformFee.toString(), "basis points");
  
  const collateralMultiplier = await NFTFlow.collateralMultiplier();
  console.log("Collateral multiplier:", collateralMultiplier.toString());

  console.log("\n=== Governance Setup Complete ===");
  console.log("The DAO is now ready for community governance!");
  console.log("Community members can:");
  console.log("1. Mint governance tokens (if eligible)");
  console.log("2. Create proposals");
  console.log("3. Vote on proposals");
  console.log("4. Execute passed proposals");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
