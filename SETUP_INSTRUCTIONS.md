# NFTFlow Setup Instructions

## Issues Fixed

✅ **Contract Addresses**: Updated to use Somnia testnet addresses
✅ **Wallet Connection**: Enhanced to handle network switching gracefully
✅ **Mock Data**: Properly integrated mock NFT data for testing
✅ **Navigation**: Added missing routes (Marketplace, Dashboard)
✅ **Error Handling**: Improved error handling for contract initialization

## How to Use

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Connect Your Wallet
- The app will automatically try to connect to Somnia testnet
- If you're on a different network, it will prompt you to switch
- The app works in "mock mode" even if contracts aren't deployed

### 3. Browse NFTs
- Visit `/marketplace` to see mock NFTs
- All NFTs are displayed with realistic data
- You can search and filter NFTs

### 4. View Dashboard
- Visit `/dashboard` to see your portfolio
- Shows your NFTs, rental history, and stats
- Requires wallet connection

## Features Working

### ✅ Wallet Connection
- MetaMask detection and connection
- Network switching to Somnia testnet
- Graceful fallback if network switch fails
- Balance display

### ✅ Mock Data Display
- 5 realistic NFT items with images
- Proper pricing in STT (Somnia Test Token)
- Collection information
- Rental statistics

### ✅ Navigation
- Home page with feature overview
- Marketplace with NFT browsing
- Dashboard with user portfolio
- Analytics page
- Profile page

### ✅ UI Components
- Responsive design
- Dark theme with purple/pink gradients
- Loading states and error handling
- Toast notifications

## Network Configuration

The app is configured for **Somnia Testnet**:
- Chain ID: 50312
- RPC URL: https://dream-rpc.somnia.network/
- Currency: STT (Somnia Test Token)
- Block Explorer: https://shannon-explorer.somnia.network/

## Contract Addresses (Somnia Testnet)

- NFTFlow: `0x59b670e9fA9D0A427751Af201D676719a970857b`
- PaymentStream: `0x68B1D87F95878fE05B998F19b66F4baba5De1aed`
- ReputationSystem: `0x3Aa5ebB10DC797CAC828524e59A333d0A371443c`
- MockPriceOracle: `0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB`
- MockERC721: `0xf5059a5D33d5853360D16C683c16e67980206f36`
- UtilityTracker: `0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8`

## Troubleshooting

### Wallet Connection Issues
1. Make sure MetaMask is installed and unlocked
2. Check browser console for detailed error messages
3. Try refreshing the page and reconnecting

### Network Issues
1. The app will try to switch to Somnia testnet automatically
2. If switching fails, the app continues in mock mode
3. You can manually add Somnia testnet to MetaMask if needed

### Contract Issues
1. If contracts fail to initialize, the app runs in mock mode
2. Check console logs for contract initialization status
3. Ensure you're on the correct network

## Development Notes

- The app uses mock data for testing without requiring deployed contracts
- All wallet interactions are simulated for demo purposes
- Real contract interaction requires deployed contracts on Somnia testnet
- The UI is fully responsive and works on mobile devices

## Next Steps

1. Deploy contracts to Somnia testnet for real functionality
2. Add more mock NFT collections
3. Implement real-time updates
4. Add more analytics and reporting features
