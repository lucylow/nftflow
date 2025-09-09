// Contract configuration
// Update these addresses after deploying the contracts

export const CONTRACT_ADDRESSES = {
  // Main contracts - Latest deployment addresses
  NFTFlow: '0x59b670e9fA9D0A427751Af201D676719a970857b',
  PaymentStream: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
  ReputationSystem: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
  UtilityTracker: '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d',
  MockPriceOracle: '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
  MockERC721: '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1',
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
