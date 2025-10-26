import { ethers } from 'ethers';
import { OpenAI } from 'openai';

interface CollateralAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  recommendedCollateral: number;
  confidence: number;
  explanation: string;
}

interface ReputationData {
  score: number;
  successRatio: number;
}

export class CollateralAgent {
  private provider: ethers.BrowserProvider | null;
  private openai: OpenAI;
  private reputationContract: ethers.Contract | null = null;
  private reputationABI = [
    'function getReputation(address user) external view returns (uint256 score)',
    'function totalRentals(address user) view returns (uint256)',
    'function successfulRentals(address user) view returns (uint256)',
  ];

  constructor(
    apiKey: string,
    provider: ethers.BrowserProvider | null,
    reputationContractAddress: string | null
  ) {
    this.openai = new OpenAI({ apiKey });
    this.provider = provider;
    
    if (reputationContractAddress && provider) {
      this.reputationContract = new ethers.Contract(
        reputationContractAddress,
        this.reputationABI,
        provider
      );
    }
  }

  async assessRisk(
    renter: string,
    nftValue: number,
    duration: number
  ): Promise<CollateralAssessment> {
    const reputation = await this.fetchReputationData(renter);

    const prompt = `
You are a DeFi risk analyst AI evaluating rental collateral requirements on Somnia blockchain.

User Stats:
Reputation Score: ${reputation.score}
Rent Success Ratio: ${reputation.successRatio}%
NFT Value: ${nftValue} STT
Rental Duration: ${duration} seconds

Output (JSON only):
{
  "riskLevel": "low|medium|high",
  "recommendedCollateral": number (in STT, usually 1.5-3x NFT value),
  "confidence": number (0-100),
  "explanation": "string one sentence"
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an autonomous AI for blockchain credit scoring.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        riskLevel: result.riskLevel || 'medium',
        recommendedCollateral: result.recommendedCollateral || nftValue * 2,
        confidence: result.confidence || 50,
        explanation: result.explanation || 'Standard collateral requirement.'
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        riskLevel: 'medium',
        recommendedCollateral: nftValue * 2,
        confidence: 50,
        explanation: 'Risk assessment unavailable. Using standard collateral.'
      };
    }
  }

  private async fetchReputationData(user: string): Promise<ReputationData> {
    if (!this.reputationContract) {
      // Return mock data if contract not available
      return {
        score: 750,
        successRatio: 92
      };
    }

    try {
      const [score, total, good] = await Promise.all([
        this.reputationContract.getReputation(user),
        this.reputationContract.totalRentals(user),
        this.reputationContract.successfulRentals(user),
      ]);

      const successRatio =
        total.toNumber() === 0 ? 0 : (good.toNumber() / total.toNumber()) * 100;

      return {
        score: score.toNumber(),
        successRatio: parseFloat(successRatio.toFixed(2)),
      };
    } catch (error) {
      console.error('Failed to fetch reputation:', error);
      return {
        score: 500,
        successRatio: 50
      };
    }
  }

  async automateAdjustments(rentalId: number, renter: string, nftValue: number) {
    const assessment = await this.assessRisk(renter, nftValue, 3600);
    if (assessment.riskLevel === 'high') {
      console.warn(
        `⚠️ AI flagged rental ${rentalId} as high-risk: ${assessment.explanation}`
      );
    } else {
      console.log(`✅ AI validated renter for rental ${rentalId}`);
    }
  }

  updateProvider(provider: ethers.BrowserProvider | null): void {
    this.provider = provider;
    
    // Re-initialize contract if address is known
    if (provider) {
      // Would need to store reputationContractAddress
      // For now, just log
      console.log('Provider updated for CollateralAgent');
    }
  }
}
