// Somnia Network Configuration
// Optimized for Somnia's 1M+ TPS, sub-cent fees, and 1-second block times

export const SOMNIA_CONFIG = {
  // Network Configuration
  NETWORK_ID: 50312, // Somnia Testnet
  RPC_URL: "https://dream-rpc.somnia.network/",
  WS_URL: "wss://dream-rpc.somnia.network/ws",
  BLOCK_EXPLORER_URL: "https://shannon-explorer.somnia.network/",
  
  // Somnia-Specific Optimizations
  BLOCK_TIME: 1, // 1 second block time
  MAX_TPS: 1000000, // 1M+ TPS capability
  GAS_PRICE: "1000000000", // 1 gwei - very low
  MAX_GAS_PRICE: "5000000000", // 5 gwei max
  CONFIRMATION_BLOCKS: 1, // Fast finality - 1 block confirmation
  RETRY_INTERVAL: 1000, // 1 second retry interval
  
  // Batch Operation Limits (Leveraging Somnia's High TPS)
  BATCH_SIZE: 1000, // Can handle large batches
  MAX_BATCH_VALUE: "1000", // 1000 STT max batch value
  BATCH_GAS_LIMIT: 30000000, // 30M gas limit for batches
  
  // Micro-Payment Streaming (Sub-cent fees enable per-second payments)
  MIN_STREAM_RATE: "1", // 1 wei per second
  MAX_STREAM_RATE: "1000000000000000000", // 1 STT per second
  MIN_STREAM_DURATION: 60, // 1 minute minimum
  MAX_STREAM_DURATION: 31536000, // 1 year maximum
  PLATFORM_FEE_PERCENTAGE: 25, // 0.25% (25 basis points)
  
  // Gas Optimization Settings
  GAS_PRICE_MULTIPLIER: 100, // 1x for Somnia's low fees
  OPTIMIZED_GAS_LIMIT: 200000, // Optimized gas limit
  FAST_TRANSACTION_GAS_LIMIT: 100000, // Fast transaction gas limit
  
  // Real-time Update Settings
  BLOCK_POLLING_INTERVAL: 1000, // Poll every 1 second
  PENDING_TX_TIMEOUT: 2000, // 2 seconds for pending tx confirmation
  MAX_PENDING_TXS: 100, // Max pending transactions to track
  
  // Contract Addresses on Somnia Testnet
  CONTRACTS: {
    // Existing contracts
    NFT_FLOW: "0x59b670e9fA9D0A427751Af201D676719a970857b",
    PAYMENT_STREAM: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
    REPUTATION_SYSTEM: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
    MOCK_PRICE_ORACLE: "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB",
    MOCK_ERC721: "0xf5059a5D33d5853360D16C683c16e67980206f36",
    UTILITY_TRACKER: "0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8",
    
    // New contracts to be deployed
    NFT_FLOW_METADATA: "", // Deploy new contract
    SOMNIA_BATCH_OPERATIONS: "", // Deploy new contract
    SOMNIA_PAYMENT_STREAM: "", // Deploy new contract
    SOMNIA_GAS_OPTIMIZED: "", // Deploy new contract
    ON_CHAIN_ANALYTICS: "", // Deploy new contract
  },
  
  // Currency Configuration
  CURRENCY: {
    SYMBOL: "STT",
    NAME: "Somnia Test Token",
    DECIMALS: 18,
    MIN_UNIT: "1000000000000000", // 0.001 STT
  },
  
  // Feature Flags
  FEATURES: {
    BATCH_OPERATIONS: true,
    MICRO_PAYMENT_STREAMING: true,
    REAL_TIME_UPDATES: true,
    ON_CHAIN_METADATA: true,
    ON_CHAIN_ANALYTICS: true,
    GAS_OPTIMIZATION: true,
  },
  
  // Performance Settings
  PERFORMANCE: {
    ENABLE_CACHING: true,
    CACHE_TTL: 5000, // 5 seconds cache TTL
    ENABLE_PRELOADING: true,
    PRELOAD_BATCH_SIZE: 50,
    ENABLE_OPTIMISTIC_UPDATES: true,
  },
  
  // Error Handling
  ERROR_HANDLING: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    TIMEOUT_DURATION: 10000, // 10 seconds
    ENABLE_FALLBACK: true,
  },
  
  // Monitoring and Analytics
  MONITORING: {
    ENABLE_PERFORMANCE_TRACKING: true,
    ENABLE_ERROR_TRACKING: true,
    ENABLE_USAGE_ANALYTICS: true,
    LOG_LEVEL: "info", // debug, info, warn, error
  }
};

