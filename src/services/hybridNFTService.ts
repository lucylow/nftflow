import { blockchainService, NFTRentalListing, RentalInfo } from './blockchainService';
import { MockDataService } from '@/mockData/mockDataService';

export interface HybridNFTRental extends NFTRentalListing {
  source: 'blockchain' | 'mock';
  image?: string;
  name?: string;
  collection?: string;
  rentalCount?: number;
  totalEarned?: string;
}

export class HybridNFTService {
  private isBlockchainAvailable = false;

  constructor() {
    this.checkBlockchainAvailability();
  }

  private async checkBlockchainAvailability(): Promise<void> {
    try {
      // Try to connect to blockchain
      await blockchainService.connectWallet();
      this.isBlockchainAvailable = blockchainService.isContractReady();
      console.log('🔗 Blockchain service available:', this.isBlockchainAvailable);
    } catch (error) {
      console.log('📱 Using mock data service (blockchain unavailable)');
      this.isBlockchainAvailable = false;
    }
  }

  async connectWallet(): Promise<string> {
    try {
      // Try blockchain first
      if (this.isBlockchainAvailable) {
        await blockchainService.ensureSomniaNetwork();
        return await blockchainService.connectWallet();
      }
    } catch (error) {
      console.warn('Blockchain connection failed, using mock mode:', error);
      this.isBlockchainAvailable = false;
    }

    // Fallback to mock mode
    return '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59'; // Mock address
  }

  async getAccount(): Promise<string | null> {
    if (this.isBlockchainAvailable) {
      try {
        return await blockchainService.getAccount();
      } catch (error) {
        console.warn('Failed to get blockchain account:', error);
      }
    }
    
    // Fallback to mock account
    return '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59';
  }

  async getBalance(): Promise<string> {
    if (this.isBlockchainAvailable) {
      try {
        return await blockchainService.getBalance();
      } catch (error) {
        console.warn('Failed to get blockchain balance:', error);
      }
    }
    
    // Fallback to mock balance
    return '125.75';
  }

  async getNetwork(): Promise<{ chainId: number; name: string }> {
    if (this.isBlockchainAvailable) {
      try {
        return await blockchainService.getNetwork();
      } catch (error) {
        console.warn('Failed to get blockchain network:', error);
      }
    }
    
    // Fallback to mock network
    return { chainId: 50312, name: 'Somnia Testnet (Mock)' };
  }

  async getAllRentalListings(): Promise<HybridNFTRental[]> {
    const listings: HybridNFTRental[] = [];

    // Try blockchain first
    if (this.isBlockchainAvailable) {
      try {
        const blockchainListings = await blockchainService.getAllRentalListings();
        listings.push(...blockchainListings.map(listing => ({
          ...listing,
          source: 'blockchain' as const
        })));
        console.log('📡 Loaded', blockchainListings.length, 'listings from blockchain');
      } catch (error) {
        console.warn('Failed to load blockchain listings:', error);
      }
    }

    // Always add mock data as backup/demo
    const mockNFTs = MockDataService.getNFTItems();
    const mockListings = mockNFTs.map(nft => ({
      id: nft.id,
      nftContract: nft.contractAddress,
      tokenId: nft.tokenId,
      owner: nft.owner,
      pricePerSecond: nft.pricePerSecond,
      minDuration: 3600, // 1 hour
      maxDuration: 86400, // 1 day
      collateralRequired: '1.0',
      isActive: !nft.isRented,
      metadata: {
        name: nft.name,
        description: nft.description,
        image: nft.image,
        attributes: nft.attributes
      },
      source: 'mock' as const,
      image: nft.image,
      name: nft.name,
      collection: nft.collectionId,
      rentalCount: nft.rentalCount,
      totalEarned: nft.totalEarned
    }));

    listings.push(...mockListings);
    console.log('🎭 Loaded', mockListings.length, 'mock listings');

    return listings;
  }

