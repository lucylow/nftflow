// src/mockData/analytics.js
export const MARKETPLACE_ANALYTICS = {
  overview: {
    totalRentals: 2450,
    activeRentals: 156,
    completedRentals: 2294,
    totalVolume: '18,745.50',
    averageRentalDuration: '2.5 hours',
    successRate: '98.7%',
    uniqueUsers: 1250,
    newUsers24h: 45,
    transactions24h: 187
  },
  trendingCollections: [
    {
      id: 'collection-1',
      name: 'Somnia Punks',
      volume24h: '1,245.75',
      rentals24h: 87,
      floorPrice: '0.5',
      change24h: '+12.5%'
    },
    {
      id: 'collection-2',
      name: 'Dreamscape Realms',
      volume24h: '2,875.25',
      rentals24h: 45,
      floorPrice: '2.5',
      change24h: '+8.3%'
    },
    {
      id: 'collection-3',
      name: 'Somnia Skylines',
      volume24h: '1,125.50',
      rentals24h: 32,
      floorPrice: '1.25',
      change24h: '+15.2%'
    },
    {
      id: 'collection-4',
      name: 'Metaverse Avatars',
      volume24h: '2,150.75',
      rentals24h: 68,
      floorPrice: '0.75',
      change24h: '+5.8%'
    },
    {
      id: 'collection-5',
      name: 'GameFi Champions',
      volume24h: '3,250.25',
      rentals24h: 28,
      floorPrice: '3.5',
      change24h: '+22.1%'
    }
  ],
  priceStatistics: {
    averagePricePerHour: '0.85',
    minPricePerHour: '0.05',
    maxPricePerHour: '15.75',
    priceDistribution: [
      { range: '0-0.25', count: 450 },
      { range: '0.25-0.5', count: 625 },
      { range: '0.5-1.0', count: 785 },
      { range: '1.0-2.0', count: 425 },
      { range: '2.0+', count: 165 }
    ]
  },
  userDemographics: {
    byExperience: [
      { level: 'Beginner', count: 450, percentage: 36 },
      { level: 'Intermediate', count: 575, percentage: 46 },
      { level: 'Expert', count: 225, percentage: 18 }
    ],
    byActivity: [
      { type: 'Lenders', count: 650, percentage: 52 },
      { type: 'Tenants', count: 875, percentage: 70 },
      { type: 'Both', count: 275, percentage: 22 }
    ]
  },
  networkPerformance: {
    averageBlockTime: '0.8s',
    averageTransactionCost: '0.0000025 STT',
    successRate: '99.9%',
    peakTps: '12,450',
    activeNodes: 125
  },
  revenueAnalysis: {
    platformRevenue: '1,874.55',
    creatorEarnings: '14,996.40',
    lenderEarnings: '16,870.95',
    averageCommission: '2.5%'
  },
  userGrowth: {
    totalUsers: 1250,
    newUsers24h: 45,
    newUsers7d: 285,
    newUsers30d: 1120,
    growthRate24h: '3.7%',
    growthRate7d: '25.6%',
    growthRate30d: '896%'
  },
  rentalActivity: {
    totalRentals: 2450,
    activeRentals: 156,
    completedRentals: 2294,
    cancelledRentals: 12,
    disputedRentals: 4,
    successRate: '98.7%',
    averageRentalDuration: '2.5 hours',
    peakRentalHours: ['14:00-15:00', '20:00-21:00']
  },
  financialMetrics: {
    totalVolume: '18,745.50',
    platformRevenue: '1,874.55',
    averageRentalValue: '7.65',
    highestRentalValue: '125.00',
    volume24h: '1,245.75',
    volume7d: '8,750.25',
    volume30d: '18,745.50'
  },
  popularCategories: [
    { name: 'Gaming', volume: '8,250.75', percentage: 44.0 },
    { name: 'Art', volume: '5,875.25', percentage: 31.3 },
    { name: 'Collectibles', volume: '2,450.50', percentage: 13.1 },
    { name: 'Virtual Land', volume: '1,125.00', percentage: 6.0 },
    { name: 'Utility', volume: '1,043.00', percentage: 5.6 }
  ]
};
