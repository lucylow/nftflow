import { ModelManager, ModelRequest } from '../ModelManager';

export interface PricingAnalysis {
  optimalPrice: number;
  confidence: number;
  reasoning: string;
  marketTrend: 'bullish' | 'bearish' | 'stable';
  suggestedActions: string[];
  riskFactors: string[];
}

export interface MarketData {
  floorPrice: number;
  volume24h: number;
  averageRentalDuration: number;
  competitorPrices: number[];
  trendingCollections: string[];
}

export class MultiModelPricingAgent {
  private modelManager: ModelManager;

  constructor(modelManager: ModelManager) {
    this.modelManager = modelManager;
  }

  /**
   * Analyze NFT and generate optimal pricing using best AI model
   */
  async analyzeNFTPricing(
    nftMetadata: any,
    marketData: MarketData,
    budget: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<PricingAnalysis> {
    const systemPrompt = `You are an expert NFT pricing analyst for the NFTFlow rental marketplace. 
Analyze the NFT characteristics and current market conditions to determine optimal rental pricing.

Key Considerations:
- NFT rarity and attributes
- Current market trends
- Competitor pricing
- Historical performance
- Seasonal demand patterns

Return your analysis in JSON format with the following structure:
{
  "optimalPrice": number,
  "confidence": number (0-100),
  "reasoning": "detailed explanation",
  "marketTrend": "bullish|bearish|stable",
  "suggestedActions": string[],
  "riskFactors": string[]
}`;

    const userPrompt = `
NFT METADATA:
${JSON.stringify(nftMetadata, null, 2)}

MARKET DATA:
- Current Floor Price: ${marketData.floorPrice} STT
- 24h Volume: ${marketData.volume24h} STT
- Average Rental Duration: ${marketData.averageRentalDuration} hours
- Competitor Prices: ${marketData.competitorPrices.join(', ')} STT
- Trending Collections: ${marketData.trendingCollections.join(', ')}

Provide your pricing analysis:`;

    const request: ModelRequest = {
      systemPrompt,
      userPrompt,
      temperature: 0.3, // Lower temperature for consistent pricing
      maxTokens: 2000,
      jsonMode: true
    };

    try {
      const response = await this.modelManager.executeWithFallback(
        request,
        'market-analysis',
        budget
      );

      const analysis = JSON.parse(response.content) as PricingAnalysis;
      
      // Log pricing decision for observability
      console.log(`💰 Pricing Analysis Complete:`, {
        model: response.model,
        optimalPrice: analysis.optimalPrice,
        confidence: analysis.confidence,
        cost: response.cost,
        latency: response.latency
      });

      return analysis;

    } catch (error) {
      console.error('Pricing analysis failed:', error);
      
      // Fallback to simple algorithm if AI fails
      return this.calculateFallbackPricing(nftMetadata, marketData);
    }
  }

  /**
   * Fallback pricing algorithm when AI models fail
   */
  private calculateFallbackPricing(
    nftMetadata: any,
    marketData: MarketData
  ): PricingAnalysis {
    const basePrice = marketData.floorPrice;
    const avgCompetitor = marketData.competitorPrices.reduce((a, b) => a + b, 0) / marketData.competitorPrices.length;
    
    // Simple weighted average
    const optimalPrice = (basePrice * 0.6) + (avgCompetitor * 0.4);

    return {
      optimalPrice,
      confidence: 65,
      reasoning: 'Fallback algorithm: weighted average of floor price and competitor pricing',
      marketTrend: 'stable',
      suggestedActions: ['Monitor market closely', 'Consider manual adjustment'],
      riskFactors: ['AI system unavailable', 'Using simplified pricing model']
    };
  }

  /**
   * Batch analyze multiple NFTs efficiently
   */
  async batchAnalyzeNFTs(
    nfts: Array<{ metadata: any; marketData: MarketData }>,
    budget: 'low' | 'medium' | 'high' = 'low'
  ): Promise<PricingAnalysis[]> {
    // Use cost-effective model for batch processing
    const analyses: PricingAnalysis[] = [];

    for (const nft of nfts) {
      const analysis = await this.analyzeNFTPricing(
        nft.metadata,
        nft.marketData,
        budget
      );
      analyses.push(analysis);
    }

    return analyses;
  }
}

