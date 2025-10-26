# NFTFlow Hybrid Functionality Guide

## 🚀 Enhanced Blockchain Integration

The NFTFlow application now features a **hybrid service architecture** that prioritizes real Somnia blockchain functionality while providing mock data as a seamless backup.

## 🔗 How It Works

### Primary: Somnia Blockchain Testnet
- **Real Contract Interaction**: Connects to deployed contracts on Somnia testnet
- **Live Transactions**: All rentals, listings, and returns are real blockchain transactions
- **Network Integration**: Automatically switches to Somnia testnet (Chain ID: 50312)
- **Gas Optimization**: Uses Somnia's low fees and fast block times

### Backup: Mock Data Service
- **Seamless Fallback**: If blockchain is unavailable, automatically uses mock data
- **Demo Mode**: Perfect for testing and demonstrations
- **No Interruption**: Users can still interact with the app even without contracts

## 🛠️ Technical Architecture

### HybridNFTService
```typescript
// Primary blockchain service
const blockchainService = new BlockchainService();

// Hybrid service that tries blockchain first, falls back to mock
const hybridNFTService = new HybridNFTService();
```

### Service Status Indicators
- 🔗 **Blockchain Active**: Real Somnia testnet connection
- 🎭 **Mock Mode**: Using mock data (backup mode)
- 📡 **Somnia Testnet**: Connected to Somnia network

## 🔧 Contract Addresses (Somnia Testnet)

| Contract | Address | Status |
|----------|---------|--------|
| NFTFlow | `0x59b670e9fA9D0A427751Af201D676719a970857b` | ✅ Deployed |
| PaymentStream | `0x68B1D87F95878fE05B998F19b66F4baba5De1aed` | ✅ Deployed |
| ReputationSystem | `0x3Aa5ebB10DC797CAC828524e59A333d0A371443c` | ✅ Deployed |
| MockPriceOracle | `0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB` | ✅ Deployed |
| MockERC721 | `0xf5059a5D33d5853360D16C683c16e67980206f36` | ✅ Deployed |
| UtilityTracker | `0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8` | ✅ Deployed |

## 🌐 Network Configuration

### Somnia Testnet Details
- **Chain ID**: 50312 (0xc4a0)
- **RPC URL**: https://dream-rpc.somnia.network/
- **Currency**: STT (Somnia Test Token)
- **Block Explorer**: https://shannon-explorer.somnia.network/
- **Block Time**: ~1 second
- **Gas Price**: Very low (sub-cent fees)

## 🎯 Key Features

### 1. Automatic Network Detection
- Detects current network on wallet connection
- Automatically switches to Somnia testnet if needed
- Adds Somnia network to MetaMask if not present

### 2. Smart Contract Integration
- Real-time contract calls for all operations
- Gas estimation and optimization
- Transaction status tracking
- Error handling with fallback

### 3. Hybrid Data Loading
- Loads real NFT listings from blockchain
- Falls back to mock data if blockchain unavailable
- Combines both sources for comprehensive marketplace

### 4. Service Status Monitoring
- Real-time status indicators
- Blockchain vs Mock mode detection
- Connection health monitoring

## 🔄 Operation Flow

### Wallet Connection
1. **Try Blockchain**: Attempt to connect to Somnia testnet
2. **Network Switch**: Automatically switch to Somnia if needed
3. **Contract Init**: Initialize all deployed contracts
4. **Fallback**: If blockchain fails, use mock mode
5. **Status Update**: Show current service status

### NFT Operations
1. **Primary**: Try blockchain operation first
2. **Validation**: Check contract availability
3. **Execution**: Perform real transaction
4. **Fallback**: Use mock simulation if blockchain fails
5. **Feedback**: Show transaction results

## 🎮 User Experience

### Blockchain Mode (Primary)
- Real transactions on Somnia testnet
- Live NFT rentals and listings
- Actual STT token usage
- Real-time blockchain data

### Mock Mode (Backup)
- Simulated transactions
- Mock NFT data display
- Demo functionality
- No real token usage

## 🚨 Error Handling

### Graceful Degradation
- Blockchain errors don't break the app
- Automatic fallback to mock mode
- Clear status indicators
- User-friendly error messages

### Recovery Mechanisms
- Automatic retry for network issues
- Manual refresh for blockchain connection
- Status monitoring and alerts

## 🔍 Debugging

### Console Logs
- `🔗 Blockchain service available: true/false`
- `📡 Loaded X listings from blockchain`
- `🎭 Loaded X mock listings`
- `✅ NFTFlow contract initialized`

### Service Status
- Check `isBlockchainReady` in Web3Context
- Monitor `serviceStatus.blockchain` and `serviceStatus.mock`
- Watch for contract initialization messages

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Connect Wallet
- Install MetaMask browser extension
- Connect wallet to the app
- App will automatically switch to Somnia testnet

### 4. Test Functionality
- Browse marketplace (shows real + mock NFTs)
- Try renting an NFT (real transaction if blockchain ready)
- Check service status indicators

## 📊 Monitoring

### Service Health
- Blockchain connection status
- Contract initialization status
- Network connectivity
- Transaction success rates

### Performance Metrics
- Transaction confirmation times
- Gas usage optimization
- Network latency
- Error rates

## 🔮 Future Enhancements

### Planned Features
- Real-time event listening
- Advanced analytics dashboard
- Batch operations
- Cross-chain compatibility
- Mobile wallet support

### Optimization Goals
- Faster contract interactions
- Better error recovery
- Enhanced user feedback
- Improved performance monitoring

## 🆘 Troubleshooting

### Common Issues
1. **Network Switch Fails**: App continues in mock mode
2. **Contract Not Found**: Check contract addresses
3. **Transaction Fails**: Automatic fallback to mock
4. **Wallet Not Connected**: Clear error messages

### Solutions
- Refresh blockchain connection
- Check MetaMask network
- Verify contract deployment
- Use mock mode for testing

---

**The hybrid architecture ensures NFTFlow works seamlessly whether connected to Somnia blockchain or running in demo mode, providing the best of both worlds for users and developers.**
