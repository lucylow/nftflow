const { ethers } = require("hardhat");

/**
 * @notice Setup comprehensive governance with Timelock, Multisig, and AutonomousController
 * @dev This script creates a production-ready governance setup
 */
async function main() {
  console.log("🏛️  Setting up Advanced Governance with Timelock...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("");

  // Configuration
  const GOVERNANCE_CONFIG = {
    // Timelock delays (in seconds)
    timelockDelays: {
      short: 12 * 3600,     // 12 hours - for non-critical updates
      medium: 24 * 3600,    // 24 hours - for price/collateral changes
      long: 48 * 3600,      // 48 hours - for protocol changes
    },
    // Multisig threshold (out of 5 signers)
    multisigThreshold: 3,
    // Required for emergency actions
    guardianMultisigThreshold: 2,
  };

  console.log("📋 Governance Configuration:");
  console.log("   Short delay (12h):", GOVERNANCE_CONFIG.timelockDelays.short);
  console.log("   Medium delay (24h):", GOVERNANCE_CONFIG.timelockDelays.medium);
  console.log("   Long delay (48h):", GOVERNANCE_CONFIG.timelockDelays.long);
  console.log("");

  // Step 1: Deploy TimelockControllers for different operations
  console.log("1️⃣  Deploying TimelockControllers...");
  
  const Timelock = await ethers.getContractFactory("TimelockController");
  
  // Short timelock for routine operations
  const shortTimelock = await Timelock.deploy(
    GOVERNANCE_CONFIG.timelockDelays.short,
    [deployer.address], // proposers
    [deployer.address], // executors
    deployer.address    // admin
  );
  await shortTimelock.deployed();
  console.log("   ✅ Short Timelock:", shortTimelock.address);

  // Medium timelock for significant changes
  const mediumTimelock = await Timelock.deploy(
    GOVERNANCE_CONFIG.timelockDelays.medium,
    [deployer.address],
    [deployer.address],
    deployer.address
  );
  await mediumTimelock.deployed();
  console.log("   ✅ Medium Timelock:", mediumTimelock.address);

  // Long timelock for critical operations
  const longTimelock = await Timelock.deploy(
    GOVERNANCE_CONFIG.timelockDelays.long,
    [deployer.address],
    [deployer.address],
    deployer.address
  );
  await longTimelock.deployed();
  console.log("   ✅ Long Timelock:", longTimelock.address);
  console.log("");

  // Step 2: Get or deploy AutonomousController
  console.log("2️⃣  Setting up AutonomousController...");
  
  const controllerAddress = process.env.AUTONOMOUS_CONTROLLER_ADDRESS;
  let controller;
  
  if (controllerAddress && controllerAddress !== "0x0000000000000000000000000000000000000000") {
    console.log("   📍 Using existing controller:", controllerAddress);
    controller = await ethers.getContractAt("AutonomousController", controllerAddress);
  } else {
    console.log("   ⚠️  AutonomousController not deployed yet.");
    console.log("   💡 Run: npx hardhat run scripts/deploy-autonomous-controller.js --network somnia");
    console.log("");
    process.exit(0);
  }

  // Step 3: Configure timelock for controller
  console.log("3️⃣  Configuring Timelock for AutonomousController...");
  
  // Link medium timelock for autonomous operations
  await controller.updateTimelock(mediumTimelock.address);
  console.log("   ✅ Controller linked to medium timelock");
  console.log("");

  // Step 4: Create role assignments
  console.log("4️⃣  Setting up role assignments...");
  
  const AGENT_ROLE = await controller.AGENT_ROLE();
  const GUARDIAN_ROLE = await controller.GUARDIAN_ROLE();
  const ADMIN_ROLE = await controller.ADMIN_ROLE();

  console.log("   📋 Role assignments:");
  console.log("      - Admin:", deployer.address);
  console.log("      - Guardian:", deployer.address);
  
  // Add agent if specified
  const agentAddresses = [
    process.env.AGENT_1_ADDRESS,
    process.env.AGENT_2_ADDRESS,
    process.env.AGENT_3_ADDRESS,
  ].filter(addr => addr && addr !== "0x0000000000000000000000000000000000000000");

  if (agentAddresses.length > 0) {
    for (const agent of agentAddresses) {
      await controller.grantAgentRole(agent);
      console.log("      - Agent:", agent);
    }
  } else {
    console.log("      - Agent: (none specified)");
  }
  console.log("");

  // Step 5: Configure safety parameters
  console.log("5️⃣  Configuring safety parameters...");
  
  // Set conservative bounds for initial deployment
  await controller.setBounds(300, 30); // 3% price, 30% collateral
  await controller.setMaxReputationDelta(50);
  await controller.setRateLimit(60); // 1 minute
  
  console.log("   ✅ Max price change: 3%");
  console.log("   ✅ Max collateral reduction: 30%");
  console.log("   ✅ Max reputation delta: 50");
  console.log("   ✅ Rate limit: 60 seconds");
  console.log("");

  // Step 6: Generate governance action templates
  console.log("6️⃣  Generating governance action templates...\n");

  const governanceActions = {
    autonomousOperations: {
      priceUpdate: {
        description: "Agent proposes price update",
        function: "agentSetPrice(uint256,uint256,uint256,string)",
        timelock: "medium",
        safetyChecks: [
          "Delta must be <= maxPriceChangePercent",
          "Price must be > 0",
          "Rate limit must be respected",
        ],
      },
      collateralUpdate: {
        description: "Agent proposes collateral adjustment",
        function: "agentSetCollateral(address,uint256,uint256,string)",
        timelock: "medium",
        safetyChecks: [
          "Reduction must be <= maxCollateralReductionPercent",
          "Collateral must be > 0",
          "Rate limit must be respected",
        ],
      },
      reputationUpdate: {
        description: "Agent updates reputation score",
        function: "agentUpdateReputation(address,uint256,string)",
        timelock: "medium",
        safetyChecks: [
          "Delta must be <= maxReputationDelta",
          "Delta must be > 0",
          "Rate limit must be respected",
        ],
      },
    },
    emergencyOperations: {
      pause: {
        description: "Guardian pauses autonomous operations",
        function: "guardianPause()",
        timelock: "none",
        safetyChecks: ["Must have GUARDIAN_ROLE"],
      },
      unpause: {
        description: "Guardian resumes autonomous operations",
        function: "guardianUnpause()",
        timelock: "none",
        safetyChecks: ["Must have GUARDIAN_ROLE"],
      },
    },
    governanceOperations: {
      updateBounds: {
        description: "Admin updates safety bounds",
        function: "setBounds(uint256,uint256)",
        timelock: "short",
        safetyChecks: [
          "Must have ADMIN_ROLE",
          "Price delta <= 1000 (10%)",
          "Collateral delta <= 100 (100%)",
        ],
      },
    },
  };

  console.log("📋 Governance Action Templates:");
  console.log(JSON.stringify(governanceActions, null, 2));
  console.log("");

  // Step 7: Save governance info
  const governanceInfo = {
    network: await ethers.provider.getNetwork(),
    timestamp: new Date().toISOString(),
    timelocks: {
      short: shortTimelock.address,
      medium: mediumTimelock.address,
      long: longTimelock.address,
    },
    controller: controllerAddress,
    roles: {
      admin: deployer.address,
      guardian: deployer.address,
      agents: agentAddresses,
    },
    configuration: GOVERNANCE_CONFIG,
    governanceActions,
  };

  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(
    __dirname,
    "../deployments/governance-setup.json"
  );
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(governanceInfo, null, 2));

  console.log("✅ Governance setup complete!");
  console.log("💾 Configuration saved to:", deploymentPath);
  console.log("");

  console.log("📋 Next Steps:");
  console.log("   1. Deploy multisig wallet for guardian role");
  console.log("   2. Transfer guardian role to multisig");
  console.log("   3. Configure off-chain agents");
  console.log("   4. Set up monitoring and alerting");
  console.log("   5. Test with small, safe operations");
  console.log("   6. Gradually increase autonomy limits");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });

