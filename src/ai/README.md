# NFTFlow AI Module

## Overview

The NFTFlow AI module provides a comprehensive, production-ready multi-model AI integration system for intelligent NFT rental marketplace operations. It supports multiple AI providers and automatically selects optimal models for different tasks.

## Features

### 🤖 Multi-Provider Support
- **OpenAI**: GPT-4o, GPT-4o-mini
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash
- **Replicate**: Open-source models (Llama 3.1, Mixtral)

### 💡 Intelligent Features
- **Automatic Fallback**: If one AI provider fails, automatically tries others
- **Cost Optimization**: Selects models based on budget constraints
- **Task-Specific Optimization**: Different models for different tasks
- **Performance Tracking**: Comprehensive metrics for cost and latency

### 🎯 Specialized Agents
- **MultiModelPricingAgent**: AI-powered NFT pricing analysis
- **ContentGenerationAgent**: Generate compelling metadata and descriptions
- **RiskAssessmentAgent**: Assess rental risks and recommend collateral

### ⚡ Production Ready
- Error handling and retry logic
- Cost tracking and analytics
- Rate limiting support
- Observability and logging

## Quick Start

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk @google/generative-ai replicate
```

### 2. Configure API Keys

Update your `.env` file:

```bash
# OpenAI
VITE_OPENAI_API_KEY=your_key_here

# Anthropic
VITE_ANTHROPIC_API_KEY=your_key_here

# Google
VITE_GOOGLE_API_KEY=your_key_here

# Replicate
VITE_REPLICATE_API_KEY=your_key_here
```

### 3. Use in Your Code

```typescript
import { AIWorkflowOrchestrator } from '@/ai';

// Initialize orchestrator
const orchestrator = new AIWorkflowOrchestrator();

// Execute intelligent listing workflow
const result = await orchestrator.executeIntelligentListing(
  {
    metadata: nftMetadata,
    marketData: marketData,
    imageUrl: imageUrl,
    baseAttributes: attributes,
    estimatedValue: 1000
  },
  {
    userProfile: userProfile,
    contentStyle: { style: 'creative', tone: 'enthusiastic' },
    preferredDuration: 24
  },
  'medium' // budget level
);

console.log('Optimal Price:', result.pricing.optimalPrice);
console.log('Collateral:', result.collateral);
console.log('Recommendations:', result.recommendations);
```

## Architecture

```
src/ai/
├── ModelManager.ts              # Core multi-provider AI manager
├── WorkflowOrchestrator.ts      # High-level workflow orchestration
├── config/
│   └── ai.config.ts            # Configuration and settings
├── agents/
│   ├── MultiModelPricingAgent.ts    # Pricing analysis
│   ├── ContentGenerationAgent.ts    # Content generation
│   └── RiskAssessmentAgent.ts      # Risk assessment
└── index.ts                     # Module exports
```

## Usage Examples

### Pricing Analysis

```typescript
import { MultiModelPricingAgent, ModelManager } from '@/ai';

const modelManager = new ModelManager();
const pricingAgent = new MultiModelPricingAgent(modelManager);

const analysis = await pricingAgent.analyzeNFTPricing(
  nftMetadata,
  {
    floorPrice: 50,
    volume24h: 1000,
    averageRentalDuration: 24,
    competitorPrices: [45, 55, 60],
    trendingCollections: ['Collection A', 'Collection B']
  },
  'medium' // budget
);

console.log('Optimal Price:', analysis.optimalPrice);
console.log('Confidence:', analysis.confidence);
console.log('Market Trend:', analysis.marketTrend);
```

### Content Generation

```typescript
import { ContentGenerationAgent, ModelManager } from '@/ai';

const modelManager = new ModelManager();
const contentAgent = new ContentGenerationAgent(modelManager);

const metadata = await contentAgent.generateNFTMetadata(
  'https://example.com/image.png',
  [
    { trait_type: 'Rarity', value: 'Legendary' },
    { trait_type: 'Color', value: 'Gold' }
  ],
  { style: 'creative', tone: 'enthusiastic' }
);

console.log('Name:', metadata.name);
console.log('Description:', metadata.description);

// Generate A/B test variations
const variations = await contentAgent.generateMetadataVariations(
  'https://example.com/image.png',
  baseAttributes,
  3 // number of variations
);
```

### Risk Assessment

```typescript
import { RiskAssessmentAgent, ModelManager } from '@/ai';

const modelManager = new ModelManager();
const riskAgent = new RiskAssessmentAgent(modelManager);

const assessment = await riskAgent.assessRentalRisk(
  {
    walletAddress: '0x1234...',
    totalRentals: 15,
    successfulRentals: 14,
    averageRentalDuration: 48,
    reputationScore: 850,
    accountAge: 180
  },
  1000, // NFT value
  24,   // rental duration (hours)
  'medium'
);

console.log('Risk Level:', assessment.riskLevel);
console.log('Recommended Collateral:', assessment.recommendedCollateral);

// Calculate dynamic collateral
const collateral = riskAgent.calculateDynamicCollateral(
  1000,
  assessment
);
```

## Model Selection

The system automatically selects optimal models based on task type and budget:

| Task Type | Primary Model | Budget Consideration |
|-----------|--------------|---------------------|
| Planning/Reasoning | Claude 3.5 Sonnet, GPT-4o | High intelligence required |
| Content Generation | GPT-4o, Claude 3.5 Sonnet | Creativity and nuance |
| Data Analysis | GPT-4o-mini, Claude 3 Haiku | Speed and cost efficiency |
| Risk Assessment | GPT-4o, Claude 3.5 Sonnet | Accuracy critical |
| Batch Processing | GPT-4o-mini, Gemini 1.5 Flash | Cost optimization |

## Budget Levels

- **Low**: Max $0.10 per request - Fast, cost-effective models
- **Medium**: Max $0.50 per request - Balanced quality and cost
- **High**: Max $2.00 per request - Best quality models

## Performance Metrics

Track your AI usage:

```typescript
const analytics = orchestrator.getWorkflowAnalytics();

console.log('Total Workflows:', analytics.totalWorkflows);
console.log('Success Rate:', analytics.successRate);
console.log('Average Cost:', analytics.averageCost);
console.log('Average Latency:', analytics.averageLatency);
console.log('Total Cost:', analytics.totalCost);
```

## Best Practices

1. **Choose Appropriate Budget**: Use 'low' for batch operations, 'medium' for critical tasks
2. **Monitor Costs**: Track analytics to optimize spending
3. **Use Fallbacks**: System automatically handles failures with fallback models
4. **Cache Results**: Cache AI results when possible to reduce costs
5. **Batch Processing**: Use batch methods for multiple items to optimize costs

## Troubleshooting

### API Key Errors
Ensure all API keys are set in your environment variables:
```bash
echo $VITE_OPENAI_API_KEY
echo $VITE_ANTHROPIC_API_KEY
echo $VITE_GOOGLE_API_KEY
echo $VITE_REPLICATE_API_KEY
```

### Rate Limiting
The system implements automatic rate limiting. If you hit limits:
- Reduce concurrent requests
- Implement exponential backoff
- Use batch processing

### Cost Management
Monitor costs with analytics:
```typescript
const analytics = orchestrator.getWorkflowAnalytics();
if (analytics.totalCost > threshold) {
  // Alert or reduce usage
}
```

## Contributing

When adding new AI providers or features:

1. Update `ModelManager.ts` with new provider
2. Add to `ai.config.ts` configuration
3. Create specialized agent if needed
4. Update this README with examples

## License

MIT - See main project license

