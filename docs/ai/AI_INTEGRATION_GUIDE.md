# NFTFlow Multi-Model AI Integration Guide

## Overview

This document describes the comprehensive multi-model AI integration system for NFTFlow's intelligent NFT rental marketplace. The system supports multiple AI providers and automatically optimizes model selection based on task requirements and budget constraints.

## Architecture

```
src/ai/
├── ModelManager.ts                    # Core multi-provider AI manager
├── WorkflowOrchestrator.ts            # High-level workflow orchestration
├── config/
│   └── ai.config.ts                   # Configuration and settings
├── agents/
│   ├── MultiModelPricingAgent.ts     # AI-powered pricing analysis
│   ├── ContentGenerationAgent.ts      # Content and metadata generation
│   └── RiskAssessmentAgent.ts         # Risk assessment and collateral
├── examples/
│   └── usage-examples.ts              # Comprehensive usage examples
├── index.ts                           # Module exports
└── README.md                          # Quick start guide
```

## Supported AI Models

### OpenAI
- **GPT-4o**: Flagship model with vision, best for complex tasks
- **GPT-4o-mini**: Fast and cost-effective, ideal for batch operations

### Anthropic
- **Claude 3.5 Sonnet**: Excellent reasoning and analysis
- **Claude 3 Haiku**: Fast and efficient for quick tasks

### Google
- **Gemini 1.5 Pro**: Multimodal capabilities with huge context window
- **Gemini 1.5 Flash**: Ultra-fast and cost-efficient

### Open Source (via Replicate)
- **Llama 3.1 405B**: Largest open-source model
- **Mixtral 8x22B**: High-quality multitasking model

## Key Features

### 1. Automatic Fallback System
The system automatically tries fallback models if the primary model fails:
- Primary model → Fallback 1 → Fallback 2
- Ensures high availability and reliability

### 2. Cost Optimization
Smart model selection based on budget:
- **Low**: $0.10 max per request
- **Medium**: $0.50 max per request  
- **High**: $2.00 max per request

### 3. Task-Specific Optimization
Different models for different tasks:
- **Planning/Reasoning**: Claude 3.5 Sonnet, GPT-4o
- **Content Generation**: GPT-4o, Claude 3.5 Sonnet
- **Data Analysis**: GPT-4o-mini, Claude 3 Haiku
- **Risk Assessment**: GPT-4o, Claude 3.5 Sonnet

### 4. Performance Tracking
Comprehensive analytics:
- Cost per request
- Latency metrics
- Success rates
- Token usage

## Quick Start

### 1. Installation

Dependencies are already installed in `package.json`:
```json
{
  "@anthropic-ai/sdk": "^0.25.0",
  "@google/generative-ai": "^0.21.0",
  "replicate": "^0.31.0",
  "openai": "^6.7.0"
}
```

### 2. Environment Setup

Add API keys to your `.env` file:
```bash
# OpenAI
VITE_OPENAI_API_KEY=your_openai_api_key

# Anthropic
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# Google
VITE_GOOGLE_API_KEY=your_google_api_key

# Replicate
VITE_REPLICATE_API_KEY=your_replicate_api_key
```

### 3. Basic Usage

```typescript
import { AIWorkflowOrchestrator } from '@/ai';

// Initialize
const orchestrator = new AIWorkflowOrchestrator();

// Execute intelligent listing
const result = await orchestrator.executeIntelligentListing(
  nftData,
  userPreferences,
  'medium' // budget
);

console.log('Optimal Price:', result.pricing.optimalPrice);
```

## Specialized Agents

### MultiModelPricingAgent

Analyzes NFT characteristics and market conditions to determine optimal rental pricing.

**Features:**
- Market trend analysis
- Competitor pricing comparison
- Confidence scoring
- Fallback algorithms

**Example:**
```typescript
const agent = new MultiModelPricingAgent(modelManager);
const analysis = await agent.analyzeNFTPricing(
  nftMetadata,
  marketData,
  'medium'
);
```

### ContentGenerationAgent

Generates compelling NFT metadata and rental descriptions.

**Features:**
- Multiple style options
- A/B test variations
- Marketing-focused content
- Multimodal support

**Example:**
```typescript
const agent = new ContentGenerationAgent(modelManager);
const metadata = await agent.generateNFTMetadata(
  imageUrl,
  attributes,
  { style: 'creative', tone: 'enthusiastic' }
);
```

