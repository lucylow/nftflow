// Real Data Service for NFTFlow - Fetches data from smart contracts
import { ethers } from 'ethers';
import { 
  getProvider, 
  getNFTFlowContract, 
  getPaymentStreamContract, 
  getReputationSystemContract,
  getMockPriceOracleContract,
  formatEther,
  parseEther,
  CONTRACT_ADDRESSES
} from '@/lib/web3';

export interface RealNFTData {
  id: string;
  tokenId: string;
  listingId: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  category: string;
  utilityType: string;
  pricePerSecond: number;
  minDuration: number;
  maxDuration: number;
  collateralRequired: number;
  isRented: boolean;
  owner: string;
  renter?: string;
  timeLeft?: string;
  rarity: string;
  rentalStartTime?: string;
  totalCost?: number;
  rentalCount?: number;
  totalEarned?: number;
  lastRented?: string;
  contractAddress: string;
  attributes: Array<{ trait_type: string; value: any }>;
  stats?: any;
  compatibleGames?: string[];
  social?: {
    likes: number;
    views: number;
    shares: number;
  };
}

export interface RentalData {
  rentalId: string;
  nftContract: string;
  tokenId: string;
  owner: string;
  renter: string;
  pricePerSecond: number;
  startTime: number;
  endTime: number;
  collateralAmount: number;
  streamId: number;
  state: number;
  createdAt: number;
  lastUpdated: number;
}

export interface StreamData {
  streamId: string;
  sender: string;
  recipient: string;
  deposit: number;
  ratePerSecond: number;
  startTime: number;
  stopTime: number;
  remainingBalance: number;
  totalWithdrawn: number;
  active: boolean;
  finalized: boolean;
  platformFeeAmount: number;
  creatorRoyaltyAmount: number;
  creatorAddress: string;
}

export interface ReputationData {
  score: number;
  totalRentals: number;
  successfulRentals: number;
  lastUpdate: number;
  isWhitelisted: boolean;
  isBlacklisted: boolean;
  collateralMultiplier: number;
}

class RealDataService {
  private provider: ethers.Provider | null = null;
  private nftFlowContract: ethers.Contract | null = null;
  private paymentStreamContract: ethers.Contract | null = null;
  private reputationSystemContract: ethers.Contract | null = null;
  private priceOracleContract: ethers.Contract | null = null;

  // Initialize contracts
  async initialize(): Promise<void> {
    try {
      this.provider = getProvider();
      this.nftFlowContract = await getNFTFlowContract();
      this.paymentStreamContract = await getPaymentStreamContract();
      this.reputationSystemContract = await getReputationSystemContract();
      this.priceOracleContract = await getMockPriceOracleContract();
      
      console.log('✅ RealDataService initialized with contracts');
    } catch (error) {
      console.error('❌ Failed to initialize RealDataService:', error);
      throw error;
    }
  }

  // Check if service is ready
  isReady(): boolean {
    return !!(
      this.provider &&
      this.nftFlowContract &&
      this.paymentStreamContract &&
      this.reputationSystemContract &&
      this.priceOracleContract
    );
  }

  // Get user's reputation data
  async getUserReputation(userAddress: string): Promise<ReputationData | null> {
    if (!this.reputationSystemContract) return null;

    try {
      const reputationData = await this.reputationSystemContract.getReputationData(userAddress);
      return {
        score: Number(reputationData.score),
        totalRentals: Number(reputationData.totalRentals),
        successfulRentals: Number(reputationData.successfulRentals),
        lastUpdate: Number(reputationData.lastUpdate),
        isWhitelisted: reputationData.isWhitelisted,
        isBlacklisted: reputationData.isBlacklisted,
        collateralMultiplier: Number(reputationData.collateralMultiplier)
      };
    } catch (error) {
      console.error('Failed to get user reputation:', error);
      return null;
    }
  }

  // Get user's collateral balance
  async getUserCollateralBalance(userAddress: string): Promise<number> {
    if (!this.nftFlowContract) return 0;

    try {
      const balance = await this.nftFlowContract.userCollateralBalance(userAddress);
      return Number(formatEther(balance));
    } catch (error) {
      console.error('Failed to get collateral balance:', error);
      return 0;
    }
  }