  async getRentalListing(listingId: string): Promise<HybridNFTRental | null> {
    // Try blockchain first
    if (this.isBlockchainAvailable) {
      try {
        const listing = await blockchainService.getRentalListing(listingId);
        if (listing) {
          return {
            ...listing,
            source: 'blockchain'
          };
        }
      } catch (error) {
        console.warn('Failed to get blockchain listing:', error);
      }
    }

    // Fallback to mock data
    const mockNFT = MockDataService.getNFTById(listingId);
    if (mockNFT) {
      return {
        id: mockNFT.id,
        nftContract: mockNFT.contractAddress,
        tokenId: mockNFT.tokenId,
        owner: mockNFT.owner,
        pricePerSecond: mockNFT.pricePerSecond,
        minDuration: 3600,
        maxDuration: 86400,
        collateralRequired: '1.0',
        isActive: !mockNFT.isRented,
        metadata: {
          name: mockNFT.name,
          description: mockNFT.description,
          image: mockNFT.image,
          attributes: mockNFT.attributes
        },
        source: 'mock',
        image: mockNFT.image,
        name: mockNFT.name,
        collection: mockNFT.collectionId,
        rentalCount: mockNFT.rentalCount,
        totalEarned: mockNFT.totalEarned
      };
    }

    return null;
  }

  async getRentalInfo(listingId: string): Promise<RentalInfo | null> {
    // Try blockchain first
    if (this.isBlockchainAvailable) {
      try {
        return await blockchainService.getRentalInfo(listingId);
      } catch (error) {
        console.warn('Failed to get blockchain rental info:', error);
      }
    }

    // Fallback to mock data
    const mockRentals = MockDataService.getActiveRentals();
    const rental = mockRentals.find(r => r.nftId === listingId);
    
    if (rental) {
      return {
        renter: rental.tenant,
        startTime: Math.floor(new Date(rental.startTime).getTime() / 1000),
        endTime: Math.floor(new Date(rental.endTime).getTime() / 1000),
        isActive: rental.status === 'active',
        totalPaid: rental.totalPaid
      };
    }

    return null;
  }

  async listNFTForRental(
    nftContract: string,
    tokenId: string,
    pricePerSecond: string,
    minDuration: number,
    maxDuration: number,
    collateralRequired: string
  ): Promise<string> {
    // Try blockchain first
    if (this.isBlockchainAvailable) {
      try {
        return await blockchainService.listNFTForRental(
          nftContract,
          tokenId,
          pricePerSecond,
          minDuration,
          maxDuration,
          collateralRequired
        );
      } catch (error) {
        console.warn('Failed to list NFT on blockchain:', error);
        this.isBlockchainAvailable = false; // Mark as unavailable
      }
    }

    // Fallback to mock mode
    console.log('🎭 Mock: NFT listed for rental');
    return 'mock-tx-hash-' + Date.now();
  }

  async rentNFT(listingId: string, duration: number): Promise<string> {
    // Try blockchain first
    if (this.isBlockchainAvailable) {
      try {
        return await blockchainService.rentNFT(listingId, duration);
      } catch (error) {
        console.warn('Failed to rent NFT on blockchain:', error);
        this.isBlockchainAvailable = false; // Mark as unavailable
      }
    }

    // Fallback to mock mode
    console.log('🎭 Mock: NFT rented for', duration, 'seconds');
    return 'mock-tx-hash-' + Date.now();
  }

  async returnNFT(listingId: string): Promise<string> {
    // Try blockchain first
    if (this.isBlockchainAvailable) {
      try {
        return await blockchainService.returnNFT(listingId);
      } catch (error) {
        console.warn('Failed to return NFT on blockchain:', error);
        this.isBlockchainAvailable = false; // Mark as unavailable
      }
    }

    // Fallback to mock mode
    console.log('🎭 Mock: NFT returned');
    return 'mock-tx-hash-' + Date.now();
  }

  // Utility methods
  isBlockchainReady(): boolean {
    return this.isBlockchainAvailable;
  }

  getServiceStatus(): { blockchain: boolean; mock: boolean } {
    return {
      blockchain: this.isBlockchainAvailable,
      mock: true // Mock is always available
    };
  }

  // Force refresh blockchain connection
  async refreshBlockchainConnection(): Promise<void> {
    await this.checkBlockchainAvailability();
  }
}

// Export singleton instance
export const hybridNFTService = new HybridNFTService();
