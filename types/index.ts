/**
 * Common type definitions for NFTFlow backend
 */

export interface EventLog {
  blockNumber: bigint;
  transactionHash: string;
  logIndex: number;
  args: any;
}

export interface JobData {
  type: string;
  payload: any;
  priority?: number;
  delay?: number;
}

export interface ConfigValue {
  value: number;
  minValue: number;
  maxValue: number;
  updatedAt: number;
  updatedBy: string;
  description: string;
}

export interface UserProfile {
  address: string;
  reputation_score: number;
  total_rentals: number;
  successful_rentals: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface NFTListing {
  id: string;
  chain_id: number;
  nft_contract: string;
  token_id: string;
  owner: string;
  price_per_second: number;
  min_duration: number;
  max_duration: number;
  collateral_multiplier: number;
  verified: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  as_of_block: number;
}

export interface Rental {
  id: string;
  listing_id: string;
  renter: string;
  lender: string;
  start_time: string;
  end_time: string;
  status: 'requested' | 'active' | 'completed' | 'cancelled' | 'disputed';
  total_price: number;
  collateral_amount: number;
  released_amount: number;
  created_at: string;
  updated_at: string;
  as_of_block: number;
}

export interface Stream {
  id: string;
  rental_id: string;
  lender: string;
  renter: string;
  total_amount: number;
  released_amount: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  as_of_block: number;
}

export interface NFTMetadata {
  id: string;
  chain_id: number;
  nft_contract: string;
  token_id: string;
  name?: string;
  description?: string;
  image_url?: string;
  animation_url?: string;
  attributes?: any[];
  metadata_uri?: string;
  cached_at: string;
}

export interface DailyMetrics {
  date: string;
  total_listings: number;
  active_listings: number;
  total_rentals: number;
  active_rentals: number;
  completed_rentals: number;
  total_volume: number;
  platform_fees: number;
  avg_rental_duration: string;
  unique_users: number;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CacheStats {
  memory: any;
  keyspace: any;
  info: any;
}

export interface StorageResult {
  cid: string;
  arweaveId?: string;
  uris: string[];
}
