# Wallet Connection Troubleshooting Guide

## Common Issues and Solutions

### 1. "MetaMask not installed" Error
**Problem**: The app can't detect MetaMask
**Solution**: 
- Install MetaMask browser extension
- Refresh the page after installation
- Make sure MetaMask is enabled

### 2. "Connection rejected" Error
**Problem**: User denied the connection request
**Solution**:
- Click "Connect" again
- Make sure to click "Connect" in the MetaMask popup
- Check if MetaMask is unlocked

### 3. "No accounts found" Error
**Problem**: MetaMask is locked or no accounts available
**Solution**:
- Unlock MetaMask by entering your password
- Make sure you have at least one account created
- Import or create an account if needed

### 4. "Contracts not deployed" Warning
**Problem**: Smart contracts haven't been deployed yet
**Solution**:
- Deploy contracts locally: `npm run deploy:contracts`
- Or use the setup script: `node scripts/setup-local.js`
- Update contract addresses in `.env.local`

### 5. Network Issues
**Problem**: Wrong network or network not added
**Solution**:
- Make sure you're on the correct network (Hardhat local or Somnia testnet)
- Use the network switch button in the wallet component
- Add the network manually in MetaMask if needed

## Setup Instructions

### For Local Development:
1. Start Hardhat node: `npm run node`
2. Deploy contracts: `npm run deploy:contracts`
3. Update `.env.local` with deployed contract addresses
4. Start frontend: `npm run dev`
5. Connect MetaMask to `http://localhost:8545` (Chain ID: 1337)

### For Testnet:
1. Deploy to testnet: `npm run deploy:testnet`
2. Update `.env.local` with testnet addresses
3. Switch MetaMask to Somnia testnet (Chain ID: 50311)
4. Get testnet tokens from faucet if needed

## Testing Accounts

When using Hardhat local network, you can import these test accounts:
- Account 1: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Account 2: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private keys are available in Hardhat documentation

## Still Having Issues?

1. Check browser console for detailed error messages
2. Make sure all dependencies are installed: `npm install`
3. Try clearing browser cache and refreshing
4. Check if MetaMask is up to date
5. Try a different browser or incognito mode
