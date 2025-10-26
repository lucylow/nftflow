export const mockAgentActivities = [
  {
    id: '1',
    agent: 'Orchestrator',
    action: '🎯 Multi-agent workflow initiated: Price optimization task',
    technical: 'workflow.execute({agents: [pricing, collateral, recommendation], priority: "high", timeout: 30000})',
    time: '5s ago',
    status: 'success' as const,
    chain: ['Orchestrator → Pricing Analyst → Collateral Agent'],
    details: {
      workflowId: 'workflow-145',
      agentsInvolved: 3,
      estimatedTime: '8s',
      confidence: 96
    }
  },
  {
    id: '2',
    agent: 'Pricing Analyst',
    action: '📊 Market analysis completed - floor price: 0.05 ETH',
    technical: 'analyzeMarket(nftContract, tokenId) → {floor: "0.05", avg: "0.058", confidence: 87}',
    time: '12s ago',
    status: 'success' as const,
    details: {
      oracle: 'DIA',
      dataPoints: 1247,
      confidence: 87,
      recommendation: 'priceTooLow'
    }
  },
  {
    id: '3',
    agent: 'Collateral Agent',
    action: '🛡️ Risk assessment: LOW (user reputation: 850/1000)',
    technical: 'calculateCollateral(userAddr, nftValue) → {required: "0.5x", base: "1.0 ETH", riskLevel: "LOW"}',
    time: '18s ago',
    status: 'success' as const,
    humanIntervention: false,
    details: {
      userScore: 850,
      totalRentals: 23,
      successfulRentals: 22,
      recommendedCollateral: '0.5 ETH'
    }
  },
  {
    id: '4',
    agent: 'Rental Intelligence',
    action: '💰 Pricing optimization: +15% increase recommended',
    technical: 'optimizePrice(currentPrice, marketData) → {suggested: "0.0033 ETH/s", current: "0.0029 ETH/s", confidence: 92}',
    time: '23s ago',
    status: 'success' as const,
    details: {
      currentPrice: '0.0029 ETH/s',
      suggestedPrice: '0.0033 ETH/s',
      increasePercent: 15,
      reasoning: 'Market shows increased demand, similar items priced higher'
    }
  },
  {
    id: '5',
    agent: 'Recommendation Agent',
    action: '⚠️ Requiring human review - low confidence prediction',
    technical: 'generateRecommendations(user, limit=10) → {confidence: 68, threshold: 75, action: "escalateToHuman"}',
    time: '35s ago',
    status: 'warning' as const,
    humanIntervention: true,
    details: {
      confidence: 68,
      threshold: 75,
      reason: 'Insufficient historical data for user profile',
      requiresReview: true
    }
  },
  {
    id: '6',
    agent: 'Orchestrator',
    action: '✨ Agent chain completed successfully',
    technical: 'workflow.onComplete() → {duration: "28s", agentsUsed: 4, success: true}',
    time: '45s ago',
    status: 'success' as const,
    chain: ['Orchestrator → Pricing → Collateral → Recommendation'],
    details: {
      totalDuration: '28s',
      agentsUsed: 4,
      accuracy: '94%'
    }
  },
  {
    id: '7',
    agent: 'Recommendation Agent',
    action: '🎯 Generated 10 personalized NFT recommendations',
    technical: 'generateTopN(user, n=10, criteria=["price", "genre", "history"]) → array[10]',
    time: '1m ago',
    status: 'success' as const,
    details: {
      totalRecommendations: 10,
      avgMatchScore: 8.5,
      categories: ['gaming', 'art', 'metaverse']
    }
  },
  {
    id: '8',
    agent: 'Pricing Analyst',
    action: '📈 Detected market trend: Bullish (+12% in last hour)',
    technical: 'analyzeTrend(timeWindow="1h") → {direction: "up", change: "+12%", confidence: 84}',
    time: '2m ago',
    status: 'success' as const,
    details: {
      direction: 'up',
      changePercent: 12,
      volume: 'increased',
      confidence: 84
    }
  }
];

export const mockAgentRecommendations = [
  {
    nftContract: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b60',
    tokenId: 145,
    score: 9.2,
    reasoning: 'Matches user preferences: gaming category, price range, positive reviews',
    metadata: {
      name: 'Epic Legendary Sword',
      collection: 'GameFi Warriors',
      price: '0.0033 ETH/s',
      utility: 'High DPS boost'
    }
  },
  {
    nftContract: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b61',
    tokenId: 234,
    score: 8.7,
    reasoning: 'Similar to recently rented items, budget-friendly',
    metadata: {
      name: 'Rare Art Canvas',
      collection: 'Digital Gallery',
      price: '0.0018 ETH/s',
      utility: 'Display rights'
    }
  },
  {
    nftContract: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b62',
    tokenId: 89,
    score: 8.5,
    reasoning: 'Trending in user network, exclusive access pass',
    metadata: {
      name: 'VIP Metaverse Pass',
      collection: 'Event Access',
      price: '0.0025 ETH/s',
      utility: 'Premium venue access'
    }
  }
];

