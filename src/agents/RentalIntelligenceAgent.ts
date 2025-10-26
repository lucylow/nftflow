import { ethers } from 'ethers';
import OpenAI from 'openai';

interface MarketData {
  floorPrice: number;
  volume24h: number;
  trending: boolean;
  avgRentalDuration: number;
}

interface RentalRecommendation {
  suggestedPrice: number;
  confidence: number;
  reasoning: string;
  optimalDuration: number;
}

export class RentalIntelligenceAgent {
  private openai: OpenAI;
  private provider: ethers.BrowserProvider | null = null;
  private nftFlowContract: ethers.Contract | null = null;
  
  constructor(
    apiKey: string,
    provider: ethers.BrowserProvider | null,
    contractAddress: string | null,
    contractABI: any[]
  ) {
    this.openai = new OpenAI({ apiKey });
    this.provider = provider;
    
    if (contractAddress && provider) {
      this.nftFlowContract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );
    }
  }

  /**
   * Autonomous agent that analyzes market data and recommends optimal rental pricing
   */
  async generateRentalStrategy(
    nftContract: string,
    tokenId: string
  ): Promise<RentalRecommendation> {
    try {
      // Step 1: Gather on-chain market data
      const marketData = await this.fetchMarketData(nftContract, tokenId);
      
      // Step 2: Analyze historical rental performance
      const historicalData = await this.analyzeRentalHistory(nftContract, tokenId);
      
      // Step 3: Use AI to generate intelligent pricing
      const aiAnalysis = await this.performAIAnalysis(marketData, historicalData);
      
      // Step 4: Return actionable recommendation
      return {
        suggestedPrice: aiAnalysis.optimalPrice,
        confidence: aiAnalysis.confidence,
        reasoning: aiAnalysis.explanation,
        optimalDuration: aiAnalysis.recommendedDuration
      };
    } catch (error) {
      console.error('AI Agent Error:', error);
      throw new Error('Failed to generate rental strategy');
    }
  }

  /**
   * Fetch real-time market data from blockchain and oracles
   */
  private async fetchMarketData(
    nftContract: string,
    tokenId: string
  ): Promise<MarketData> {
    // For now, return mock data since we don't have active rentals API
    return {
      floorPrice: 0.001,
      volume24h: 10,
      trending: true,
      avgRentalDuration: 3600
    };
  }

  /**
   * Analyze historical rental performance using AI
   */
  private async analyzeRentalHistory(
    nftContract: string,
    tokenId: string
  ): Promise<any> {
    // Query historical rental events from blockchain
    // For now, return mock data
    const rentalData = [
      { price: 0.001, duration: 3600, timestamp: Date.now() - 86400000 },
      { price: 0.0012, duration: 7200, timestamp: Date.now() - 172800000 }
    ];
    
    return {
      totalRentals: rentalData.length,
      avgPrice: rentalData.reduce((sum, r) => sum + r.price, 0) / rentalData.length,
      avgDuration: rentalData.reduce((sum, r) => sum + r.duration, 0) / rentalData.length,
      trend: this.calculatePriceTrend(rentalData)
    };
  }

  /**
   * Use OpenAI to generate intelligent pricing recommendations
   */
  private async performAIAnalysis(
    marketData: MarketData,
    historicalData: any
  ): Promise<any> {
    const prompt = `
You are an AI agent specializing in NFT rental market analysis on the Somnia blockchain.

Current Market Data:
- Floor Price: ${marketData.floorPrice} STT
- 24h Rental Volume: ${marketData.volume24h}
- Trending: ${marketData.trending}
- Average Rental Duration: ${marketData.avgRentalDuration} seconds

Historical Performance:
- Total Rentals: ${historicalData.totalRentals}
- Average Historical Price: ${historicalData.avgPrice} STT/second
- Average Duration: ${historicalData.avgDuration} seconds
- Price Trend: ${historicalData.trend}

Based on this data, recommend:
1. Optimal rental price per second (in STT)
2. Recommended minimum and maximum rental duration
3. Confidence level (0-100%)
4. Detailed reasoning for the recommendation

Respond in JSON format:
{
  "optimalPrice": number,
  "recommendedDuration": number,
  "confidence": number,
  "explanation": "string"
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert NFT market analyst." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Return fallback analysis
      return {
        optimalPrice: marketData.floorPrice,
        recommendedDuration: 3600,
        confidence: 50,
        explanation: "Market analysis unavailable. Using default pricing based on floor price."
      };
    }
  }

  /**
   * Calculate price trend from historical data
   */
  private calculatePriceTrend(rentalData: any[]): string {
    if (rentalData.length < 2) return 'insufficient_data';
    
    const recentPrices = rentalData.slice(-10).map((r: any) => r.price);
    const olderPrices = rentalData.slice(0, 10).map((r: any) => r.price);
    
    if (recentPrices.length === 0 || olderPrices.length === 0) return 'stable';
    
    const recentAvg = recentPrices.reduce((a: number, b: number) => a + b, 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((a: number, b: number) => a + b, 0) / olderPrices.length;
    
    if (recentAvg > olderAvg * 1.1) return 'increasing';
    if (recentAvg < olderAvg * 0.9) return 'decreasing';
    return 'stable';
  }

  /**
   * Autonomous agent loop - continuously monitors and adjusts pricing
   */
  async startAutonomousMonitoring(
    nftContract: string,
    tokenId: string,
    ownerAddress: string
  ): Promise<NodeJS.Timeout> {
    console.log(`🤖 Starting autonomous AI agent for NFT ${tokenId}...`);
    
    // Monitor every hour
    return setInterval(async () => {
      try {
        const recommendation = await this.generateRentalStrategy(nftContract, tokenId);
        
        console.log(`\n📊 AI Agent Analysis:`);
        console.log(`   Suggested Price: ${recommendation.suggestedPrice} STT/second`);
        console.log(`   Confidence: ${recommendation.confidence}%`);
        console.log(`   Reasoning: ${recommendation.reasoning}`);
        
        // Auto-adjust pricing if confidence is high (in real implementation)
        // if (recommendation.confidence > 80) {
        //   await this.adjustRentalPricing(
        //     nftContract,
        //     tokenId,
        //     ownerAddress,
        //     recommendation.suggestedPrice
        //   );
        // }
      } catch (error) {
        console.error('Autonomous monitoring error:', error);
      }
    }, 3600000); // Every hour
  }

  /**
   * Automatically adjust rental pricing based on AI recommendations
   */
  private async adjustRentalPricing(
    nftContract: string,
    tokenId: string,
    ownerAddress: string,
    newPrice: number
  ): Promise<void> {
    if (!this.nftFlowContract || !this.provider) return;

    const signer = await this.provider.getSigner(ownerAddress);
    const contract = this.nftFlowContract.connect(signer);
    
    const priceInWei = ethers.parseEther(newPrice.toString());
    
    try {
      // Note: updateRentalPrice method needs to be implemented in contract
      if ('updateRentalPrice' in contract) {
        const tx = await (contract as any).updateRentalPrice(nftContract, tokenId, priceInWei);
        await tx.wait();
        console.log(`✅ AI Agent automatically adjusted price to ${newPrice} STT/second`);
      } else {
        console.warn('updateRentalPrice method not available in contract');
      }
    } catch (error) {
      console.error('Failed to adjust pricing:', error);
    }
  }

  /**
   * Update provider and contract references
   */
  updateProvider(provider: ethers.BrowserProvider | null): void {
    this.provider = provider;
  }

  updateContract(contractAddress: string | null, contractABI: any[]): void {
    if (contractAddress && this.provider) {
      this.nftFlowContract = new ethers.Contract(
        contractAddress,
        contractABI,
        this.provider
      );
    }
  }
}

