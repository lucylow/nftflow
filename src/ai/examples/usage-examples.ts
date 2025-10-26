/**
 * NFTFlow AI Usage Examples
 * 
 * Comprehensive examples demonstrating how to use the multi-model AI system
 */

import { 
  AIWorkflowOrchestrator, 
  ModelManager,
  MultiModelPricingAgent,
  ContentGenerationAgent,
  RiskAssessmentAgent,
  type PricingAnalysis,
  type NFTMetadata,
  type RiskAssessment,
  type UserRiskProfile,
  type MarketData
} from '../index';

// ==========================================
// Example 1: Complete Intelligent Listing Workflow
// ==========================================

export async function exampleIntelligentListing() {
  console.log('🚀 Example: Intelligent Listing Workflow\n');

  const orchestrator = new AIWorkflowOrchestrator();

  // NFT Data
  const nftData = {
    metadata: {
      name: 'Digital Art #1234',
      collection: 'Awesome Collection',
      rarity: 'Legendary',
      attributes: [
        { trait_type: 'Color', value: 'Gold' },
        { trait_type: 'Style', value: 'Abstract' },
        { trait_type: 'Edition', value: '1/100' }
      ]
    },
    marketData: {
      floorPrice: 50,
      volume24h: 10000,
      averageRentalDuration: 24,
      competitorPrices: [45, 55, 60, 48],
      trendingCollections: ['Trending A', 'Trending B']
    },
    imageUrl: 'https://example.com/nft-image.png',
    baseAttributes: [
      { trait_type: 'Color', value: 'Gold' },
      { trait_type: 'Style', value: 'Abstract' }
    ],
    estimatedValue: 1000
  };

  // User Preferences
  const userPreferences = {
    userProfile: {
      walletAddress: '0x1234567890abcdef',
      totalRentals: 15,
      successfulRentals: 14,
      averageRentalDuration: 48,
      reputationScore: 850,
      accountAge: 180
    },
    contentStyle: {
      style: 'creative' as const,
      tone: 'enthusiastic' as const,
      length: 'medium' as const
    },
    preferredDuration: 24
  };

  try {
    const result = await orchestrator.executeIntelligentListing(
      nftData,
      userPreferences,
      'medium' // budget
    );

    console.log('✅ Intelligent Listing Complete!\n');
    console.log('Workflow ID:', result.workflowId);
    console.log('\n📊 Pricing Analysis:');
    console.log('  Optimal Price:', result.pricing.optimalPrice);
    console.log('  Confidence:', result.pricing.confidence + '%');
    console.log('  Market Trend:', result.pricing.marketTrend);
    console.log('  Risk Factors:', result.pricing.riskFactors);
    
    console.log('\n🎨 Generated Metadata:');
    console.log('  Name:', result.metadata.name);
    console.log('  Description:', result.metadata.description);
    
    console.log('\n🛡️ Risk Assessment:');
    console.log('  Risk Level:', result.risk.riskLevel);
    console.log('  Recommended Collateral:', result.collateral);
    console.log('  Risk Factors:', result.risk.riskFactors.length);
    
    console.log('\n💡 Recommendations:');
    result.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    
    console.log('\n💰 Workflow Statistics:');
    console.log('  Total Cost: $' + result.totalCost.toFixed(4));
    console.log('  Total Latency:', result.totalLatency + 'ms');

    return result;
  } catch (error) {
    console.error('❌ Workflow failed:', error);
    throw error;
  }
}

// ==========================================
// Example 2: Standalone Pricing Analysis
// ==========================================

export async function examplePricingAnalysis() {
  console.log('💰 Example: Standalone Pricing Analysis\n');

  const modelManager = new ModelManager();
  const pricingAgent = new MultiModelPricingAgent(modelManager);

  const nftMetadata = {
    name: 'Epic NFT #999',
    collection: 'Premium Collection',
    rarity: 'Mythic',
    attributes: [
      { trait_type: 'Power', value: '10/10' },
      { trait_type: 'Tier', value: 'S+' }
    ]
  };

  const marketData: MarketData = {
    floorPrice: 75,
    volume24h: 50000,
    averageRentalDuration: 48,
    competitorPrices: [70, 80, 85, 72],
    trendingCollections: ['Trending Collection A', 'Trending Collection B']
  };

  try {
    const analysis = await pricingAgent.analyzeNFTPricing(
      nftMetadata,
      marketData,
      'medium'
    );

    console.log('✅ Pricing Analysis Complete!\n');
    console.log('Optimal Price:', analysis.optimalPrice, 'STT');
    console.log('Confidence:', analysis.confidence + '%');
    console.log('Market Trend:', analysis.marketTrend);
    console.log('\nReasoning:', analysis.reasoning);
    console.log('\nSuggested Actions:');
    analysis.suggestedActions.forEach((action, i) => {
      console.log(`  ${i + 1}. ${action}`);
    });
    console.log('\nRisk Factors:');
    analysis.riskFactors.forEach((risk, i) => {
      console.log(`  ${i + 1}. ${risk}`);
    });

    return analysis;
  } catch (error) {
    console.error('❌ Pricing analysis failed:', error);
    throw error;
  }
}

