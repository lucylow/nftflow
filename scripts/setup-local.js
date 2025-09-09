#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up NFTFlow for local development...\n');

// Check if Hardhat node is running
try {
  execSync('curl -s http://localhost:8545', { stdio: 'ignore' });
  console.log('✅ Hardhat node is running');
} catch (error) {
  console.log('❌ Hardhat node is not running. Please start it with: npm run node');
  console.log('   Then run this script again.');
  process.exit(1);
}

// Deploy contracts
console.log('📦 Deploying contracts...');
try {
  execSync('npm run deploy:contracts', { stdio: 'inherit' });
  console.log('✅ Contracts deployed successfully');
} catch (error) {
  console.log('❌ Failed to deploy contracts');
  process.exit(1);
}

// Read deployment output and update .env.local
console.log('🔧 Updating environment variables...');
try {
  // This would need to be updated based on your actual deployment script output
  // For now, we'll create a template
  const envContent = `# Environment variables for NFTFlow
# Update these after deploying contracts

# Network configuration
REACT_APP_NETWORK=hardhat
REACT_APP_RPC_URL=http://localhost:8545

# Contract addresses (update these with actual deployed addresses)
REACT_APP_NFTFLOW_ADDRESS=0x0000000000000000000000000000000000000000
REACT_APP_PAYMENT_STREAM_ADDRESS=0x0000000000000000000000000000000000000000
REACT_APP_REPUTATION_SYSTEM_ADDRESS=0x0000000000000000000000000000000000000000
REACT_APP_PRICE_ORACLE_ADDRESS=0x0000000000000000000000000000000000000000
REACT_APP_MOCK_ERC721_ADDRESS=0x0000000000000000000000000000000000000000
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Environment file created');
} catch (error) {
  console.log('❌ Failed to update environment file');
  process.exit(1);
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update the contract addresses in .env.local with the actual deployed addresses');
console.log('2. Start the frontend with: npm run dev');
console.log('3. Connect your MetaMask to http://localhost:8545 (Chain ID: 1337)');
console.log('4. Import some test accounts from Hardhat for testing');
