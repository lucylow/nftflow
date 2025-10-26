# NFTFlow Frontend-Backend Integration Guide

This guide explains how to integrate the smart contracts with the frontend application.

## Prerequisites

1. Node.js and npm installed
2. Hardhat installed globally: `npm install -g hardhat`
3. MetaMask browser extension
4. Git

## Smart Contract Architecture

The NFTFlow system consists of several interconnected smart contracts:

### Core Contracts

1. **NFTFlow.sol** - Main rental marketplace contract
   - Manages NFT listings and rentals
   - Handles collateral deposits/withdrawals
   - Integrates with payment streaming and reputation system

2. **PaymentStream.sol** - Real-time payment streaming
   - Enables continuous payment flow during rentals
   - Handles stream creation, withdrawal, and cancellation

3. **ReputationSystem.sol** - User reputation management
   - Tracks user rental history and success rates
   - Provides collateral multipliers based on reputation
   - Manages achievements and blacklisting

### Supporting Contracts

4. **MockPriceOracle.sol** - Price data provider
   - Provides NFT pricing information
   - Used for rental price calculations

5. **MockERC721.sol** - Test NFT contract
   - Standard ERC721 implementation for testing
   - Supports ERC-4907 rental standard

6. **IERC4907.sol** - Rental NFT interface
   - Standard interface for rentable NFTs
   - Separates ownership from usage rights

## Deployment Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Deploy Smart Contracts

```bash
# Start local Hardhat network
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Configure Frontend

Create a `.env.local` file in the root directory with the deployed contract addresses:

```env
REACT_APP_NFTFLOW_ADDRESS=0x...
REACT_APP_PAYMENT_STREAM_ADDRESS=0x...
REACT_APP_REPUTATION_SYSTEM_ADDRESS=0x...
REACT_APP_PRICE_ORACLE_ADDRESS=0x...
REACT_APP_MOCK_ERC721_ADDRESS=0x...
REACT_APP_NETWORK=hardhat
REACT_APP_RPC_URL=http://localhost:8545
```

### 4. Start the Application

```bash
# Start the frontend development server
npm run dev
```

## Frontend Integration

### Web3 Context

The `Web3Context` provides:
- Wallet connection management
- Contract instance initialization
- Network switching
- Balance tracking

### Custom Hooks

#### useNFTFlow
- `listForRental()` - List NFT for rental
- `rentNFT()` - Rent an NFT
- `completeRental()` - Complete a rental
- `depositCollateral()` - Deposit collateral
- `withdrawCollateral()` - Withdraw collateral

#### usePaymentStream
- `createStream()` - Create payment stream
- `withdrawFromStream()` - Withdraw from stream
- `cancelStream()` - Cancel stream
- `getStreamBalance()` - Get available balance

#### useReputationSystem
- `getUserReputation()` - Get user reputation data
- `getCollateralMultiplier()` - Get collateral multiplier
- `getSuccessRate()` - Get user success rate
- `getUserAchievements()` - Get user achievements

### Component Updates

#### WalletConnect
- Integrated with Web3 context
- Real wallet connection
- Network switching support
- Balance display

#### Create Page
- Smart contract integration for listing NFTs
- Form validation
- Transaction handling
- Error management

#### NFTCard
- Real rental functionality
- Smart contract interaction
- Loading states
- Error handling

#### Marketplace
- Updated NFT data structure
- Real-time pricing
- Contract-based filtering

## Key Features

### 1. Micro-Rentals
- Rent NFTs by the second
- Real-time payment streaming
- Flexible duration settings

### 2. Reputation System
- Track rental history
- Collateral reduction for trusted users
- Achievement system
- Blacklist management

### 3. Payment Streaming
- Continuous payment flow
- Automatic withdrawals
- Stream management

### 4. Collateral Management
- Security deposits
- Reputation-based multipliers
- Automatic returns

## Testing

### Manual Testing

1. **Connect Wallet**
   - Connect MetaMask
   - Switch to local network
   - Verify balance

2. **List NFT**
   - Navigate to Create page
   - Fill in NFT details
   - Submit transaction
   - Verify listing

3. **Rent NFT**
   - Browse marketplace
   - Select NFT
   - Rent for specified duration
   - Verify rental

4. **Manage Collateral**
   - Deposit collateral
   - Check balance
   - Withdraw if needed

### Automated Testing

```bash
# Run smart contract tests
cd backend
npx hardhat test

# Run frontend tests
npm test
```

## Troubleshooting

### Common Issues

1. **Contract Not Found**
   - Verify contract addresses in `.env.local`
   - Ensure contracts are deployed
   - Check network configuration

2. **Transaction Fails**
   - Check wallet connection
   - Verify sufficient balance
   - Check gas limits

3. **Network Issues**
   - Ensure Hardhat node is running
   - Check RPC URL configuration
   - Verify network ID

### Debug Mode

Enable debug logging by setting:
```env
REACT_APP_DEBUG=true
```

## Production Deployment

### 1. Deploy to Somnia Testnet

```bash
# Deploy to Somnia testnet
npx hardhat run scripts/deploy.js --network somniaTestnet
```

### 2. Update Configuration

Update `.env.production` with testnet addresses:
```env
REACT_APP_NETWORK=somnia
REACT_APP_RPC_URL=https://testnet.somnia.network
```

### 3. Build and Deploy

```bash
# Build for production
npm run build

# Deploy to your hosting platform
```

## Security Considerations

1. **Private Keys**
   - Never commit private keys
   - Use environment variables
   - Consider hardware wallets

2. **Contract Verification**
   - Verify contracts on block explorer
   - Use audited libraries
   - Test thoroughly

3. **Access Control**
   - Implement proper access controls
   - Use multi-signature wallets
   - Regular security audits

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review smart contract documentation
3. Check GitHub issues
4. Contact the development team

## Future Enhancements

1. **Advanced Features**
   - Batch operations
   - Advanced filtering
   - Analytics dashboard
   - Mobile app

2. **Integration**
   - More NFT standards
   - Cross-chain support
   - DeFi integrations
   - Social features

3. **Optimization**
   - Gas optimization
   - UI/UX improvements
   - Performance enhancements
   - Scalability solutions
