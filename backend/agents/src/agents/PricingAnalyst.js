/**
 * Pricing Analyst Agent
 * Autonomous pricing optimization for NFT rentals
 */

import { OpenAI } from 'openai';
import axios from 'axios';

export class PricingAnalystAgent {
  constructor(config) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.somniaRpc = config.somniaRpc;
  }

  /**
   * Analyze optimal pricing for an NFT
   */
  async analyzePricing(nftContract, tokenId) {
    console.log(`📊 Analyzing pricing for ${nftContract}/${tokenId}`);

    // Gather market data
    const marketData = await this.gatherMarketData(nftContract, tokenId);

    // AI analysis
    const recommendation = await this.analyzeWithAI(marketData);

    return {
      nftContract,
      tokenId,
      ...recommendation,
      timestamp: Date.now(),
    };
  }

  /**
   * Gather market data from subgraph and oracles
   */
  async gatherMarketData(nftContract, tokenId) {
    // Query historical rentals for this NFT
    const query = `
      {
        rentals(where: { 
          nftContract: "${nftContract.toLowerCase()}", 
          tokenId: "${tokenId}" 
        }, first: 50, orderBy: timestamp, orderDirection: desc) {
          pricePerSecond
          duration
          completed
          timestamp
        }
      }
    `;

    let rentals = [];
    const subgraphUrl = process.env.SUBGRAPH_URL || 'http://localhost:8000/subgraphs/name/nftflow';
    
    try {
      const response = await axios.post(subgraphUrl, { query });
      rentals = response.data?.data?.rentals || [];
    } catch (error) {
      console.error('Subgraph query failed:', error);
      rentals = this.getMockRentals();
    }

    // Calculate statistics
    const completedRentals = rentals.filter(r => r.completed);
    const utilizationRate = completedRentals.length / Math.max(rentals.length, 1);
    
    const prices = rentals.map(r => parseFloat(r.pricePerSecond || 0));
    const durations = rentals.map(r => parseInt(r.duration || 0));

    const meanPrice = prices.length > 0 
      ? prices.reduce((a, b) => a + b, 0) / prices.length 
      : 0.000001;

    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 3600;

    // Get floor price from oracle
    const floorPrice = await this.fetchFloorPrice(nftContract);

    return {
      totalRentals: rentals.length,
      successfulRentals: completedRentals.length,
      utilizationRate,
      meanPrice,
      avgDuration,
      floorPrice,
      trend: this.calculateTrend(rentals),
    };
  }

  /**
   * Analyze with AI
   */
  async analyzeWithAI(marketData) {
    const prompt = `
You are an AI pricing analyst for NFTFlow rental marketplace on Somnia blockchain.

Market Data:
- Total Rentals: ${marketData.totalRentals}
- Successful Rentals: ${marketData.successfulRentals}
- Utilization Rate: ${(marketData.utilizationRate * 100).toFixed(1)}%
- Mean Price: ${marketData.meanPrice} STT/sec
- Average Duration: ${marketData.avgDuration} seconds
- Floor Price: ${marketData.floorPrice} STT
- Trend: ${marketData.trend}

Recommend optimal pricing strategy to maximize utilization while maintaining profitability.

Return JSON:
{
  "optimalPrice": number (in STT per second),
  "confidence": number (0-100),
  "reasoning": string,
  "utilizationProjection": number (0-100),
  "revenueProjection": number (percentage change)
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a blockchain market data analyst.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      
      return {
        optimalPrice: parsed.optimalPrice || marketData.meanPrice,
        confidence: parsed.confidence || 50,
        reasoning: parsed.reasoning || 'Analysis unavailable.',
        utilizationProjection: parsed.utilizationProjection || 50,
        revenueProjection: parsed.revenueProjection || 0,
      };
    } catch (error) {
      console.error('OpenAI error:', error);
      return {
        optimalPrice: marketData.meanPrice || 0.000001,
        confidence: 30,
        reasoning: 'AI analysis unavailable. Using historical mean price.',
        utilizationProjection: marketData.utilizationRate * 100,
        revenueProjection: 0,
      };
    }
  }

  /**
   * Fetch floor price from oracle
   */
  async fetchFloorPrice(nftContract) {
    // In production, this would call DIA Oracle or similar
    try {
      const response = await axios.get(
        `${process.env.ORACLE_URL || 'https://oracle.somnia.network'}/floor/${nftContract}`
      );
      return parseFloat(response.data.floorPrice || 0.001);
    } catch (error) {
      console.warn('Oracle fetch failed, using fallback');
      return 0.001;
    }
  }

  /**
   * Calculate price trend
   */
  calculateTrend(rentals) {
    if (rentals.length < 2) return 'stable';

    const recent = rentals.slice(0, 10).map(r => parseFloat(r.pricePerSecond || 0));
    const older = rentals.slice(10, 20).map(r => parseFloat(r.pricePerSecond || 0));

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (recentAvg > olderAvg * 1.1) return 'increasing';
    if (recentAvg < olderAvg * 0.9) return 'decreasing';
    return 'stable';
  }

  getMockRentals() {
    return [
      { pricePerSecond: '0.000001', duration: 3600, completed: true, timestamp: Date.now() - 86400000 },
      { pricePerSecond: '0.0000012', duration: 7200, completed: true, timestamp: Date.now() - 172800000 },
      { pricePerSecond: '0.0000009', duration: 5400, completed: false, timestamp: Date.now() - 259200000 },
    ];
  }
}

