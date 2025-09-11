// src/mockData/mockDataService.js
import { NFT_COLLECTIONS } from './nftCollections';
import { NFT_ITEMS } from './nftItems';
import { USERS } from './users';
import { ACTIVE_RENTALS } from './activeRentals';
import { PAYMENT_STREAMS } from './paymentStreams';
import { MARKETPLACE_ANALYTICS } from './analytics';
import { REAL_TIME_NETWORK_DATA, SUBGRAPH_STATISTICS } from './networkData';
import { NOTIFICATIONS } from './notifications';

// Mock data service for easy data management
export class MockDataService {
  // Collections
  static getCollections() {
    return NFT_COLLECTIONS;
  }

  static getCollectionById(id) {
    return NFT_COLLECTIONS.find(collection => collection.id === id);
  }

  static getCollectionsByCategory(category) {
    return NFT_COLLECTIONS.filter(collection => collection.category === category);
  }

  // NFT Items
  static getNFTItems() {
    return NFT_ITEMS;
  }

  static getNFTById(id) {
    return NFT_ITEMS.find(nft => nft.id === id);
  }

  static getNFTsByCollection(collectionId) {
    return NFT_ITEMS.filter(nft => nft.collectionId === collectionId);
  }

  static getNFTsByOwner(ownerAddress) {
    return NFT_ITEMS.filter(nft => nft.owner === ownerAddress);
  }

  static getListedNFTs() {
    return NFT_ITEMS.filter(nft => nft.isListed);
  }

  static getRentedNFTs() {
    return NFT_ITEMS.filter(nft => nft.isRented);
  }

  // Users
  static getUsers() {
    return USERS;
  }

  static getUserById(id) {
    return USERS.find(user => user.id === id);
  }

  static getUserByAddress(address) {
    return USERS.find(user => user.address === address);
  }

  static getUsersByReputation(minScore) {
    return USERS.filter(user => user.reputationScore >= minScore);
  }

  // Rentals
  static getActiveRentals() {
    return ACTIVE_RENTALS;
  }

  static getRentalById(id) {
    return ACTIVE_RENTALS.find(rental => rental.id === id);
  }

  static getRentalsByLender(lenderAddress) {
    return ACTIVE_RENTALS.filter(rental => rental.lender === lenderAddress);
  }

  static getRentalsByTenant(tenantAddress) {
    return ACTIVE_RENTALS.filter(rental => rental.tenant === tenantAddress);
  }

  static getRentalsByNFT(nftId) {
    return ACTIVE_RENTALS.filter(rental => rental.nftId === nftId);
  }

  // Payment Streams
  static getPaymentStreams() {
    return PAYMENT_STREAMS;
  }

  static getPaymentStreamById(id) {
    return PAYMENT_STREAMS.find(stream => stream.id === id);
  }

  static getActivePaymentStreams() {
    return PAYMENT_STREAMS.filter(stream => stream.isActive);
  }

  static getPaymentStreamsByPayer(payerAddress) {
    return PAYMENT_STREAMS.filter(stream => stream.payer === payerAddress);
  }

  static getPaymentStreamsByPayee(payeeAddress) {
    return PAYMENT_STREAMS.filter(stream => stream.payee === payeeAddress);
  }

  // Analytics
  static getAnalytics() {
    return MARKETPLACE_ANALYTICS;
  }

  static getOverviewStats() {
    return MARKETPLACE_ANALYTICS.overview;
  }

  static getTrendingCollections() {
    return MARKETPLACE_ANALYTICS.trendingCollections;
  }

  static getPriceStatistics() {
    return MARKETPLACE_ANALYTICS.priceStatistics;
  }

  static getUserDemographics() {
    return MARKETPLACE_ANALYTICS.userDemographics;
  }

  static getNetworkPerformance() {
    return MARKETPLACE_ANALYTICS.networkPerformance;
  }

  static getRevenueAnalysis() {
    return MARKETPLACE_ANALYTICS.revenueAnalysis;
  }

  // Network Data
  static getNetworkData() {
    return REAL_TIME_NETWORK_DATA;
  }

  static getSubgraphStatistics() {
    return SUBGRAPH_STATISTICS;
  }

