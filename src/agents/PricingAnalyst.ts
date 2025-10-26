import { ethers } from 'ethers';
import { OpenAI } from 'openai';

interface PriceRecommendation {
  optimalPrice: number;
  confidence: number;
  reasoning: string;
  utilization: number;
  revenueProjection: number;
}

interface HistoricalStats {
  utilizationRate: number;
  avgRentalDuration: number;
  meanPrice: number;
  floorPrice: number;
  trend: 'up' | 'down' | 'flat';
}

export class PricingAnalyst {
  private provider: ethers.BrowserProvider | null;
  private openai: OpenAI;
  private contractAddress: string | null;
  private nftFlowContract: ethers.Contract | null = null;
  private active = false;
  private subscribers: Map<string, Set<any>> = new Map();

  constructor(
    apiKey: string,
    provider: ethers.BrowserProvider | null,
    contractAddress: string | null,
    contractABI: any[]
  ) {
    this.openai = new OpenAI({ apiKey });
    this.provider = provider;
    this.contractAddress = contractAddress;
    
    if (contractAddress && provider) {
      this.nftFlowContract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );
    }
  }

  isActive() {
    return this.active;
  }

  async start() {
    this.active = true;
    console.log('📈 PricingAnalyst Agent started.');
  }

  async stop() {
    this.active = false;
    console.log('🛑 PricingAnalyst Agent stopped.');
  }

  async analyzePricing(
    nftContract: string,
    tokenId: string
  ): Promise<PriceRecommendation> {
    const stats = await this.gatherData(nftContract, tokenId);
    const aiRecommendation = await this.analyzeWithAI(stats);
    return aiRecommendation;
  }

  private async gatherData(nftContract: string, tokenId: string): Promise<HistoricalStats> {
    // Mock data for demonstration - replace with actual subgraph queries
    const rentals = [
      { duration: 3600, pricePerSecond: '0.000001', completed: true },
      { duration: 7200, pricePerSecond: '0.0000012', completed: true },
      { duration: 5400, pricePerSecond: '0.0000009', completed: true }
    ];

    const durations = rentals.map((r: any) => Number(r.duration));
    const meanDuration = durations.reduce((a: number, b: number) => a + b, 0) / durations.length;
    
    const prices = rentals.map((r: any) => parseFloat(r.pricePerSecond));
    const meanPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const utilization = rentals.length > 0 ? 0.75 : 0.2;

    const floorPrice = await this.fetchFloorPriceFromOracle(nftContract);
    const trend = meanPrice > floorPrice ? 'up' : meanPrice < floorPrice ? 'down' : 'flat';

    return {
      utilizationRate: utilization,
      avgRentalDuration: meanDuration,
      meanPrice,
      floorPrice,
      trend,
    };
  }

  private async fetchFloorPriceFromOracle(nftContract: string): Promise<number> {
    // Mock oracle fetch - replace with actual DIA oracle integration
    try {
      // In production, this would call: `${process.env.ORACLE_FEED}/floor/${nftContract}`
      const oracleRes = await fetch(`https://oracle-feed.placeholder.com/floor/${nftContract}`);
      const data = await oracleRes.json();
      return parseFloat(data.floorPrice ?? 0.000002);
    } catch (err) {
      console.warn('Oracle issue; using fallback floor price.');
      return 0.000002;
    }
  }

  private async analyzeWithAI(stats: HistoricalStats): Promise<PriceRecommendation> {
    const prompt = `
You are an AI pricing analyst for NFTFlow's rental marketplace on Somnia blockchain. Based on these stats:

Utilization Rate: ${stats.utilizationRate}
Average Rental Duration: ${stats.avgRentalDuration} seconds
Mean Price: ${stats.meanPrice} STT/sec
Floor Price: ${stats.floorPrice} STT
Trend: ${stats.trend}

Recommend:
- Optimal rental price per second (number)
- Confidence score 0-100 (number)
- Reasoning about market trends (string)
- Projected utilization % (number)
- Projected revenue increase % (number)

Return JSON:
{
  "optimalPrice": number,
  "confidence": number,
  "reasoning": string,
  "utilization": number,
  "revenueProjection": number
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a data scientist specialized in blockchain markets.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        optimalPrice: stats.meanPrice || 0.000001,
        confidence: 50,
        reasoning: 'Market analysis unavailable. Using default pricing.',
        utilization: 0.5,
        revenueProjection: 0
      };
    }
  }

  subscribeNFT(nftContract: string, tokenId: string, socket: any) {
    const key = `${nftContract}:${tokenId}`;
    if (!this.subscribers.has(key)) this.subscribers.set(key, new Set());
    this.subscribers.get(key)!.add(socket);

    socket.on('disconnect', () => {
      this.subscribers.get(key)?.delete(socket);
    });
  }

  private emitUpdate(nftContract: string, tokenId: string, data: any) {
    const sockets = this.subscribers.get(`${nftContract}:${tokenId}`);
    if (sockets) sockets.forEach(socket => socket.emit('pricing_update', data));
  }

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

