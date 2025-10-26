# NFTFlow Agent Service

**Somnia AI Hackathon - Accessible End-to-End dApp**

This agent service provides an accessible interface for AI agents to interact with the NFTFlow marketplace on Somnia blockchain.

## Features

- 🔗 Blockchain Integration: Direct interaction with Somnia testnet
- 🤖 AI Recommendations: Personalized NFT rental suggestions
- 💰 Price Proposals: Agents can propose price adjustments
- 🔐 Role-Based Security: Uses AutonomousController for safe operations
- 📊 Subgraph Queries: Real-time rental data analysis
- 🎯 OpenAI Integration: Optional LLM-powered reasoning

## Quick Start

### 1. Install Dependencies

```bash
cd backend/agent-service
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `SOMNIA_RPC`: Somnia testnet RPC endpoint
- `AUTONOMOUS_CONTROLLER`: Deployed controller address
- `NFTFLOW_CONTRACT`: NFTFlow contract address
- `PRIVATE_KEY`: Agent wallet private key (⚠️ testing only)
- `OPENAI_API_KEY`: Optional for enhanced recommendations

### 3. Deploy AutonomousController

```bash
cd ../../
npx hardhat run scripts/deploy-autonomous-controller.js --network somnia
```

Update `.env` with the deployed address.

### 4. Run Development Server

```bash
cd backend/agent-service
npm run dev
```

Service will run on `http://localhost:4001`

## API Endpoints

### POST /api/agent/recommendations
Get personalized NFT rental recommendations for a user.

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
      "reason": "Popular recently",
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
  "listingId": "1",
  "newPrice": "2000000000000",
  "reasonCID": "ipfs://..."
}
```

### POST /api/agent/recommend
Emit an AI recommendation event.

**Request:**
```json
{
  "listingId": "1",
  "score": 85,
  "reasoning": "High demand detected"
}
```

## Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Wagmi/Viem)   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│ Agent Service   │
│ (Express + TS)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│Subgraph│ │  Blockchain  │
│Queries │ │  (Somnia)    │
└────────┘ └───────┬───────┘
                  │
                  ▼
         ┌─────────────────┐
         │AutonomousController│
         │  (Smart Contract) │
         └─────────────────┘
```

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

1. **Never use private keys in .env for production**
   - Use Gnosis Safe or hardware wallets
   - Implement secure key management

2. **Rate limiting**
   - Implement API rate limits
   - Add authentication for sensitive endpoints

3. **Permission scoping**
   - Agents only have minimum required permissions
   - Use TimelockController for sensitive operations

4. **User intent verification**
   - Always get explicit user confirmation
   - Show clear transaction previews

## Docker

### Build Image
```bash
docker build -t nftflow-agent ./backend/agent-service
```

### Run Container
```bash
docker-compose -f docker-compose.agent.yml up
```

## Development

### Watch Mode
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start Production
```bash
npm start
```

## Testing

```bash
# Health check
curl http://localhost:4001/health

# Get recommendations
curl -X POST http://localhost:4001/api/agent/recommendations \
  -H "Content-Type: application/json" \
  -d '{"user":"0x..."}'
```

## Integration with Frontend

Add proxy configuration to `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api/agent': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      }
    }
  }
})
```

## Next Steps

1. ✅ Deploy AutonomousController on Somnia Testnet
2. ✅ Configure agent service environment
3. ✅ Integrate with frontend components
4. ✅ Add OpenAI integration for better recommendations
5. ✅ Implement vector DB for semantic search
6. ✅ Add comprehensive logging and monitoring

## License

MIT - Part of Somnia AI Hackathon submission

