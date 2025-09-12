# 📊 NFTFlow Subgraph for Somnia Network

A comprehensive subgraph implementation for indexing NFTFlow's rental marketplace data on the Somnia Network using The Graph protocol.

## 🚀 Overview

This subgraph provides real-time indexing and querying capabilities for the NFTFlow NFT rental marketplace, including:

- **NFT Listings & Rentals**: Track all NFT listings and rental transactions
- **Payment Streams**: Monitor real-time payment streaming with milestones
- **Reputation System**: Index user reputation scores and achievements
- **Analytics**: Comprehensive platform and market analytics
- **Governance**: Track DAO proposals and voting
- **Dispute Resolution**: Monitor rental disputes and resolutions

## 📋 Features

### **Core Marketplace Data**
- ✅ NFT listings with pricing and duration constraints
- ✅ Rental transactions with SOMI payments
- ✅ Payment streaming with milestone tracking
- ✅ User reputation and achievement systems
- ✅ Dispute resolution tracking

### **Advanced Analytics**
- ✅ Platform-wide metrics and statistics
- ✅ Daily metrics and trend analysis
- ✅ Collection rankings and performance
- ✅ User activity and engagement tracking
- ✅ Market insights and price history

### **Governance Integration**
- ✅ DAO proposal tracking
- ✅ Voting records and delegation
- ✅ Governance token distribution
- ✅ Proposal execution monitoring

## 🛠️ Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- Graph CLI installed globally
- Access to Somnia Network

### Installation

```bash
# Install Graph CLI globally
npm install -g @graphprotocol/graph-cli

# Navigate to subgraph directory
cd subgraph

# Install dependencies
npm install

# Generate types from schema
npm run codegen

# Build the subgraph
npm run build
```

### Configuration

1. **Update Contract Addresses** in `subgraph.yaml`:
```yaml
dataSources:
  - kind: ethereum
    name: NFTFlowSOMI
    network: somnia-testnet
    source:
      address: "0xYourNFTFlowContractAddress"  # Update this
      abi: NFTFlowSOMI
      startBlock: 1234567  # Update with actual deployment block
```

2. **Set Environment Variables**:
```bash
export GRAPH_ACCESS_TOKEN="your_graph_studio_access_token"
export SOMNIA_RPC_URL="https://dream-rpc.somnia.network/"
```

## 🚀 Deployment

### Deploy to Graph Studio

```bash
# Authenticate with Graph Studio
graph auth --studio YOUR_DEPLOY_KEY

# Deploy the subgraph
npm run deploy
```

### Deploy Locally

```bash
# Start local Graph node
docker-compose up -d

# Create local subgraph
npm run create-local

# Deploy to local node
npm run deploy-local
```

## 📊 GraphQL Schema

The subgraph provides a comprehensive schema with the following main entities:

### **Core Entities**
- `Token`: Contract information and metrics
- `NFT`: Individual NFT data and rental history
- `NFTListing`: Rental listings with pricing
- `Rental`: Rental transactions and details
- `User`: User profiles and statistics
- `PaymentStream`: Payment streaming data

### **Analytics Entities**
- `PlatformMetrics`: Platform-wide statistics
- `DailyMetrics`: Daily performance metrics
- `Collection`: NFT collection analytics
- `PriceHistory`: Historical price data
- `AnalyticsSnapshot`: Periodic analytics snapshots

### **Governance Entities**
- `GovernanceProposal`: DAO proposals
- `Vote`: Voting records
- `Dispute`: Rental disputes

## 🔍 Example Queries

### **Recent Rentals**
```graphql
query RecentRentals {
  rentals(
    first: 10
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    nft {
      contract
      tokenId
    }
    lender
    tenant
    totalPrice
    duration
    createdAt
  }
}
```

### **User Statistics**
```graphql
query UserStats($user: Bytes!) {
  user(id: $user) {
    id
    totalRentals
    totalListings
    totalEarned
    totalSpent
    reputationScore
    isVerified
    listings(first: 5) {
      id
      pricePerSecond
      active
    }
    rentalsAsTenant(first: 5) {
      id
      totalPrice
      duration
    }
  }
}
```

### **Platform Metrics**
```graphql
query PlatformMetrics {
  platformMetrics(id: "platform") {
    totalUsers
    totalNFTs
    totalListings
    totalRentals
    totalVolume
    totalFees
    averageRentalDuration
    averageRentalValue
    lastUpdated
  }
}
```

### **Collection Analytics**
```graphql
query CollectionAnalytics($collection: Bytes!) {
  collection(id: $collection) {
    id
    name
    symbol
    totalListings
    totalRentals
    totalVolume
    averagePrice
    floorPrice
    ceilingPrice
    activeListings
    activeRentals
    nfts(first: 10, orderBy: totalEarnings, orderDirection: desc) {
      id
      tokenId
      totalRentals
      totalEarnings
      averageRentalDuration
    }
  }
}
```

### **Daily Metrics**
```graphql
query DailyMetrics($days: Int!) {
  dailyMetrics(
    first: $days
    orderBy: date
    orderDirection: desc
  ) {
    id
    date
    newUsers
    newListings
    newRentals
    completedRentals
    volume
    fees
    gasUsed
    averageRentalDuration
    averageRentalValue
  }
}
```

