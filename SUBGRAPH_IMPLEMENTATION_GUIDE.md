# NFTFlow DAO Subgraph Implementation Guide

This guide provides a comprehensive implementation of a subgraph for the NFTFlow DAO, enabling real-time blockchain data queries and live updates.

## 🏗️ Architecture Overview

The subgraph implementation consists of:

1. **GraphQL Schema** - Defines the data structure
2. **Apollo Client** - Handles GraphQL queries and subscriptions
3. **React Components** - UI for displaying subgraph data
4. **Real-time Subscriptions** - Live updates for DAO activity

## 📊 Data Structure

### Core Entities

- **Proposal**: Governance proposals with voting data
- **Vote**: Individual votes cast on proposals
- **GovernanceToken**: ERC-721 tokens that grant voting rights
- **DAOStats**: Aggregated statistics about the DAO
- **Activity**: Real-time activity feed
- **TreasuryTransaction**: Treasury fund movements

### Events

- **ProposalCreated**: New proposal submitted
- **VoteCast**: Vote cast on a proposal
- **ProposalExecuted**: Proposal executed after passing

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install @apollo/client graphql ethers
```

### 2. Configure Apollo Client

The Apollo Client is configured in `src/services/subgraphService.ts`:

```typescript
const client = new ApolloClient({
  uri: 'https://proxy.somnia.chain.love/subgraphs/name/nftflow-dao',
  cache: new InMemoryCache(),
});
```

### 3. Deploy Subgraph

To deploy the subgraph to Somnia:

1. Install The Graph CLI:
```bash
npm install -g @graphprotocol/graph-cli
```

2. Initialize the subgraph:
```bash
graph init --protocol ethereum --product hosted-service nftflow-dao
```

3. Deploy to Somnia:
```bash
graph deploy --node https://api.thegraph.com/deploy/ nftflow-dao
```

## 🎨 Components

### 1. SubgraphDashboard

**Location**: `src/components/SubgraphDashboard.tsx`

**Features**:
- Real-time DAO statistics
- Proposal listing with pagination
- Activity feed
- Analytics and metrics
- Auto-refresh functionality

**Key Functions**:
- `loadDAOStats()` - Loads DAO statistics
- `loadProposals()` - Loads proposals with pagination
- `handleRefresh()` - Manual refresh
- `toggleAutoRefresh()` - Enable/disable auto-refresh

### 2. LiveFeed

**Location**: `src/components/LiveFeed.tsx`

**Features**:
- Real-time activity updates
- Recent proposals display
- Live notifications
- Configurable refresh rates
- Subscription-based updates

**Key Functions**:
- `handleRefresh()` - Manual refresh
- `toggleNotifications()` - Enable/disable notifications
- `changeRefreshRate()` - Update auto-refresh interval

### 3. useSubgraph Hook

**Location**: `src/hooks/useSubgraph.ts`

**Features**:
- Centralized subgraph data management
- Real-time subscriptions
- Utility functions for data formatting
- Error handling and loading states

**Key Functions**:
- `fetchAllProposals()` - Load all proposals
- `fetchProposalById()` - Load specific proposal
- `fetchUserVotes()` - Load user's voting history
- `refreshAll()` - Refresh all data
- `toggleNotifications()` - Control notifications

## 📡 GraphQL Queries

### Basic Queries

```graphql
# Get all proposals with pagination
query GetAllProposals($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!) {
  proposals(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
    id
    description
    proposalType
    proposer
    createdAt
    deadline
    yesVotes
    noVotes
    executed
  }
}

# Get recent proposals
query GetRecentProposals($first: Int!) {
  proposals(first: $first, orderBy: createdAt, orderDirection: desc) {
    id
    description
    proposalType
    proposer
    createdAt
    deadline
    yesVotes
    noVotes
    executed
  }
}

# Get DAO statistics
query GetDAOStats {
  daoStats(id: "1") {
    totalProposals
    activeProposals
    totalVotes
    totalVotingPower
    treasuryBalance
  }
}
```

### Real-time Subscriptions

```graphql
# Subscribe to new proposals
subscription ProposalCreated {
  proposalCreated {
    id
    description
    proposalType
    proposer
    createdAt
    deadline
  }
}

# Subscribe to votes
subscription VoteCast {
  voteCast {
    id
    proposal {
      id
      description
    }
    voter
    support
    votingPower
    timestamp
  }
}

