# Advanced Smart Contracts with Autonomous Logic

A comprehensive guide for implementing autonomous smart contracts with safety guardrails for NFTFlow.

## Overview

The NFTFlow autonomous system enables AI-driven agents to autonomously manage pricing, collateral, and reputation on Somnia Network while maintaining strict safety constraints through on-chain governance and timelocks.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AutonomousController                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Rate-Limited Autonomous Actions          │  │
│  │  • agentSetPrice() - Price adjustments               │  │
│  │  • agentSetCollateral() - Collateral tuning          │  │
│  │  • agentUpdateReputation() - Reputation scoring      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   Safety Guardrails                    │  │
│  │  • Rate limiting (10 min intervals)                   │  │
│  │  • Delta bounds (5% price, 50% collateral)          │  │
│  │  • Pausable by Guardian                              │  │
│  │  • TimelockController integration                    │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           │              │              │
           ▼              ▼              ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ NFTFlow │    │Reputation│    │Payment   │
    │         │    │ System   │    │Stream    │
    └──────────┘    └──────────┘    └──────────┘
```

## Key Features

### 1. Autonomous Price Updates

**Purpose:** AI agents dynamically adjust listing prices based on market conditions, utility analytics, and demand patterns.

**Safety Checks:**
- Maximum 5% change per execution (configurable)
- Rate-limited to once per 10 minutes
- All changes logged with IPFS CID explanations
- Can be paused by Guardian

**Usage:**
```solidity
// Agent proposes price update
await controller.agentSetPrice(
  listingId,
  oldPrice,
  newPrice,
  "QmHash..." // IPFS CID with reasoning
);
```

### 2. Collateral Tuning

**Purpose:** Automatically adjust collateral requirements based on user reputation and rental history.

**Safety Checks:**
- Maximum 50% reduction per execution
- Cannot reduce below minimum thresholds
- Rate-limited
- Requires high reputation or successful streak

**Usage:**
```solidity
// Agent adjusts collateral for trusted user
await controller.agentSetCollateral(
  userAddress,
  oldCollateral,
  newCollateral,
  "QmHash..." // Explanation
);
```

### 3. Reputation Updates

**Purpose:** Automated reputation scoring based on rental outcomes, reviews, and behavioral analytics.

**Safety Checks:**
- Maximum delta of 100 points per update
- Positive deltas only
- Rate-limited
- Post-rental verification required

**Usage:**
```solidity
// Agent updates reputation after successful rental
await controller.agentUpdateReputation(
  userAddress,
  delta,
  "QmHash..." // Verification data
);
```

## Deployment

### Prerequisites

1. Deploy core contracts (NFTFlow, ReputationSystem, PaymentStream)
2. Set up Guardian multisig wallet
3. Configure agent wallet addresses

### Step 1: Deploy Contracts

```bash
# Deploy to Somnia Network
npx hardhat run scripts/deploy-autonomous-controller.js --network somnia

# Or deploy to testnet
npx hardhat run scripts/deploy-autonomous-controller.js --network somnia-testnet
```

### Step 2: Configure Governance

```bash
# Set up Timelock and roles
npx hardhat run scripts/setup-governance-with-timelock.js --network somnia
```

### Step 3: Grant Agent Roles

```javascript
const AGENT_ROLE = await controller.AGENT_ROLE();
await controller.grantRole(AGENT_ROLE, agentWallet1);
await controller.grantRole(AGENT_ROLE, agentWallet2);
await controller.grantRole(AGENT_ROLE, agentWallet3);
```

### Step 4: Unpause Controller

```javascript
// Guardian unpauses the controller
await controller.guardianUnpause();
```

## Safety Configuration

### Recommended Production Settings

```javascript
const SAFE_BOUNDS = {
  maxPriceChangePercent: 500,       // 5%
  maxCollateralReductionPercent: 50, // 50%
  maxReputationDelta: 100,
  rateLimitInterval: 600,          // 10 minutes
  timelockDelay: 86400,              // 24 hours
};
```

### Conservative Settings (Initial Deployment)

```javascript
const CONSERVATIVE_BOUNDS = {
  maxPriceChangePercent: 300,       // 3%
  maxCollateralReductionPercent: 30, // 30%
  maxReputationDelta: 50,
  rateLimitInterval: 300,           // 5 minutes
  timelockDelay: 172800,             // 48 hours
};
```

## Testing

### Unit Tests

```bash
# Run all autonomous controller tests
npx hardhat test test/AutonomousController.test.js

# Run specific test suite
npx hardhat test test/AutonomousController.test.js --grep "Price Updates"
```

### Integration Tests

```bash
# Run with coverage
npx hardhat coverage test/AutonomousController.test.js
```

### Gas Optimization Tests

```bash
# Profile gas usage
REPORT_GAS=true npx hardhat test test/AutonomousController.test.js
```

## Off-Chain Agent Integration

### Agent Architecture

```typescript
// Example: PricingAnalyst Agent
interface Agent {
  observeState(contracts: Contract[]): Promise<MarketState>;
  decide(previousState: MarketState, currentState: MarketState): Promise<AgentAction[]>;
  execute(action: AgentAction, signer: Wallet): Promise<TransactionReceipt>;
}

