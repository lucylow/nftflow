// src/mockData/users.js
export const USERS = [
  {
    id: 'user-1',
    address: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59',
    username: 'CryptoCollector',
    bio: 'Digital art enthusiast and NFT collector. Building the future of web3.',
    profileImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/avatar1',
    bannerImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/banner1',
    joinedDate: '2023-06-15T00:00:00Z',
    website: 'https://cryptocollector.io',
    twitter: 'https://twitter.com/cryptocollector',
    discord: 'CryptoCollector#1234',
    reputationScore: 875,
    totalRentals: 47,
    successfulRentals: 45,
    totalEarned: '125.75',
    totalSpent: '87.25',
    nftsOwned: 12,
    nftsListed: 8,
    favoriteCollections: ['collection-1', 'collection-2'],
    recentlyViewed: ['nft-1', 'nft-3', 'nft-5'],
    notifications: [
      {
        id: 'notif-1',
        type: 'rental_started',
        message: 'Your rental of Somnia Punk #1234 has started',
        timestamp: '2024-03-20T10:30:00Z',
        read: false,
        link: '/rentals/rental-1'
      },
      {
        id: 'notif-2',
        type: 'payment_received',
        message: 'You received 0.75 STT from rental payment',
        timestamp: '2024-03-20T09:15:00Z',
        read: true,
        link: '/wallet'
      }
    ],
    settings: {
      emailNotifications: true,
      pushNotifications: true,
      darkMode: true,
      currency: 'STT',
      language: 'en',
      timezone: 'UTC-5'
    }
  },
  {
    id: 'user-2',
    address: '0x99d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
    username: 'MetaverseBuilder',
    bio: 'Creating immersive virtual experiences and digital real estate.',
    profileImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/avatar2',
    bannerImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/banner2',
    joinedDate: '2023-08-22T00:00:00Z',
    website: 'https://metaversebuilder.io',
    twitter: 'https://twitter.com/metaversebuilder',
    discord: 'MetaverseBuilder#5678',
    reputationScore: 920,
    totalRentals: 32,
    successfulRentals: 31,
    totalEarned: '215.50',
    totalSpent: '42.75',
    nftsOwned: 18,
    nftsListed: 12,
    favoriteCollections: ['collection-2', 'collection-3'],
    recentlyViewed: ['nft-2', 'nft-4', 'nft-6'],
    notifications: [
      {
        id: 'notif-3',
        type: 'new_follower',
        message: 'CryptoCollector started following you',
        timestamp: '2024-03-19T16:45:00Z',
        read: false,
        link: '/profile/user-1'
      }
    ],
    settings: {
      emailNotifications: true,
      pushNotifications: false,
      darkMode: false,
      currency: 'USD',
      language: 'en',
      timezone: 'UTC-8'
    }
  },
  {
    id: 'user-3',
    address: '0x8a1d4d8b6c3e9f2a5b7c4d6e8f1a3b5c7d9e0f2',
    username: 'DigitalArtist',
    bio: 'Creating immersive digital art experiences for the blockchain era. Collector and creator of futuristic landscapes.',
    profileImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/artist-avatar',
    bannerImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/artist-banner',
    joinedDate: '2023-05-12T00:00:00Z',
    website: 'https://digitalartist.io',
    twitter: 'https://twitter.com/digitalartist',
    discord: 'DigitalArtist#7890',
    reputationScore: 920,
    totalRentals: 28,
    successfulRentals: 27,
    totalEarned: '156.25',
    totalSpent: '42.30',
    nftsOwned: 15,
    nftsListed: 10,
    favoriteCollections: ['collection-1', 'collection-3'],
    recentlyViewed: ['nft-1', 'nft-3', 'nft-5'],
    notifications: [
      {
        id: 'notif-4',
        type: 'price_alert',
        message: 'Your NFT Somnia Skyline #7890 has reached your target price',
        timestamp: '2024-03-20T11:30:00Z',
        read: false,
        link: '/nft/nft-3'
      }
    ],
    settings: {
      emailNotifications: true,
      pushNotifications: true,
      darkMode: true,
      currency: 'STT',
      language: 'en',
      timezone: 'UTC-8'
    }
  },
  {
    id: 'user-4',
    address: '0x9b2e4d6f8a1c3e5f7b9d2c4e6f8a1b3d5f7e9c1',
    username: 'MetaGamer',
    bio: 'Professional metaverse explorer and competitive gamer. Always looking for the best assets to enhance my virtual presence.',
    profileImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/gamer-avatar',
    bannerImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/gamer-banner',
    joinedDate: '2023-09-03T00:00:00Z',
    website: 'https://metagamer.pro',
    twitter: 'https://twitter.com/metagamer',
    discord: 'MetaGamer#2468',
    reputationScore: 880,
    totalRentals: 42,
    successfulRentals: 40,
    totalEarned: '87.50',
    totalSpent: '215.75',
    nftsOwned: 8,
    nftsListed: 5,
    favoriteCollections: ['collection-4', 'collection-5'],
    recentlyViewed: ['nft-2', 'nft-4', 'nft-5'],
    notifications: [
      {
        id: 'notif-5',
        type: 'rental_ending',
        message: 'Your rental of GameFi Champion #1357 will expire in 1 hour',
        timestamp: '2024-03-21T13:20:00Z',
        read: false,
        link: '/rentals/rental-3'
      }
    ],
    settings: {
      emailNotifications: false,
      pushNotifications: true,
      darkMode: false,
      currency: 'USD',
      language: 'en',
      timezone: 'UTC-5'
    }
  },
  {
    id: 'user-5',
    address: '0x7c3e5f9a1b4d6e8f2a5c7d9e1b3f5a7c9d2e4f6',
    username: 'CryptoInvestor',
    bio: 'Strategic investor in blockchain assets with a focus on utility and long-term value. Building a diversified NFT portfolio.',
    profileImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/investor-avatar',
    bannerImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/investor-banner',
    joinedDate: '2023-11-18T00:00:00Z',
    website: 'https://cryptoinvestor.io',
    twitter: 'https://twitter.com/cryptoinvestor',
    discord: 'CryptoInvestor#1357',
    reputationScore: 950,
    totalRentals: 18,
    successfulRentals: 18,
    totalEarned: '225.50',
    totalSpent: '65.25',
    nftsOwned: 22,
    nftsListed: 15,
    favoriteCollections: ['collection-2', 'collection-5'],
    recentlyViewed: ['nft-1', 'nft-3', 'nft-5'],
    notifications: [
      {
        id: 'notif-6',
        type: 'new_follower',
        message: 'DigitalArtist started following you',
        timestamp: '2024-03-20T15:45:00Z',
        read: true,
        link: '/profile/user-3'
      }
    ],
    settings: {
      emailNotifications: true,
      pushNotifications: false,
      darkMode: true,
      currency: 'ETH',
      language: 'en',
      timezone: 'UTC+0'
    }
  }
];


