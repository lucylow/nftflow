// src/mockData/index.js
// Central export file for all mock data

export { NFT_COLLECTIONS } from './nftCollections';
export { NFT_ITEMS } from './nftItems';
export { USERS } from './users';
export { ACTIVE_RENTALS } from './activeRentals';
export { PAYMENT_STREAMS } from './paymentStreams';
export { MARKETPLACE_ANALYTICS } from './analytics';
export { REAL_TIME_NETWORK_DATA, SUBGRAPH_STATISTICS } from './networkData';
export { NOTIFICATIONS } from './notifications';
export { MockDataService } from './mockDataService';

// Re-export the service as default
export { default } from './mockDataService';


