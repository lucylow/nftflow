import { ModelManager, ModelRequest } from '../ModelManager';

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendedCollateral: number;
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  mitigationStrategies: string[];
  overallScore: number; // 0-100
}

export interface UserRiskProfile {
  walletAddress: string;
  totalRentals: number;
  successfulRentals: number;
  averageRentalDuration: number;
  reputationScore: number;
  accountAge: number; // days
}

export class RiskAssessmentAgent {
  private modelManager: ModelManager;

  constructor(modelManager: ModelManager) {
    this.modelManager = modelManager;
  }

  /**
   * Assess rental risk using AI models
   */
  async assessRentalRisk(
    userProfile: UserRiskProfile,
    nftValue: number,
    rentalDuration: number,
    budget: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<RiskAssessment> {
    const systemPrompt = `You are a risk assessment AI for NFT rentals. Analyze user profiles and rental parameters to determine risk levels and recommend appropriate collateral.

Risk Factors to Consider:
- User rental history and success rate
- Account age and reputation
- NFT value and rental duration
- Market volatility indicators

Return JSON in this structure:
{
  "riskLevel": "low|medium|high|critical",
  "confidence": number,
  "recommendedCollateral": number,
  "riskFactors": [
    {
      "factor": "string",
      "severity": "low|medium|high", 
      "description": "string"
    }
  ],
  "mitigationStrategies": string[],
  "overallScore": number
}`;

    const userPrompt = `
Assess risk for this rental:

USER PROFILE:
- Wallet: ${userProfile.walletAddress}
- Total Rentals: ${userProfile.totalRentals}
- Successful Rentals: ${userProfile.successfulRentals}
- Success Rate: ${((userProfile.successfulRentals / userProfile.totalRentals) * 100).toFixed(1)}%
- Reputation Score: ${userProfile.reputationScore}/1000
- Account Age: ${userProfile.accountAge} days

RENTAL PARAMETERS:
- NFT Value: ${nftValue} STT
- Rental Duration: ${rentalDuration} hours

Provide detailed risk assessment:`;

    const request: ModelRequest = {
      systemPrompt,
      userPrompt,
      temperature: 0.2, // Very low temperature for consistent risk assessment
      maxTokens: 2000,
      jsonMode: true
    };

    const response = await this.modelManager.executeWithFallback(
      request,
      'risk-assessment',
      budget
    );

    const assessment = JSON.parse(response.content) as RiskAssessment;

    console.log(`🛡️ Risk Assessment Complete:`, {
      model: response.model,
      riskLevel: assessment.riskLevel,
      confidence: assessment.confidence,
      recommendedCollateral: assessment.recommendedCollateral,
      cost: response.cost,
      latency: response.latency
    });

    return assessment;
  }

  /**
   * Calculate dynamic collateral based on risk assessment
   */
  calculateDynamicCollateral(
    nftValue: number,
    riskAssessment: RiskAssessment
  ): number {
    const baseCollateral = nftValue;
    
    const riskMultipliers = {
      low: 0.5,
      medium: 0.8,
      high: 1.2,
      critical: 2.0
    };

    const multiplier = riskMultipliers[riskAssessment.riskLevel];
    return baseCollateral * multiplier;
  }

  /**
   * Batch assess multiple rental requests
   */
  async batchAssessRisks(
    assessments: Array<{
      userProfile: UserRiskProfile;
      nftValue: number;
      rentalDuration: number;
    }>,
    budget: 'low' | 'medium' | 'high' = 'low'
  ): Promise<RiskAssessment[]> {
    const results: RiskAssessment[] = [];

    // Process in parallel with rate limiting
    const batchSize = 5;
    for (let i = 0; i < assessments.length; i += batchSize) {
      const batch = assessments.slice(i, i + batchSize);
      
      const batchPromises = batch.map(assessment =>
        this.assessRentalRisk(
          assessment.userProfile,
          assessment.nftValue,
          assessment.rentalDuration,
          budget
        )
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Rate limiting delay
      if (i + batchSize < assessments.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

