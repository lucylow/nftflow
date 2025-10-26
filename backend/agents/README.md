# 🤖 NFTFlow AI Agent Microservice

Backend microservice for AI-powered agents in NFTFlow rental marketplace.

## Overview

This service runs autonomous AI agents that:
- **Rental Matchmaker**: Generate personalized NFT recommendations
- **Pricing Analyst**: Optimize rental pricing for maximum revenue
- **Collateral Agent**: Dynamic risk assessment and collateral management

## Architecture

```
┌─────────────────────┐
│   Agent Server      │
│  (FastAPI/Express)  │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐    ┌───▼───┐
│ OpenAI│    │Subgraph│
└───────┘    └───────┘
    │             │
    │    ┌────────▼────────┐
    └───▶│ Somnia Blockchain│
         └─────────────────┘
```

## Quick Start

### Prerequisites

```bash
node >= 18
npm >= 8
```

### Installation

```bash
cd backend/agents
npm install
```

### Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
OPENAI_API_KEY=sk-your-key
SUBGRAPH_URL=http://localhost:8000/subgraphs/name/nftflow
SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
```

### Run

```bash
# Development
npm run dev

# Production
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "agents": ["rentalMatchmaker", "pricingAnalyst"]
}
```

### Get Recommendations
```bash
POST /api/agents/recommendations
Content-Type: application/json

{
  "user": "0x123...",
  "context": {
    "budget": 0.001
  }
}
```

Response:
```json
[
  {
    "nftContract": "0xabc...",
    "tokenId": "123",
    "score": 9,
    "reason": "High affinity: matches favorite trait 'golden' + affordable",
    "listing": {
      "pricePerSecond": "0.000001",
      "minDuration": 3600,
      "maxDuration": 86400
    }
  }
]
```

### Analyze Pricing
```bash
POST /api/agents/pricing
Content-Type: application/json

{
  "nftContract": "0xabc...",
  "tokenId": "123"
}
```

Response:
```json
{
  "nftContract": "0xabc...",
  "tokenId": "123",
  "optimalPrice": 0.0000012,
  "confidence": 85,
  "reasoning": "Market shows strong demand...",
  "utilizationProjection": 75,
  "revenueProjection": 15
}
```

## Docker

Build and run with Docker:

```bash
docker build -t nftflow-agents .
docker run -p 3001:3001 --env-file .env nftflow-agents
```

Or use with docker-compose:

```bash
cd ../..  # Project root
docker-compose up agents
```

## Development

### Project Structure

```
backend/agents/
├── src/
│   ├── server.js           # Main server
│   ├── agents/
│   │   ├── RentalMatchmaker.js
│   │   └── PricingAnalyst.js
│   └── services/
│       └── database.js     # Database service
├── Dockerfile
├── package.json
└── README.md
```

### Adding a New Agent

1. Create agent class in `src/agents/`:
```javascript
import { OpenAI } from 'openai';

export class MyAgent {
  constructor(config) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
  }

  async process(input) {
    // Your agent logic
  }
}
```

2. Register in `src/server.js`:
```javascript
const agents = {
  rentalMatchmaker: new RentalMatchmakerAgent(config),
  myAgent: new MyAgent(config),
};
```

3. Add endpoint:
```javascript
app.post('/api/agents/my-agent', async (req, res) => {
  const result = await agents.myAgent.process(req.body);
  res.json(result);
});
```

## Integration with Frontend

The frontend can call the agent service using the `useAgentAPI` hook:

```typescript
import { useAgentAPI } from '@/hooks/useAgentAPI';

const { recommendations, isLoading } = useAgentAPI();

// Get recommendations
const results = await recommendations({ user: address, context: {} });
```

## Production Deployment

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...
SUBGRAPH_URL=https://subgraph.somnia.network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network/

# Optional
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
PORT=3001
```

### Health Checks

The service exposes a `/health` endpoint that monitors:
- Agent availability
- Database connectivity
- Subgraph reachability

### Monitoring

Integrates with Prometheus/Grafana for metrics:
- Request rate
- Agent success rate
- Response times
- OpenAI API usage

## License

MIT