// Pricing Agent Implementation
class PricingAnalystAgent implements Agent {
  async decide(state: MarketState): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];
    
    for (const listing of state.activeListings) {
      const suggestedPrice = await this.analyzePrice(listing);
      const currentPrice = listing.price;
      
      if (this.shouldUpdate(currentPrice, suggestedPrice)) {
        actions.push({
          type: 'PRICE_UPDATE',
          listingId: listing.id,
          oldPrice: currentPrice,
          newPrice: suggestedPrice,
          reasonCID: await this.storeReasoning(listing, suggestedPrice),
        });
      }
    }
    
    return actions;
  }
  
  async execute(action: AgentAction, signer: Wallet): Promise<TransactionReceipt> {
    const controller = new ethers.Contract(CONTROLLER_ADDRESS, ABI, signer);
    
    return await controller.agentSetPrice(
      action.listingId,
      action.oldPrice,
      action.newPrice,
      action.reasonCID
    );
  }
}
```

### Monitoring and Alerting

```typescript
// Event monitoring setup
const filter = controller.filters.AgentProposal();
controller.on(filter, async (agent, actionType, reasonHash, timestamp) => {
  console.log('Agent action detected:', {
    agent,
    actionType,
    timestamp: new Date(timestamp * 1000),
  });
  
  // Send alerts for suspicious activity
  if (isSuspicious(agent, actionType)) {
    await sendAlert(`Suspicious agent activity: ${actionType}`);
  }
});
```

## Security Best Practices

### 1. Multisig for Guardian Role

```javascript
// Create Gnosis Safe multisig (3-of-5)
const guardianSafe = await deployMultisig({
  threshold: 3,
  owners: [owner1, owner2, owner3, owner4, owner5],
});

// Transfer guardian role to multisig
const GUARDIAN_ROLE = await controller.GUARDIAN_ROLE();
await controller.grantRole(GUARDIAN_ROLE, guardianSafe.address);
```

### 2. Timelock for Sensitive Operations

```javascript
// Timelock critical parameter changes
const timelock = new TimelockController(timelockAddress);

// Schedule bound update through timelock
await timelock.schedule(
  controller.address,
  0, // value
  setBoundsABI.encode(),
  ethers.constants.HashZero,
  ethers.utils.keccak256(ethers.utils.randomBytes(32)),
  minDelay
);
```

### 3. Circuit Breaker

```javascript
// Implement circuit breaker pattern
if (anomalyDetected()) {
  // Pause all autonomous operations
  await controller.guardianPause();
  
  // Alert governance
  await notifyGovernance();
  
  // Wait for review
  await waitForTimelock();
}
```

## Operational Runbook

### Daily Operations

1. **Monitor Agent Activity**
   - Check AgentProposal events
   - Review IPFS reasoning documents
   - Validate bounding constraints

2. **Review Metrics**
   - Price volatility
   - Collateral usage
   - Reputation distribution

3. **Alert Responses**
   - Investigate anomalies
   - Pause if necessary
   - Escalate to governance

### Weekly Review

1. **Governance Meeting**
   - Review agent performance
   - Adjust bounds if needed
   - Approve timelock proposals

2. **Security Audit**
   - Review all agent actions
   - Check for suspicious patterns
   - Update parameters as needed

### Emergency Procedures

#### If Agent Becomes Compromised

```javascript
// Step 1: Immediate pause
await controller.guardianPause();

// Step 2: Revoke agent role
await controller.connect(guardian).revokeAgentRole(compromisedAgent);

// Step 3: Investigate
await investigateAnomalies();

// Step 4: Fix and redeploy if necessary
```

#### If Anomalous Activity Detected

```javascript
// Pause immediately
await controller.connect(guardian).guardianPause();

// Reduce bounds
await controller.connect(admin).setBounds(200, 20); // 2% price, 20% collateral

// Increase timelock delay
await timelock.updateDelay(172800); // 48 hours

// Investigate and resume
await investigateAndResume();
```

## Metrics and KPIs

### Key Performance Indicators

- **Automation Rate:** % of actions taken autonomously vs manual
- **Safety Score:** Compliance with bounds and limits
- **Response Time:** Time from event to action
- **Error Rate:** Failed transactions / total actions
- **Gas Efficiency:** Gas per autonomous action

### Monitoring Dashboards

Create Grafana dashboards for:
- Agent activity over time
- Price volatility
- Collateral utilization
- Reputation distribution
- Error rates
- Gas usage

## Upgrade Path

### Phase 1: Conservative (Months 1-2)
- Manual review required
- Small bounds (2-3%)
- Short timelock delays

### Phase 2: Gradual Autonomy (Months 3-4)
- Automated for verified actions
- Medium bounds (5%)
- Standard timelock (24h)

### Phase 3: Full Autonomy (Months 5+)
- Fully automated
- Standard bounds (5-10%)
- Emergency controls only

## Troubleshooting

### Common Issues

**Issue:** Agent actions failing
- Check rate limiting
- Verify bounds not exceeded
- Ensure contract not paused

**Issue:** Gas estimates too high
- Optimize agent logic
- Batch operations
- Use cheaper storage patterns

**Issue:** Timelock delays too long
- Use shorter delays for safe operations
- Batch timelock proposals
- Optimize execution paths

## Additional Resources

- [OpenZeppelin AccessControl](https://docs.openzeppelin.com/contracts/4.x/access-control)
- [OpenZeppelin TimelockController](https://docs.openzeppelin.com/contracts/4.x/api/governance#TimelockController)
- [Somnia Network Documentation](https://docs.somnia.network)
- [EIP-712: Typed Data Signing](https://eips.ethereum.org/EIPS/eip-712)

## Support

For questions or issues:
- GitHub Issues: [NFTFlow Issues](https://github.com/nftflow/issues)
- Discord: [NFTFlow Discord](https://discord.gg/nftflow)
- Email: support@nftflow.io

