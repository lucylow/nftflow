// Contract configuration
// Updated with Somnia testnet addresses

export const CONTRACT_ADDRESSES = {
  // Main contracts - Somnia Testnet addresses
  NFTFlow: '0x59b670e9fA9D0A427751Af201D676719a970857b',
  NFTFlowCore: '0x59b670e9fA9D0A427751Af201D676719a970857b', // Using same address for now
  PaymentStream: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
  ReputationSystem: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
  DynamicPricing: '0x0000000000000000000000000000000000000000', // To be deployed
  UtilityTracker: '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8',
  MockPriceOracle: '0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB',
  MockERC721: '0xf5059a5D33d5853360D16C683c16e67980206f36',
  AIAgentManager: '0x0000000000000000000000000000000000000000', // To be deployed
  AIAgentNFT: '0x0000000000000000000000000000000000000000', // To be deployed
};

// Network configuration
export const NETWORK_CONFIG = {
  name: import.meta.env.VITE_NETWORK || 'somnia',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://dream-rpc.somnia.network/',
  chainId: import.meta.env.VITE_NETWORK === 'hardhat' ? 1337 : 50312,
  currency: import.meta.env.VITE_NETWORK === 'hardhat' ? 'ETH' : 'STT',
  blockExplorer: 'https://shannon-explorer.somnia.network/',
};

// Default values for testing
export const DEFAULT_VALUES = {
  pricePerSecond: '0.000001', // 0.0036 STT per hour
  minDuration: '3600', // 1 hour
  maxDuration: '2592000', // 30 days
  collateralRequired: '1.0', // 1 STT
};