// ==========================================
// Example 3: Content Generation
// ==========================================

export async function exampleContentGeneration() {
  console.log('🎨 Example: Content Generation\n');

  const modelManager = new ModelManager();
  const contentAgent = new ContentGenerationAgent(modelManager);

  const imageUrl = 'https://example.com/nft-art.png';
  const baseAttributes = [
    { trait_type: 'Genre', value: 'Sci-Fi' },
    { trait_type: 'Color Scheme', value: 'Neon' },
    { trait_type: 'Mood', value: 'Futuristic' }
  ];

  try {
    // Generate single metadata
    console.log('Generating metadata...');
    const metadata = await contentAgent.generateNFTMetadata(
      imageUrl,
      baseAttributes,
      { 
        style: 'creative',
        tone: 'enthusiastic',
        length: 'medium'
      }
    );

    console.log('✅ Metadata Generated!\n');
    console.log('Name:', metadata.name);
    console.log('Description:', metadata.description);
    console.log('Attributes:', metadata.attributes);

    // Generate A/B test variations
    console.log('\nGenerating A/B test variations...');
    const variations = await contentAgent.generateMetadataVariations(
      imageUrl,
      baseAttributes,
      3
    );

    console.log(`\n✅ Generated ${variations.length} Variations:\n`);
    variations.forEach((meta, i) => {
      console.log(`Variation ${i + 1}:`);
      console.log('  Name:', meta.name);
      console.log('  Description:', meta.description.substring(0, 100) + '...');
    });

    return { metadata, variations };
  } catch (error) {
    console.error('❌ Content generation failed:', error);
    throw error;
  }
}

// ==========================================
// Example 4: Risk Assessment
// ==========================================

export async function exampleRiskAssessment() {
  console.log('🛡️ Example: Risk Assessment\n');

  const modelManager = new ModelManager();
  const riskAgent = new RiskAssessmentAgent(modelManager);

  const userProfile: UserRiskProfile = {
    walletAddress: '0xabcdef1234567890',
    totalRentals: 25,
    successfulRentals: 23,
    averageRentalDuration: 72,
    reputationScore: 920,
    accountAge: 365
  };

  const nftValue = 1500;
  const rentalDuration = 48; // hours

  try {
    const assessment = await riskAgent.assessRentalRisk(
      userProfile,
      nftValue,
      rentalDuration,
      'medium'
    );

    console.log('✅ Risk Assessment Complete!\n');
    console.log('Risk Level:', assessment.riskLevel.toUpperCase());
    console.log('Confidence:', assessment.confidence + '%');
    console.log('Overall Score:', assessment.overallScore + '/100');
    console.log('Recommended Collateral:', assessment.recommendedCollateral, 'STT');
    
    console.log('\nRisk Factors:');
    assessment.riskFactors.forEach((factor, i) => {
      console.log(`  ${i + 1}. ${factor.factor} (${factor.severity})`);
      console.log(`     ${factor.description}`);
    });

    console.log('\nMitigation Strategies:');
    assessment.mitigationStrategies.forEach((strategy, i) => {
      console.log(`  ${i + 1}. ${strategy}`);
    });

    // Calculate dynamic collateral
    const dynamicCollateral = riskAgent.calculateDynamicCollateral(
      nftValue,
      assessment
    );
    console.log('\n💎 Calculated Dynamic Collateral:', dynamicCollateral, 'STT');

    return { assessment, dynamicCollateral };
  } catch (error) {
    console.error('❌ Risk assessment failed:', error);
    throw error;
  }
}

// ==========================================
// Example 5: Batch Analysis
// ==========================================

export async function exampleBatchAnalysis() {
  console.log('📊 Example: Batch NFT Analysis\n');

  const modelManager = new ModelManager();
  const pricingAgent = new MultiModelPricingAgent(modelManager);

  const nfts = [
    {
      metadata: { name: 'NFT #1', rarity: 'Common' },
      marketData: {
        floorPrice: 50,
        volume24h: 5000,
        averageRentalDuration: 24,
        competitorPrices: [45, 50, 55],
        trendingCollections: ['Collection A']
      }
    },
    {
      metadata: { name: 'NFT #2', rarity: 'Rare' },
      marketData: {
        floorPrice: 100,
        volume24h: 15000,
        averageRentalDuration: 48,
        competitorPrices: [95, 105, 110],
        trendingCollections: ['Collection B']
      }
    },
    {
      metadata: { name: 'NFT #3', rarity: 'Legendary' },
      marketData: {
        floorPrice: 500,
        volume24h: 50000,
        averageRentalDuration: 72,
        competitorPrices: [480, 510, 520],
        trendingCollections: ['Collection C']
      }
    }
  ];

  try {
    console.log(`Analyzing ${nfts.length} NFTs in batch...\n`);
    const analyses = await pricingAgent.batchAnalyzeNFTs(
      nfts,
      'low' // Use cost-effective model for batch
    );

    console.log('✅ Batch Analysis Complete!\n');
    console.log('Results:\n');
    
    analyses.forEach((analysis, i) => {
      console.log(`NFT #${i + 1}:`);
      console.log('  Optimal Price:', analysis.optimalPrice, 'STT');
      console.log('  Confidence:', analysis.confidence + '%');
      console.log('  Market Trend:', analysis.marketTrend);
      console.log('');
    });

    return analyses;
  } catch (error) {
    console.error('❌ Batch analysis failed:', error);
    throw error;
  }
}

