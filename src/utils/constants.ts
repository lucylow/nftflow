/**
 * Application constants
 */

// Ethereum constants
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Network constants
export const SOMNIA_CHAIN_ID = 50312;
export const ETHEREUM_CHAIN_ID = 1;
export const POLYGON_CHAIN_ID = 137;

// Gas constants
export const DEFAULT_GAS_LIMIT = 300000;
export const HIGH_GAS_LIMIT = 500000;

// Time constants (in seconds)
export const SECOND = 1;
export const MINUTE = 60;
export const HOUR = 3600;
export const DAY = 86400;
export const WEEK = 604800;
export const MONTH = 2592000;
export const YEAR = 31536000;

// Default values
export const DEFAULT_PRICE_PER_SECOND = '0.000001'; // 0.0036 STT per hour
export const DEFAULT_MIN_DURATION = HOUR; // 1 hour
export const DEFAULT_MAX_DURATION = MONTH; // 30 days
export const DEFAULT_COLLATERAL_MULTIPLIER = 1.0;

// Platform fees (in basis points)
export const PLATFORM_FEE_BPS = 250; // 2.5%
export const CREATOR_ROYALTY_BPS = 100; // 1%

// Reputation system
export const REPUTATION_TIERS = {
  NEWBIE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
  DIAMOND: 5
} as const;

export const REPUTATION_THRESHOLDS = {
  [REPUTATION_TIERS.NEWBIE]: 0,
  [REPUTATION_TIERS.BRONZE]: 10,
  [REPUTATION_TIERS.SILVER]: 50,
  [REPUTATION_TIERS.GOLD]: 100,
  [REPUTATION_TIERS.PLATINUM]: 250,
  [REPUTATION_TIERS.DIAMOND]: 500
} as const;

// UI constants
export const ANIMATION_DURATION = 300;
export const DEBOUNCE_DELAY = 500;
export const TOAST_DURATION = 5000;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
export const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL || '';

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  INVALID_ADDRESS: 'Invalid address format',
  INVALID_AMOUNT: 'Invalid amount',
  CONTRACT_NOT_DEPLOYED: 'Contract not deployed on this network',
  USER_REJECTED: 'Transaction rejected by user'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRANSACTION_SUCCESS: 'Transaction completed successfully',
  NFT_LISTED: 'NFT listed for rental successfully',
  RENTAL_STARTED: 'Rental started successfully',
  RENTAL_COMPLETED: 'Rental completed successfully'
} as const;
