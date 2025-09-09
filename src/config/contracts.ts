// Contract configuration
// Update these addresses after deploying the contracts

export const CONTRACT_ADDRESSES = {
  // Main contracts - Latest deployment addresses (Local Hardhat)
  NFTFlow: '0x851356ae760d987E095750cCeb3bC6014560891C',
  NFTFlowCore: '0x851356ae760d987E095750cCeb3bC6014560891C', // Using same address for now
  PaymentStream: '0x9E545E3C0baAB3E08CdfD552C960A1050f373042',
  ReputationSystem: '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9',
  DynamicPricing: '0x0000000000000000000000000000000000000000', // To be deployed
  UtilityTracker: '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8',
  MockPriceOracle: '0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB',
  MockERC721: '0xf5059a5D33d5853360D16C683c16e67980206f36',
};

// Network configuration
export const NETWORK_CONFIG = {
  name: import.meta.env.VITE_NETWORK || 'somnia',
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://testnet.somnia.network',
  chainId: import.meta.env.VITE_NETWORK === 'hardhat' ? 1337 : 50311,
  currency: import.meta.env.VITE_NETWORK === 'hardhat' ? 'ETH' : 'STT',
};

// Default values for testing
export const DEFAULT_VALUES = {
  pricePerSecond: '0.000001', // 0.0036 STT per hour
  minDuration: '3600', // 1 hour
  maxDuration: '2592000', // 30 days
  collateralRequired: '1.0', // 1 STT
};
