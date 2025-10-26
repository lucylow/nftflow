# 🤖 AI Agents Integration for NFTFlow

## Overview

NFTFlow now includes autonomous AI agents that enhance the NFT rental experience with intelligent pricing, personalized recommendations, and dynamic risk assessment. These agents leverage OpenAI's GPT-4 and Somnia's high-throughput blockchain to provide real-time, on-chain intelligence.

## 🤖 Agent Types

### 1. **Rental Intelligence Agent**
**Goal**: Optimize rental pricing for maximum revenue
**Functionality**:
- Analyzes market trends and NFT floor prices
- Suggests optimal rental prices per second
- Provides confidence scores and detailed reasoning
- Monitors market conditions and auto-adjusts pricing

**Integration Points**:
- `NFTFlow.sol` contract for price updates
- DIA Oracle for market data
- Historical rental event analysis

**Example Usage**:
```typescript
const { getRentalPricingRecommendation } = useAIAgents();
const recommendation = await getRentalPricingRecommendation(
  nftContract,
  tokenId
);
// Returns: { suggestedPrice, confidence, reasoning, optimalDuration }
```

### 2. **Recommendation Agent**
**Goal**: Deliver personalized NFT recommendations
**Functionality**:
- Analyzes user's rental history and preferences
- Searches available NFTs that match user interests
- Ranks recommendations by relevance (1-10 score)
- Provides explanations for each recommendation

**Integration Points**:
- `ReputationSystem.sol` for user reputation
- NFT metadata and rental history
- On-chain event filtering

**Example Usage**:
```typescript
const { getPersonalizedRecommendations } = useAIAgents();
const recommendations = await getPersonalizedRecommendations(10);
// Returns array of recommended NFTs with scores
```

### 3. **Collateral Management Agent**
**Goal**: Reduce platform risk through dynamic collateral assessment
**Functionality**:
- Analyzes user's on-chain reputation and rental history
- Determines risk level (low/medium/high)
- Calculates appropriate collateral requirements
- Provides detailed risk factor analysis

**Integration Points**:
- `ReputationSystem.sol` for reputation data
- Rental completion history
- Account age and activity patterns

**Example Usage**:
```typescript
const { assessRentalRisk } = useAIAgents();
const assessment = await assessRentalRisk(
  renterAddress,
  nftValue,
  rentalDuration
);
// Returns: { riskLevel, recommendedCollateral, confidence, factors }
```

## 🏗️ Smart Contract Integration

### AIAgentManager.sol
The `AIAgentManager` contract tracks all autonomous agent actions on-chain:

```solidity
// Register an agent
function registerAgent(
    address _agentAddress,
    string memory _agentType
) external onlyOwner returns (uint256)

// Track agent actions
function executeAgentAction(
    uint256 _agentId,
    string memory _actionType,
    bytes memory _data
) external nonReentrant

// Get agent performance
function getAgentMetrics(uint256 _agentId) 
    external view 
    returns (uint256 totalActions, ...)
```

## 🎨 Frontend Integration

### AI Agent Dashboard
Access the AI Agent Dashboard via `/ai-agents` route or through the navigation.

**Features**:
- Real-time agent status monitoring
- Personalized recommendations display
- Agent performance metrics
- Activity log for all agent actions
- Toggle agent active/inactive state

### Components
- `AIAgentDashboard.tsx` - Main dashboard component
- `src/agents/RentalIntelligenceAgent.ts` - Pricing agent
- `src/agents/RecommendationAgent.ts` - Recommendation engine
- `src/agents/CollateralAgent.ts` - Risk assessment agent

### Hooks
```typescript
// Hook for AI agent functionality
const {
  isInitialized,
  getRentalPricingRecommendation,
  getPersonalizedRecommendations,
  assessRentalRisk,
  getCollateralRequirement
} = useAIAgents();
```

## 🔧 Setup Instructions

### 1. Environment Configuration
Add your OpenAI API key to `.env`:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Install Dependencies
```bash
npm install openai
```

### 3. Deploy AIAgentManager Contract
```bash
cd backend
npx hardhat run scripts/deploy-ai-agent-manager.js --network somnia
```

