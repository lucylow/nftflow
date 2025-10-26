/**
 * Rental Matchmaker Agent
 * AI-powered recommendation engine for NFT rentals
 */

import { OpenAI } from 'openai';
import axios from 'axios';

export class RentalMatchmakerAgent {
  constructor(config) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.subgraphUrl = config.subgraphUrl;
    this.vectorDb = config.vectorDbUrl;
    this.userProfiles = new Map();
  }

  /**
   * Generate personalized NFT rental recommendations
   */
  async generateRecommendations(userAddress, context = {}) {
    console.log(`🎯 Generating recommendations for ${userAddress}`);

    // Step 1: Build user profile from on-chain data
    const userProfile = await this.buildUserProfile(userAddress);

    // Step 2: Fetch available listings from subgraph
    const availableListings = await this.fetchAvailableListings(context);

    // Step 3: Rank using AI
    const recommendations = await this.rankWithAI(userProfile, availableListings);

    return recommendations.slice(0, 10); // Top 10
  }

  /**
   * Build user profile from rental history
   */
  async buildUserProfile(userAddress) {
    // Query subgraph for user's rental history
    const query = `
      {
        rentals(where: { renter: "${userAddress.toLowerCase()}" }, orderBy: timestamp, orderDirection: desc, first: 50) {
          id
          nftContract
          tokenId
          duration
          pricePerSecond
          completed
          timestamp
        }
      }
    `;

    let rentalHistory = [];
    try {
      const response = await axios.post(this.subgraphUrl, { query });
      rentalHistory = response.data?.data?.rentals || [];
    } catch (error) {
      console.error('Subgraph query failed:', error);
      // Return mock data for demo
      rentalHistory = this.getMockRentalHistory();
    }

    // Analyze user preferences
    const preferences = this.analyzePreferences(rentalHistory);

    return {
      address: userAddress,
      rentalCount: rentalHistory.length,
      preferences,
      recentRentals: rentalHistory.slice(0, 10),
    };
  }

  /**
   * Analyze user preferences from rental history
   */
  analyzePreferences(rentals) {
    if (rentals.length === 0) {
      return {
        avgDuration: 3600,
        avgPricePerSecond: 0.000001,
        favoriteCollections: [],
        priceRange: { min: 0, max: 1 },
      };
    }

    const prices = rentals.map(r => parseFloat(r.pricePerSecond || 0));
    const durations = rentals.map(r => parseInt(r.duration || 0));
    
    // Get collection frequency
    const collections = rentals.reduce((acc, r) => {
      const key = r.nftContract?.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const favoriteCollections = Object.entries(collections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([addr]) => addr);

    return {
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      avgPricePerSecond: prices.reduce((a, b) => a + b, 0) / prices.length,
      favoriteCollections,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
    };
  }

  /**
   * Fetch available NFT listings from subgraph
   */
  async fetchAvailableListings(context = {}) {
    const query = `
      {
        listings(where: { active: true }, first: 100, orderBy: createdAt, orderDirection: desc) {
          id
          nftContract
          tokenId
          pricePerSecond
          minDuration
          maxDuration
          collateral
          createdAt
        }
      }
    `;

    let listings = [];
    try {
      const response = await axios.post(this.subgraphUrl, { query });
      listings = response.data?.data?.listings || [];
    } catch (error) {
      console.error('Subgraph query failed:', error);
      listings = this.getMockListings();
    }

    // Apply context filters (budget, category, etc.)
    if (context.budget) {
      listings = listings.filter(
        l => parseFloat(l.pricePerSecond) <= context.budget
      );
    }

    return listings;
  }

  /**
   * Rank NFTs using AI
   */
  async rankWithAI(userProfile, listings) {
    const prompt = `
You are an AI recommendation agent for NFTFlow, an NFT rental marketplace on Somnia blockchain.

User Profile:
- Total Rentals: ${userProfile.rentalCount}
- Average Rental Duration: ${userProfile.preferences.avgDuration} seconds
- Average Price Per Second: ${userProfile.preferences.avgPricePerSecond} STT
- Favorite Collections: ${userProfile.preferences.favoriteCollections.slice(0, 3).join(', ')}

Available Listings (${listings.length}):
${listings.slice(0, 20).map(l => `- ${l.nftContract}/${l.tokenId} @ ${l.pricePerSecond} STT/sec`).join('\n')}

Rank these listings for the user from 1-10 (10 = perfect match).
Consider: price affordability, duration preferences, collection affinity.

Return JSON array:
[
  {"nftContract": "address", "tokenId": "string", "score": number, "reason": "short explanation"}
]
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert NFT rental recommendation engine.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      const rankings = parsed.recommendations || parsed.rankings || [];

      // Merge with listing data
      return rankings.map(rank => ({
        ...rank,
        listing: listings.find(l => 
          l.nftContract?.toLowerCase() === rank.nftContract?.toLowerCase() &&
          l.tokenId === String(rank.tokenId)
        ),
      })).filter(r => r.listing).sort((a, b) => b.score - a.score);

    } catch (error) {
      console.error('OpenAI error:', error);
      // Fallback: return listings ordered by price
      return listings
        .sort((a, b) => parseFloat(a.pricePerSecond) - parseFloat(b.pricePerSecond))
        .map(l => ({
          nftContract: l.nftContract,
          tokenId: l.tokenId,
          score: 5,
          reason: 'Recommendation engine temporarily unavailable.',
          listing: l,
        }));
    }
  }

  /**
   * Generate embedding for NFT metadata
   */
  async generateEmbedding(metadata) {
    const text = typeof metadata === 'string' 
      ? metadata 
      : JSON.stringify(metadata);

    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  }

  // Mock data for development
  getMockRentalHistory() {
    return [
      { nftContract: '0x123...', tokenId: '1', duration: 3600, pricePerSecond: '0.000001', completed: true },
      { nftContract: '0x123...', tokenId: '2', duration: 7200, pricePerSecond: '0.0000012', completed: true },
    ];
  }

  getMockListings() {
    return [
      { nftContract: '0xabc...', tokenId: '10', pricePerSecond: '0.000001', minDuration: 3600, maxDuration: 86400 },
      { nftContract: '0xdef...', tokenId: '20', pricePerSecond: '0.0000015', minDuration: 3600, maxDuration: 86400 },
      { nftContract: '0xghi...', tokenId: '30', pricePerSecond: '0.0000008', minDuration: 3600, maxDuration: 86400 },
    ];
  }
}

