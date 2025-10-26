# 🤖 Enhanced AI Workflow Orchestrator

## Overview

NFTFlow now includes a sophisticated **Workflow Orchestrator** inspired by AgentFlow's modular architecture. This system coordinates multiple AI agents to execute complex, multi-step workflows for NFT rental operations.

## Architecture

The orchestrator implements a **4-agent modular system**:

```
┌─────────────────────────────────────────────────────────┐
│                  Workflow Orchestrator                  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌────────┐        ┌────────┐       ┌────────┐
   │PLANNER │   →    │EXECUTOR│   →   │VERIFIER│
   └────────┘        └────────┘       └────────┘
                                            │
                                            ▼
                                     ┌──────────┐
                                     │GENERATOR │
                                     └──────────┘
```

### 1. **Planner Agent**
Analyzes the task and creates a detailed execution plan:
- Identifies required agents
- Defines sequential steps
- Estimates execution time
- Provides confidence scores

### 2. **Executor Agent**
Executes workflow steps in sequence:
- Coordinates agent actions
- Handles dependencies
- Manages on-chain operations
- Captures results

### 3. **Verifier Agent**
Validates workflow results:
- Checks data completeness
- Identifies anomalies
- Verifies logical consistency
- Assesses quality

### 4. **Generator Agent**
Creates comprehensive reports:
- Executive summaries
- Key findings
- Recommendations
- Risk assessments

## Available Workflows

### 1. Intelligent NFT Listing
**File**: `src/workflows/intelligent_nft_listing.md`

Automatically analyzes NFT traits, compares with market data, suggests optimal rental price, and generates listing descriptions.

**Usage**:
```typescript
const { executeIntelligentListing } = useWorkflowOrchestrator();

const result = await executeIntelligentListing(
  '0x...', // nftContract
  '123',   // tokenId
  0.001    // basePrice (optional)
);

console.log(result.summary); // Markdown report
console.log(result.results); // All workflow results
```

### 2. Dynamic Pricing Optimization
**File**: `src/workflows/dynamic_pricing_optimization.md`

Multi-agent workflow for complex pricing optimization with risk assessment using Planner→Executor→Verifier→Generator.

**Usage**:
```typescript
const { executePricingOptimization } = useWorkflowOrchestrator();

const result = await executePricingOptimization(
  '0x...', // nftContract
  '123'    // tokenId
);
```

### 3. Market Analysis
**Usage**:
```typescript
const { executeMarketAnalysis } = useWorkflowOrchestrator();

const result = await executeMarketAnalysis(
  '0x...', // nftContract
  '123'    // tokenId
);
```

### 4. Risk Assessment
**Usage**:
```typescript
const { executeRiskAssessment } = useWorkflowOrchestrator();

const result = await executeRiskAssessment(
  '0x123...', // renterAddress
  100,         // nftValue
  3600         // duration (seconds)
);
```

## How It Works

### Step-by-Step Execution

1. **User Initiates Workflow**
   ```typescript
   const result = await executeIntelligentListing(nftContract, tokenId);
   ```

2. **Planner Creates Plan**
   - Analyzes context and requirements
   - Identifies necessary agents
   - Creates step-by-step execution plan
   - Returns plan with confidence score

3. **Executor Runs Steps**
   - Executes each step in sequence
   - Gathers results from agents
   - Handles dependencies between steps
   - Captures intermediate results

4. **Verifier Validates Results**
   - Checks data quality
   - Identifies anomalies
   - Verifies logical consistency
   - Provides pass/fail status

5. **Generator Creates Report**
   - Combines all results
   - Creates markdown summary
   - Highlights key findings
   - Provides recommendations

6. **Return WorkflowResult**
   ```typescript
   {
     success: boolean,
     results: { ... },
     verification: {
       passed: boolean,
       issues: string[]
     },
     summary: string, // Markdown report
     timestamp: number
   }
   ```

## Integration Examples

### Basic Listing Workflow

```typescript
import { useWorkflowOrchestrator } from '@/hooks/useWorkflowOrchestrator';

function ListingWorkflow() {
  const { 
    isInitialized, 
    executeIntelligentListing,
    activeWorkflows 
  } = useWorkflowOrchestrator();

  const handleListNFT = async (nftContract: string, tokenId: string) => {
    try {
      const result = await executeIntelligentListing(nftContract, tokenId);
      
      if (result.success) {
        console.log('✅ Listing prepared:', result.summary);
        // Present to user for approval
      } else {
        console.warn('⚠️ Issues detected:', result.verification.issues);
      }
    } catch (error) {
      console.error('Workflow failed:', error);
    }
  };

  return (
    <button onClick={() => handleListNFT('0x...', '123')}>
      List NFT with AI
    </button>
  );
}
```