// Somnia-specific utility functions
export const SomniaUtils = {
  // Convert wei to STT
  weiToSTT: (wei: string | bigint): string => {
    const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
    return (Number(weiValue) / 1e18).toFixed(18);
  },
  
  // Convert STT to wei
  sttToWei: (stt: string | number): string => {
    const sttValue = typeof stt === 'string' ? parseFloat(stt) : stt;
    return (sttValue * 1e18).toString();
  },
  
  // Calculate gas cost in STT
  calculateGasCost: (gasUsed: number, gasPrice: string = SOMNIA_CONFIG.GAS_PRICE): string => {
    const gasPriceWei = BigInt(gasPrice);
    const totalWei = BigInt(gasUsed) * gasPriceWei;
    return SomniaUtils.weiToSTT(totalWei.toString());
  },
  
  // Check if gas price is optimal for Somnia
  isOptimalGasPrice: (gasPrice: string): boolean => {
    const gasPriceWei = BigInt(gasPrice);
    const maxGasPriceWei = BigInt(SOMNIA_CONFIG.MAX_GAS_PRICE);
    return gasPriceWei <= maxGasPriceWei;
  },
  
  // Calculate batch operation cost
  calculateBatchCost: (itemCount: number, operationType: 'rental' | 'price_update' | 'listing' | 'transfer'): string => {
    const baseGas = 21000;
    const gasPerItem = {
      rental: 100000,
      price_update: 50000,
      listing: 150000,
      transfer: 75000
    }[operationType];
    
    const totalGas = baseGas + (itemCount * gasPerItem);
    return SomniaUtils.calculateGasCost(totalGas);
  },
  
  // Calculate micro-stream cost
  calculateStreamCost: (ratePerSecond: string, duration: number): string => {
    const rateWei = BigInt(ratePerSecond);
    const totalWei = rateWei * BigInt(duration);
    return SomniaUtils.weiToSTT(totalWei.toString());
  },
  
  // Format time for Somnia's fast blocks
  formatBlockTime: (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(timestamp).toLocaleString();
  },
  
  // Check if transaction should be fast-tracked
  shouldFastTrack: (gasPrice: string, gasLimit: number): boolean => {
    const gasPriceWei = BigInt(gasPrice);
    const maxGasPriceWei = BigInt(SOMNIA_CONFIG.MAX_GAS_PRICE);
    const isLowGasPrice = gasPriceWei <= maxGasPriceWei;
    const isLowGasLimit = gasLimit <= SOMNIA_CONFIG.FAST_TRANSACTION_GAS_LIMIT;
    
    return isLowGasPrice && isLowGasLimit;
  }
};

// Somnia network detection
export const SomniaNetwork = {
  // Check if connected to Somnia
  isConnected: async (): Promise<boolean> => {
    if (typeof window.ethereum === 'undefined') return false;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === `0x${SOMNIA_CONFIG.NETWORK_ID.toString(16)}`;
    } catch (error) {
      console.error('Error checking Somnia connection:', error);
      return false;
    }
  },
  
  // Switch to Somnia network
  switchToSomnia: async (): Promise<void> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not available');
    }
    
    try {
      // Try to switch to Somnia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SOMNIA_CONFIG.NETWORK_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${SOMNIA_CONFIG.NETWORK_ID.toString(16)}`,
            chainName: 'Somnia Testnet',
            nativeCurrency: {
              name: SOMNIA_CONFIG.CURRENCY.NAME,
              symbol: SOMNIA_CONFIG.CURRENCY.SYMBOL,
              decimals: SOMNIA_CONFIG.CURRENCY.DECIMALS,
            },
            rpcUrls: [SOMNIA_CONFIG.RPC_URL],
            blockExplorerUrls: [SOMNIA_CONFIG.BLOCK_EXPLORER_URL],
          }],
        });
      } else {
        throw switchError;
      }
    }
  },
  
  // Get current network info
  getCurrentNetwork: async () => {
    if (typeof window.ethereum === 'undefined') return null;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isSomnia = chainId === `0x${SOMNIA_CONFIG.NETWORK_ID.toString(16)}`;
      
      return {
        chainId: parseInt(chainId as string, 16),
        isSomnia,
        name: isSomnia ? 'Somnia Testnet' : 'Unknown',
        rpcUrl: isSomnia ? SOMNIA_CONFIG.RPC_URL : null,
        blockExplorerUrl: isSomnia ? SOMNIA_CONFIG.BLOCK_EXPLORER_URL : null,
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return null;
    }
  }
};

// Export default configuration
export default SOMNIA_CONFIG;