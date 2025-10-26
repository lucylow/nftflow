# NFTFlow Advanced Features Integration Guide

This guide provides comprehensive instructions for integrating and using the advanced technical features implemented in NFTFlow.

## 🚀 Overview

NFTFlow now includes five key technical features that leverage Somnia's unique capabilities:

1. **Gas Optimization**: MultiCallV3 integration for efficient transaction batching
2. **Real-time Updates**: WebSocket connections for instant UI updates
3. **Price Oracle**: DIA Oracle integration for fair, market-based pricing
4. **User Experience**: Reputation system for collateral-free rentals
5. **Testing**: Comprehensive test suite covering edge cases

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Hardhat development environment
- MetaMask wallet
- Somnia testnet access
- Basic understanding of Solidity and React

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
# Install additional dependencies for advanced features
npm install reconnecting-websocket
npm install @nomicfoundation/hardhat-toolbox
```

### 2. Environment Configuration

Create `.env.local` file:

```env
# Somnia Testnet Configuration
VITE_NETWORK=somnia
VITE_RPC_URL=https://testnet.somnia.network
VITE_WSS_RPC_URL=wss://testnet.somnia.network
VITE_CHAIN_ID=50311

# Contract Addresses (update after deployment)
VITE_NFTFLOW_CONTRACT_ADDRESS=0x...
VITE_REPUTATION_SYSTEM_ADDRESS=0x...
VITE_DIA_ORACLE_ADDRESS=0x...
VITE_MULTICALL_V3_ADDRESS=0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223
```

## 🏗️ Contract Deployment

### 1. Deploy Core Contracts

```bash
# Navigate to backend directory
cd backend

# Deploy contracts
npx hardhat run scripts/deploy-advanced.js --network somnia
```

### 2. Update Contract Addresses

After deployment, update `src/config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  NFTFlow: '0x...', // Deployed NFTFlowGasOptimized address
  ReputationSystem: '0x...', // Deployed ReputationSystem address
  DIAPriceOracle: '0x...', // Deployed DIAPriceOracle address
  MultiCallV3: '0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223', // Somnia's MultiCallV3
  // ... other addresses
};
```

## 🔌 Integration Guide

### 1. Gas Optimization (MultiCallV3)

The MultiCallV3 integration automatically batches operations to reduce gas costs.

**Usage in Components:**

```typescript
import { useNFTFlow } from '@/hooks/useNFTFlow';

const MyComponent = () => {
  const { rentNFT } = useNFTFlow();
  
  // MultiCall is automatically used for gas optimization
  const handleRent = async () => {
    await rentNFT(nftContract, tokenId, duration, totalCost, collateralAmount);
  };
};
```

**Benefits:**
- Up to 40% gas savings on rental transactions
- Automatic batching of approve + setUser operations
- Reduced transaction overhead

### 2. Real-time Updates (WebSocket)

Enable real-time updates across the application.

**Setup in App Component:**

```typescript
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

const App = () => {
  // Enable all real-time features
  const { isConnected } = useRealTimeUpdates({
    enableNotifications: true,
    enableRentalUpdates: true,
    enablePaymentUpdates: true,
    enableReputationUpdates: true
  });

  return (
    <div>
      {isConnected && <div>🟢 Real-time updates active</div>}
      {/* Your app content */}
    </div>
  );
};
```

**Custom Event Subscriptions:**

```typescript
const { subscribe } = useRealTimeUpdates();

useEffect(() => {
  const unsubscribe = subscribe('rental-created', (data) => {
    console.log('New rental:', data);
    // Update UI in real-time
  });

  return unsubscribe;
}, [subscribe]);
```

### 3. Price Oracle (DIA Integration)

Integrate fair pricing using DIA Oracle.

**Usage in NFT Components:**

```typescript
import { useDIAPriceOracle } from '@/hooks/useDIAPriceOracle';

const NFTCard = ({ nft }) => {
  const { getPrice, formatPrice, isLoading } = useDIAPriceOracle();
  const [priceData, setPriceData] = useState(null);

  useEffect(() => {
    const loadPrice = async () => {
      const price = await getPrice(nft.contract, nft.tokenId, true); // true = use oracle
      setPriceData(price);
    };
    loadPrice();
  }, [nft]);

  return (
    <div>
      {isLoading ? (
        <div>Loading price...</div>
      ) : (
        <div>
          <p>Price: {formatPrice(priceData?.pricePerSecond, 'second')}</p>
          <p>Hourly: {formatPrice(priceData?.pricePerHour, 'hour')}</p>
        </div>
      )}
    </div>
  );
};
```

**Setting Custom Prices:**

```typescript
const { setCustomPrice } = useDIAPriceOracle();

const handleSetCustomPrice = async () => {
  await setCustomPrice(nftContract, tokenId, "0.000005"); // 0.000005 STT/second
};
```

### 4. Reputation System

Implement collateral-free rentals based on user reputation.

**Usage in Rental Components:**

```typescript
import { useReputationSystem } from '@/hooks/useReputationSystem';

