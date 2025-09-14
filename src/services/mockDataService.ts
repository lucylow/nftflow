// Centralized Mock Data Service for NFTFlow
import { ENHANCED_NFT_ITEMS, AVAILABLE_NFTS, RENTED_NFTS } from '@/mockData/enhancedNftItems';

export interface MockNFTData {
  id: string;
  tokenId: string;
  listingId?: string;
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

class MockDataService {
  private nftData: MockNFTData[] = ENHANCED_NFT_ITEMS;

  // Get all NFTs
  getAllNFTs(): MockNFTData[] {
    return this.nftData;
  }

  // Get available NFTs (not rented)
  getAvailableNFTs(): MockNFTData[] {
    return this.nftData.filter(nft => !nft.isRented);
  }

  // Get rented NFTs
  getRentedNFTs(): MockNFTData[] {
    return this.nftData.filter(nft => nft.isRented);
  }

  // Get NFTs by owner
  getNFTsByOwner(ownerAddress: string): MockNFTData[] {
    return this.nftData.filter(nft => 
      nft.owner.toLowerCase() === ownerAddress.toLowerCase()
    );
  }

  // Get NFTs by renter
  getNFTsByRenter(renterAddress: string): MockNFTData[] {
    return this.nftData.filter(nft => 
      nft.renter?.toLowerCase() === renterAddress.toLowerCase()
    );
  }

  // Get NFT by ID
  getNFTById(id: string): MockNFTData | undefined {
    return this.nftData.find(nft => nft.id === id);
  }

  // Get NFT by token ID
  getNFTByTokenId(tokenId: string): MockNFTData | undefined {
    return this.nftData.find(nft => nft.tokenId === tokenId);
  }

  // Get NFTs by collection
  getNFTsByCollection(collection: string): MockNFTData[] {
    return this.nftData.filter(nft => 
      nft.collection.toLowerCase().includes(collection.toLowerCase())
    );
  }