### 4. Update Contract Addresses
Update `src/config/contracts.ts` with the deployed contract address:
```typescript
export const CONTRACT_ADDRESSES = {
  // ... existing addresses
  AIAgentManager: '0x...' // Add deployed address
};
```

## 🚀 Usage Examples

### Autonomous Price Optimization
```typescript
// The Rental Intelligence Agent automatically:
// 1. Monitors market conditions every hour
// 2. Analyzes competitor pricing
// 3. Suggests optimal price adjustments
// 4. Updates rental prices when confidence > 80%

const agent = new RentalIntelligenceAgent(apiKey, provider, contractAddress, abi);
await agent.startAutonomousMonitoring(nftContract, tokenId, ownerAddress);
```

### Dynamic Recommendations
```typescript
// Generate personalized recommendations on demand
const recommendations = await recommendationAgent.generateRecommendations(
  userAddress,
  10 // limit
);

// Each recommendation includes:
// - NFT details
// - Match score (1-10)
// - Detailed reasoning
// - Metadata
```

### Risk-Based Collateral
```typescript
// Assess risk for a rental
const assessment = await collateralAgent.assessRentalRisk(
  renterAddress,
  nftValue,
  rentalDuration
);

// Adjust collateral based on risk
if (assessment.riskLevel === 'high') {
  // Require full collateral
  collateralAmount = nftValue * 1.5;
} else if (assessment.riskLevel === 'low') {
  // Reduce collateral for trusted users
  collateralAmount = nftValue * 0.25;
}
```

## 🎯 Somnia AI Hackathon Requirements

This implementation fulfills the following Somnia AI Hackathon criteria:

✅ **Autonomous AI Agents** - Fully autonomous agents that operate 24/7
✅ **Somnia Native** - Built specifically for Somnia blockchain with 1M+ TPS support
✅ **On-Chain Intelligence** - All agent actions recorded on Somnia blockchain
✅ **Real-World Utility** - Solves real problems in NFT rental marketplace
✅ **Production Ready** - Complete frontend, backend, and smart contract integration
✅ **OpenAI Integration** - Uses GPT-4 for intelligent decision-making

## 📊 Agent Metrics

Monitor agent performance through the dashboard:
- **Total Actions**: Number of autonomous actions taken
- **Success Rate**: Percentage of successful agent operations
- **Uptime**: Agent availability percentage (24/7 monitoring)
- **Response Time**: Average time for AI analysis

## 🔒 Security Considerations

1. **API Key Security**: Store OpenAI API keys in environment variables
2. **Agent Authorization**: Only authorized agents can execute actions
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Error Handling**: Graceful degradation when AI services unavailable

## 🧪 Testing

Test AI agents with mock data:
```bash
# Run agent tests
npm run test:agents

# Test individual agents
npm run test:agents -- --agent=recommendation
```

## 📈 Future Enhancements

1. **Multi-Agent Collaboration**: Agents working together for complex decisions
2. **Learning System**: Agents learn from successful patterns
3. **Cross-Chain Support**: Extend agents to other chains
4. **Advanced Analytics**: Deep insights into market trends
5. **User Preferences**: Machine learning from user behavior

## 🎓 Getting Started

1. Visit `/ai-agents` in the NFTFlow app
2. Connect your wallet
3. Activate AI agents
4. View personalized recommendations
5. Monitor agent activity in real-time

## 💡 Tips

- **Optimal Pricing**: Set confidence threshold to 80% for auto-pricing
- **Recommendations**: Refresh recommendations daily for best results
- **Risk Assessment**: Review risk factors before adjusting collateral
- **Monitoring**: Keep dashboard open to track agent performance

## 🤝 Contributing

To contribute to AI agent improvements:
1. Fork the repository
2. Create a feature branch
3. Add new agent types or enhance existing ones
4. Submit a pull request

## 📝 License

This project is part of the Somnia AI Hackathon submission.
All AI agent implementations are open source.

---

**Built for Somnia Blockchain** 🔷
**Powered by OpenAI GPT-4** 🤖
**Made for Somnia AI Hackathon** 🏆

