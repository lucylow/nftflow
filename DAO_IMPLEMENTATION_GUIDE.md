# NFTFlow DAO Implementation Guide

This guide provides a comprehensive overview of the NFTFlow DAO (Decentralized Autonomous Organization) implementation, which enables community governance of the NFT rental marketplace.

## 🏛️ Overview

The NFTFlow DAO allows community members to collectively make decisions about platform parameters, fees, upgrades, and other important aspects of the NFTFlow ecosystem. Governance is based on ERC-721 tokens, where each token represents one vote.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Governance Process](#governance-process)
- [Deployment](#deployment)
- [Frontend Integration](#frontend-integration)
- [Testing](#testing)
- [Usage Examples](#usage-examples)
- [Security Considerations](#security-considerations)

## 🏗️ Architecture

### Core Components

1. **GovernanceToken (ERC-721)**: Grants voting rights to holders
2. **NFTFlowDAO**: Main governance contract
3. **NFTFlow**: Modified main contract with DAO integration
4. **Frontend Components**: User interface for governance

### Governance Flow

```
1. User becomes eligible for governance token
2. User mints governance token (1 token = 1 vote)
3. User creates proposals or votes on existing ones
4. Proposals are executed after voting period and delay
5. Changes take effect on the platform
```

## 📜 Smart Contracts

### 1. GovernanceToken.sol

**Purpose**: ERC-721 token that grants voting rights

**Key Features**:
- One token per eligible address
- Pausable transfers
- Batch minting capabilities
- Eligibility management

**Key Functions**:
```solidity
function mint() external whenNotPaused
function setEligibility(address account, bool eligible) external onlyOwner
function isEligibleForToken(address account) external view returns (bool)
```

### 2. NFTFlowDAO.sol

**Purpose**: Main governance contract

**Key Features**:
- Multiple proposal types
- Quorum-based voting
- Execution delays
- Treasury management
- Emergency functions

**Proposal Types**:
- `FEE_CHANGE`: Modify platform fees
- `COLLATERAL_UPDATE`: Update collateral requirements
- `REWARD_ADJUSTMENT`: Adjust reward mechanisms
- `TREASURY_MANAGEMENT`: Allocate treasury funds
- `CONTRACT_UPGRADE`: Upgrade core contracts
- `PARAMETER_UPDATE`: Update other parameters
- `ORACLE_UPDATE`: Update oracle settings
- `PAUSE_UNPAUSE`: Pause/unpause contracts

**Key Functions**:
```solidity
function createProposal(string calldata description, ProposalType proposalType, bytes calldata parameters)
function vote(uint256 proposalId, bool support)
function executeProposal(uint256 proposalId)
function proposalPassed(uint256 proposalId) external view returns (bool)
```

### 3. NFTFlow.sol (Modified)

**Purpose**: Main platform contract with DAO integration

**New Features**:
- DAO-controlled parameters
- Fee recipient management
- Collateral multiplier control
- Generic parameter updates

**Key Functions**:
```solidity
function setFeeParameters(uint256 newFeePercentage, address newFeeRecipient) external onlyDAO
function setCollateralMultiplier(uint256 newMultiplier) external onlyDAO
function setParameter(string calldata key, bytes calldata value) external onlyDAO
```

## 🗳️ Governance Process

### 1. Proposal Creation

1. User must have governance token
2. User creates proposal with description, type, and parameters
3. Proposal enters voting period (default: 3 days)
4. Cooldown period prevents spam (default: 1 day)

### 2. Voting

1. Users with governance tokens can vote
2. One token = one vote
3. Users can vote YES or NO
4. No double voting allowed
5. Voting ends after deadline

### 3. Execution

1. Proposal must pass (more YES than NO votes)
2. Quorum must be met (default: 4% of total tokens)
3. Execution delay must pass (default: 1 day)
4. Anyone can execute passed proposals

### 4. Parameter Updates

Different proposal types update different platform parameters:

- **Fee Changes**: Update platform fee percentage and recipient
- **Collateral Updates**: Modify collateral multiplier
- **Treasury Management**: Allocate funds from treasury
- **Contract Upgrades**: Deploy new contract versions

## 🚀 Deployment

### Prerequisites

1. Node.js and npm installed
2. Hardhat configured for Somnia network
3. Private key with STT tokens for deployment
4. MetaMask connected to Somnia

### Step 1: Deploy Contracts

```bash
cd backend
npm install
npx hardhat compile
npx hardhat run scripts/deploy-dao.js --network somnia
```

### Step 2: Set Up Governance

```bash
npx hardhat run scripts/setup-governance.js --network somnia
```

### Step 3: Verify Contracts

```bash
npx hardhat verify --network somnia <CONTRACT_ADDRESS>
```

### Step 4: Update Frontend Configuration

Update `src/config/contracts.ts` with deployed contract addresses:

```typescript
export const CONTRACTS = {
  // ... existing contracts
  governanceToken: "0x...",
  dao: "0x...",
  // ... other contracts
};
```

## 🎨 Frontend Integration

### Components

1. **DAODashboard**: Main governance interface
2. **GovernanceTokenMinter**: Token minting interface
3. **useDAO Hook**: React hook for DAO interactions

### Key Features

- Real-time proposal tracking
- Voting interface
- Proposal creation form
- Governance statistics
- Token minting eligibility

### Usage

```tsx
import { useDAO } from '../hooks/useDAO';

function MyComponent() {
  const { 
    stats, 
    proposals, 
    createProposal, 
    voteOnProposal 
  } = useDAO();

  // Use DAO functions
}
```

## 🧪 Testing

### Run Tests

```bash
cd backend
npx hardhat test test/NFTFlowDAO.test.js
```

### Test Coverage

- Contract deployment
- Proposal creation and voting
- Different proposal types
- Execution logic
- Admin functions
- Error handling
- Pausable functionality

### Test Scenarios

1. **Basic Governance Flow**
   - Create proposal
   - Vote on proposal
   - Execute proposal

2. **Edge Cases**
   - Double voting prevention
   - Quorum requirements
   - Execution delays
   - Paused contracts

3. **Security Tests**
   - Unauthorized access prevention
   - Parameter validation
   - Emergency functions

## 💡 Usage Examples

### Creating a Fee Change Proposal

```javascript
// Encode parameters: new fee percentage (300 = 3%) and recipient address
const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
  ["uint256", "address"],
  [300, "0x1234..."] // 3% fee to address
);

await dao.createProposal(
  "Reduce platform fee from 2.5% to 3%",
  0, // FEE_CHANGE
  parameters
);
```

### Creating a Treasury Management Proposal

```javascript
// Encode parameters: recipient, amount, token address (0x0 for ETH)
const parameters = ethers.AbiCoder.defaultAbiCoder().encode(
  ["address", "uint256", "address"],
  ["0x1234...", ethers.parseEther("1.0"), ethers.ZeroAddress]
);

await dao.createProposal(
  "Allocate 1 ETH for development incentives",
  3, // TREASURY_MANAGEMENT
  parameters
);
```

### Voting on a Proposal

```javascript
// Vote YES on proposal 0
await dao.vote(0, true);

// Vote NO on proposal 1
await dao.vote(1, false);
```

### Executing a Proposal

```javascript
// Execute proposal 0 (must be passed and delay met)
await dao.executeProposal(0);
```

## 🔒 Security Considerations

### Access Control

- Only governance token holders can create proposals and vote
- Only DAO can modify platform parameters
- Owner retains emergency functions

### Proposal Security

- Execution delays prevent immediate changes
- Quorum requirements ensure community participation
- Parameter validation prevents invalid values

### Emergency Functions

- Owner can pause DAO operations
- Owner can cancel malicious proposals
- Owner can update contract addresses

### Best Practices

1. **Gradual Decentralization**: Start with owner control, gradually transfer to DAO
2. **Parameter Limits**: Set reasonable bounds for all parameters
3. **Community Education**: Educate users about governance process
4. **Regular Audits**: Audit contracts before major changes
5. **Monitoring**: Monitor proposal activity and execution

## 📊 Governance Metrics

### Key Metrics to Track

- **Participation Rate**: Percentage of token holders voting
- **Proposal Success Rate**: Percentage of proposals that pass
- **Execution Rate**: Percentage of passed proposals that execute
- **Parameter Changes**: Frequency of different parameter updates

### Dashboard Features

- Real-time statistics
- Proposal history
- Voting patterns
- Treasury balance tracking
- Community engagement metrics

## 🔄 Maintenance

### Regular Tasks

1. **Monitor Proposals**: Check for malicious or spam proposals
2. **Update Parameters**: Adjust quorum and timing as needed
3. **Community Engagement**: Encourage participation
4. **Security Updates**: Keep contracts updated

### Emergency Procedures

1. **Pause DAO**: If malicious activity detected
2. **Cancel Proposals**: Remove harmful proposals
3. **Update Contracts**: Deploy security fixes
4. **Community Communication**: Inform users of issues

## 📚 Additional Resources

- [Somnia Network Documentation](https://docs.somnia.network)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Hook Patterns](https://reactjs.org/docs/hooks-intro.html)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This DAO implementation is designed for the Somnia network and follows best practices for decentralized governance. Always test thoroughly before deploying to mainnet.
