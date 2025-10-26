# 🤖 AI Agents Full Integration Guide

This document explains how the AI agents are fully integrated between the frontend and backend in NFTFlow.

## Architecture Overview

### Frontend Components
- **Location**: `src/components/agents/`
- **Agent Services**: `src/agents/` (frontend client-side agents)
- **Hooks**: `src/hooks/useAgentAPI.ts`, `src/hooks/useAIAgents.ts`

### Backend Services
- **Agent Service (TypeScript)**: `backend/agent-service/` - Port 4001
- **Agent Service (Node.js)**: `backend/agents/` - Port 3002
- **Agent Frontend**: `backend/agent/` - Port 4011 (Arbitrage)

## Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  - AccessibleAgentRecommendations.tsx                           │
│  - useAgentAPI() hook                                            │
│  - useAIAgents() hook                                            │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTP/REST
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Agent Service                        │
│                    (Port 4001)                                  │
│                                                                  │
│  Routes:                                                         │
│  - POST /api/agent/recommendations                             │
│  - POST /api/agent/propose-price                                │
│  - POST /api/agent/recommend                                    │
└────────┬───────────────────────────┬──────────────────────────┘
         │                           │
         ▼                           ▼
┌──────────────────────┐   ┌──────────────────────────────────┐
│  Smart Contracts     │   │      External Services           │
│  - AutonomousController│  │  - Subgraph (rental data)       │
│  - NFTFlow           │   │  - OpenAI (recommendations)      │
│  - PaymentStream      │   │  - IPFS (reasoning CID)         │
└──────────────────────┘   └──────────────────────────────────┘
```

## Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_AGENT_API_URL=http://localhost:4001
VITE_ARBITRAGE_AGENT_URL=http://localhost:4011
```

#### Backend Agent Service (.env)
```bash
PORT=4001
SOMNIA_RPC=https://dream-rpc.somnia.network/
AUTONOMOUS_CONTROLLER=0x...
NFTFLOW_CONTRACT=0x...
PRIVATE_KEY=0x...
OPENAI_API_KEY=sk-...
SUBGRAPH_URL=http://localhost:8000/subgraphs/name/nftflow
```

### Docker Compose

The `docker-compose.yml` includes:
- **agent-service**: TypeScript agent service on port 4001
- **agents**: Legacy Node.js agent service on port 3002
- **nginx**: Reverse proxy configuration

## API Endpoints

### POST /api/agent/recommendations
Get personalized NFT rental recommendations.

**Request:**
```json
{
  "user": "0x123..."
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "collection": "0x...",
      "tokenId": "1",
      "reason": "Popular in your network",
      "score": 85,
      "pricePerSecond": "1000000000000"
    }
  ]
}
```

### POST /api/agent/propose-price
Propose a price change for an NFT listing.

**Request:**
```json
{
  "listingId": "123",
  "newPrice": "2000000000000",
  "reasonCID": "ipfs://..."
}
```

**Response:**
```json
{
  "txHash": "0x...",
  "blockNumber": 12345,
  "success": true
}
```

## Frontend Usage

### Using useAgentAPI Hook

```typescript
import { useAgentAPI } from '@/hooks/useAgentAPI';

function MyComponent() {
  const { getRecommendations, loading, error } = useAgentAPI();
  
  const loadRecommendations = async () => {
    try {
      const recommendations = await getRecommendations({
      user: address,
      context: { budget: 0.001 }
    });
      console.log(recommendations);
    } catch (err) {
      console.error(err);
    }
  };
  
  return <button onClick={loadRecommendations}>Get Recommendations</button>;
}
```

### Using AIAgent Components

```typescript
import { AccessibleAgentRecommendations } from '@/components/agents/AccessibleAgentRecommendations';

<AccessibleAgentRecommendations />
```

## Backend Agent Services

### Agent Service (TypeScript)
- **Location**: `backend/agent-service/`
- **Port**: 4001
- **Main File**: `src/index.ts`
- **Routes**: `src/routes/`
- **Agent Logic**: `src/agent/matchmaker.ts`

