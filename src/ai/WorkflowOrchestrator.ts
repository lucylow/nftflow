import { ModelManager } from './ModelManager';
import { MultiModelPricingAgent } from './agents/MultiModelPricingAgent';
import { ContentGenerationAgent } from './agents/ContentGenerationAgent';
import { RiskAssessmentAgent } from './agents/RiskAssessmentAgent';

export class AIWorkflowOrchestrator {
  private modelManager: ModelManager;
  private pricingAgent: MultiModelPricingAgent;
  private contentAgent: ContentGenerationAgent;
  private riskAgent: RiskAssessmentAgent;

  private workflowStats: Map<string, any> = new Map();

  constructor() {
    this.modelManager = new ModelManager();
    this.pricingAgent = new MultiModelPricingAgent(this.modelManager);
    this.contentAgent = new ContentGenerationAgent(this.modelManager);
    this.riskAgent = new RiskAssessmentAgent(this.modelManager);
  }

  /**
   * Execute intelligent NFT listing workflow
   */
  async executeIntelligentListing(
    nftData: any,
    userPreferences: any,
    budget: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<any> {
    const workflowId = `listing-${Date.now()}`;
    const startTime = Date.now();

    console.log(`🚀 Starting intelligent listing workflow: ${workflowId}`);

    try {
      // Step 1: Analyze NFT and generate pricing
      console.log('📊 Step 1: Analyzing NFT pricing...');
      const pricingAnalysis = await this.pricingAgent.analyzeNFTPricing(
        nftData.metadata,
        nftData.marketData,
        budget
      );

      // Step 2: Generate compelling metadata
      console.log('🎨 Step 2: Generating metadata...');
      const metadata = await this.contentAgent.generateNFTMetadata(
        nftData.imageUrl,
        nftData.baseAttributes,
        userPreferences.contentStyle
      );

      // Step 3: Assess risk and collateral
      console.log('🛡️ Step 3: Assessing risk...');
      const riskAssessment = await this.riskAgent.assessRentalRisk(
        userPreferences.userProfile,
        nftData.estimatedValue,
        userPreferences.preferredDuration,
        budget
      );

      // Step 4: Calculate dynamic collateral
      const dynamicCollateral = this.riskAgent.calculateDynamicCollateral(
        nftData.estimatedValue,
        riskAssessment
      );

      const result = {
        workflowId,
        pricing: pricingAnalysis,
        metadata,
        risk: riskAssessment,
        collateral: dynamicCollateral,
        recommendations: this.generateListingRecommendations(pricingAnalysis, riskAssessment),
        totalCost: this.calculateWorkflowCost([pricingAnalysis, metadata, riskAssessment]),
        totalLatency: Date.now() - startTime
      };

      this.trackWorkflowPerformance(workflowId, 'success', result.totalCost, result.totalLatency);
      
      console.log(`✅ Intelligent listing workflow completed: ${workflowId}`);
      return result;

    } catch (error) {
      console.error(`❌ Intelligent listing workflow failed: ${workflowId}`, error);
      this.trackWorkflowPerformance(workflowId, 'failed', 0, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Execute market optimization workflow
   */
  async executeMarketOptimization(
    listedNFTs: any[],
    optimizationStrategy: 'aggressive' | 'conservative' | 'balanced' = 'balanced'
  ): Promise<any> {
    const workflowId = `optimization-${Date.now()}`;
    
    console.log(`📈 Starting market optimization workflow: ${workflowId}`);

    // Use cost-effective batch processing for optimization
    const budget = optimizationStrategy === 'aggressive' ? 'medium' : 'low';

    try {
      const batchAnalyses = await this.pricingAgent.batchAnalyzeNFTs(
        listedNFTs.map(nft => ({
          metadata: nft.metadata,
          marketData: nft.marketData
        })),
        budget
      );

      const optimizations = listedNFTs.map((nft, index) => ({
        nftId: nft.id,
        currentPrice: nft.currentPrice,
        recommendedPrice: batchAnalyses[index].optimalPrice,
        adjustment: batchAnalyses[index].optimalPrice - nft.currentPrice,
        confidence: batchAnalyses[index].confidence,
        reasoning: batchAnalyses[index].reasoning
      }));

      const result = {
        workflowId,
        optimizations,
        summary: {
          totalNFTs: optimizations.length,
          averageAdjustment: optimizations.reduce((sum, opt) => sum + opt.adjustment, 0) / optimizations.length,
          highConfidenceCount: optimizations.filter(opt => opt.confidence > 80).length
        }
      };

      console.log(`✅ Market optimization completed: ${workflowId}`);
      return result;

    } catch (error) {
      console.error(`❌ Market optimization failed: ${workflowId}`, error);
      throw error;
    }
  }

  /**
   * Generate listing recommendations based on analysis
   */
  private generateListingRecommendations(
    pricing: any,
    risk: any
  ): string[] {
    const recommendations: string[] = [];

    if (pricing.confidence > 80) {
      recommendations.push('High confidence in pricing - proceed with listing');
    } else {
      recommendations.push('Consider manual review of pricing due to lower confidence');
    }

    if (risk.riskLevel === 'high' || risk.riskLevel === 'critical') {
      recommendations.push('High risk detected - consider additional verification');
    }

    if (pricing.marketTrend === 'bullish') {
      recommendations.push('Market trending upward - consider premium pricing');
    } else if (pricing.marketTrend === 'bearish') {
      recommendations.push('Market trending downward - consider competitive pricing');
    }

    return recommendations;
  }

  /**
   * Calculate total workflow cost
   */
  private calculateWorkflowCost(analyses: any[]): number {
    // Sum costs from all AI operations
    return analyses.reduce((total, analysis) => total + (analysis.cost || 0), 0);
  }

  /**
   * Track workflow performance for observability
   */
  private trackWorkflowPerformance(
    workflowId: string,
    status: 'success' | 'failed',
    cost: number,
    latency: number
  ): void {
    this.workflowStats.set(workflowId, {
      status,
      cost,
      latency,
      timestamp: new Date()
    });
  }

  /**
   * Get workflow performance analytics
   */
  getWorkflowAnalytics(): any {
    const stats = Array.from(this.workflowStats.values());
    
    return {
      totalWorkflows: stats.length,
      successRate: stats.filter(s => s.status === 'success').length / stats.length,
      averageCost: stats.reduce((sum, s) => sum + s.cost, 0) / stats.length,
      averageLatency: stats.reduce((sum, s) => sum + s.latency, 0) / stats.length,
      totalCost: stats.reduce((sum, s) => sum + s.cost, 0)
    };
  }

  /**
   * Get available AI models and their capabilities
   */
  getAvailableModels(): any {
    return {
      models: this.modelManager.getAvailableModels(),
      capabilities: {
        pricing: ['gpt-4o', 'claude-3-5-sonnet', 'gpt-4o-mini'],
        content: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
        risk: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
        batch: ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash']
      }
    };
  }
}