  static getFlipResults() {
    return SUBGRAPH_STATISTICS.flipResults;
  }

  static getRentalActivity() {
    return SUBGRAPH_STATISTICS.rentalActivity;
  }

  static getNetworkMetrics() {
    return SUBGRAPH_STATISTICS.networkMetrics;
  }

  // Notifications
  static getNotifications() {
    return NOTIFICATIONS;
  }

  static getSystemNotifications() {
    return NOTIFICATIONS.system;
  }

  static getUserNotifications() {
    return NOTIFICATIONS.user;
  }

  static getUnreadNotifications() {
    return [
      ...NOTIFICATIONS.system.filter(notif => !notif.read),
      ...NOTIFICATIONS.user.filter(notif => !notif.read)
    ];
  }

  // Search and Filter Functions
  static searchNFTs(query) {
    const lowercaseQuery = query.toLowerCase();
    return NFT_ITEMS.filter(nft => 
      nft.name.toLowerCase().includes(lowercaseQuery) ||
      nft.description.toLowerCase().includes(lowercaseQuery) ||
      nft.collectionId.toLowerCase().includes(lowercaseQuery)
    );
  }

  static searchUsers(query) {
    const lowercaseQuery = query.toLowerCase();
    return USERS.filter(user => 
      user.username.toLowerCase().includes(lowercaseQuery) ||
      user.bio.toLowerCase().includes(lowercaseQuery)
    );
  }

  static filterNFTsByPrice(minPrice, maxPrice) {
    return NFT_ITEMS.filter(nft => {
      const price = parseFloat(nft.currentPrice);
      return price >= minPrice && price <= maxPrice;
    });
  }

  static filterNFTsByRarity(rarity) {
    return NFT_ITEMS.filter(nft => 
      nft.attributes.some(attr => 
        attr.trait_type === 'Rarity' && attr.value === rarity
      )
    );
  }

  static getTopRentals(limit = 10) {
    return ACTIVE_RENTALS
      .sort((a, b) => parseFloat(b.totalPrice) - parseFloat(a.totalPrice))
      .slice(0, limit);
  }

  static getRecentActivity(limit = 20) {
    const allRentals = [...ACTIVE_RENTALS];
    return allRentals
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, limit);
  }

  // Statistics and Aggregations
  static getTotalVolume() {
    return ACTIVE_RENTALS.reduce((total, rental) => 
      total + parseFloat(rental.totalPrice), 0
    ).toFixed(2);
  }

  static getAverageRentalDuration() {
    const totalDuration = ACTIVE_RENTALS.reduce((total, rental) => 
      total + rental.duration, 0
    );
    return (totalDuration / ACTIVE_RENTALS.length / 3600).toFixed(1); // in hours
  }

  static getSuccessRate() {
    const completedRentals = ACTIVE_RENTALS.filter(rental => 
      rental.status === 'completed'
    ).length;
    return ((completedRentals / ACTIVE_RENTALS.length) * 100).toFixed(1);
  }

  static getTopCollections() {
    const collectionStats = {};
    
    NFT_ITEMS.forEach(nft => {
      if (!collectionStats[nft.collectionId]) {
        collectionStats[nft.collectionId] = {
          collectionId: nft.collectionId,
          totalRentals: 0,
          totalVolume: 0,
          averagePrice: 0
        };
      }
      collectionStats[nft.collectionId].totalRentals += nft.rentalCount;
      collectionStats[nft.collectionId].totalVolume += parseFloat(nft.totalEarned);
    });

    return Object.values(collectionStats)
      .sort((a, b) => b.totalVolume - a.totalVolume);
  }

  // Real-time data simulation
  static simulateRealTimeUpdate() {
    // Simulate real-time updates by slightly modifying existing data
    const updatedRentals = ACTIVE_RENTALS.map(rental => ({
      ...rental,
      progress: Math.min(100, rental.progress + Math.random() * 5),
      timeRemaining: Math.max(0, rental.timeRemaining - 60),
      totalPaid: (parseFloat(rental.totalPaid) + parseFloat(rental.pricePerSecond) * 60).toFixed(4)
    }));

    return updatedRentals;
  }

  // Data export functions
  static exportToCSV(data, filename) {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  static exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

// Default export
export default MockDataService;
