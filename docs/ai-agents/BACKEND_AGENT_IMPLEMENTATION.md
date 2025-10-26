# 🤖 Backend AI Agent Implementation

## Overview

This document describes the **backend agent microservice** for NFTFlow that runs independently from the frontend and provides production-ready AI agent capabilities.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Agent Microservice                     │
│                     (Node.js/Express)                     │
│                     Port: 3002                            │
└──────────────────────┬───────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
    ┌─────▼─────┐           ┌──────▼─────┐
    │   OpenAI  │           │  Subgraph  │
    │   GPT-4   │           │  (TheGraph)│
    └───────────┘           └──────┬─────┘
                                   │
                            ┌──────▼──────┐
                            │   Somnia    │
                            │  Blockchain │
                            └─────────────┘
```

## What's Implemented

### ✅ Agent Microservice (`backend/agents/`)

**Structure:**
```
backend/agents/
├── src/
│   ├── server.js                    # Main Express server
│   ├── agents/
│   │   ├── RentalMatchmaker.js      # AI recommendation agent
│   │   └── PricingAnalyst.js        # AI pricing optimization
│   └── services/
│       └── database.js               # Database service
├── Dockerfile                        # Container definition
├── package.json                      # Dependencies
└── README.md                         # Documentation
```

**APIs:**
- `POST /api/agents/recommendations` - Get personalized NFT recommendations
- `POST /api/agents/pricing` - Analyze optimal pricing
- `GET /health` - Health check

### ✅ Frontend Integration

**New Files:**
- `src/hooks/useAgentAPI.ts` - React hook for calling agent API
- `src/components/agents/BackendRecommendationsPanel.tsx` - UI component

### ✅ Docker Integration

Updated `docker-compose.yml` to include the agent service.

## Agent Types

### 1. Rental Matchmaker Agent

**Purpose:** Generate personalized NFT rental recommendations

**How it works:**
1. Builds user profile from rental history (via subgraph)
2. Fetches available listings
3. Ranks NFTs using OpenAI GPT-4 based on:
   - User preferences
   - Price affordability
   - Collection affinity
   - Rental duration patterns

**Example Request:**
```bash
POST http://localhost:3002/api/agents/recommendations
{
  "user": "0x123...",
  "context": {
    "budget": 0.001
  }
}
```

**Example Response:**
```json
[
  {
    "nftContract": "0xabc...",
    "tokenId": "123",
    "score": 9,
    "reason": "High affinity: matches favorite trait + affordable",
    "listing": {
      "pricePerSecond": "0.000001",
      "minDuration": 3600,
      "maxDuration": 86400
    }
  }
]
```

### 2. Pricing Analyst Agent

**Purpose:** Optimize rental pricing for maximum revenue and utilization

**How it works:**
1. Analyzes historical rental data from subgraph
2. Fetches floor price from DIA Oracle
3. Uses AI to recommend optimal pricing based on:
   - Utilization rate
   - Average rental duration
   - Market trends
   - Floor prices

**Example Request:**
```bash
POST http://localhost:3002/api/agents/pricing
{
  "nftContract": "0xabc...",
  "tokenId": "123"
}
```

**Example Response:**
```json
{
  "optimalPrice": 0.0000012,
  "confidence": 85,
  "reasoning": "Market shows strong demand, 15% price increase recommended",
  "utilizationProjection": 75,
  "revenueProjection": 15
}
```

## Setup

### Backend Agent Service

```bash
cd backend/agents
npm install
```

Create `.env`:
```env
OPENAI_API_KEY=sk-...
SUBGRAPH_URL=http://localhost:8000/subgraphs/name/nftflow
SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
```

Run:
```bash
npm run dev  # Development
npm start     # Production
```

### Docker Deployment

```bash
# Start agent service
docker-compose up agents

# Or start everything
docker-compose up
```

### Frontend Usage

```typescript
import { useAgentAPI } from '@/hooks/useAgentAPI';

function MyComponent() {
  const { getRecommendations, loading, error } = useAgentAPI();
  
  const load = async () => {
    const results = await getRecommendations({
      user: address,
      context: { budget: 0.001 }
    });
    console.log(results);
  };
  
  return (
    <button onClick={load} disabled={loading}>
      Get AI Recommendations
    </button>
  );
}
```

## Integration Points

### Subgraph Integration

The agent service queries TheGraph subgraph for:
- User rental history
- Available listings
- Historical rental data

```graphql
{
  rentals(where: { renter: "0x..." }, first: 50) {
    pricePerSecond
    duration
    completed
  }
}
```

### OpenAI Integration

Uses GPT-4 for:
- Natural language explanations
- Intelligent ranking algorithms
- Pricing optimization reasoning

### Smart Contract Integration

(Planned) Direct integration with:
- `NFTFlow.sol` - For on-chain recommendations
- `ReputationSystem.sol` - For trust scores
- Price oracles - For market data

## Comparison: Frontend vs Backend Agents

| Feature | Frontend Agents | Backend Agent Service |
|---------|----------------|----------------------|
| **Location** | Browser | Server |
| **API Key** | Exposed in browser | Secure on server |
| **Performance** | Limited by OpenAI limits | Dedicated resources |
| **Caching** | No | Redis/Database |
| **State Management** | Browser session | Persistent |
| **Scalability** | Per user | Shared across users |
| **Use Case** | Demo/prototype | Production |

## Roadmap

### Week 1 (MVP)
- ✅ Rental Matchmaker agent
- ✅ Pricing Analyst agent
- ✅ Docker deployment
- ✅ API endpoints
- ⏳ Subgraph integration (mock data ready)
- ⏳ Frontend integration (component created)

### Week 2
- ⏳ Vector search with Qdrant/FAISS
- ⏳ Real-time event streaming
- ⏳ Metrics & monitoring
- ⏳ Caching layer

### Post-Hackathon
- ⏳ Additional agents (Collateral Agent, Dispute Resolver)
- ⏳ Multi-agent orchestration
- ⏳ A/B testing framework
- ⏳ Production deployment

## Security Notes

1. **API Key Management**: OpenAI API key is stored server-side only
2. **Rate Limiting**: Implement rate limits per user
3. **Input Validation**: All inputs validated
4. **Error Handling**: Graceful fallbacks for all errors
5. **Privacy**: User data not stored long-term

## Metrics

Track:
- Recommendation quality (CTR)
- API response time
- Success rate
- OpenAI token usage

## Next Steps

1. **Deploy agent service** to staging environment
2. **Connect to real subgraph** (currently using mock data)
3. **Add monitoring** with Prometheus/Grafana
4. **Test with real users**
5. **Iterate based on feedback**

## Demo

To see the backend recommendations in action:

1. Start agent service:
```bash
cd backend/agents && npm run dev
```

2. In frontend, navigate to a page with `BackendRecommendationsPanel`

3. Connect wallet and view personalized recommendations!

## Support

- Documentation: `backend/agents/README.md`
- API Docs: Check `backend/agents/src/server.js`
- Frontend Hook: `src/hooks/useAgentAPI.ts`

