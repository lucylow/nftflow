# Somnia Subgraph UI Implementation

This document outlines the complete implementation of a UI for subgraph queries on Somnia, built with Next.js, Apollo Client, and GraphQL.

## 🚀 Features Implemented

### 1. **Apollo Client Setup**
- **File**: `src/lib/apollo-client.ts`
- **Features**:
  - Configured Apollo Client with Somnia subgraph endpoints
  - In-memory caching for optimal performance
  - Error handling and retry logic
  - Support for multiple subgraph endpoints

### 2. **GraphQL Queries**
- **File**: `src/lib/graphql-queries.ts`
- **Queries Available**:
  - `GET_FLIP_RESULTS` - Coin flip game results with pagination
  - `GET_RECENT_FLIPS` - Recent flip activity for live feed
  - `GET_FLIP_STATISTICS` - Statistical analysis of flip data
  - `GET_RENTALS` - NFT rental activity with pagination
  - `GET_RECENT_RENTALS` - Recent rental activity
  - `GET_RENTAL_STATISTICS` - Rental analytics and metrics
  - `GET_NETWORK_STATISTICS` - Network health and block data
  - `GET_ACHIEVEMENTS` - Achievement system data
  - `GET_PAYMENT_STREAMS` - Payment stream analytics

### 3. **Interactive Dashboard Components**

#### **SubgraphDashboard** (`src/components/SubgraphDashboard.tsx`)
- **Features**:
  - Real-time coin flip results with pagination
  - Live activity feed with auto-refresh
  - Network statistics and health monitoring
  - Interactive data tables with sorting
  - Error handling and loading states

#### **RentalSubgraph** (`src/components/RentalSubgraph.tsx`)
- **Features**:
  - NFT rental activity tracking
  - Recent rentals with live updates
  - Rental statistics and analytics
  - Duration and cost calculations
  - Status tracking (Active/Completed)

### 4. **Comprehensive Showcase Page**
- **File**: `src/pages/SubgraphShowcase.tsx`
- **Features**:
  - Hero section with feature highlights
  - Interactive dashboard tabs
  - Subgraph endpoint information
  - Code examples and documentation
  - Technical implementation details

## 🛠 Technical Implementation

### **Apollo Client Configuration**
```typescript
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          flipResults: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
});
```

### **GraphQL Query Example**
```graphql
query GetFlipResults(
  $first: Int!
  $skip: Int!
  $orderBy: String!
  $orderDirection: String!
) {
  flipResults(
    first: $first
    skip: $skip
    orderBy: $orderBy
    orderDirection: $orderDirection
  ) {
    id
    player
    betAmount
    choice
    result
    payout
    blockTimestamp
    transactionHash
  }
}
```

### **Real-time Updates**
```typescript
const { loading, error, data } = useQuery(GET_RECENT_FLIPS, {
  variables: { first: 10 },
  pollInterval: 5000, // Refresh every 5 seconds
});
```

## 📊 Available Subgraph Endpoints

1. **SomFlip Game**
   - URL: `https://proxy.somnia.chain.love/subgraphs/name/somnia-testnet/SomFlip`
   - Description: Coin flip game results and statistics
   - Status: Active

2. **NFTFlow Rentals**
   - URL: `https://proxy.somnia.chain.love/subgraphs/name/nftflow/rentals`
   - Description: NFT rental activity and analytics
   - Status: Active

3. **Somnia Network**
   - URL: `https://proxy.somnia.chain.love/subgraphs/name/somnia/network`
   - Description: Network statistics and block data
   - Status: Active

## 🎨 UI Components

### **Data Visualization**
- Interactive tables with sorting and pagination
- Real-time statistics cards
- Live activity feeds with animations
- Network health indicators
- Progress bars and loading states

### **User Experience**
- Responsive design for all screen sizes
- Smooth animations and transitions
- Error handling with user-friendly messages
- Auto-refresh capabilities
- Export functionality for data

## 🔧 Setup Instructions

### **1. Install Dependencies**
```bash
npm install @apollo/client graphql
```

### **2. Configure Apollo Client**
The Apollo Client is already configured in `src/lib/apollo-client.ts` with:
- Somnia subgraph endpoints
- Caching strategies
- Error handling
- Authentication headers

### **3. Add Apollo Provider**
The app is wrapped with `ApolloWrapper` in `App.tsx` to provide GraphQL context to all components.

### **4. Use GraphQL Queries**
```typescript
import { useQuery } from '@apollo/client';
import { GET_FLIP_RESULTS } from '@/lib/graphql-queries';

const { loading, error, data } = useQuery(GET_FLIP_RESULTS, {
  variables: {
    first: 20,
    skip: 0,
    orderBy: 'blockTimestamp',
    orderDirection: 'desc',
  },
});
```

## 🚀 Features Highlights

### **Real-Time Data**
- Live updates every 5-15 seconds
- Automatic refresh on data changes
- WebSocket-like experience with polling

### **Advanced Caching**
- Apollo Client's intelligent caching
- Optimistic updates
- Cache invalidation strategies

### **Error Handling**
- Graceful error states
- Retry mechanisms
- User-friendly error messages

### **Performance Optimization**
- Pagination for large datasets
- Lazy loading of components
- Efficient re-rendering with React.memo

## 📱 Responsive Design

The implementation includes:
- Mobile-first design approach
- Responsive tables with horizontal scrolling
- Adaptive layouts for different screen sizes
- Touch-friendly interactions

## 🔍 Data Analytics

### **Flip Game Analytics**
- Total flips count
- Win/loss ratios
- Volume tracking
- Average bet amounts
- Player activity patterns

### **Rental Analytics**
- Total rental volume
- Active rental count
- Average rental duration
- Price per second trends
- User activity metrics

### **Network Health**
- Current block number
- Indexing status
- Deployment information
- Error tracking

## 🎯 Usage Examples

### **View Live Data**
Navigate to `/subgraph` to see the interactive dashboard with:
- Real-time coin flip results
- Live activity feed
- Network statistics
- Rental analytics

### **Integrate in Components**
```typescript
import { useQuery } from '@apollo/client';
import { GET_RENTALS } from '@/lib/graphql-queries';

function MyComponent() {
  const { data, loading, error } = useQuery(GET_RENTALS, {
    variables: { first: 10 }
  });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data.rentals.map(rental => (
        <div key={rental.id}>{rental.nftContract}</div>
      ))}
    </div>
  );
}
```

## 🔧 Customization

### **Add New Queries**
1. Define query in `src/lib/graphql-queries.ts`
2. Export the query
3. Use in components with `useQuery` hook

### **Add New Subgraph Endpoints**
1. Update `apollo-client.ts` with new endpoint
2. Create new client instance if needed
3. Update query definitions

### **Customize UI Components**
- Modify styling in component files
- Add new data visualizations
- Implement custom error handling
- Add new interactive features

## 🚀 Future Enhancements

- WebSocket integration for real-time updates
- Advanced filtering and search capabilities
- Data export in multiple formats (CSV, JSON)
- Custom dashboard creation
- Advanced analytics and reporting
- Integration with more Somnia subgraphs

## 📚 Documentation

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Somnia Network Documentation](https://docs.somnia.network/)
- [Subgraph Development Guide](https://thegraph.com/docs/en/developing/creating-a-subgraph/)

This implementation provides a complete, production-ready UI for querying Somnia subgraphs with modern web technologies and best practices.



