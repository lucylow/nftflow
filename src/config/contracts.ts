// Contract configuration
// Update these addresses after deploying the contracts

export const CONTRACT_ADDRESSES = {
  // Main contracts
  NFTFlow: process.env.REACT_APP_NFTFLOW_ADDRESS || '0x0000000000000000000000000000000000000000',
  PaymentStream: process.env.REACT_APP_PAYMENT_STREAM_ADDRESS || '0x0000000000000000000000000000000000000000',
  ReputationSystem: process.env.REACT_APP_REPUTATION_SYSTEM_ADDRESS || '0x0000000000000000000000000000000000000000',
  MockPriceOracle: process.env.REACT_APP_PRICE_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000',
  MockERC721: process.env.REACT_APP_MOCK_ERC721_ADDRESS || '0x0000000000000000000000000000000000000000',
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
