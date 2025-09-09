// Somnia Network Configuration for NFTFlow
export const SOMNIA_CONFIG = {
  MAINNET: {
    chainId: 5031,
    rpcUrl: 'https://api.infra.mainnet.somnia.network/',
    wsUrl: 'wss://api.infra.mainnet.somnia.network/ws',
    blockExplorer: 'https://explorer.somnia.network',
    currency: {
      name: 'Somnia',
      symbol: 'SOMI',
      decimals: 18
    }
  },
  TESTNET: {
    chainId: 50312,
    rpcUrl: 'https://dream-rpc.somnia.network/',
    wsUrl: 'wss://dream-rpc.somnia.network/ws',
    blockExplorer: 'https://shannon-explorer.somnia.network/',
    currency: {
      name: 'Somnia Test Token',
      symbol: 'STT',
      decimals: 18
    }
  },
  CONTRACTS: {
    MULTICALL_V3: {
      mainnet: '0x5e44F178E8cF9B2F5409B6f18ce936aB817C5a11',
      testnet: '0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223'
    },
    DIA_ORACLE: '0xbA0E0750A56e995506CA458b2BdD752754CF39C4',
    NFTFLOW_CORE: process.env.NFTFLOW_CONTRACT_ADDRESS,
    PAYMENT_STREAM: process.env.PAYMENT_STREAM_CONTRACT_ADDRESS,
    REPUTATION_SYSTEM: process.env.REPUTATION_SYSTEM_CONTRACT_ADDRESS,
    NFT_UTILITY_GAMIFICATION: process.env.NFT_UTILITY_GAMIFICATION_ADDRESS,
    NFT_SOCIAL_FEATURES: process.env.NFT_SOCIAL_FEATURES_ADDRESS,
    SOMNIA_OPTIMIZED_FEATURES: process.env.SOMNIA_OPTIMIZED_FEATURES_ADDRESS
  },
  PERFORMANCE: {
    maxTPS: 1000000,
    avgBlockTime: 800, // milliseconds
    maxBlockConfirmations: 3,
    connectionPoolSize: 50,
    keepAliveInterval: 30000,
    batchSize: 100,
    maxRetries: 5,
    retryDelay: 1000
  },
  FEATURES: {
    microTransactions: true,
    realTimeStreaming: true,
    highFrequencyEvents: true,
    subSecondFinality: true,
    lowFees: true
  }
};

// Somnia-specific ABI fragments
export const SOMNIA_ABIS = {
  MULTICALL_V3: [
    "function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)"
  ],
  DIA_ORACLE: [
    "function getPrice(address nftContract, uint256 tokenId) view returns (uint256)",
    "function updatePrice(address nftContract, uint256 tokenId, uint256 price)"
  ],
  NFTFLOW_CORE: [
    "event NFTRented(bytes32 indexed rentalId, address indexed nftContract, uint256 indexed tokenId, address lender, address tenant, uint256 startTime, uint256 endTime, uint256 totalPrice, address paymentStream)",
    "event RentalCompleted(bytes32 indexed rentalId, address indexed tenant, bool successful)",
    "event RentalListed(bytes32 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address owner, uint256 pricePerSecond)",
    "function rentNFT(bytes32 listingId, uint256 duration) payable",
    "function listForRental(address nftContract, uint256 tokenId, uint256 pricePerSecond, uint256 minDuration, uint256 maxDuration, uint256 collateralRequired)",
    "function completeRental(bytes32 rentalId)"
  ],
  PAYMENT_STREAM: [
    "event StreamCreated(address indexed streamId, address indexed payer, address indexed payee, uint256 totalAmount, uint256 startTime, uint256 endTime)",
    "event FundsReleased(address indexed streamId, uint256 amount)",
    "function createStream(address recipient, uint256 startTime, uint256 stopTime) payable returns (uint256)",
    "function withdrawFromStream(uint256 streamId, uint256 amount)"
  ]
};

export default SOMNIA_CONFIG;
