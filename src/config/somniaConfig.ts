// Somnia Network Configuration
// Optimized for Somnia's unique capabilities: 1M+ TPS, sub-second finality, low fees

export const SOMNIA_CONFIG = {
  // Network configurations
  NETWORKS: {
    TESTNET: {
      name: 'Somnia Testnet',
      rpcUrl: 'https://dream-rpc.somnia.network/',
      wsRpcUrl: 'wss://dream-rpc.somnia.network/',
      chainId: 50312,
      currency: 'STT',
      blockExplorer: 'https://shannon-explorer.somnia.network/',
      faucet: 'https://faucet.somnia.network/',
      docs: 'https://docs.somnia.network/'
    },
    MAINNET: {
      name: 'Somnia Mainnet',
      rpcUrl: 'https://mainnet-rpc.somnia.network/',
      wsRpcUrl: 'wss://mainnet-rpc.somnia.network/',
      chainId: 50311,
      currency: 'STT',
      blockExplorer: 'https://explorer.somnia.network/',
      docs: 'https://docs.somnia.network/'
    }
  },

  // Somnia-specific contract addresses
  CONTRACTS: {
    MULTICALL_V3: '0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223',
    DIA_ORACLE: '0xbA0E0750A56e995506CA458b2BdD752754CF39C4',
    // Add deployed contract addresses here after deployment
    NFTFLOW_OPTIMIZED: '',
    PAYMENT_STREAM_SOMNIA: '',
    REPUTATION_SYSTEM: '',
    PRICE_ORACLE: ''
  },

  // Somnia performance characteristics
  PERFORMANCE: {
    MAX_TPS: 1000000, // 1M+ TPS
    TARGET_BLOCK_TIME: 100, // Sub-second finality (100ms)
    MIN_GAS_PRICE: 0.000001, // Sub-cent fees
    MAX_GAS_LIMIT: 30000000, // High gas limit for complex operations
    BATCH_SIZE_LIMIT: 1000 // Maximum operations per batch
  },

  // Rental configuration optimized for Somnia
  RENTAL_CONFIG: {
    MIN_DURATION: 60, // 1 minute minimum
    MAX_DURATION: 2592000, // 30 days maximum
    MIN_PRICE_PER_SECOND: 0.000001, // Minimum viable price
    MAX_PRICE_PER_SECOND: 0.01, // Prevent excessive pricing
    DEFAULT_COLLATERAL_MULTIPLIER: 1.0, // 100% collateral for new users
    REPUTATION_THRESHOLDS: {
      NO_COLLATERAL: 800, // High reputation users
      LOW_COLLATERAL: 600, // Medium reputation users
      MEDIUM_COLLATERAL: 400, // Low reputation users
      HIGH_COLLATERAL: 100 // Very low reputation users
    }
  },

  // Payment streaming configuration
  STREAMING_CONFIG: {
    MIN_STREAM_AMOUNT: 0.000001, // Minimum stream amount
    MAX_STREAM_DURATION: 31536000, // 1 year maximum
    MIN_STREAM_DURATION: 60, // 1 minute minimum
    PROTOCOL_FEE_PERCENTAGE: 250, // 2.5%
    RELEASE_INTERVAL: 1, // Release every second
    BATCH_RELEASE_LIMIT: 50 // Maximum streams per batch
  },

  // Real-time update intervals (leverage Somnia's speed)
  UPDATE_INTERVALS: {
    BLOCK_MONITORING: 100, // Monitor every 100ms
    STATS_REFRESH: 2000, // Refresh stats every 2 seconds
    RENTAL_UPDATES: 1000, // Update rentals every second
    PAYMENT_STREAMS: 500, // Update payment streams every 500ms
    NETWORK_METRICS: 1000 // Update network metrics every second
  },

  // Utility types for NFT categorization
  UTILITY_TYPES: {
    GAMING: 1,
    ART: 2,
    METAVERSE: 3,
    MUSIC: 4,
    SPORTS: 5,
    COLLECTIBLES: 6,
    UTILITY: 7,
    ACCESS: 8,
    MEMBERSHIP: 9,
    OTHER: 10
  },

  // Stream types for payment categorization
  STREAM_TYPES: {
    RENTAL: 1,
    SUBSCRIPTION: 2,
    STAKING_REWARD: 3,
    GOVERNANCE_REWARD: 4,
    REFERRAL_BONUS: 5,
    LIQUIDITY_REWARD: 6,
    OTHER: 7
  },

  // Somnia-specific features
  FEATURES: {
    ENABLE_REAL_TIME_UPDATES: true,
    ENABLE_BATCH_OPERATIONS: true,
    ENABLE_MICRO_PAYMENTS: true,
    ENABLE_HIGH_FREQUENCY_TRADING: true,
    ENABLE_REAL_TIME_ANALYTICS: true,
    ENABLE_SUB_SECOND_FINALITY: true
  },

  // API endpoints for Somnia services
  API_ENDPOINTS: {
    BLOCK_EXPLORER: 'https://shannon-explorer.somnia.network/api',
    PRICE_FEED: 'https://api.somnia.network/price',
    NETWORK_STATS: 'https://api.somnia.network/stats',
    TRANSACTION_HISTORY: 'https://api.somnia.network/tx'
  },

  // Error messages optimized for Somnia
  ERROR_MESSAGES: {
    INSUFFICIENT_GAS: 'Transaction requires more gas for Somnia network',
    NETWORK_CONGESTION: 'Somnia network is experiencing high load',
    INVALID_CHAIN: 'Please switch to Somnia network',
    TRANSACTION_FAILED: 'Transaction failed on Somnia network',
    CONTRACT_NOT_DEPLOYED: 'Contract not deployed on Somnia network'
  },

  // Success messages
  SUCCESS_MESSAGES: {
    TRANSACTION_CONFIRMED: 'Transaction confirmed on Somnia network',
    RENTAL_STARTED: 'NFT rental started successfully',
    PAYMENT_STREAMED: 'Payment streamed in real-time',
    REPUTATION_UPDATED: 'Reputation updated on Somnia network'
  }
};

