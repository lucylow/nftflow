# 🏆 Somnia AI Hackathon - Complete Integration Guide

## Overview

This document provides a complete integration guide for NFTFlow's accessible AI agent dApp as submitted to the Somnia AI Hackathon.

## ✅ What's Implemented

### 1. Smart Contracts
- **AutonomousController.sol**: Safe, role-based controller for AI agent actions
  - Located: `backend/contracts/AutonomousController.sol`
  - Features: Agent roles, price proposals, collateral management
  - Security: Pausable, role-based access control, event emissions

### 2. Agent Service Backend
- **TypeScript + Express API**: Full agent service
  - Located: `backend/agent-service/`
  - Endpoints: Recommendations, price proposals, agent actions
  - Features: Blockchain integration, subgraph queries, OpenAI integration

### 3. Frontend Components
- **AccessibleAgentRecommendations.tsx**: User-facing UI
  - Located: `src/components/agents/AccessibleAgentRecommendations.tsx`
  - Features: Wallet integration, recommendations display, price proposals
  - Accessible: Built with shadcn/ui components

### 4. Deployment Scripts
- **Deploy script**: `backend/scripts/deploy-autonomous-controller.js`
- **Docker setup**: `docker-compose.agent.yml`

## 🚀 Quick Start

### Step 1: Deploy Smart Contracts

```bash
cd backend

# Deploy to Somnia Testnet
npx hardhat run scripts/deploy-autonomous-controller.js --network somnia
```

Output:
```
AutonomousController deployed to: 0x...
Update your .env with: AUTONOMOUS_CONTROLLER=0x...
```

### Step 2: Configure Agent Service

```bash
cd backend/agent-service
cp .env.example .env
```

Edit `.env`:
```bash
PORT=4001
SOMNIA_RPC=https://dream-rpc.somnia.network
AUTONOMOUS_CONTROLLER=0x... # From deployment above
NFTFLOW_CONTRACT=0x59b670e9fA9D0A427751Af201D676719a970857b
PRIVATE_KEY=0x... # Agent wallet (⚠️ testing only!)
OPENAI_API_KEY=sk-... # Optional
```

### Step 3: Start Agent Service

```bash
npm install
npm run dev
```

Service running on `http://localhost:4001`

### Step 4: Integrate Frontend

The `AccessibleAgentRecommendations` component is ready to use:

```typescript
import { AccessibleAgentRecommendations } from '@/components/agents/AccessibleAgentRecommendations';

function MyPage() {
  return <AccessibleAgentRecommendations />;
}
```

### Step 5: Test End-to-End

1. Connect wallet in frontend
2. Click "Get Recommendations"
3. View AI suggestions
4. Click "Propose Price" to submit on-chain proposal

## 📋 Component Architecture

```
┌─────────────────────────────────────────────┐
│         User Interface (React)              │
│  - AccessibleAgentRecommendations          │
│  - Wallet connection (Wagmi)                │
│  - Transaction signing                      │
└──────────────────┬──────────────────────────┘
                   │ HTTP/API
                   ▼
┌─────────────────────────────────────────────┐
│        Agent Service (Express)             │
│  - /api/agent/recommendations               │
│  - /api/agent/propose-price                 │
│  - /api/agent/recommend                     │
└────────┬───────────┬────────────────────────┘
         │           │
         ▼           ▼
┌─────────────┐ ┌──────────────────────┐
│  Subgraph   │ │   Somnia Blockchain  │
│  Queries    │ │  (Somnia Testnet)    │
└─────────────┘ └──────┬───────────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ AutonomousController │
              │  (Smart Contract)   │
              └────────────────────┘
```

## 🎯 AI Agent Workflow

### 1. User Initiates Interaction
- User connects wallet
- Clicks "Get Recommendations"

### 2. Agent Service Processes
- Queries user's rental history from subgraph
- Analyzes market trends
- Generates personalized recommendations
- Returns JSON response

### 3. Frontend Displays Results
- Shows recommendations with scores
- Displays reasoning
- Provides action buttons

### 4. User Proposes Action
- User reviews AI recommendation
- Clicks "Propose Price"
- Enters new price

### 5. On-Chain Execution
- Agent service calls AutonomousController
- Event emitted on-chain
- Transaction confirmed
- User sees transaction hash

## 🔐 Security Features

### Role-Based Access Control
- `AGENT_ROLE`: AI agents can propose actions
- `GUARDIAN_ROLE`: Can pause the system
- `ADMIN_ROLE`: Can manage roles

### Permission Scoping
- Agents only have minimum required permissions
- Price bounds: 1e12 (min) to 1e24 (max)
- Explicit confirmation required

### User Intent Verification
- All proposals require user confirmation
- Clear transaction previews
- Transaction hashes displayed

## 📊 Integration Checklist

### For Demo/Submission
- [x] Deploy AutonomousController on Somnia Testnet
- [x] Configure agent service environment
- [x] Start agent service (locally or deployed)
- [x] Add AccessibleAgentRecommendations to frontend
- [x] Connect wallet
- [x] Test recommendation flow
- [x] Test price proposal flow
- [x] Verify on-chain events on Somnia explorer

### For Production
- [ ] Use Gnosis Safe for agent wallet
- [ ] Implement TimelockController for sensitive operations
- [ ] Add rate limiting to API endpoints
- [ ] Add authentication for agent endpoints
- [ ] Implement comprehensive logging
- [ ] Set up monitoring and alerts
- [ ] Add error recovery mechanisms
- [ ] Implement data archival to IPFS

## 🧪 Testing

### Test Agent Service
```bash
# Health check
curl http://localhost:4001/health

# Get recommendations (requires running service)
curl -X POST http://localhost:4001/api/agent/recommendations \
  -H "Content-Type: application/json" \
  -d '{"user":"0x123..."}'
```

### Test Frontend Integration
1. Start frontend: `npm run dev`
2. Navigate to page with AccessibleAgentRecommendations
3. Connect wallet
4. Click "Get Recommendations"
5. Verify recommendations appear

## 📈 Next Steps

### Short Term
1. Deploy AutonomousController to Somnia Mainnet (when ready)
2. Add OpenAI integration for better recommendations
3. Implement vector DB for semantic search
4. Add more AI agent types

### Long Term
1. Build marketplace for agent NFTs (ERC-7857)
2. Implement multi-agent collaboration
3. Add governance for agent actions
4. Create visual workflow editor (AgentFlow style)

## 🎓 Learning Resources

- [Somnia Documentation](https://docs.somnia.network)
- [AgentFlow Concepts](https://agentflow.ai)
- [ERC-7857 Standard](https://eips.ethereum.org/EIPS/eip-7857)
- [Accessible Design Patterns](https://www.w3.org/WAI/WCAG21/quickref/)

## 📝 License

MIT - Part of NFTFlow's Somnia AI Hackathon submission

---

**Built for Somnia AI Hackathon** 🔷  
**Making AI Agents Accessible and On-Chain** 🤖