# Subscribe to executed proposals
subscription ProposalExecuted {
  proposalExecuted {
    id
    proposal {
      id
      description
    }
    executor
    timestamp
  }
}
```

## 🔄 Real-time Features

### Auto-refresh

Components automatically refresh data at configurable intervals:

- **Proposals**: Every 10 seconds
- **Activity Feed**: Every 5 seconds
- **Statistics**: Every 10 seconds

### Live Notifications

Real-time notifications for:

- New proposal creation
- Vote casting
- Proposal execution
- Treasury transactions

### Subscription Management

```typescript
// Enable/disable notifications
const toggleNotifications = () => {
  setNotificationsEnabled(!notificationsEnabled);
};

// Change refresh rate
const changeRefreshRate = (rate: number) => {
  setPollInterval(rate);
};
```

## 📊 Analytics Features

### Proposal Analytics

- Proposal type distribution
- Voting success rates
- Community participation metrics
- Execution statistics

### User Analytics

- Voting power history
- User activity tracking
- Proposal creation patterns
- Participation rates

### Treasury Analytics

- Fund allocation tracking
- Transaction history
- Spending patterns
- Budget utilization

## 🛠️ Customization

### Adding New Queries

1. Define the GraphQL query in `subgraphService.ts`
2. Add the query to the appropriate component
3. Handle loading and error states
4. Format the data for display

### Adding New Subscriptions

1. Define the subscription in `subgraphService.ts`
2. Add the subscription to the component
3. Handle the subscription data
4. Update the UI accordingly

### Custom Data Processing

```typescript
// Format time
const formatTime = (timestamp: string) => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString();
};

// Format ether values
const formatEther = (wei: string) => {
  const ether = parseFloat(wei) / 1e18;
  return ether.toFixed(4);
};

// Truncate addresses
const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
```

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_SUBGRAPH_URL=https://proxy.somnia.chain.love/subgraphs/name/nftflow-dao
NEXT_PUBLIC_DAO_ADDRESS=0xYourDAOContractAddress
```

### Apollo Client Configuration

```typescript
const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
  cache: new InMemoryCache({
    typePolicies: {
      Proposal: {
        fields: {
          votes: {
            merge: false, // Don't merge votes array
          },
        },
      },
    },
  }),
});
```

## 🚨 Error Handling

### Query Errors

```typescript
const { data, loading, error } = useQuery(GET_PROPOSALS);

if (error) {
  return <div>Error: {error.message}</div>;
}
```

### Subscription Errors

```typescript
useSubscription(PROPOSAL_CREATED_SUBSCRIPTION, {
  onError: (error) => {
    console.error('Subscription error:', error);
    toast.error('Failed to receive live updates');
  },
});
```

### Network Errors

```typescript
const handleRefresh = async () => {
  try {
    await refetch();
    toast.success('Data refreshed');
  } catch (error) {
    toast.error('Failed to refresh data');
  }
};
```

## 📱 Mobile Optimization

The components are fully responsive and optimized for mobile:

- Touch-friendly interfaces
- Responsive grid layouts
- Mobile-optimized navigation
- Touch gestures for interactions

## 🔒 Security Considerations

### Data Validation

- Validate all subgraph data before display
- Sanitize user inputs
- Handle malformed data gracefully

### Rate Limiting

- Implement query rate limiting
- Use pagination for large datasets
- Cache frequently accessed data

### Error Boundaries

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <SubgraphDashboard />
</ErrorBoundary>
```

## 🧪 Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import SubgraphDashboard from './SubgraphDashboard';

test('renders DAO statistics', () => {
  render(
    <MockedProvider mocks={mocks}>
      <SubgraphDashboard />
    </MockedProvider>
  );
  expect(screen.getByText('Total Proposals')).toBeInTheDocument();
});
```

### Integration Tests

```typescript
test('handles real-time updates', async () => {
  const { result } = renderHook(() => useSubgraph());
  
  act(() => {
    result.current.toggleNotifications();
  });
  
  expect(result.current.notificationsEnabled).toBe(true);
});
```

## 📈 Performance Optimization

### Caching Strategy

- Use Apollo Client's built-in caching
- Implement query result caching
- Cache frequently accessed data

### Query Optimization

- Use pagination for large datasets
- Implement query deduplication
- Optimize GraphQL queries

### Component Optimization

- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load non-critical components

## 🚀 Deployment

### Build Process

```bash
npm run build
```

### Environment Setup

1. Configure subgraph URL
2. Set up Apollo Client
3. Configure error handling
4. Set up monitoring

### Monitoring

- Track query performance
- Monitor subscription health
- Log errors and issues
- Track user engagement

## 📚 Additional Resources

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Documentation](https://graphql.org/)
- [The Graph Protocol](https://thegraph.com/)
- [Somnia Network Documentation](https://docs.somnia.network)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This subgraph implementation is designed for the Somnia network and provides real-time data access for the NFTFlow DAO. Make sure to deploy the subgraph before using the frontend components.