### **Payment Streams**
```graphql
query PaymentStreams($user: Bytes!) {
  paymentStreams(
    where: { sender: $user }
    first: 10
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    recipient
    deposit
    ratePerSecond
    startTime
    stopTime
    remainingBalance
    totalWithdrawn
    active
    finalized
    milestones
    currentMilestone
    streamType
  }
}
```

### **Reputation Events**
```graphql
query ReputationEvents($user: Bytes!) {
  reputationEvents(
    where: { user: $user }
    first: 20
    orderBy: blockTimestamp
    orderDirection: desc
  ) {
    id
    eventType
    scoreChange
    reason
    blockTimestamp
    transactionHash
  }
}
```

### **Governance Proposals**
```graphql
query GovernanceProposals {
  governanceProposals(
    first: 10
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    proposer
    title
    description
    startTime
    endTime
    forVotes
    againstVotes
    abstainVotes
    executed
    cancelled
    proposalType
    createdAt
  }
}
```

### **Dispute Resolution**
```graphql
query Disputes {
  disputes(
    first: 10
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    rental {
      id
      nft {
        contract
        tokenId
      }
    }
    disputer
    reason
    status
    resolver
    resolutionTime
    resolvedInFavorOfTenant
    refundAmount
    createdAt
    resolvedAt
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### Test Coverage
```bash
npm run test
```

## 📈 Performance Optimization

### **Indexing Efficiency**
- Optimized entity relationships
- Efficient event filtering
- Batch processing for large datasets
- Memory-efficient data structures

### **Query Optimization**
- Proper entity indexing
- Relationship-based queries
- Pagination support
- Caching strategies

### **Monitoring**
- Real-time indexing status
- Query performance metrics
- Error tracking and logging
- Health check endpoints

## 🔧 Customization

### **Adding New Events**
1. Update the schema in `schema.graphql`
2. Add event handler in `mapping.ts`
3. Update ABI files in `abis/` directory
4. Regenerate types and rebuild

### **Custom Analytics**
1. Add new entity types to schema
2. Implement analytics logic in mappings
3. Create custom query resolvers
4. Update frontend integration

### **Multi-Network Support**
1. Add new network configurations
2. Update contract addresses
3. Handle network-specific logic
4. Deploy to multiple networks

## 🚀 Advanced Features

### **Real-Time Updates**
- WebSocket subscriptions
- Live data streaming
- Instant notifications
- Real-time analytics

### **Data Export**
- CSV export functionality
- JSON data dumps
- Historical data archiving
- Backup and restore

### **API Integration**
- REST API endpoints
- GraphQL subscriptions
- Webhook notifications
- Third-party integrations

## 📊 Monitoring and Maintenance

### **Health Monitoring**
- Subgraph sync status
- Indexing progress
- Query performance
- Error rates

### **Data Quality**
- Data validation
- Consistency checks
- Error handling
- Recovery procedures

### **Scaling**
- Horizontal scaling
- Load balancing
- Caching strategies
- Performance optimization

## 🔗 Integration Examples

### **Frontend Integration**
```javascript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/your-username/nftflow-subgraph',
  cache: new InMemoryCache()
});

const GET_RECENT_RENTALS = gql`
  query GetRecentRentals {
    rentals(first: 10, orderBy: createdAt, orderDirection: desc) {
      id
      nft { contract tokenId }
      lender tenant totalPrice duration
    }
  }
`;

// Use in React component
const { data, loading, error } = useQuery(GET_RECENT_RENTALS);
```

### **Backend Integration**
```javascript
const { createClient } = require('@urql/core');

const client = createClient({
  url: 'https://api.thegraph.com/subgraphs/name/your-username/nftflow-subgraph'
});

const query = `
  query GetUserStats($user: Bytes!) {
    user(id: $user) {
      totalRentals totalEarned reputationScore
    }
  }
`;

const result = await client.query(query, { user: '0x...' }).toPromise();
```

## 🎯 Use Cases

### **Marketplace Analytics**
- Track rental trends and patterns
- Monitor user behavior and engagement
- Analyze collection performance
- Generate market insights

### **User Dashboards**
- Personal rental history
- Earnings and spending tracking
- Reputation and achievement display
- Portfolio management

### **Business Intelligence**
- Platform performance metrics
- Revenue and fee analysis
- User acquisition and retention
- Market opportunity identification

### **Compliance and Auditing**
- Transaction history tracking
- Dispute resolution monitoring
- Governance participation records
- Regulatory compliance reporting

## 🚀 Future Enhancements

### **Planned Features**
- Advanced analytics and ML insights
- Cross-chain data aggregation
- Real-time notifications
- Mobile app integration

### **Performance Improvements**
- Query optimization
- Caching strategies
- Data compression
- Network efficiency

### **New Data Sources**
- External price feeds
- Social media sentiment
- Market data integration
- Third-party analytics

## 📞 Support

For questions, issues, or contributions:

- **GitHub Issues**: [Create an issue](https://github.com/nftflow/somnia-subgraph/issues)
- **Documentation**: [Read the docs](https://docs.nftflow.io/subgraph)
- **Discord**: [Join our community](https://discord.gg/nftflow)
- **Email**: support@nftflow.io

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Somnia Network and NFTFlow ecosystem**



