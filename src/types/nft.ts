// NFT and Stream type definitions for Somnia NFTFlow

export interface NFT {
  id: string;
  name: string;
  description?: string;
  image: string;
  collection: string;
  pricePerSecond: number;
  isRented: boolean;
  owner: string;
  rarity: string;
  utilityType: string;
  listingId?: string;
  nftContract?: string;
  tokenId?: string;
  collateralRequired?: number;
  minDuration?: number;
  maxDuration?: number;
  timeLeft?: string;
}

export interface UserNFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  pricePerSecond: number;
  isRented: boolean;
  owner: string;
  rarity: string;
  utilityType: string;
  isApproved: boolean;
  isListed: boolean;
}

export interface NFTItem {
  id: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  pricePerSecond: number;
  isRented: boolean;
  owner: string;
  rarity: string;
  utilityType: string;
  tokenId?: string;
  isApproved?: boolean;
  isListed?: boolean;
  listingId?: string;
  collateralRequired?: number;
}

export interface PaymentStreamData {
  id: string;
  sender: string;
  recipient: string;
  deposit: string;
  ratePerSecond: string;
  startTime: string;
  stopTime: string;
  remainingBalance: string;
  active: boolean;
  balance?: string;
  streamId?: string;
  totalAmount?: string;
  streamedAmount?: string;
  endTime?: string;
  isActive?: boolean;
}

export interface Stream {
  streamId: string;
  sender: string;
  recipient: string;
  deposit: string;
  ratePerSecond: string;
  startTime: string;
  stopTime: string;
  remainingBalance: string;
  active: boolean;
  balance?: string;
}

export type BulkOperationType = 'list' | 'rent' | 'unlist' | 'update_price' | 'delete';

export interface NFTFormData {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

export interface ListingFormData {
  tokenId: string;
  pricePerSecond: string;
  minDuration: string;
  maxDuration: string;
  collateralRequired: string;
}