  // Get user's payment streams
  async getUserStreams(userAddress: string): Promise<StreamData[]> {
    if (!this.paymentStreamContract) return [];

    try {
      const senderStreams = await this.paymentStreamContract.getSenderStreams(userAddress);
      const recipientStreams = await this.paymentStreamContract.getRecipientStreams(userAddress);
      
      const allStreamIds = [...senderStreams, ...recipientStreams];
      const uniqueStreamIds = [...new Set(allStreamIds.map(id => Number(id)))];
      
      const streams: StreamData[] = [];
      
      for (const streamId of uniqueStreamIds) {
        try {
          const streamData = await this.paymentStreamContract.getStreamDetails(streamId);
          streams.push({
            streamId: streamId.toString(),
            sender: streamData.sender,
            recipient: streamData.recipient,
            deposit: Number(formatEther(streamData.deposit)),
            ratePerSecond: Number(formatEther(streamData.ratePerSecond)),
            startTime: Number(streamData.startTime),
            stopTime: Number(streamData.stopTime),
            remainingBalance: Number(formatEther(streamData.remainingBalance)),
            totalWithdrawn: Number(formatEther(streamData.totalWithdrawn)),
            active: streamData.active,
            finalized: streamData.finalized,
            platformFeeAmount: Number(formatEther(streamData.platformFeeAmount)),
            creatorRoyaltyAmount: Number(formatEther(streamData.creatorRoyaltyAmount)),
            creatorAddress: streamData.creatorAddress
          });
        } catch (streamError) {
          console.warn(`Failed to get stream ${streamId}:`, streamError);
        }
      }
      
      return streams;
    } catch (error) {
      console.error('Failed to get user streams:', error);
      return [];
    }
  }

  // Get marketplace statistics from contracts
  async getMarketplaceStats(): Promise<{
    totalListings: number;
    totalRentals: number;
    totalVolume: number;
    avgPricePerSecond: number;
    platformFeePercentage: number;
    creatorRoyaltyPercentage: number;
  }> {
    if (!this.nftFlowContract) {
      return {
        totalListings: 0,
        totalRentals: 0,
        totalVolume: 0,
        avgPricePerSecond: 0,
        platformFeePercentage: 0,
        creatorRoyaltyPercentage: 0
      };
    }

    try {
      const [
        nextRentalId,
        platformFeePercentage,
        creatorRoyaltyPercentage
      ] = await Promise.all([
        this.nftFlowContract.nextRentalId(),
        this.nftFlowContract.platformFeePercentage(),
        this.nftFlowContract.creatorRoyaltyPercentage()
      ]);

      // Note: Getting exact counts would require events or additional contract methods
      // For now, we'll return the next rental ID as an approximation
      return {
        totalListings: 0, // Would need to track listing events
        totalRentals: Number(nextRentalId),
        totalVolume: 0, // Would need to track payment events
        avgPricePerSecond: 0, // Would need to calculate from listings
        platformFeePercentage: Number(platformFeePercentage),
        creatorRoyaltyPercentage: Number(creatorRoyaltyPercentage)
      };
    } catch (error) {
      console.error('Failed to get marketplace stats:', error);
      return {
        totalListings: 0,
        totalRentals: 0,
        totalVolume: 0,
        avgPricePerSecond: 0,
        platformFeePercentage: 0,
        creatorRoyaltyPercentage: 0
      };
    }
  }

  // Get rental data by ID
  async getRental(rentalId: number): Promise<RentalData | null> {
    if (!this.nftFlowContract) return null;

    try {
      const rentalData = await this.nftFlowContract.getRental(rentalId);
      return {
        rentalId: rentalId.toString(),
        nftContract: rentalData.nftContract,
        tokenId: rentalData.tokenId.toString(),
        owner: rentalData.owner,
        renter: rentalData.renter,
        pricePerSecond: Number(formatEther(rentalData.pricePerSecond)),
        startTime: Number(rentalData.startTime),
        endTime: Number(rentalData.endTime),
        collateralAmount: Number(formatEther(rentalData.collateralAmount)),
        streamId: Number(rentalData.streamId),
        state: Number(rentalData.state),
        createdAt: Number(rentalData.createdAt),
        lastUpdated: Number(rentalData.lastUpdated)
      };
    } catch (error) {
      console.error('Failed to get rental:', error);
      return null;
    }
  }