const RentalForm = () => {
  const { 
    reputationData, 
    canRentWithoutCollateral, 
    getCollateralRequirement,
    getCurrentTier 
  } = useReputationSystem();

  const collateralRequired = canRentWithoutCollateral() ? 0 : getCollateralRequirement();

  return (
    <div>
      <div className="reputation-badge">
        <span className={`badge ${getCurrentTier().color}`}>
          {getCurrentTier().name}
        </span>
      </div>
      
      {collateralRequired > 0 && (
        <div>
          Collateral Required: {collateralRequired}%
        </div>
      )}
      
      {canRentWithoutCollateral() && (
        <div className="success">
          ✅ No collateral required - you're trusted!
        </div>
      )}
    </div>
  );
};
```

**Reputation Dashboard:**

```typescript
const ReputationDashboard = () => {
  const { 
    reputationData, 
    getProgressToNextTier, 
    getNextTier,
    getReputationBenefits 
  } = useReputationSystem();

  return (
    <div>
      <h3>Your Reputation</h3>
      <div>Score: {reputationData?.score}/1000</div>
      <div>Success Rate: {reputationData?.successRate}%</div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${getProgressToNextTier()}%` }}
        />
      </div>
      
      <div>Next Tier: {getNextTier()?.name}</div>
      <div>Benefits: {getReputationBenefits().join(', ')}</div>
    </div>
  );
};
```

## 🧪 Testing

### 1. Run Comprehensive Tests

```bash
# Run all tests
npx hardhat test

# Run specific test suites
npx hardhat test test/NFTFlowComprehensive.test.js
npx hardhat test test/ReputationSystem.test.js
npx hardhat test test/DIAPriceOracle.test.js
```

### 2. Test Coverage

```bash
# Generate coverage report
npx hardhat coverage
```

### 3. Gas Usage Analysis

```bash
# Analyze gas usage
npx hardhat test --gas-report
```

## 🔧 Configuration

### 1. WebSocket Configuration

Modify `src/services/WebSocketService.ts`:

```typescript
const config: WebSocketConfig = {
  wssRpcUrl: 'wss://testnet.somnia.network',
  chainId: 50311,
  reconnectAttempts: 0,
  maxReconnectAttempts: 10
};
```

### 2. Reputation System Parameters

Modify `backend/contracts/ReputationSystem.sol`:

```solidity
uint256 public constant REPUTATION_GAIN = 10;        // Points gained per successful rental
uint256 public constant REPUTATION_LOSS = 20;        // Points lost per failed rental
uint256 public constant COLLATERAL_FREE_THRESHOLD = 750; // Score needed for no collateral
```

### 3. Price Oracle Settings

Modify `backend/contracts/oracles/DIAPriceOracle.sol`:

```solidity
uint256 public constant MIN_PRICE_PER_SECOND = 0.000001 ether; // Minimum price
uint256 public constant MAX_PRICE_PER_SECOND = 1 ether;        // Maximum price
uint256 public oracleFee = 0.001 ether;                       // Oracle usage fee
```

## 🚀 Deployment

### 1. Deploy to Somnia Testnet

```bash
# Deploy all contracts
npx hardhat run scripts/deploy-all.js --network somnia

# Verify contracts
npx hardhat verify --network somnia <CONTRACT_ADDRESS>
```

### 2. Frontend Deployment

```bash
# Build for production
npm run build

# Deploy to your hosting platform
npm run deploy
```

## 📊 Monitoring & Analytics

### 1. Real-time Metrics

Monitor the following metrics:

- **Gas Usage**: Track MultiCall savings
- **WebSocket Connections**: Monitor connection stability
- **Oracle Calls**: Track DIA Oracle usage and costs
- **Reputation Changes**: Monitor reputation system health
- **Rental Success Rate**: Track overall platform health

### 2. Error Handling

Implement comprehensive error handling:

```typescript
// WebSocket error handling
webSocketService.on('error', (error) => {
  console.error('WebSocket error:', error);
  // Implement fallback mechanisms
});

// Oracle error handling
try {
  const price = await getPrice(contract, tokenId, true);
} catch (error) {
  // Fallback to estimated pricing
  const estimatedPrice = await getEstimatedPrice(contract, tokenId);
}
```

## 🔒 Security Considerations

### 1. Access Control

- Only authorized contracts can update reputation
- Oracle fees prevent spam attacks
- MultiCall operations are validated

### 2. Rate Limiting

- Implement rate limiting for oracle calls
- Monitor for suspicious activity
- Set maximum rental durations

### 3. Emergency Procedures

- Emergency NFT recovery functions
- Circuit breakers for oracle failures
- Reputation system pause functionality

## 🆘 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check network connectivity
   - Verify RPC URL configuration
   - Implement fallback polling

2. **Oracle Price Fetch Failed**
   - Check oracle fee balance
   - Verify DIA Oracle availability
   - Use estimated pricing fallback

3. **Reputation Update Failed**
   - Verify contract permissions
   - Check rental contract address
   - Ensure proper event emission

### Debug Mode

Enable debug logging:

```typescript
// In WebSocketService.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('WebSocket event:', eventType, data);
}
```

## 📈 Performance Optimization

### 1. Caching Strategies

- Cache oracle prices for 5 minutes
- Cache reputation data locally
- Implement smart cache invalidation

### 2. Batch Operations

- Batch multiple NFT price requests
- Group reputation updates
- Optimize WebSocket subscriptions

### 3. Lazy Loading

- Load reputation data on demand
- Implement progressive price loading
- Use skeleton components for better UX

## 🎯 Best Practices

1. **Always handle errors gracefully**
2. **Implement proper loading states**
3. **Use TypeScript for type safety**
4. **Write comprehensive tests**
5. **Monitor gas usage and optimize**
6. **Keep user experience smooth**
7. **Document all custom implementations**

## 📞 Support

For technical support or questions:

- Check the test suite for usage examples
- Review the contract documentation
- Consult the Somnia documentation
- Join the NFTFlow community Discord

---

This integration guide provides everything needed to successfully implement and use NFTFlow's advanced features. Follow the steps carefully and test thoroughly before deploying to production.
