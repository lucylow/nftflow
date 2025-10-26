# Mock Data Implementation for NFTFlow

This document outlines the comprehensive mock data implementation for the NFTFlow application, providing realistic data for testing, demonstration, and development purposes.

## 📊 **Mock Data Overview**

The mock data system provides realistic, comprehensive datasets that simulate real-world NFT rental marketplace activity on the Somnia blockchain.

### **Data Categories Implemented:**

1. **NFT Collections** - 5 diverse collections with detailed metadata
2. **NFT Items** - 5 unique NFTs with attributes and pricing
3. **User Profiles** - 5 users with reputation scores and activity history
4. **Active Rentals** - 4 ongoing rental transactions with real-time progress
5. **Payment Streams** - 4 payment streams with transaction history
6. **Analytics** - Comprehensive marketplace statistics and metrics
7. **Network Data** - Real-time Somnia blockchain metrics
8. **Notifications** - User and system notifications

## 🗂️ **File Structure**

```
src/mockData/
├── index.js                 # Central export file
├── mockDataService.js       # Data service with utility functions
├── nftCollections.js        # NFT collection data
├── nftItems.js             # Individual NFT data
├── users.js                # User profile data
├── activeRentals.js        # Active rental transactions
├── paymentStreams.js       # Payment stream data
├── analytics.js            # Marketplace analytics
├── networkData.js          # Network and subgraph statistics
└── notifications.js        # Notification data
```

## 🚀 **Key Features**

### **1. Realistic Data Generation**
- **Dynamic Content**: Mock data includes realistic timestamps, addresses, and values
- **Consistent Relationships**: Data maintains referential integrity across collections
- **Varied Scenarios**: Different user types, rental statuses, and transaction states

### **2. Comprehensive Coverage**
- **5 NFT Collections**: Punks, Real Estate, Art, Avatars, Gaming
- **5 NFT Items**: Each with unique attributes and metadata
- **5 User Profiles**: Different experience levels and activity patterns
- **4 Active Rentals**: Various durations, prices, and progress states
- **4 Payment Streams**: Different stages and transaction histories

### **3. Advanced Analytics**
- **Marketplace Metrics**: Volume, success rates, user demographics
- **Network Performance**: Block times, TPS, gas costs
- **Trending Data**: Popular collections and price statistics
- **Financial Analysis**: Revenue breakdowns and commission tracking

## 📈 **Data Statistics**

### **Collections Data**
```javascript
- Somnia Punks: 10,000 supply, 0.5 STT floor, 7.5% royalties
- Dreamscape Realms: 5,000 supply, 2.5 STT floor, 10% royalties
- Somnia Skylines: 2,500 supply, 1.25 STT floor, 8.5% royalties
- Metaverse Avatars: 10,000 supply, 0.75 STT floor, 7% royalties
- GameFi Champions: 5,000 supply, 3.5 STT floor, 10% royalties
```

### **User Profiles**
```javascript
- CryptoCollector: 875 reputation, 47 rentals, 125.75 STT earned
- MetaverseBuilder: 920 reputation, 32 rentals, 215.50 STT earned
- DigitalArtist: 920 reputation, 28 rentals, 156.25 STT earned
- MetaGamer: 880 reputation, 42 rentals, 87.50 STT earned
- CryptoInvestor: 950 reputation, 18 rentals, 225.50 STT earned
```

### **Rental Activity**
```javascript
- Total Rentals: 2,450
- Active Rentals: 156
- Success Rate: 98.7%
- Total Volume: 18,745.50 STT
- Average Duration: 2.5 hours
```

## 🛠️ **MockDataService API**

### **Collection Methods**
```javascript
MockDataService.getCollections()           // Get all collections
MockDataService.getCollectionById(id)      // Get specific collection
MockDataService.getCollectionsByCategory(category) // Filter by category
```

### **NFT Methods**
```javascript
MockDataService.getNFTItems()              // Get all NFTs
MockDataService.getNFTById(id)             // Get specific NFT
MockDataService.getNFTsByCollection(id)    // Get NFTs by collection
MockDataService.getNFTsByOwner(address)    // Get NFTs by owner
MockDataService.getListedNFTs()            // Get listed NFTs only
```

### **User Methods**
```javascript
MockDataService.getUsers()                 // Get all users
MockDataService.getUserById(id)            // Get specific user
MockDataService.getUserByAddress(address)  // Get user by wallet address
MockDataService.getUsersByReputation(min)  // Filter by reputation score
```

### **Rental Methods**
```javascript
MockDataService.getActiveRentals()         // Get active rentals
MockDataService.getRentalById(id)          // Get specific rental
MockDataService.getRentalsByLender(address) // Get rentals by lender
MockDataService.getRentalsByTenant(address) // Get rentals by tenant
```

### **Analytics Methods**
```javascript
MockDataService.getAnalytics()             // Get all analytics
MockDataService.getOverviewStats()         // Get overview statistics
MockDataService.getTrendingCollections()   // Get trending collections
MockDataService.getPriceStatistics()       // Get price distribution
```