### Advanced Pricing Optimization

```typescript
function PricingOptimization() {
  const { executePricingOptimization, getActiveWorkflows } = useWorkflowOrchestrator();

  const handleOptimize = async () => {
    // This uses the full 4-agent system
    const result = await executePricingOptimization('0x...', '123');
    
    console.log(result.verification); // Quality check results
    console.log(result.summary); // AI-generated report
  };

  return <button onClick={handleOptimize}>Optimize Pricing</button>;
}
```

## Markdown Workflow Definitions

Workflows are defined in Markdown files (inspired by AgentFlow's approach):

```markdown
---
workflow_id: intelligent_nft_listing
name: Intelligent NFT Listing
description: Auto-analyze and list NFTs
version: 1.0
---

## Workflow Steps

### Step 1: Analyze Market
```yaml
agent: pricing
action: analyzePricing
inputs:
  - nftContract: "{{context.nftContract}}"
outputs:
  - optimalPrice
  - confidence
```
```

This allows for:
- **Natural language workflows** (as you researched)
- **Version control** for workflows
- **Easy modification** without code changes
- **Reusability** across different scenarios

## ERC-7857 Agent NFTs

The new `AIAgentNFT` contract allows agents themselves to be minted as NFTs:

### Minting an Agent
```solidity
function mintAgent(
    string agentType,
    string model,
    string capabilities,
    string tokenURI
) external returns (uint256);
```

### Benefits
- **Ownership**: Agents are verifiable on-chain assets
- **Trading**: Successful agents can be bought/sold
- **Revenue Sharing**: Agent owners earn from performance
- **Provenance**: Complete history of agent capabilities

### Example: Mint a High-Performance Agent

```typescript
// After an agent proves successful (e.g., 90%+ success rate)
const mintAgentNFT = async (agentId: string) => {
  const tx = await aiAgentNFT.mintAgent(
    'pricing',
    'gpt-4o-mini-custom-v2',
    JSON.stringify({ capabilities: [...] }),
    'ipfs://...' // Metadata URI
  );
};
```

### Trading Agents

```typescript
// Agents with high performance become valuable
const agentValue = await aiAgentNFT.calculateAgentValue(tokenId);

// Users can buy successful agents
await marketplace.transferAgent(agentNFTTokenId, newOwner);
```

## Configuration

Add to your `.env`:
```bash
VITE_OPENAI_API_KEY=sk-...
VITE_NFT_FLOW_CONTRACT=0x...
VITE_REPUTATION_CONTRACT=0x...
```

## Deployment

### Smart Contracts

```bash
cd backend
npx hardhat run scripts/deploy-ai-agent-nft.js --network somnia
```

Update `src/config/contracts.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  AIAgentNFT: '0x...', // Your deployed address
};
```

## Performance Metrics

Track agent performance:
```typescript
// Get agent metrics
const { successRate, totalActions, totalRevenue } = 
  await aiAgentNFT.getAgentInfo(tokenId);

// Calculate agent value
const value = await aiAgentNFT.calculateAgentValue(tokenId);
```

## Best Practices

### 1. Start Small
Begin with simple workflows like `dynamic_pricing`, then expand.

### 2. Human-in-the-Loop
Always require approval for high-value operations:
```typescript
if (result.verification.confidence < 80) {
  await showApprovalDialog();
}
```

### 3. Monitor Performance
Track workflow success rates and optimize based on metrics.

### 4. Iterative Improvement
Use AgentFlow-style markdown files to quickly iterate on workflows.

## Future Enhancements

1. **Multi-Agent Collaboration**: Agents working together on complex tasks
2. **Learning System**: Agents improve from successful patterns  
3. **Marketplace**: Trading floor for agent NFTs
4. **Cross-Agent Communication**: Agents share insights
5. **A/B Testing**: Compare agent performance automatically

## Summary

This implementation brings together:
- ✅ **AgentFlow Concepts**: Modular multi-agent architecture
- ✅ **Markdown Workflows**: Natural language workflow definitions
- ✅ **ERC-7857 Inspiration**: Agent NFTs as tradable assets
- ✅ **Production Ready**: Complete integration with NFTFlow

---

**Next Steps**: Integrate the `useWorkflowOrchestrator` hook into your UI components and start creating intelligent workflows!

