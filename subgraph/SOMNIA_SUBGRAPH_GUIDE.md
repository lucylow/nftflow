# 📊 NFTFlow Somnia Subgraph - Complete Implementation Guide

## 🚀 Overview

This comprehensive subgraph implementation provides real-time indexing and querying capabilities for the NFTFlow NFT rental marketplace on the Somnia Network using The Graph protocol.

## 📋 Features Implemented

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

## 📊 Use Cases

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

## 🎯 Benefits

### **Real-Time Data**
- Instant indexing of blockchain events
- Live query capabilities
- Sub-second data updates
- Comprehensive event coverage

### **Advanced Analytics**
- Rich data relationships
- Complex query support
- Historical trend analysis
- Performance metrics

### **Developer Experience**
- GraphQL API
- Type-safe queries
- Comprehensive documentation
- Easy integration

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