### RiskAssessmentAgent

Assesses rental risks and recommends appropriate collateral.

**Features:**
- User profile analysis
- Risk factor identification
- Dynamic collateral calculation
- Mitigation strategies

**Example:**
```typescript
const agent = new RiskAssessmentAgent(modelManager);
const assessment = await agent.assessRentalRisk(
  userProfile,
  nftValue,
  duration,
  'medium'
);
```

## Workflow Orchestrator

The `AIWorkflowOrchestrator` provides high-level workflow management:

### Intelligent Listing Workflow

Complete workflow for listing NFTs:
1. Pricing analysis
2. Metadata generation
3. Risk assessment
4. Collateral calculation
5. Recommendations

```typescript
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
    contentStyle: { style: 'creative' },
    preferredDuration: 24
  },
  'medium'
);
```

### Market Optimization Workflow

Optimizes prices for multiple listed NFTs:

```typescript
const result = await orchestrator.executeMarketOptimization(
  listedNFTs,
  'balanced'
);
```

## Configuration

All settings in `src/ai/config/ai.config.ts`:

```typescript
export const AIConfig = {
  apiKeys: {
    openai: import.meta.env.VITE_OPENAI_API_KEY,
    anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY,
    // ...
  },
  
  budgets: {
    low: { maxCostPerRequest: 0.10, ... },
    medium: { maxCostPerRequest: 0.50, ... },
    high: { maxCostPerRequest: 2.00, ... }
  },
  
  workflows: {
    intelligentListing: {
      enabled: true,
      primaryModel: 'claude-3-5-sonnet',
      // ...
    }
  }
};
```

## Performance Monitoring

Track AI usage:

```typescript
const analytics = orchestrator.getWorkflowAnalytics();

console.log('Total Workflows:', analytics.totalWorkflows);
console.log('Success Rate:', analytics.successRate);
console.log('Average Cost:', analytics.averageCost);
console.log('Total Cost:', analytics.totalCost);
```

## Best Practices

### 1. Budget Management
- Use 'low' budget for batch operations
- Use 'medium' budget for critical tasks
- Monitor total costs via analytics

### 2. Error Handling
- System automatically tries fallback models
- Always catch and handle errors
- Implement retry logic for transient failures

### 3. Caching
- Cache AI results when possible
- Reduce costs by avoiding duplicate requests
- Use Redis or similar for distributed caching

### 4. Rate Limiting
- Respect API rate limits
- Implement exponential backoff
- Use batch processing to optimize usage

### 5. Cost Optimization
- Monitor analytics regularly
- Use appropriate budget levels
- Consider using cheaper models for non-critical tasks

## Troubleshooting

### API Key Issues
```bash
# Check environment variables
echo $VITE_OPENAI_API_KEY
echo $VITE_ANTHROPIC_API_KEY
echo $VITE_GOOGLE_API_KEY
echo $VITE_REPLICATE_API_KEY
```

### Rate Limiting
Reduce concurrent requests and implement delays between batches.

### High Costs
- Switch to lower-cost models (GPT-4o-mini, Claude 3 Haiku)
- Use 'low' budget mode
- Cache results aggressively
- Batch similar requests

## Examples

Comprehensive examples available in `src/ai/examples/usage-examples.ts`:

- `exampleIntelligentListing()` - Complete listing workflow
- `examplePricingAnalysis()` - Standalone pricing
- `exampleContentGeneration()` - Metadata generation
- `exampleRiskAssessment()` - Risk analysis
- `exampleBatchAnalysis()` - Batch processing
- `exampleMarketOptimization()` - Price optimization
- `exampleWorkflowAnalytics()` - Performance monitoring

## Production Deployment

### 1. Environment Variables
Set all required API keys in production environment.

### 2. Monitoring
Implement comprehensive monitoring:
- Log all AI requests
- Track costs and latencies
- Alert on failures

### 3. Fallbacks
Always have fallback algorithms for critical paths.

### 4. Rate Limiting
Implement proper rate limiting to avoid API throttling.

### 5. Cost Controls
Set budget limits and alert when exceeded.

## Support

For issues or questions:
1. Check `src/ai/README.md` for quick start
2. Review `src/ai/examples/usage-examples.ts` for examples
3. Check console logs for detailed error messages

## License

MIT - See main project license

