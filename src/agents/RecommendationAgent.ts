import { OpenAI } from 'openai';
import { ethers } from 'ethers';

interface UserProfile {
  address: string;
  rentalHistory: RentalEvent[];
  preferences: UserPreferences;
  reputation: number;
}

interface RentalEvent {
  nftContract: string;
  tokenId: string;
  duration: number;
  price: number;
  category: string;
}

interface UserPreferences {
  favoriteCategories: string[];
  priceRange: { min: number; max: number };
  avgRentalDuration: number;
}

interface Recommendation {
  nftContract: string;
  tokenId: string;
  score: number;
  reason: string;
  metadata?: any;
}

export class RecommendationAgent {
  private openai: OpenAI;
  private provider: ethers.BrowserProvider | null = null;
  
  constructor(apiKey: string, provider: ethers.BrowserProvider | null) {
    this.openai = new OpenAI({ apiKey });
    this.provider = provider;
  }

  /**
   * Generate personalized NFT rental recommendations using AI
   */
  async generateRecommendations(
    userAddress: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    // Step 1: Build user profile
    const userProfile = await this.buildUserProfile(userAddress);
    
    // Step 2: Fetch available NFTs
    const availableNFTs = await this.fetchAvailableRentals();
    
    // Step 3: Use AI to rank and recommend
    const recommendations = await this.rankNFTsWithAI(userProfile, availableNFTs);
    
    return recommendations.slice(0, limit);
  }

  /**
   * Build comprehensive user profile from on-chain data
   */
  private async buildUserProfile(userAddress: string): Promise<UserProfile> {
    // Query user's rental history from events
    const rentalHistory = await this.fetchUserRentalHistory(userAddress);
    
    // Calculate preferences from behavior
    const preferences = this.calculatePreferences(rentalHistory);
    
    // Get reputation score from smart contract (mock for now)
    const reputation = await this.fetchReputationScore(userAddress);
    
    return {
      address: userAddress,
      rentalHistory,
      preferences,
      reputation
    };
  }

  /**
   * Fetch user's past rental activity
   */
  private async fetchUserRentalHistory(userAddress: string): Promise<RentalEvent[]> {
    // This would query the NFTFlow contract events
    // For now, return mock data
    return [
      {
        nftContract: '0x...',
        tokenId: '1',
        duration: 3600,
        price: 0.001,
        category: 'gaming'
      },
      {
        nftContract: '0x...',
        tokenId: '2',
        duration: 7200,
        price: 0.0012,
        category: 'gaming'
      },
      {
        nftContract: '0x...',
        tokenId: '3',
        duration: 5400,
        price: 0.0008,
        category: 'collectibles'
      }
    ];
  }

  /**
   * Calculate user preferences from behavior patterns
   */
  private calculatePreferences(history: RentalEvent[]): UserPreferences {
    if (history.length === 0) {
      return {
        favoriteCategories: [],
        priceRange: { min: 0, max: 1 },
        avgRentalDuration: 3600
      };
    }

    const categories = history.map(r => r.category);
    const prices = history.map(r => r.price);
    const durations = history.map(r => r.duration);
    
    // Find most common categories
    const categoryCounts = categories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);
    
    return {
      favoriteCategories,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      avgRentalDuration: durations.reduce((a, b) => a + b, 0) / durations.length
    };
  }

  /**
   * Fetch reputation score from smart contract
   */
  private async fetchReputationScore(userAddress: string): Promise<number> {
    // Query ReputationSystem contract (mock for now)
    return 750; // Placeholder
  }

  /**
   * Fetch all available NFTs for rent
   */
  private async fetchAvailableRentals(): Promise<any[]> {
    // Query NFTFlow marketplace (mock data for now)
    return [
      {
        nftContract: '0x...',
        tokenId: '1',
        pricePerSecond: 0.001,
        category: 'gaming',
        metadata: {
          name: 'Legendary Sword',
          description: 'Powerful gaming item',
          image: 'ipfs://...'
        }
      },
      {
        nftContract: '0x...',
        tokenId: '2',
        pricePerSecond: 0.0015,
        category: 'collectibles',
        metadata: {
          name: 'Rare Artwork',
          description: 'Unique digital art piece',
          image: 'ipfs://...'
        }
      },
      {
        nftContract: '0x...',
        tokenId: '3',
        pricePerSecond: 0.0008,
        category: 'utility',
        metadata: {
          name: 'Access Pass',
          description: 'Exclusive platform access',
          image: 'ipfs://...'
        }
      }
    ];
  }

  /**
   * Use AI to intelligently rank NFTs for the user
   */
  private async rankNFTsWithAI(
    userProfile: UserProfile,
    availableNFTs: any[]
  ): Promise<Recommendation[]> {
    const prompt = `
You are an AI recommendation agent for an NFT rental marketplace on Somnia blockchain.

User Profile:
- Favorite Categories: ${userProfile.preferences.favoriteCategories.join(', ')}
- Price Range: ${userProfile.preferences.priceRange.min} - ${userProfile.preferences.priceRange.max} STT/second
- Average Rental Duration: ${userProfile.preferences.avgRentalDuration} seconds
- Reputation Score: ${userProfile.reputation}/1000

Available NFTs:
${JSON.stringify(availableNFTs, null, 2)}

Rank these NFTs for the user from 1-10 (10 being perfect match) and explain why each would be a good fit.

Respond in JSON format as an array:
[
  {
    "nftContract": "address",
    "tokenId": "string",
    "score": number (1-10),
    "reason": "explanation"
  }
]
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert NFT recommendation engine." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8
      });

      const responseText = response.choices[0].message.content || '[]';
      // OpenAI returns json_object which means we get a wrapper object
      const parsed = JSON.parse(responseText);
      const rankings = Array.isArray(parsed) ? parsed : parsed.recommendations || parsed.rankings || [];
      
      // Combine AI rankings with NFT metadata
      return rankings.map((rank: any) => ({
        ...rank,
        tokenId: String(rank.tokenId || rank.nftId || ''),
        metadata: availableNFTs.find(
          nft => nft.tokenId === String(rank.tokenId || rank.nftId)
        )?.metadata
      })).sort((a: any, b: any) => b.score - a.score);
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Return fallback recommendations
      return availableNFTs.map(nft => ({
        nftContract: nft.nftContract,
        tokenId: nft.tokenId,
        score: 5,
        reason: "Recommendation engine temporarily unavailable.",
        metadata: nft.metadata
      }));
    }
  }

  /**
   * Update provider reference
   */
  updateProvider(provider: ethers.BrowserProvider | null): void {
    this.provider = provider;
  }
}

