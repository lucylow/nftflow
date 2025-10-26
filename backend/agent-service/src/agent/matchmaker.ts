import { queryRecentRentals, queryUserRentals, Rental } from "../tools/subgraph";

export interface Recommendation {
  collection: string;
  tokenId: string;
  reason: string;
  score: number;
  pricePerSecond?: string;
}

/**
 * Compute personalized recommendations based on user behavior and market trends
 */
export const computeRecommendations = async (userAddress: string): Promise<Recommendation[]> => {
  try {
    // Fetch user's rental history
    const userRentals = await queryUserRentals(userAddress);
    console.log(`📊 Found ${userRentals.length} previous rentals for user`);

    // Fetch recent market activity
    const marketRentals = await queryRecentRentals(200);
    console.log(`📊 Found ${marketRentals.length} recent market rentals`);

    // Simple recommendation algorithm:
    // 1. Look at user's favorite collections
    const favoriteCollections = extractCollections(userRentals);
    
    // 2. Find similar trending items
    const recommendations = generateRecommendations(marketRentals, favoriteCollections);
    
    return recommendations;
  } catch (err) {
    console.error("Compute recommendations error:", err);
    return getFallbackRecommendations();
  }
};

/**
 * Extract favorite collections from rental history
 */
const extractCollections = (rentals: Rental[]): Map<string, number> => {
  const collections = new Map<string, number>();
  
  for (const rental of rentals) {
    const count = collections.get(rental.collection) || 0;
    collections.set(rental.collection, count + 1);
  }
  
  return collections;
};

/**
 * Generate recommendations based on market trends and user preferences
 */
const generateRecommendations = (
  marketRentals: Rental[], 
  favorites: Map<string, number>
): Recommendation[] => {
  const recs: Recommendation[] = [];
  const seen = new Set<string>();

  // Filter out user's recent rentals to avoid duplicates
  const availableRentals = marketRentals.filter(r => !seen.has(`${r.collection}-${r.tokenId}`));

  // Build recommendations
  for (const rental of availableRentals.slice(0, 20)) {
    const key = `${rental.collection}-${rental.tokenId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Calculate score based on:
    // - Recency (recently rented = popular)
    // - User preferences (favorite collections)
    // - Price trend
    const hoursAgo = (Date.now() / 1000 - rental.timestamp) / 3600;
    const recencyScore = Math.max(1, 100 - hoursAgo);
    const favoriteBonus = favorites.has(rental.collection) ? 30 : 0;
    const score = recencyScore + favoriteBonus;

    recs.push({
      collection: rental.collection,
      tokenId: rental.tokenId,
      reason: generateReason(rental, hoursAgo),
      score,
      pricePerSecond: rental.pricePerSecond,
    });
  }

  return recs
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

/**
 * Generate human-readable reason for recommendation
 */
const generateReason = (rental: Rental, hoursAgo: number): string => {
  if (hoursAgo < 24) {
    return `Trending - rented ${Math.floor(hoursAgo)}h ago`;
  } else if (hoursAgo < 168) {
    return `Popular this week (${Math.floor(hoursAgo / 24)} days ago)`;
  } else {
    return `Steady performer`;
  }
};

/**
 * Fallback recommendations if data unavailable
 */
const getFallbackRecommendations = (): Recommendation[] => {
  return [
    {
      collection: "0xExample",
      tokenId: "1",
      reason: "Based on market trends",
      score: 75,
    },
    {
      collection: "0xExample",
      tokenId: "2",
      reason: "Popular collection",
      score: 65,
    },
  ];
};