export const mockWorkflows = [
  {
    id: 'workflow-123',
    name: 'Price Optimization Workflow',
    status: 'completed',
    agents: ['Orchestrator', 'Pricing Analyst', 'Rental Intelligence'],
    duration: '28s',
    result: {
      oldPrice: '0.0029 ETH/s',
      newPrice: '0.0033 ETH/s',
      impact: '+15% revenue',
      confidence: 92
    }
  },
  {
    id: 'workflow-124',
    name: 'Risk Assessment Workflow',
    status: 'processing',
    agents: ['Orchestrator', 'Collateral Agent', 'Pricing Analyst'],
    duration: '12s',
    progress: 67
  },
  {
    id: 'workflow-125',
    name: 'User Recommendation Workflow',
    status: 'pending',
    agents: ['Orchestrator', 'Recommendation Agent'],
    duration: '0s',
    estimatedTime: '15s'
  }
];

export const mockHumanInterventions = [
  {
    id: 'hitl-1',
    agent: 'Recommendation Agent',
    task: 'Low confidence recommendation',
    reason: 'Insufficient user history - new account',
    confidence: 68,
    threshold: 75,
    action: 'approve_or_reject_recommendations',
    details: {
      userAge: '2 days',
      userHistory: '4 rentals',
      recommendationCount: 10
    },
    timestamp: new Date(Date.now() - 30000)
  },
  {
    id: 'hitl-2',
    agent: 'Collateral Agent',
    task: 'High-value transaction review',
    reason: 'NFT value > 10 ETH requires approval',
    confidence: 95,
    threshold: 99,
    action: 'verify_transaction_approval',
    details: {
      nftValue: '12.5 ETH',
      collateral: '3.75 ETH',
      userScore: 920
    },
    timestamp: new Date(Date.now() - 120000)
  }
];

export const mockTechnicalMetrics = {
  totalWorkflows: 145,
  completedWorkflows: 142,
  activeWorkflows: 2,
  failedWorkflows: 1,
  avgWorkflowDuration: '18s',
  avgConfidence: 89,
  humanInterventions: 8,
  successRate: 98.6,
  gasSaved: '2.3 STT',
  revenueImpact: '+15.2%'
};

export const generateMockActivity = () => {
  const actions: Array<{agent: string, action: string, technical: string, status: 'success' | 'warning' | 'error', humanIntervention?: boolean}> = [
    { agent: 'Rental Intelligence', action: 'Optimizing pricing for new listing...', technical: 'optimizePrice(nftId=145, marketData)', status: 'success' },
    { agent: 'Recommendation Agent', action: 'Processing user preferences...', technical: 'analyzePreferences(user) → {categories: ["gaming", "art"]}', status: 'success' },
    { agent: 'Pricing Analyst', action: 'Fetching real-time market data...', technical: 'fetchMarketData(DIA_Oracle, ETH/USD)', status: 'success' },
    { agent: 'Collateral Agent', action: 'Calculating dynamic collateral...', technical: 'calculateDynamicCollateral(riskScore=0.75)', status: 'success' },
    { agent: 'Orchestrator', action: 'Coordinating agent workflow...', technical: 'orchestrate(["pricing", "collateral", "recommendation"])', status: 'success' },
    { agent: 'Pricing Analyst', action: '⚠️ Market volatility detected', technical: 'volatilityCheck() → highVolatility: true', status: 'warning' },
    { agent: 'Rental Intelligence', action: '✅ Price optimization complete: +12%', technical: 'priceOptimized: {old: "0.0029", new: "0.0033", confidence: 91}', status: 'success' },
    { agent: 'Recommendation Agent', action: 'Generating top 10 recommendations...', technical: 'generateRecommendations(user, n=10, filters=[...])', status: 'success' },
    { agent: 'Collateral Agent', action: 'Risk assessment completed', technical: 'assessRisk(user) → {level: "LOW", collateral: "0.5x", reasoning: "..."}', status: 'success' },
    { agent: 'Orchestrator', action: '⚠️ Workflow timeout - requiring human review', technical: 'workflowTimeout(workflowId=123, elapsed=35s, limit=30s)', status: 'warning', humanIntervention: true }
  ];
  
  return actions[Math.floor(Math.random() * actions.length)];
};

