# NFTFlow AI Rental Arbitrage Agent

## Overview

The NFTFlow AI Rental Arbitrage Agent is a decentralized system that autonomously detects and capitalizes on pricing inefficiencies between NFT rental markets. The agent proposes arbitrage opportunities on-chain and distributes profits automatically.

## Architecture

### Components

1. **ArbitrageRouter.sol** - On-chain smart contract that manages arbitrage proposals and execution
2. **Agent Service** - Node.js/TypeScript service that detects opportunities and proposes them
3. **Frontend Component** - React UI for monitoring and proposing opportunities

### Security Model

- **Bond System**: Proposers must deposit a bond to prevent spam
- **Trustless Execution**: Proposals are encoded and verified on-chain
- **Profit Verification**: Contract measures actual profit before distribution
- **Automatic Distribution**: Profits split between proposer, treasury, and admin

## Setup

### 1. Deploy Contract

```bash
cd backend
npx hardhat compile
npx hardhat run scripts/deploy-arbitrage.js --network <your-network>
```

### 2. Configure Agent

Create `backend/agent/.env`:

```env
SOMNIA_RPC=https://rpc.testnet.somnia.network
PRIVATE_KEY=0xYourPrivateKey
ARBITRAGE_ROUTER=0xDeployedContractAddress
PROFIT_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000  # native
BOND_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000   # native
BOND_AMOUNT=1000000000000000
TREASURY_ADDRESS=0xYourTreasury
MIN_PROFIT_WEI=1000000000000000
PROPOSER_SHARE_BPS=8000
TREASURY_SHARE_BPS=1500
```

### 3. Start Agent Service

```bash
cd backend/agent
npm install
npm run dev
```

### 4. Frontend Configuration

Add to `.env`:

```env
VITE_ARBITRAGE_AGENT_URL=http://localhost:4011
```

## Usage

### Detecting Opportunities

The agent continuously scans for arbitrage opportunities:

```bash
curl http://localhost:4011/opportunities
```

### Proposing an Arbitrage

The frontend component provides a one-click propose interface, or you can use the API:

```bash
curl -X POST http://localhost:4011/propose \
  -H "Content-Type: application/json" \
  -d '{
    "nftContract": "0x...",
    "tokenId": "1",
    "sourceMarket": "NFTFlow",
    "sourcePriceWei": "10000000000000000",
    "targetMarket": "OtherMarket",
    "targetPriceWei": "15000000000000000",
    "potentialProfitWei": "4000000000000000"
  }'
```

### Executing Proposals

Only authorized executors can call `executeProposal()` on the contract. In production, this should be a multisig or timelock.

## Security Considerations

⚠️ **Important for Production:**

1. **Never store private keys in `.env`** - Use a hardware wallet or key management service
2. **Use multisig for execution** - The `executeProposal` function should be called by a Gnosis Safe
3. **Implement timelock** - Add a delay between proposal and execution for community review
4. **Audit contracts** - Get professional security audit before mainnet deployment
5. **Monitor actively** - Set up alerts for failed proposals and unusual activity

## Development

### Adding Real Market Data

Replace the mock detector in `src/detector.ts` with real subgraph queries:

```typescript
export async function detectOpportunities(provider: ethers.JsonRpcProvider): Promise<Opportunity[]> {
  // Query NFTFlow subgraph for available rentals
  // Query external marketplaces (OpenSea, Blur, etc.)
  // Compare prices and identify opportunities
}
```

### Integrating with NFTFlow Contracts

Update `src/proposer.ts` to encode actual NFTFlow contract calls:

```typescript
// Example: rentNFT call
const nftFlowIface = new ethers.Interface(["function rentNFT(address nft, uint256 tokenId, uint256 duration)"]);
const rentCalldata = nftFlowIface.encodeFunctionData("rentNFT", [
  opp.nftContract,
  opp.tokenId,
  86400 // 1 day
]);
```

## API Reference

### GET /opportunities

Returns list of detected arbitrage opportunities.

**Response:**
```json
[
  {
    "nftContract": "0x...",
    "tokenId": "1",
    "sourceMarket": "NFTFlow",
    "sourcePriceWei": "10000000000000000",
    "targetMarket": "OtherMarket",
    "targetPriceWei": "15000000000000000",
    "potentialProfitWei": "4000000000000000"
  }
]
```

### POST /propose

Propose an arbitrage opportunity on-chain.

**Request Body:**
```json
{
  "nftContract": "0x...",
  "tokenId": "1",
  "sourceMarket": "NFTFlow",
  "sourcePriceWei": "10000000000000000",
  "targetMarket": "OtherMarket",
  "targetPriceWei": "15000000000000000",
  "potentialProfitWei": "4000000000000000"
}
```

**Response:**
```json
{
  "ok": true,
  "receipt": {
    "transactionHash": "0x...",
    "blockNumber": 12345,
    "gasUsed": "100000"
  }
}
```

## Testing

### Local Testing

```bash
# Start local Hardhat node
cd backend
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy-arbitrage.js --network localhost

# Start agent
cd agent
npm run dev

# Start frontend
npm run dev
```

### Testnet Testing

Ensure you have testnet tokens for gas and bonds:

1. Get testnet tokens from Somnia faucet
2. Configure network in `hardhat.config.js`
3. Deploy with testnet configuration

## Contributing

See the main project README for contribution guidelines.

## License

MIT