### Agent Service (Node.js - Legacy)
- **Location**: `backend/agents/`
- **Port**: 3002
- **Main File**: `src/server.js`

## Smart Contract Integration

The agent service interacts with:

1. **AutonomousController.sol**: Safe agent execution
2. **NFTFlow.sol**: Core rental functionality
3. **PaymentStream.sol**: Payment streaming

### Agent Permissions

Agents require specific roles:
- `AGENT_ROLE`: Can propose actions
- `GUARDIAN_ROLE`: Can execute actions
- `ADMIN_ROLE`: Can manage roles

## Development Setup

### 1. Install Dependencies

```bash
# Backend agent service
cd backend/agent-service
npm install

# Frontend (already installed in root)
npm install
```

### 2. Configure Environment

```bash
# Copy and edit .env files
cp env.template .env
cd backend/agent-service
cp env.example .env
```

### 3. Start Services

```bash
# Using Docker Compose (recommended)
docker-compose up agent-service

# Or manually
cd backend/agent-service
npm run dev  # Runs on localhost:4001
```

### 4. Start Frontend

```bash
npm run dev  # Runs on localhost:8080
```

## Testing

### Health Check

```bash
curl http://localhost:4001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "nftflow-agent-service",
  "version": "1.0.0"
}
```

### Get Recommendations

```bash
curl -X POST http://localhost:4001/api/agent/recommendations \
  -H "Content-Type: application/json" \
  -d '{"user": "0x123..."}'
```

### Propose Price Change

```bash
curl -X POST http://localhost:4001/api/agent/propose-price \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "123",
    "newPrice": "2000000000000",
    "reasonCID": "ipfs://..."
  }'
```

## Frontend Components Integration

### AI Agents Page
- **File**: `src/pages/AIAgentsPage.tsx`
- **Purpose**: Monitor all AI agents
- **Features**: Real-time activity, human-in-the-loop controls

### AccessibleAgentRecommendations
- **File**: `src/components/agents/AccessibleAgentRecommendations.tsx`
- **Purpose**: Display and interact with recommendations
- **API**: Uses `useAgentAPI()` hook

### BackendRecommendationsPanel
- **File**: `src/components/agents/BackendRecommendationsPanel.tsx`
- **Purpose**: Show recommendations from backend

## Troubleshooting

### Agent Service Not Responding

1. Check if service is running:
   ```bash
   docker ps | grep agent-service
   ```

2. Check logs:
   ```bash
   docker logs nftflow-agent-service
   ```

3. Verify environment variables:
   ```bash
   docker exec nftflow-agent-service env | grep SOMNIA
   ```

### Frontend Not Connecting to Backend

1. Check CORS configuration in `backend/agent-service/src/index.ts`
2. Verify proxy configuration in `vite.config.ts`
3. Check browser console for network errors

### Recommendations Not Showing

1. Ensure wallet is connected
2. Check backend logs for errors
3. Verify SUBGRAPH_URL is configured correctly

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **API Keys**: Store OpenAI keys securely
3. **CORS**: Configure CORS to allow only specific origins
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **Input Validation**: Validate all user inputs

## Performance Optimization

1. **Caching**: Use Redis for caching recommendations
2. **Batching**: Batch API calls when possible
3. **Pagination**: Implement pagination for large datasets
4. **Lazy Loading**: Load recommendations on demand

## Future Enhancements

1. **Multi-chain Support**: Support multiple blockchains
2. **Advanced AI Models**: Integrate GPT-4 and other models
3. **Real-time Updates**: WebSocket support for live updates
4. **Analytics**: Add analytics for agent performance
5. **Governance**: Implement on-chain governance for agents

## Support

For issues or questions:
- Check documentation in `docs/ai-agents/`
- Review implementation in `AI_AGENT_IMPLEMENTATION_SUMMARY.md`
- Open an issue on GitHub