// ==========================================
// Example 6: Market Optimization
// ==========================================

export async function exampleMarketOptimization() {
  console.log('📈 Example: Market Optimization\n');

  const orchestrator = new AIWorkflowOrchestrator();

  const listedNFTs = [
    {
      id: 'nft-1',
      metadata: { name: 'NFT A' },
      marketData: {
        floorPrice: 50,
        volume24h: 5000,
        averageRentalDuration: 24,
        competitorPrices: [45, 50, 55],
        trendingCollections: ['Collection A']
      },
      currentPrice: 55
    },
    {
      id: 'nft-2',
      metadata: { name: 'NFT B' },
      marketData: {
        floorPrice: 100,
        volume24h: 15000,
        averageRentalDuration: 48,
        competitorPrices: [95, 105, 110],
        trendingCollections: ['Collection B']
      },
      currentPrice: 110
    }
  ];

  try {
    const result = await orchestrator.executeMarketOptimization(
      listedNFTs,
      'balanced' // aggressive | conservative | balanced
    );

    console.log('✅ Market Optimization Complete!\n');
    console.log(`Analyzed ${listedNFTs.length} NFTs\n`);
    console.log('Optimization Results:\n');
    
    result.optimizations.forEach((opt, i) => {
      console.log(`NFT ${i + 1}:`);
      console.log('  Current Price:', opt.currentPrice);
      console.log('  Recommended Price:', opt.recommendedPrice);
      console.log('  Adjustment:', opt.adjustment > 0 ? '+' : '', opt.adjustment);
      console.log('  Confidence:', opt.confidence + '%');
      console.log('  Reasoning:', opt.reasoning);
      console.log('');
    });

    console.log('Summary:');
    console.log('  Total NFTs:', result.summary.totalNFTs);
    console.log('  Average Adjustment:', result.summary.averageAdjustment.toFixed(2));
    console.log('  High Confidence Count:', result.summary.highConfidenceCount);

    return result;
  } catch (error) {
    console.error('❌ Market optimization failed:', error);
    throw error;
  }
}

// ==========================================
// Example 7: Workflow Analytics
// ==========================================

export async function exampleWorkflowAnalytics() {
  console.log('📊 Example: Workflow Analytics\n');

  const orchestrator = new AIWorkflowOrchestrator();

  // Run some workflows first
  console.log('Running sample workflows...\n');
  
  try {
    // Simulate running workflows
    await examplePricingAnalysis();
    await exampleContentGeneration();
    
    // Get analytics
    const analytics = orchestrator.getWorkflowAnalytics();
    
    console.log('✅ Workflow Analytics:\n');
    console.log('Total Workflows:', analytics.totalWorkflows);
    console.log('Success Rate:', (analytics.successRate * 100).toFixed(2) + '%');
    console.log('Average Cost:', '$' + analytics.averageCost.toFixed(4));
    console.log('Average Latency:', analytics.averageLatency + 'ms');
    console.log('Total Cost:', '$' + analytics.totalCost.toFixed(4));
    console.log('Total Workflows:', analytics.totalWorkflows);

    // Get available models
    const models = orchestrator.getAvailableModels();
    console.log('\n🤖 Available AI Models:\n');
    models.models.forEach((model: any) => {
      console.log(`${model.name} (${model.provider}):`);
      console.log('  Cost: $' + model.costPer1kTokens + '/1k tokens');
      console.log('  Speed:', model.speed);
      console.log('  Capabilities:', model.capabilities.join(', '));
    });

    return analytics;
  } catch (error) {
    console.error('❌ Analytics failed:', error);
    throw error;
  }
}

// ==========================================
// Example Runner
// ==========================================

export async function runAllExamples() {
  console.log('🎯 Running All NFTFlow AI Examples\n');
  console.log('=' .repeat(60));
  console.log('');

  try {
    await exampleIntelligentListing();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await examplePricingAnalysis();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await exampleContentGeneration();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await exampleRiskAssessment();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await exampleBatchAnalysis();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await exampleMarketOptimization();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await exampleWorkflowAnalytics();
    
    console.log('\n✅ All Examples Completed Successfully!\n');
  } catch (error) {
    console.error('\n❌ Examples Failed:', error);
  }
}

