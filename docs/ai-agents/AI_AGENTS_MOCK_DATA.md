# 🤖 AI Agents Mock Data & Interactive Demos

## Overview
The AI Agents page now includes comprehensive mock data and interactive demos to showcase autonomous agent operations with Human-In-The-Loop (HITL) features.

## Mock Data Structure

### 1. **Agent Activities** (`mockAgentActivities`)
Pre-populated realistic agent operation logs showing:
- Multi-agent workflow coordination
- Market analysis and pricing decisions
- Risk assessment calculations
- Human intervention triggers
- Technical execution details

#### Example Activities:
```typescript
{
  id: '1',
  agent: 'Orchestrator',
  action: '🎯 Multi-agent workflow initiated: Price optimization task',
  technical: 'workflow.execute({agents: [pricing, collateral, recommendation], priority: "high"})',
  chain: ['Orchestrator → Pricing Analyst → Collateral Agent'],
  details: {
    workflowId: 'workflow-145',
    agentsInvolved: 3,
    estimatedTime: '8s',
    confidence: 96
  }
}
```

### 2. **Recommendation Examples** (`mockAgentRecommendations`)
Real NFT recommendation data with:
- Match scores (0-10)
- Detailed reasoning explanations
- Metadata (name, collection, price, utility)
- Confidence levels

### 3. **Workflow Examples** (`mockWorkflows`)
Active workflow states showing:
- Workflow status (completed, processing, pending)
- Agent involvement
- Duration tracking
- Progress percentages
- Results and impacts

### 4. **Human Interventions** (`mockHumanInterventions`)
HITL scenarios demonstrating:
- Low confidence triggers
- High-value transaction reviews
- Anomaly detection
- Policy conflict resolution

## Interactive Features

### **"Run Demo" Button**
Triggered demo shows:
- **Multi-agent workflow simulation**
- Agent communication and chaining
- Realistic technical logs
- Market analysis examples
- Confidence scoring

**What happens:**
1. Orchestrator initiates workflow
2. Agents execute in sequence
3. Technical details are logged
4. Results are displayed

### **"Simulate HITL" Button**
Demonstrates human-in-the-loop:
- **Creates low-confidence scenario**
- Triggers warning status
- Adds to human intervention queue
- Shows approval workflow
- Demonstrates safety controls

**What happens:**
1. Simulates low confidence (65% < 75% threshold)
2. Adds warning badge
3. Queues for human review
4. Shows in HITL tab
5. Requires approval before proceeding

### **Auto-Generated Activity** (Every 8 seconds)
Random agent operations showing:
- Pricing optimization
- User preference analysis
- Market data fetching
- Collateral calculations
- Workflow orchestration
- Market volatility detection
- Recommendation generation
- Risk assessments
- Timeout scenarios

## Technical Details

### Real-Time Simulation
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const mockActivity = generateMockActivity();
    const newAction: ActivityLog = {
      id: Date.now().toString(),
      agent: mockActivity.agent,
      action: mockActivity.action,
      technical: mockActivity.technical,
      time: 'Just now',
      status: mockActivity.status,
      humanIntervention: mockActivity.humanIntervention
    };
    setActivityLog(prev => [newAction, ...prev].slice(0, 25));
  }, 8000); // Every 8 seconds
  return () => clearInterval(interval);
}, [isConnected]);
```

### Workflow Progress Simulation
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setWorkflows(prev => prev.map(w => 
      w.status === 'processing' 
        ? { ...w, progress: Math.min(w.progress + 5, 100), duration: `${parseInt(w.duration) + 1}s` }
        : w
    ));
  }, 3000);
  return () => clearInterval(interval);
}, [isConnected]);
```

## Data Examples

### Agent Recommendation Output
```typescript
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
}
```

### HITL Scenario
```typescript
{
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
  }
}
```

## What Users See

### Real-Time Activity
- Agents working autonomously
- Technical function calls
- Multi-agent chains
- Status indicators
- Timestamps
- Confidence scores

### Interactive Demos
- **"Run Demo"**: Shows agent workflow in action
- **"Simulate HITL"**: Demonstrates safety controls
- **Auto-updates**: Simulated agent activity every 8s
- **Progress bars**: Live workflow tracking

### Technical Logs
Terminal-style output showing:
- Timestamped entries
- Function names and parameters
- Return values
- Status codes
- Error messages

## Benefits

1. **Live Demonstration** - See agents working in real-time
2. **Interactive Learning** - Button-triggered demos
3. **Realistic Scenarios** - Based on actual use cases
4. **HITL Visibility** - Clear human intervention points
5. **Technical Details** - Code-level transparency
6. **Engaging UI** - Beautiful animations and updates

## Usage

### For Demo/Presentation
1. Click "Run Demo" to see agent workflow
2. Click "Simulate HITL" to show safety controls
3. Watch auto-generated activity stream
4. Monitor agent coordination
5. Review technical logs

### For Development
- Mock data in `/src/mockData/aiAgentMocks.ts`
- Update activity templates
- Add new agent scenarios
- Customize confidence thresholds
- Modify workflow examples

## Files

- **Mock Data**: `src/mockData/aiAgentMocks.ts`
- **Page**: `src/pages/AIAgentsPage.tsx`
- **Build Size**: 41.38 KB (gzipped: 7.49 KB)