// Helper functions for Somnia integration
export const SomniaUtils = {
  // Check if current network is Somnia
  isSomniaNetwork: (chainId: number): boolean => {
    return chainId === SOMNIA_CONFIG.NETWORKS.TESTNET.chainId || 
           chainId === SOMNIA_CONFIG.NETWORKS.MAINNET.chainId;
  },

  // Get network configuration by chain ID
  getNetworkConfig: (chainId: number) => {
    if (chainId === SOMNIA_CONFIG.NETWORKS.TESTNET.chainId) {
      return SOMNIA_CONFIG.NETWORKS.TESTNET;
    } else if (chainId === SOMNIA_CONFIG.NETWORKS.MAINNET.chainId) {
      return SOMNIA_CONFIG.NETWORKS.MAINNET;
    }
    return null;
  },

  // Format gas price for Somnia (very low)
  formatGasPrice: (gasPrice: bigint): string => {
    const gwei = Number(gasPrice) / 1e9;
    if (gwei < 0.001) {
      return `${(gwei * 1000).toFixed(3)} mGwei`;
    }
    return `${gwei.toFixed(3)} Gwei`;
  },

  // Calculate optimal gas limit for Somnia operations
  calculateGasLimit: (operationType: string): number => {
    const gasLimits = {
      'rental': 200000,
      'stream': 150000,
      'batch': 500000,
      'reputation': 100000,
      'default': 100000
    };
    return gasLimits[operationType as keyof typeof gasLimits] || gasLimits.default;
  },

  // Get utility type name
  getUtilityTypeName: (type: number): string => {
    const types = [
      'Unknown', 'Gaming', 'Art', 'Metaverse', 'Music', 
      'Sports', 'Collectibles', 'Utility', 'Access', 'Membership', 'Other'
    ];
    return types[type] || 'Unknown';
  },

  // Get stream type name
  getStreamTypeName: (type: number): string => {
    const types = [
      'Unknown', 'Rental', 'Subscription', 'Staking Reward', 
      'Governance Reward', 'Referral Bonus', 'Liquidity Reward', 'Other'
    ];
    return types[type] || 'Unknown';
  },

  // Validate rental parameters for Somnia
  validateRentalParams: (duration: number, pricePerSecond: number): boolean => {
    return duration >= SOMNIA_CONFIG.RENTAL_CONFIG.MIN_DURATION &&
           duration <= SOMNIA_CONFIG.RENTAL_CONFIG.MAX_DURATION &&
           pricePerSecond >= SOMNIA_CONFIG.RENTAL_CONFIG.MIN_PRICE_PER_SECOND &&
           pricePerSecond <= SOMNIA_CONFIG.RENTAL_CONFIG.MAX_PRICE_PER_SECOND;
  },

  // Calculate collateral requirement based on reputation
  calculateCollateral: (reputation: number, baseAmount: number): number => {
    const thresholds = SOMNIA_CONFIG.RENTAL_CONFIG.REPUTATION_THRESHOLDS;
    
    if (reputation >= thresholds.NO_COLLATERAL) return 0;
    if (reputation >= thresholds.LOW_COLLATERAL) return baseAmount * 0.25;
    if (reputation >= thresholds.MEDIUM_COLLATERAL) return baseAmount * 0.5;
    if (reputation >= thresholds.HIGH_COLLATERAL) return baseAmount * 0.75;
    return baseAmount; // 100% collateral for very low reputation
  },

  // Format duration for display
  formatDuration: (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  },

  // Format price for display
  formatPrice: (pricePerSecond: number): string => {
    if (pricePerSecond < 0.000001) {
      return `${(pricePerSecond * 1000000).toFixed(2)}μ STT/s`;
    }
    return `${pricePerSecond.toFixed(6)} STT/s`;
  }
};

export default SOMNIA_CONFIG;
