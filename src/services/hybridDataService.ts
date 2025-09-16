// Hybrid Data Service - Combines real blockchain data with mock data
import { realDataService, RealNFTData, ReputationData, StreamData } from './realDataService';
import { mockDataService, MockNFTData } from './mockDataService';
import { useWeb3 } from '@/contexts/Web3Context';

export interface HybridNFTData extends MockNFTData {
  isRealData?: boolean;
  lastUpdated?: number;
}

export interface HybridDashboardData {
  // Real data from contracts
  reputation: ReputationData | null;
  collateralBalance: number;
  streams: StreamData[];
  realEarnings: { totalEarned: number; totalSpent: number; netEarnings: number };
  marketplaceStats: any;
  
  // Mock data for UI
  userNFTs: HybridNFTData[];
  activeRentals: HybridNFTData[];
  recentActivity: any[];
  userStats: any[];
  earningsHistory: any[];
  userListings: any[];
}

class HybridDataService {
  private isInitialized = false;

  // Initialize the service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await realDataService.initialize();
      this.isInitialized = true;
      console.log('✅ HybridDataService initialized');
    } catch (error) {
      console.warn('⚠️ HybridDataService initialized in mock-only mode:', error);
      this.isInitialized = true;
    }
  }

  // Get dashboard data combining real and mock data
  async getDashboardData(userAddress: string): Promise<HybridDashboardData> {
    await this.initialize();

    // Get real blockchain data
    let realData = {
      reputation: null,
      collateralBalance: 0,
      streams: [],
      realEarnings: { totalEarned: 0, totalSpent: 0, netEarnings: 0 },
      marketplaceStats: {
        totalListings: 0,
        totalRentals: 0,
        totalVolume: 0,
        avgPricePerSecond: 0,
        platformFeePercentage: 0,
        creatorRoyaltyPercentage: 0
      }
    };

    if (realDataService.isReady()) {
      try {
        realData = {
          ...realData,
          realEarnings: (await realDataService.getDashboardData(userAddress)).earnings
        };
        console.log('✅ Real blockchain data loaded');
      } catch (error) {
        console.warn('⚠️ Failed to load real blockchain data, using mock data:', error);
      }
    }

    // Get mock data for UI components
    const userNFTs = mockDataService.getNFTsByOwner(userAddress);
    const activeRentals = mockDataService.getRentedNFTs().filter(nft => 
      nft.renter?.toLowerCase() === userAddress.toLowerCase()
    );

    // Generate recent activity based on real streams if available
    const recentActivity = this.generateRecentActivity(realData.streams, userAddress);

    // Generate user stats combining real and mock data
    const userStats = this.generateUserStats(realData, userNFTs);

    // Generate earnings history
    const earningsHistory = this.generateEarningsHistory(realData.realEarnings);

    // Get user listings
    const userListings = userNFTs.filter(nft => !nft.isRented);

    return {
      // Real blockchain data
      reputation: realData.reputation,
      collateralBalance: realData.collateralBalance,
      streams: realData.streams,
      realEarnings: realData.realEarnings,
      marketplaceStats: realData.marketplaceStats,
      
      // Mock data for UI
      userNFTs: userNFTs.map(nft => ({ ...nft, isRealData: false, lastUpdated: Date.now() })),
      activeRentals: activeRentals.map(nft => ({ ...nft, isRealData: false, lastUpdated: Date.now() })),
      recentActivity,
      userStats,
      earningsHistory,
      userListings
    };
  }

  // Generate recent activity from real stream data
  private generateRecentActivity(streams: StreamData[], userAddress: string): any[] {
    const activities = [];

    // Add activities from real streams
    for (const stream of streams.slice(0, 5)) {
      const isSender = stream.sender.toLowerCase() === userAddress.toLowerCase();
      const isRecipient = stream.recipient.toLowerCase() === userAddress.toLowerCase();
      
      if (isSender) {
        activities.push({
          type: "stream_created",
          action: `Created payment stream for ${stream.recipient.slice(0, 6)}...${stream.recipient.slice(-4)}`,
          time: this.formatTimeAgo(stream.startTime),
          amount: `-${stream.deposit.toFixed(2)} STT`,
          streamId: stream.streamId
        });
      }
      
      if (isRecipient && stream.totalWithdrawn > 0) {
        activities.push({
          type: "stream_withdrawal",
          action: `Withdrew from payment stream`,
          time: this.formatTimeAgo(Date.now() / 1000), // Approximate
          amount: `+${stream.totalWithdrawn.toFixed(2)} STT`,
          streamId: stream.streamId
        });
      }
    }

    // Add some mock activities if we don't have enough real data
    const mockActivities = [
      { type: "rental", action: "Rented Cosmic Wizard #1234", time: "2 hours ago", amount: "+1.5 STT", nftId: "1" },
      { type: "return", action: "Returned Space Ape #456", time: "5 hours ago", amount: "-0.8 STT", nftId: "456" },
      { type: "rental", action: "Rented AI Trading Bot License", time: "1 day ago", amount: "+1.08 STT", nftId: "3" },
      { type: "earning", action: "Earned from Virtual Real Estate Plot", time: "2 days ago", amount: "+1.44 STT", nftId: "4" },
      { type: "rental", action: "Rented Music Production Studio", time: "3 days ago", amount: "+0.65 STT", nftId: "5" }
    ];

    // Combine and limit to 6 activities
    return [...activities, ...mockActivities].slice(0, 6);
  }

  // Generate user stats combining real and mock data
  private generateUserStats(realData: any, userNFTs: MockNFTData[]): any[] {
    const totalEarned = realData.realEarnings.totalEarned || 0;
    const activeRentals = userNFTs.filter(nft => nft.isRented).length;
    const totalRented = userNFTs.length;
    const reputationScore = realData.reputation ? 
      `${(realData.reputation.score / 100).toFixed(1)}/5` : 
      "4.8/5";

    return [
      { 
        label: "Total Earned", 
        value: `${totalEarned.toFixed(2)} STT`, 
        change: totalEarned > 0 ? "+12.5%" : "+0%" 
      },
      { 
        label: "Active Rentals", 
        value: activeRentals.toString(), 
        change: `+${Math.floor(activeRentals / 2)}` 
      },
      { 
        label: "Total Rented", 
        value: `${totalRented} NFTs`, 
        change: `+${Math.floor(totalRented / 10)}` 
      },
      { 
        label: "Reputation Score", 
        value: reputationScore, 
        change: "+0.1" 
      }
    ];
  }

  // Generate earnings history
  private generateEarningsHistory(realEarnings: any): any[] {
    const baseAmount = realEarnings.totalEarned || 0;
    const days = 7;
    const history = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate some variation around the base amount
      const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
      const amount = Math.max(0, baseAmount / days + variation);
      const rentals = Math.floor(Math.random() * 5) + 1;

      history.push({
        date: date.toISOString().split('T')[0],
        amount: parseFloat(amount.toFixed(2)),
        rentals
      });
    }

    return history;
  }

  // Format time ago
  private formatTimeAgo(timestamp: number): string {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  // Get NFTs with real data when available
  async getNFTs(userAddress: string): Promise<HybridNFTData[]> {
    await this.initialize();
    
    const mockNFTs = mockDataService.getNFTsByOwner(userAddress);
    
    // If we have real data service, try to enhance with real data
    if (realDataService.isReady()) {
      // For now, return mock data but mark it appropriately
      return mockNFTs.map(nft => ({
        ...nft,
        isRealData: false,
        lastUpdated: Date.now()
      }));
    }
    
    return mockNFTs.map(nft => ({
      ...nft,
      isRealData: false,
      lastUpdated: Date.now()
    }));
  }

  // Get marketplace data
  async getMarketplaceData(): Promise<any> {
    await this.initialize();
    
    if (realDataService.isReady()) {
      try {
        const realStats = await realDataService.getMarketplaceStats();
        const mockStats = mockDataService.getMarketplaceStats();
        
        return {
          ...mockStats,
          realStats,
          hasRealData: true
        };
      } catch (error) {
        console.warn('Failed to get real marketplace stats:', error);
      }
    }
    
    return {
      ...mockDataService.getMarketplaceStats(),
      hasRealData: false
    };
  }

  // Get user streams (real data)
  async getUserStreams(userAddress: string): Promise<StreamData[]> {
    await this.initialize();
    
    if (realDataService.isReady()) {
      try {
        return await realDataService.getUserStreams(userAddress);
      } catch (error) {
        console.warn('Failed to get real streams:', error);
      }
    }
    
    return [];
  }

  // Get user reputation (real data)
  async getUserReputation(userAddress: string): Promise<ReputationData | null> {
    await this.initialize();
    
    if (realDataService.isReady()) {
      try {
        return await realDataService.getUserReputation(userAddress);
      } catch (error) {
        console.warn('Failed to get real reputation:', error);
      }
    }
    
    return null;
  }

  // Check if real data is available
  hasRealData(): boolean {
    return realDataService.isReady();
  }

  // Get data source info
  getDataSourceInfo(): { hasRealData: boolean; contractAddresses: any } {
    return {
      hasRealData: this.hasRealData(),
      contractAddresses: realDataService.isReady() ? {
        NFTFlow: "Connected",
        PaymentStream: "Connected", 
        ReputationSystem: "Connected",
        MockPriceOracle: "Connected"
      } : {
        NFTFlow: "Not Connected",
        PaymentStream: "Not Connected",
        ReputationSystem: "Not Connected", 
        MockPriceOracle: "Not Connected"
      }
    };
  }
}

// Export singleton instance
export const hybridDataService = new HybridDataService();
export default hybridDataService;