  // Get NFTs by category
  getNFTsByCategory(category: string): MockNFTData[] {
    return this.nftData.filter(nft => 
      nft.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get NFTs by rarity
  getNFTsByRarity(rarity: string): MockNFTData[] {
    return this.nftData.filter(nft => 
      nft.rarity.toLowerCase() === rarity.toLowerCase()
    );
  }

  // Get NFTs by utility type
  getNFTsByUtilityType(utilityType: string): MockNFTData[] {
    return this.nftData.filter(nft => 
      nft.utilityType.toLowerCase().includes(utilityType.toLowerCase())
    );
  }

  // Search NFTs by name or description
  searchNFTs(query: string): MockNFTData[] {
    const lowerQuery = query.toLowerCase();
    return this.nftData.filter(nft => 
      nft.name.toLowerCase().includes(lowerQuery) ||
      nft.description.toLowerCase().includes(lowerQuery) ||
      nft.collection.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter NFTs by price range (per second)
  filterNFTsByPriceRange(minPrice: number, maxPrice: number): MockNFTData[] {
    return this.nftData.filter(nft => 
      nft.pricePerSecond >= minPrice && nft.pricePerSecond <= maxPrice
    );
  }

  // Filter NFTs by duration range
  filterNFTsByDuration(minDuration: number, maxDuration: number): MockNFTData[] {
    return this.nftData.filter(nft => 
      nft.minDuration >= minDuration && nft.maxDuration <= maxDuration
    );
  }

  // Get trending NFTs (sorted by rental count and social metrics)
  getTrendingNFTs(limit: number = 10): MockNFTData[] {
    return this.nftData
      .sort((a, b) => {
        const aScore = (a.rentalCount || 0) + (a.social?.views || 0) / 100;
        const bScore = (b.rentalCount || 0) + (b.social?.views || 0) / 100;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  // Get high-earning NFTs
  getTopEarningNFTs(limit: number = 10): MockNFTData[] {
    return this.nftData
      .filter(nft => nft.totalEarned && nft.totalEarned > 0)
      .sort((a, b) => (b.totalEarned || 0) - (a.totalEarned || 0))
      .slice(0, limit);
  }

  // Get recently rented NFTs
  getRecentlyRentedNFTs(limit: number = 10): MockNFTData[] {
    return this.nftData
      .filter(nft => nft.lastRented)
      .sort((a, b) => {
        const aTime = new Date(a.lastRented || 0).getTime();
        const bTime = new Date(b.lastRented || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, limit);
  }

  // Simulate renting an NFT
  rentNFT(nftId: string, renterAddress: string, duration: number): boolean {
    const nft = this.getNFTById(nftId);
    if (!nft || nft.isRented) {
      return false;
    }

    // Update NFT status
    nft.isRented = true;
    nft.renter = renterAddress;
    nft.rentalStartTime = new Date().toISOString();
    nft.totalCost = nft.pricePerSecond * duration;
    nft.timeLeft = this.formatDuration(duration);
    nft.rentalCount = (nft.rentalCount || 0) + 1;

    return true;
  }

  // Simulate returning an NFT
  returnNFT(nftId: string): boolean {
    const nft = this.getNFTById(nftId);
    if (!nft || !nft.isRented) {
      return false;
    }

    // Update NFT status
    nft.isRented = false;
    nft.renter = undefined;
    nft.rentalStartTime = undefined;
    nft.lastRented = new Date().toISOString();
    nft.timeLeft = undefined;
    nft.totalEarned = (nft.totalEarned || 0) + (nft.totalCost || 0);
    nft.totalCost = 0;

    return true;
  }

  // Simulate listing an NFT
  listNFT(nftData: Partial<MockNFTData>): MockNFTData {
    const newNFT: MockNFTData = {
      id: `nft-${Date.now()}`,
      tokenId: nftData.tokenId || `${Date.now()}`,
      listingId: `listing-${Date.now()}`,
      name: nftData.name || 'New NFT',
      description: nftData.description || 'A new NFT listing',
      image: nftData.image || 'https://images.unsplash.com/photo-1578662996442-48f103fc96?w=400&h=400&fit=crop',
      collection: nftData.collection || 'Custom Collection',
      category: nftData.category || 'Gaming Asset',
      utilityType: nftData.utilityType || 'General',
      pricePerSecond: nftData.pricePerSecond || 0.000001,
      minDuration: nftData.minDuration || 3600,
      maxDuration: nftData.maxDuration || 86400,
      collateralRequired: nftData.collateralRequired || 1.0,
      isRented: false,
      owner: nftData.owner || '0x0000000000000000000000000000000000000000',
      rarity: nftData.rarity || 'Common',
      rentalCount: 0,
      totalEarned: 0,
      contractAddress: nftData.contractAddress || '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
      attributes: nftData.attributes || [],
      social: {
        likes: 0,
        views: 0,
        shares: 0
      }
    };

    this.nftData.push(newNFT);
    return newNFT;
  }

  // Get marketplace statistics
  getMarketplaceStats() {
    const totalNFTs = this.nftData.length;
    const availableNFTs = this.getAvailableNFTs().length;
    const rentedNFTs = this.getRentedNFTs().length;
    const totalVolume = this.nftData.reduce((sum, nft) => sum + (nft.totalEarned || 0), 0);
    const avgPrice = this.nftData.reduce((sum, nft) => sum + nft.pricePerSecond, 0) / totalNFTs;

    return {
      totalNFTs,
      availableNFTs,
      rentedNFTs,
      totalVolume: parseFloat(totalVolume.toFixed(2)),
      avgPricePerSecond: parseFloat(avgPrice.toFixed(8)),
      avgPricePerHour: parseFloat((avgPrice * 3600).toFixed(6)),
      collections: [...new Set(this.nftData.map(nft => nft.collection))].length,
      categories: [...new Set(this.nftData.map(nft => nft.category))].length
    };
  }

  // Helper method to format duration
  private formatDuration(seconds: number): string {
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
  }

  // Get unique collections
  getCollections(): string[] {
    return [...new Set(this.nftData.map(nft => nft.collection))];
  }

  // Get unique categories
  getCategories(): string[] {
    return [...new Set(this.nftData.map(nft => nft.category))];
  }

  // Get unique rarities
  getRarities(): string[] {
    return [...new Set(this.nftData.map(nft => nft.rarity))];
  }

  // Get unique utility types
  getUtilityTypes(): string[] {
    return [...new Set(this.nftData.map(nft => nft.utilityType))];
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();
export default mockDataService;