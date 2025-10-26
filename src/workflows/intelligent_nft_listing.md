---
workflow_id: intelligent_nft_listing
name: Intelligent NFT Listing
description: Automatically analyze NFT traits, compare with market data, suggest optimal rental price, and generate listing
version: 1.0
---

## Overview
This workflow helps NFT owners list their assets on the rental marketplace by:
1. Analyzing NFT traits and metadata
2. Comparing with current market prices
3. Suggesting optimal rental pricing
4. Generating compelling listing descriptions
5. Preparing on-chain listing data

## Agents Required
- **PricingAnalyst**: Market analysis
- **RentalIntelligenceAgent**: Pricing strategy
- **AI**: Content generation

## Workflow Steps

### Step 1: Analyze Market Conditions
```yaml
agent: pricing
action: analyzePricing
inputs:
  - nftContract: "{{context.nftContract}}"
  - tokenId: "{{context.tokenId}}"
  - basePrice: "{{context.basePrice}}"
outputs:
  - optimalPrice
  - confidence
  - marketTrend
```

### Step 2: Generate Rental Strategy
```yaml
agent: rental_intelligence
action: generateRentalStrategy
inputs:
  - nftContract: "{{context.nftContract}}"
  - tokenId: "{{context.tokenId}}"
  - marketData: "{{step1.marketData}}"
outputs:
  - suggestedPrice
  - optimalDuration
  - reasoning
```

### Step 3: Generate Listing Description
```yaml
agent: ai_content
action: generateDescription
inputs:
  - nftMetadata: "{{context.metadata}}"
  - marketAnalysis: "{{step1.marketTrend}}"
  - pricingRecommendation: "{{step2.reasoning}}"
outputs:
  - title
  - description
  - tags
```

### Step 4: Prepare On-Chain Listing
```yaml
agent: executor
action: prepareListing
inputs:
  - nftContract: "{{context.nftContract}}"
  - tokenId: "{{context.tokenId}}"
  - price: "{{step2.suggestedPrice}}"
  - duration: "{{step2.optimalDuration}}"
  - metadata: "{{step3.output}}"
outputs:
  - listingData
  - estimatedGas
```

## Success Criteria
- [ ] Market analysis confidence > 70%
- [ ] Price within 20% of market average
- [ ] Description generated successfully
- [ ] Gas estimate reasonable (< 500K gas)

## Error Handling
If any step fails:
1. Log error to on-chain AIAgentManager
2. Provide fallback suggestions
3. Allow manual override

## Estimated Time
~15 seconds

## Cost Estimate
- AI API calls: ~$0.02
- Gas (if auto-listing): Variable