### **Search and Filter Methods**
```javascript
MockDataService.searchNFTs(query)          // Search NFTs by name/description
MockDataService.searchUsers(query)         // Search users by username/bio
MockDataService.filterNFTsByPrice(min, max) // Filter NFTs by price range
MockDataService.filterNFTsByRarity(rarity) // Filter NFTs by rarity
```

### **Statistics Methods**
```javascript
MockDataService.getTotalVolume()           // Calculate total volume
MockDataService.getAverageRentalDuration() // Calculate average duration
MockDataService.getSuccessRate()           // Calculate success rate
MockDataService.getTopCollections()        // Get top performing collections
```

## 🎨 **UI Components with Mock Data**

### **SubgraphDashboardMock**
- **Real-time Coin Flip Data**: Simulated flip results with live updates
- **Live Activity Feed**: Recent activity with animations
- **Network Statistics**: Somnia blockchain metrics
- **Interactive Tables**: Pagination and sorting capabilities

### **RentalSubgraphMock**
- **Rental Activity Tracking**: Active and completed rentals
- **Recent Rentals Feed**: Live rental updates
- **Statistics Dashboard**: Rental analytics and metrics
- **Category Breakdown**: Popular categories visualization

## 📊 **Data Visualization Features**

### **Real-time Updates**
- **Simulated Live Data**: Mock data updates every 5-15 seconds
- **Progress Tracking**: Rental progress and payment stream updates
- **Status Changes**: Dynamic status updates for rentals and streams

### **Interactive Elements**
- **Pagination**: Large datasets with page navigation
- **Sorting**: Sortable columns in data tables
- **Filtering**: Search and filter capabilities
- **Export**: CSV and JSON export functionality

### **Responsive Design**
- **Mobile-friendly**: Optimized for all screen sizes
- **Touch Interactions**: Touch-friendly interface elements
- **Adaptive Layouts**: Responsive grid and table layouts

## 🔧 **Usage Examples**

### **Basic Data Access**
```javascript
import { MockDataService } from '@/mockData';

// Get all collections
const collections = MockDataService.getCollections();

// Get specific NFT
const nft = MockDataService.getNFTById('nft-1');

// Get user by address
const user = MockDataService.getUserByAddress('0x742d35Cc...');
```

### **Advanced Filtering**
```javascript
// Search NFTs
const searchResults = MockDataService.searchNFTs('cyberpunk');

// Filter by price range
const affordableNFTs = MockDataService.filterNFTsByPrice(0, 2.0);

// Get top collections
const topCollections = MockDataService.getTopCollections();
```

### **Analytics Integration**
```javascript
// Get marketplace overview
const overview = MockDataService.getOverviewStats();

// Get trending collections
const trending = MockDataService.getTrendingCollections();

// Calculate statistics
const totalVolume = MockDataService.getTotalVolume();
const successRate = MockDataService.getSuccessRate();
```

## 🚀 **Integration with Subgraph UI**

The mock data seamlessly integrates with the subgraph UI components:

1. **Apollo Client Compatibility**: Mock data structure matches GraphQL queries
2. **Real-time Simulation**: Polling intervals simulate live data updates
3. **Error Handling**: Mock error states for testing error scenarios
4. **Loading States**: Simulated loading states for better UX

## 📱 **Mobile Optimization**

- **Responsive Tables**: Horizontal scrolling on mobile devices
- **Touch Interactions**: Optimized for touch input
- **Adaptive Layouts**: Stack layouts on smaller screens
- **Performance**: Optimized for mobile performance

## 🔍 **Testing and Development**

### **Development Benefits**
- **No API Dependencies**: Work offline without external APIs
- **Consistent Data**: Predictable data for testing
- **Easy Customization**: Modify data for specific test scenarios
- **Performance**: Fast data access without network delays

### **Testing Scenarios**
- **Empty States**: Test with no data scenarios
- **Error States**: Test error handling and recovery
- **Loading States**: Test loading indicators and transitions
- **Edge Cases**: Test with extreme data values

## 📈 **Future Enhancements**

### **Planned Features**
- **Data Generation**: Automated mock data generation
- **Custom Scenarios**: User-defined test scenarios
- **Performance Metrics**: Data access performance tracking
- **Export Formats**: Additional export formats (XML, YAML)

### **Integration Improvements**
- **GraphQL Schema**: Full GraphQL schema compatibility
- **Real-time Subscriptions**: WebSocket simulation
- **Caching**: Advanced caching strategies
- **Pagination**: Cursor-based pagination support

## 🎯 **Best Practices**

### **Data Management**
- **Consistent Naming**: Use consistent naming conventions
- **Type Safety**: Maintain TypeScript compatibility
- **Documentation**: Document all data structures
- **Versioning**: Version control for data changes

### **Performance**
- **Lazy Loading**: Load data only when needed
- **Caching**: Cache frequently accessed data
- **Optimization**: Optimize data structures for performance
- **Memory Management**: Efficient memory usage

This comprehensive mock data implementation provides a solid foundation for testing, development, and demonstration of the NFTFlow platform's capabilities while maintaining realistic data relationships and scenarios.



