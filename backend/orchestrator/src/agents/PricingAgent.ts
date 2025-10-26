import { ethers } from 'ethers';
import { AutonomousControllerABI } from '../abis/AutonomousControllerABI';
import { NFTFlowABI } from '../abis/NFTFlowABI';
import { Store } from '../services/ipfsService';
import { Logger } from '../services/logger';

/**
 * PricingAnalyst Agent
 * 
 * Autonomous agent that monitors market conditions and adjusts listing prices
 * based on utility analytics, demand patterns, and historical data.
 */
export class PricingAnalystAgent {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private controller: ethers.Contract;
  private nftflow: ethers.Contract;
  private store: Store;
  private logger: Logger;

  constructor(
    rpcUrl: string,
    privateKey: string,
    controllerAddress: string,
    nftflowAddress: string,
    store: Store,
    logger: Logger
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.controller = new ethers.Contract(controllerAddress, AutonomousControllerABI, this.signer);
    this.nftflow = new ethers.Contract(nftflowAddress, NFTFlowABI, this.provider);
    this.store = store;
    this.logger = logger;
  }

  /**
   * Main execution loop - called periodically
   */
  async execute(): Promise<void> {
    this.logger.info('🔍 PricingAgent: Starting price analysis cycle');
    
    try {
      // 1. Observe current state
      const state = await this.observeState();
      
      // 2. Decide on actions
      const actions = await this.decide(state);
      
      // 3. Execute actions
      for (const action of actions) {
        await this.executeAction(action);
      }
      
      this.logger.info(`✅ PricingAgent: Completed analysis cycle. Actions: ${actions.length}`);
    } catch (error) {
      this.logger.error('❌ PricingAgent: Error in execution cycle', error);
      throw error;
    }
  }

  /**
   * Observe current market state
   */
  private async observeState(): Promise<MarketState> {
    // Get all active listings
    const listings = await this.nftflow.getActiveListings();
    
    // Analyze each listing
    const marketData: ListingMarketData[] = await Promise.all(
      listings.map(async (listingId: string) => {
        const listing = await this.nftflow.getListing(listingId);
        const rentalHistory = await this.getRentalHistory(listingId);
        
        return {
          listingId,
          currentPrice: listing.pricePerSecond,
          demandScore: this.calculateDemand(listing, rentalHistory),
          utilityScore: await this.getUtilityScore(listing),
          competingListings: await this.findCompetingListings(listing),
        };
      })
    );
    
    return { listings: marketData };
  }

  /**
   * Decide on price updates
   */
  private async decide(state: MarketState): Promise<PriceUpdateAction[]> {
    const actions: PriceUpdateAction[] = [];
    
    for (const listing of state.listings) {
      const suggestedPrice = await this.calculateSuggestedPrice(listing);
      const currentPrice = listing.currentPrice;
      
      // Check if update is needed
      if (this.shouldUpdate(currentPrice, suggestedPrice)) {
        actions.push({
          listingId: listing.listingId,
          oldPrice: currentPrice,
          newPrice: suggestedPrice,
          reasoning: this.generateReasoning(listing, suggestedPrice),
        });
      }
    }
    
    return actions;
  }

  /**
   * Calculate suggested price based on market conditions
   */
  private calculateSuggestedPrice(listing: ListingMarketData): ethers.BigNumber {
    let multiplier = 1.0;
    
    // Adjust based on demand
    if (listing.demandScore > 0.8) {
      multiplier *= 1.05; // Increase price for high demand
    } else if (listing.demandScore < 0.3) {
      multiplier *= 0.96; // Decrease price for low demand
    }
    
    // Adjust based on utility
    if (listing.utilityScore > 80) {
      multiplier *= 1.03;
    } else if (listing.utilityScore < 40) {
      multiplier *= 0.97;
    }
    
    // Adjust based on competition
    const avgCompetingPrice = this.averagePrice(listing.competingListings);
    const priceRatio = listing.currentPrice.div(avgCompetingPrice);
    
    if (priceRatio.gt(1.1)) {
      multiplier *= 0.98; // Lower if overpriced
    } else if (priceRatio.lt(0.9)) {
      multiplier *= 1.02; // Raise if underpriced
    }
    
    // Apply 5% safety cap
    const maxChange = listing.currentPrice.mul(105).div(100);
    const newPrice = listing.currentPrice.mul(Math.floor(multiplier * 100)).div(100);
    
    return newPrice.gt(maxChange) ? maxChange : newPrice;
  }

