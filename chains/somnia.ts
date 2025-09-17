import { defineChain } from 'viem';

// Somnia Testnet Configuration
export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia Token',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network/'],
      webSocket: ['wss://dream-rpc.somnia.network/ws'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network/', 'https://somnia-testnet-rpc.ankr.com/'],
      webSocket: ['wss://dream-rpc.somnia.network/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shannon Explorer',
      url: 'https://shannon-explorer.somnia.network',
    },
  },
  testnet: true,
});

// Somnia Mainnet Configuration (for future use)
export const somniaMainnet = defineChain({
  id: 1,
  name: 'Somnia Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia Token',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.somnia.network/'],
      webSocket: ['wss://mainnet-rpc.somnia.network/ws'],
    },
    public: {
      http: ['https://mainnet-rpc.somnia.network/'],
      webSocket: ['wss://mainnet-rpc.somnia.network/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.somnia.network',
    },
  },
  testnet: false,
});

// Contract addresses for different networks
export const contractAddresses = {
  [somniaTestnet.id]: {
    NFTFlowCore: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59' as `0x${string}`,
    PaymentStreamFactory: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    ReputationSystem: '0x2345678901234567890123456789012345678901' as `0x${string}`,
    ConfigRegistry: '0x3456789012345678901234567890123456789012' as `0x${string}`,
  },
  [somniaMainnet.id]: {
    NFTFlowCore: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    PaymentStreamFactory: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    ReputationSystem: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    ConfigRegistry: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
};

// Network configuration helper
export function getNetworkConfig(chainId: number) {
  switch (chainId) {
    case somniaTestnet.id:
      return {
        chain: somniaTestnet,
        contracts: contractAddresses[somniaTestnet.id],
        isTestnet: true,
      };
    case somniaMainnet.id:
      return {
        chain: somniaMainnet,
        contracts: contractAddresses[somniaMainnet.id],
        isTestnet: false,
      };
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

// Gas configuration for different networks
export const gasConfig = {
  [somniaTestnet.id]: {
    gasLimit: 30000000,
    gasPrice: 20000000000, // 20 gwei
    maxFeePerGas: 30000000000, // 30 gwei
    maxPriorityFeePerGas: 2000000000, // 2 gwei
  },
  [somniaMainnet.id]: {
    gasLimit: 30000000,
    gasPrice: 10000000000, // 10 gwei
    maxFeePerGas: 20000000000, // 20 gwei
    maxPriorityFeePerGas: 1000000000, // 1 gwei
  },
};

// RPC endpoints with fallbacks
export const rpcEndpoints = {
  [somniaTestnet.id]: [
    'https://dream-rpc.somnia.network/',
    'https://somnia-testnet-rpc.ankr.com/',
    'https://testnet-rpc.somnia.network/',
  ],
  [somniaMainnet.id]: [
    'https://mainnet-rpc.somnia.network/',
    'https://somnia-mainnet-rpc.ankr.com/',
  ],
};

// WebSocket endpoints
export const wsEndpoints = {
  [somniaTestnet.id]: [
    'wss://dream-rpc.somnia.network/ws',
    'wss://testnet-rpc.somnia.network/ws',
  ],
  [somniaMainnet.id]: [
    'wss://mainnet-rpc.somnia.network/ws',
  ],
};

// Block explorer URLs
export const explorerUrls = {
  [somniaTestnet.id]: 'https://shannon-explorer.somnia.network',
  [somniaMainnet.id]: 'https://explorer.somnia.network',
};

// Network metadata
export const networkMetadata = {
  [somniaTestnet.id]: {
    name: 'Somnia Testnet',
    shortName: 'Somnia Testnet',
    chainId: 50312,
    networkId: 50312,
    isTestnet: true,
    isMainnet: false,
    currency: 'STT',
    currencyDecimals: 18,
    blockTime: 2, // seconds
    blockReward: '2 STT',
    totalSupply: '1000000000 STT',
  },
  [somniaMainnet.id]: {
    name: 'Somnia Mainnet',
    shortName: 'Somnia',
    chainId: 1,
    networkId: 1,
    isTestnet: false,
    isMainnet: true,
    currency: 'STT',
    currencyDecimals: 18,
    blockTime: 2, // seconds
    blockReward: '2 STT',
    totalSupply: '1000000000 STT',
  },
};

// Helper functions
export function isSomniaNetwork(chainId: number): boolean {
  return chainId === somniaTestnet.id || chainId === somniaMainnet.id;
}

export function isTestnet(chainId: number): boolean {
  return chainId === somniaTestnet.id;
}

export function isMainnet(chainId: number): boolean {
  return chainId === somniaMainnet.id;
}

export function getContractAddress(chainId: number, contractName: keyof typeof contractAddresses[number]): `0x${string}` {
  const contracts = contractAddresses[chainId as keyof typeof contractAddresses];
  if (!contracts) {
    throw new Error(`No contracts found for chain ID ${chainId}`);
  }
  return contracts[contractName];
}

export function getGasConfig(chainId: number) {
  const config = gasConfig[chainId as keyof typeof gasConfig];
  if (!config) {
    throw new Error(`No gas config found for chain ID ${chainId}`);
  }
  return config;
}

export function getRpcEndpoints(chainId: number): string[] {
  const endpoints = rpcEndpoints[chainId as keyof typeof rpcEndpoints];
  if (!endpoints) {
    throw new Error(`No RPC endpoints found for chain ID ${chainId}`);
  }
  return endpoints;
}

export function getWsEndpoints(chainId: number): string[] {
  const endpoints = wsEndpoints[chainId as keyof typeof wsEndpoints];
  if (!endpoints) {
    throw new Error(`No WebSocket endpoints found for chain ID ${chainId}`);
  }
  return endpoints;
}

export function getExplorerUrl(chainId: number): string {
  const url = explorerUrls[chainId as keyof typeof explorerUrls];
  if (!url) {
    throw new Error(`No explorer URL found for chain ID ${chainId}`);
  }
  return url;
}

export function getNetworkMetadata(chainId: number) {
  const metadata = networkMetadata[chainId as keyof typeof networkMetadata];
  if (!metadata) {
    throw new Error(`No network metadata found for chain ID ${chainId}`);
  }
  return metadata;
}

// Default export
export default {
  somniaTestnet,
  somniaMainnet,
  contractAddresses,
  gasConfig,
  rpcEndpoints,
  wsEndpoints,
  explorerUrls,
  networkMetadata,
  isSomniaNetwork,
  isTestnet,
  isMainnet,
  getContractAddress,
  getGasConfig,
  getRpcEndpoints,
  getWsEndpoints,
  getExplorerUrl,
  getNetworkMetadata,
};
