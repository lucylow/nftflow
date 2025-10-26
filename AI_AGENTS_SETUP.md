# 🤖 Quick Setup Guide - AI Agents for NFTFlow

## Prerequisites

- Node.js >= 18.0.0
- An OpenAI API key
- Wallet connected to Somnia network
- NFTFlow contracts deployed

## Installation

1. **Install OpenAI package** (already done):
```bash
npm install openai
```

2. **Add OpenAI API key to environment**:
Create or update `.env` file in the project root:
```env
VITE_OPENAI_API_KEY=sk-...
```

## Quick Start

1. **Start the application**:
```bash
npm run dev
```

2. **Navigate to AI Agents page**:
Visit `/ai-agents` in the application

3. **Activate AI agents**:
- Click "Activate Agent" button
- Wait for initialization (requires OpenAI API key)
- View personalized recommendations

## File Structure

```
src/
├── agents/                          # AI Agent implementations
│   ├── RentalIntelligenceAgent.ts   # Pricing optimization agent
│   ├── RecommendationAgent.ts      # Personalization engine
│   └── CollateralAgent.ts           # Risk assessment agent
├── components/
│   ├── AIAgentDashboard.tsx        # Main dashboard UI
├── hooks/
│   └── useAIAgents.ts              # React hook for AI agents
├── pages/
│   └── AIAgentsPage.tsx            # Page wrapper

backend/
└── contracts/
    └── AIAgentManager.sol          # On-chain agent manager
```

## API Usage

### Get Rental Pricing Recommendation

```typescript
import { useAIAgents } from '@/hooks/useAIAgents';

const { getRentalPricingRecommendation } = useAIAgents();

const recommendation = await getRentalPricingRecommendation(
  nftContract,  // "0x..."
  tokenId       // "123"
);

// Returns:
// {
//   suggestedPrice: 0.001,
//   confidence: 85,
//   reasoning: "Market analysis shows strong demand...",
//   optimalDuration: 3600
// }
```

### Get Personalized Recommendations

```typescript
const { getPersonalizedRecommendations } = useAIAgents();

const recommendations = await getPersonalizedRecommendations(10);

// Returns array of:
// {
//   nftContract: "0x...",
//   tokenId: "123",
//   score: 9,
//   reason: "Based on your gaming preferences...",
//   metadata: { name, description, image }
// }
```

### Assess Rental Risk

```typescript
const { assessRentalRisk } = useAIAgents();

const assessment = await assessRentalRisk(
  renterAddress,  // "0x..."
  nftValue,       // 100 (in STT)
  rentalDuration  // 3600 (seconds)
);

// Returns:
// {
//   riskLevel: "low" | "medium" | "high",
//   recommendedCollateral: 50,
//   confidence: 90,
//   factors: ["High reputation", "Good rental history"]
// }
```

## Smart Contract Deployment

Deploy the AIAgentManager contract:

```bash
cd backend
npx hardhat run scripts/deploy-ai-agent-manager.js --network somnia
```

Then update `src/config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  // ... existing contracts
  AIAgentManager: '0x...' // Add deployed address
};
```

## Troubleshooting

### "AI agents not initialized"
- Check that `VITE_OPENAI_API_KEY` is set in `.env`
- Restart the dev server after adding the key
- Verify the API key is valid

### "OpenAI API error"
- Check your API key is valid and has credits
- Review rate limits in OpenAI dashboard
- Check network connectivity

### Agents not producing recommendations
- Ensure wallet is connected
- Verify you have rental history
- Check browser console for errors

## Features

✅ **Autonomous Pricing Intelligence** - Agents monitor market and suggest optimal prices
✅ **Personalized Recommendations** - AI analyzes your history to suggest perfect NFTs
✅ **Dynamic Risk Assessment** - Intelligent collateral requirements based on reputation
✅ **Real-Time Monitoring** - Track all agent actions live
✅ **On-Chain Governance** - All actions recorded on Somnia blockchain

## Testing

Test agents without API key using mock data:

```bash
npm run dev
# Navigate to /ai-agents
# Agents will run in demo mode with mock data
```

## Architecture

```
┌─────────────────────────────────────┐
│     AI Agent Dashboard (UI)        │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │  useAIAgents Hook           │  │
│  └──────────────────────────────┘  │
│              │                      │
│  ┌───────────┴───────────┐         │
│  │                       │         │
│  ┌──────────┐ ┌─────────┐         │
│  │ Pricing  │ │  Recs   │         │
│  │ Agent    │ │  Agent  │         │
│  └──────────┘ └─────────┘         │
│                                     │
│  ┌──────────────────────────────┐  │
│  │     Collateral Agent         │  │
│  └──────────────────────────────┘  │
│              │                      │
│              ▼                      │
│  ┌──────────────────────────────┐  │
│  │   OpenAI GPT-4 API            │  │
│  └──────────────────────────────┘  │
│                                     │
│              │                      │
│              ▼                      │
│  ┌──────────────────────────────┐  │
│  │   Smart Contracts            │  │
│  │   (NFTFlow, Reputation)      │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Next Steps

1. Add your OpenAI API key
2. Visit `/ai-agents` page
3. Activate agents
4. Explore recommendations
5. Monitor agent activity

## Support

For issues or questions:
- Check `AI_AGENTS_INTEGRATION.md` for detailed docs
- Review browser console for errors
- Ensure all dependencies installed
- Verify environment variables

## License

Part of Somnia AI Hackathon submission