  /**
   * Execute price update action
   */
  private async executeAction(action: PriceUpdateAction): Promise<void> {
    try {
      // Store reasoning on IPFS
      const reasonCID = await this.store.storeJSON({
        timestamp: Date.now(),
        agent: 'PricingAnalyst',
        action: 'PRICE_UPDATE',
        listingId: action.listingId,
        oldPrice: action.oldPrice.toString(),
        newPrice: action.newPrice.toString(),
        reasoning: action.reasoning,
        calculatedAt: new Date().toISOString(),
      });
      
      this.logger.info(
        `📝 PricingAgent: Proposing price update for listing ${action.listingId}`,
        { oldPrice: action.oldPrice.toString(), newPrice: action.newPrice.toString() }
      );
      
      // Call controller
      const tx = await this.controller.agentSetPrice(
        action.listingId,
        action.oldPrice,
        action.newPrice,
        reasonCID
      );
      
      const receipt = await tx.wait();
      
      this.logger.info(
        `✅ PricingAgent: Price update executed`,
        { txHash: receipt.transactionHash }
      );
    } catch (error: any) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        this.logger.warn('⏳ PricingAgent: Rate limit exceeded, skipping action');
        return;
      }
      
      this.logger.error('❌ PricingAgent: Failed to execute action', error);
      throw error;
    }
  }

  /**
   * Check if update should be made
   */
  private shouldUpdate(currentPrice: ethers.BigNumber, suggestedPrice: ethers.BigNumber): boolean {
    const delta = suggestedPrice.sub(currentPrice).abs();
    const percentChange = delta.mul(10000).div(currentPrice);
    
    // Only update if change is >= 0.5%
    return percentChange.gte(50);
  }

  /**
   * Calculate demand score (0-1)
   */
  private calculateDemand(listing: any, rentalHistory: any[]): number {
    const recentRentals = rentalHistory.filter(r => 
      r.timestamp > Date.now() - 7 * 24 * 3600 * 1000
    ).length;
    
    // Normalize to 0-1 scale
    return Math.min(recentRentals / 10, 1);
  }

  /**
   * Get utility score from UtilityTracker
   */
  private async getUtilityScore(listing: any): Promise<number> {
    // Implementation would fetch from UtilityTracker contract
    // For now, return mock value
    return Math.random() * 100;
  }

  /**
   * Find competing listings
   */
  private async findCompetingListings(listing: any): Promise<any[]> {
    // Implementation would query for similar NFTs
    return [];
  }

  /**
   * Get rental history for listing
   */
  private async getRentalHistory(listingId: string): Promise<any[]> {
    // Implementation would query events/indexer
    return [];
  }

  /**
   * Average price of competing listings
   */
  private averagePrice(listings: any[]): ethers.BigNumber {
    if (listings.length === 0) return ethers.BigNumber.from(0);
    
    const sum = listings.reduce(
      (acc, l) => acc.add(l.price),
      ethers.BigNumber.from(0)
    );
    
    return sum.div(listings.length);
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(listing: ListingMarketData, newPrice: ethers.BigNumber): string {
    return `
Autonomous Price Adjustment Report
----------------------------------
Listing ID: ${listing.listingId}
Current Price: ${listing.currentPrice.toString()} wei
Suggested Price: ${newPrice.toString()} wei
Price Change: ${newPrice.sub(listing.currentPrice).mul(100).div(listing.currentPrice).toString()}%

Market Analysis:
- Demand Score: ${listing.demandScore.toFixed(2)}
- Utility Score: ${listing.utilityScore.toFixed(2)}
- Competing Listings: ${listing.competingListings.length}

Recommendation: ${newPrice.gt(listing.currentPrice) ? 'INCREASE' : 'DECREASE'}
Reason: ${this.generateReasoningText(listing)}
    `.trim();
  }

  private generateReasoningText(listing: ListingMarketData): string {
    if (listing.demandScore > 0.8) {
      return 'High demand detected, increasing price to maximize revenue.';
    } else if (listing.utilityScore < 40) {
      return 'Low utility score, reducing price to improve competitiveness.';
    } else {
      return 'Market conditions suggest price adjustment.';
    }
  }
}

// Types
interface MarketState {
  listings: ListingMarketData[];
}

interface ListingMarketData {
  listingId: string;
  currentPrice: ethers.BigNumber;
  demandScore: number;
  utilityScore: number;
  competingListings: any[];
}

interface PriceUpdateAction {
  listingId: string;
  oldPrice: ethers.BigNumber;
  newPrice: ethers.BigNumber;
  reasoning: string;
}

