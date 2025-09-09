// Contract configuration
// Update these addresses after deploying the contracts

export const CONTRACT_ADDRESSES = {
  // Main contracts - Hardhat deployment addresses
  NFTFlow: process.env.REACT_APP_NFTFLOW_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  PaymentStream: process.env.REACT_APP_PAYMENT_STREAM_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  ReputationSystem: process.env.REACT_APP_REPUTATION_SYSTEM_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  MockPriceOracle: process.env.REACT_APP_PRICE_ORACLE_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  MockERC721: process.env.REACT_APP_MOCK_ERC721_ADDRESS || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
};

// Network configuration
export const NETWORK_CONFIG = {
  name: process.env.REACT_APP_NETWORK || 'hardhat',
  rpcUrl: process.env.REACT_APP_RPC_URL || 'http://localhost:8545',
  chainId: process.env.REACT_APP_NETWORK === 'somnia' ? 50311 : 1337,
  currency: process.env.REACT_APP_NETWORK === 'somnia' ? 'STT' : 'ETH',
};

// Default values for testing
export const DEFAULT_VALUES = {
  pricePerSecond: '0.000001', // 0.0036 STT per hour
  minDuration: '3600', // 1 hour
  maxDuration: '2592000', // 30 days
  collateralRequired: '1.0', // 1 STT
};
