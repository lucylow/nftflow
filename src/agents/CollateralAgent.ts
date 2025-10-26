import { ethers } from 'ethers';
import OpenAI from 'openai';

interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  recommendedCollateral: number;
  confidence: number;
  factors: string[];
}

interface ReputationData {
  score: number;
  totalRentals: number;
  successfulRentals: number;
  accountAge: number;
}

export class CollateralAgent {
  private openai: OpenAI;
  private reputationContract: ethers.Contract | null = null;
  
  constructor(
    apiKey: string,
    reputationContract: ethers.Contract | null
  ) {
    this.openai = new OpenAI({ apiKey });
    this.reputationContract = reputationContract;
  }

  /**
   * AI-powered risk assessment for collateral requirements
   */
  async assessRentalRisk(
    renterAddress: string,
    nftValue: number,
    rentalDuration: number
  ): Promise<RiskAssessment> {
    // Gather on-chain reputation data
    const reputation = await this.getReputationData(renterAddress);
    
    // Use AI to assess risk
    const prompt = `
Analyze the rental risk for this user on Somnia blockchain:

User Data:
- Reputation Score: ${reputation.score}/1000
- Total Rentals: ${reputation.totalRentals}
- Successful Rentals: ${reputation.successfulRentals}
- Success Rate: ${reputation.totalRentals > 0 ? (reputation.successfulRentals / reputation.totalRentals * 100).toFixed(1) : 0}%
- Account Age: ${reputation.accountAge} days

Rental Details:
- NFT Value: ${nftValue} STT
- Rental Duration: ${rentalDuration} seconds (${(rentalDuration / 3600).toFixed(1)} hours)

Recommend:
1. Risk level (low/medium/high)
2. Appropriate collateral amount (0-${nftValue})
3. Confidence in assessment (0-100%)
4. Key risk factors to consider

Respond in JSON:
{
  "riskLevel": "low|medium|high",
  "recommendedCollateral": number,
  "confidence": number,
  "factors": ["factor1", "factor2", ...]
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a risk assessment AI for NFT rentals." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Return fallback assessment
      return {
        riskLevel: 'medium' as const,
        recommendedCollateral: nftValue * 0.5,
        confidence: 50,
        factors: ['Unable to perform AI risk analysis. Using default conservative approach.']
      };
    }
  }

  /**
   * Get reputation data from smart contract
   */
  private async getReputationData(userAddress: string): Promise<ReputationData> {
    if (!this.reputationContract) {
      return {
        score: 500,
        totalRentals: 0,
        successfulRentals: 0,
        accountAge: 30
      };
    }

    try {
      const data = await this.reputationContract.getReputationData(userAddress);
      return {
        score: Number(data.score),
        totalRentals: Number(data.totalRentals),
        successfulRentals: Number(data.successfulRentals),
        accountAge: Number(data.accountAge || 30)
      };
    } catch (error) {
      console.error('Failed to get reputation data:', error);
      return {
        score: 0,
        totalRentals: 0,
        successfulRentals: 0,
        accountAge: 0
      };
    }
  }

  /**
   * Get collateral requirement based on AI risk assessment
   */
  async getCollateralRequirement(
    renterAddress: string,
    nftValue: number,
    rentalDuration: number
  ): Promise<{ amount: number; reasoning: string; riskLevel: string }> {
    const assessment = await this.assessRentalRisk(renterAddress, nftValue, rentalDuration);
    
    return {
      amount: assessment.recommendedCollateral,
      reasoning: assessment.factors.join('. '),
      riskLevel: assessment.riskLevel
    };
  }

  /**
   * Update contract reference
   */
  updateContract(reputationContract: ethers.Contract | null): void {
    this.reputationContract = reputationContract;
  }
}