  // Get stream data by ID
  async getStream(streamId: number): Promise<StreamData | null> {
    if (!this.paymentStreamContract) return null;

    try {
      const streamData = await this.paymentStreamContract.getStreamDetails(streamId);
      return {
        streamId: streamId.toString(),
        sender: streamData.sender,
        recipient: streamData.recipient,
        deposit: Number(formatEther(streamData.deposit)),
        ratePerSecond: Number(formatEther(streamData.ratePerSecond)),
        startTime: Number(streamData.startTime),
        stopTime: Number(streamData.stopTime),
        remainingBalance: Number(formatEther(streamData.remainingBalance)),
        totalWithdrawn: Number(formatEther(streamData.totalWithdrawn)),
        active: streamData.active,
        finalized: streamData.finalized,
        platformFeeAmount: Number(formatEther(streamData.platformFeeAmount)),
        creatorRoyaltyAmount: Number(formatEther(streamData.creatorRoyaltyAmount)),
        creatorAddress: streamData.creatorAddress
      };
    } catch (error) {
      console.error('Failed to get stream:', error);
      return null;
    }
  }

  // Get user's active rentals
  async getUserActiveRentals(userAddress: string): Promise<RentalData[]> {
    // This would require tracking rental events or having a mapping in the contract
    // For now, we'll return an empty array as this would need contract modifications
    return [];
  }

  // Get user's rental history
  async getUserRentalHistory(userAddress: string): Promise<RentalData[]> {
    // This would require tracking rental events
    // For now, we'll return an empty array
    return [];
  }

  // Get available listings
  async getAvailableListings(): Promise<any[]> {
    // This would require tracking listing events or having a mapping in the contract
    // For now, we'll return an empty array
    return [];
  }

  // Get NFT metadata from contract (if available)
  async getNFTMetadata(contractAddress: string, tokenId: string): Promise<{
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: any }>;
  } | null> {
    try {
      // This would require the NFT contract to implement tokenURI
      // For now, we'll return null as it depends on the specific NFT contract
      return null;
    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      return null;
    }
  }

  // Get platform fees and royalties
  async getPlatformFees(): Promise<{
    totalPlatformFees: number;
    totalCreatorRoyalties: number;
  }> {
    if (!this.paymentStreamContract) {
      return { totalPlatformFees: 0, totalCreatorRoyalties: 0 };
    }

    try {
      const [totalPlatformFees, totalCreatorRoyalties] = await Promise.all([
        this.paymentStreamContract.getTotalPlatformFees(),
        this.paymentStreamContract.getTotalCreatorRoyalties()
      ]);

      return {
        totalPlatformFees: Number(formatEther(totalPlatformFees)),
        totalCreatorRoyalties: Number(formatEther(totalCreatorRoyalties))
      };
    } catch (error) {
      console.error('Failed to get platform fees:', error);
      return { totalPlatformFees: 0, totalCreatorRoyalties: 0 };
    }
  }

  // Get user's earnings from streams
  async getUserEarnings(userAddress: string): Promise<{
    totalEarned: number;
    totalSpent: number;
    netEarnings: number;
  }> {
    const streams = await this.getUserStreams(userAddress);
    
    let totalEarned = 0;
    let totalSpent = 0;

    for (const stream of streams) {
      if (stream.recipient.toLowerCase() === userAddress.toLowerCase()) {
        totalEarned += stream.totalWithdrawn;
      }
      if (stream.sender.toLowerCase() === userAddress.toLowerCase()) {
        totalSpent += stream.deposit - stream.remainingBalance;
      }
    }

    return {
      totalEarned,
      totalSpent,
      netEarnings: totalEarned - totalSpent
    };
  }

  // Get real-time data for dashboard
  async getDashboardData(userAddress: string): Promise<{
    reputation: ReputationData | null;
    collateralBalance: number;
    streams: StreamData[];
    earnings: { totalEarned: number; totalSpent: number; netEarnings: number };
    marketplaceStats: any;
  }> {
    if (!this.isReady()) {
      await this.initialize();
    }

    const [reputation, collateralBalance, streams, earnings, marketplaceStats] = await Promise.all([
      this.getUserReputation(userAddress),
      this.getUserCollateralBalance(userAddress),
      this.getUserStreams(userAddress),
      this.getUserEarnings(userAddress),
      this.getMarketplaceStats()
    ]);

    return {
      reputation,
      collateralBalance,
      streams,
      earnings,
      marketplaceStats
    };
  }
}

// Export singleton instance
export const realDataService = new RealDataService();
export default realDataService;
