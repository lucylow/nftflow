// Enhanced NFT Mock Data with realistic images and comprehensive attributes
export const ENHANCED_NFT_ITEMS = [
  {
    id: 'nft-1',
    listingId: 'listing-1',
    tokenId: '1234',
    name: 'Cosmic Wizard #1234',
    description: 'A powerful cosmic wizard wielding ethereal magic and interdimensional spells. Perfect for RPG adventures and fantasy gaming worlds.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f103fc96?w=400&h=400&fit=crop&crop=center',
    collection: 'Cosmic Wizards',
    category: 'Gaming Asset',
    utilityType: 'RPG Character',
    pricePerSecond: 0.000138, // ~0.5 STT/hour
    minDuration: 3600, // 1 hour
    maxDuration: 86400, // 1 day
    collateralRequired: 1.2,
    isRented: true,
    owner: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59',
    renter: '0x1234567890abcdef1234567890abcdef12345678',
    timeLeft: '2h 15m',
    rarity: 'Rare',
    rentalStartTime: new Date(Date.now() - 2.75 * 3600 * 1000).toISOString(),
    totalCost: 1.25,
    rentalCount: 15,
    totalEarned: 12.75,
    lastRented: '2 hours ago',
    contractAddress: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
    attributes: [
      { trait_type: 'Class', value: 'Wizard' },
      { trait_type: 'Element', value: 'Cosmic' },
      { trait_type: 'Level', value: '45' },
      { trait_type: 'Mana Power', value: '890' },
      { trait_type: 'Special Ability', value: 'Cosmic Storm' },
      { trait_type: 'Rarity Score', value: '87.3' }
    ],
    stats: {
      attack: 75,
      defense: 60,
      magic: 95,
      speed: 70,
      health: 450
    },
    compatibleGames: ['Fantasy Realms', 'Mana Wars', 'Cosmic Quest'],
    social: {
      likes: 342,
      views: 2150,
      shares: 67
    }
  },
  {
    id: 'nft-2',
    listingId: 'listing-2',
    tokenId: '5678',
    name: 'Neon Samurai #5678',
    description: 'A cyberpunk samurai warrior with advanced AR capabilities and traditional combat skills merged with futuristic technology.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
    collection: 'Neon Warriors',
    category: 'Avatar',
    utilityType: 'Metaverse Avatar',
    pricePerSecond: 0.000333, // ~1.2 STT/hour
    minDuration: 1800, // 30 minutes
    maxDuration: 172800, // 2 days
    collateralRequired: 2.5,
    isRented: false,
    owner: '0x9876543210fedcba9876543210fedcba98765432',
    timeLeft: null,
    rarity: 'Epic',
    rentalStartTime: null,
    totalCost: 0,
    rentalCount: 23,
    totalEarned: 28.90,
    lastRented: '3 days ago',
    contractAddress: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
    attributes: [
      { trait_type: 'Class', value: 'Samurai' },
      { trait_type: 'Style', value: 'Cyberpunk' },
      { trait_type: 'Weapon', value: 'Plasma Katana' },
      { trait_type: 'Armor', value: 'Neon Exosuit' },
      { trait_type: 'Special Feature', value: 'AR Visor' },
      { trait_type: 'Rarity Score', value: '92.1' }
    ],
    stats: {
      attack: 88,
      defense: 75,
      magic: 40,
      speed: 92,
      health: 520
    },
    compatibleGames: ['CyberWorld', 'Neon Streets', 'Samurai Legends'],
    social: {
      likes: 187,
      views: 1580,
      shares: 42
    }
  },
  {
    id: 'nft-3',
    listingId: 'listing-3',
    tokenId: '9999',
    name: 'Digital Art Gallery Space',
    description: 'A premium virtual gallery space for displaying digital art collections with interactive features and customizable lighting.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&crop=center',
    collection: 'Virtual Spaces',
    category: 'Virtual Real Estate',
    utilityType: 'Art Gallery',
    pricePerSecond: 0.000055, // ~0.2 STT/hour
    minDuration: 7200, // 2 hours
    maxDuration: 604800, // 1 week
    collateralRequired: 0.8,
    isRented: false,
    owner: '0x5555666677778888999900001111222233334444',
    timeLeft: null,
    rarity: 'Legendary',
    rentalStartTime: null,
    totalCost: 0,
    rentalCount: 47,
    totalEarned: 35.60,
    lastRented: '1 week ago',
    contractAddress: '0x7c8e2d3f4a5b6c9d1e2f3a4b5c6d7e8f9a0b1c2',
    attributes: [
      { trait_type: 'Space Type', value: 'Gallery' },
      { trait_type: 'Capacity', value: '50 Artworks' },
      { trait_type: 'Lighting', value: 'Dynamic' },
      { trait_type: 'Interactivity', value: 'High' },
      { trait_type: 'Location', value: 'Prime District' },
      { trait_type: 'Rarity Score', value: '95.7' }
    ],
    stats: {
      capacity: 50,
      traffic: 850,
      prestige: 78,
      accessibility: 90,
      features: 12
    },
    compatibleGames: ['Art Worlds', 'Gallery Verse', 'Creative Spaces'],
    social: {
      likes: 425,
      views: 3200,
      shares: 95
    }
  },
  {
    id: 'nft-4',
    listingId: 'listing-4',
    tokenId: '7777',
    name: 'Racing Beast #7777',
    description: 'A high-performance racing vehicle with nitro boost capabilities and advanced aerodynamics for competitive racing games.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
    collection: 'Speed Demons',
    category: 'Gaming Asset',
    utilityType: 'Racing Vehicle',
    pricePerSecond: 0.000278, // ~1.0 STT/hour
    minDuration: 900, // 15 minutes
    maxDuration: 43200, // 12 hours
    collateralRequired: 1.8,
    isRented: true,
    owner: '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555',
    renter: '0x9999888877776666555544443333222211110000',
    timeLeft: '45m',
    rarity: 'Epic',
    rentalStartTime: new Date(Date.now() - 0.75 * 3600 * 1000).toISOString(),
    totalCost: 0.75,
    rentalCount: 31,
    totalEarned: 22.30,
    lastRented: '45 minutes ago',
    contractAddress: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    attributes: [
      { trait_type: 'Vehicle Type', value: 'Supercar' },
      { trait_type: 'Engine', value: 'Plasma V12' },
      { trait_type: 'Top Speed', value: '420 mph' },
      { trait_type: 'Acceleration', value: '0-60 in 1.8s' },
      { trait_type: 'Special Feature', value: 'Nitro Boost' },
      { trait_type: 'Rarity Score', value: '89.4' }
    ],
    stats: {
      speed: 95,
      acceleration: 88,
      handling: 82,
      durability: 75,
      style: 90
    },
    compatibleGames: ['Hyper Racing', 'Speed Champions', 'Neon Tracks'],
    social: {
      likes: 278,
      views: 1940,
      shares: 54
    }
  },
  {
    id: 'nft-5',
    listingId: 'listing-5',
    tokenId: '3333',
    name: 'Mystic Dragon #3333',
    description: 'An ancient mystic dragon with fire breath abilities and treasure hoarding instincts. Powerful companion for fantasy adventures.',
    image: 'https://images.unsplash.com/photo-1578662015923-8c4e8ed4df3f?w=400&h=400&fit=crop&crop=center',
    collection: 'Legendary Dragons',
    category: 'Gaming Asset',
    utilityType: 'Companion Pet',
    pricePerSecond: 0.000417, // ~1.5 STT/hour
    minDuration: 3600, // 1 hour
    maxDuration: 259200, // 3 days
    collateralRequired: 3.0,
    isRented: false,
    owner: '0xffff0000eeee1111dddd2222cccc3333bbbb4444',
    timeLeft: null,
    rarity: 'Mythic',
    rentalStartTime: null,
    totalCost: 0,
    rentalCount: 12,
    totalEarned: 45.80,
    lastRented: '5 days ago',
    contractAddress: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
    attributes: [
      { trait_type: 'Species', value: 'Dragon' },
      { trait_type: 'Element', value: 'Fire' },
      { trait_type: 'Size', value: 'Ancient' },
      { trait_type: 'Breath Weapon', value: 'Plasma Fire' },
      { trait_type: 'Special Ability', value: 'Treasure Sense' },
      { trait_type: 'Rarity Score', value: '98.9' }
    ],
    stats: {
      attack: 98,
      defense: 85,
      magic: 92,
      speed: 78,
      health: 850
    },
    compatibleGames: ['Dragon Quest', 'Fantasy Realms', 'Mythic Adventures'],
    social: {
      likes: 512,
      views: 4200,
      shares: 123
    }
  },
  {
    id: 'nft-6',
    listingId: 'listing-6',
    tokenId: '8888',
    name: 'Cyberpunk Hacker Terminal',
    description: 'A high-tech hacking terminal with quantum encryption breaking capabilities and neural interface compatibility.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=center',
    collection: 'Tech Arsenal',
    category: 'Gaming Asset',
    utilityType: 'Hacking Tool',
    pricePerSecond: 0.000167, // ~0.6 STT/hour
    minDuration: 1800, // 30 minutes
    maxDuration: 86400, // 1 day
    collateralRequired: 1.5,
    isRented: false,
    owner: '0x1111aaaa2222bbbb3333cccc4444dddd5555eeee',
    timeLeft: null,
    rarity: 'Rare',
    rentalStartTime: null,
    totalCost: 0,
    rentalCount: 19,
    totalEarned: 18.40,
    lastRented: '2 days ago',
    contractAddress: '0x4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
    attributes: [
      { trait_type: 'Device Type', value: 'Terminal' },
      { trait_type: 'Processing Power', value: 'Quantum' },
      { trait_type: 'Encryption Level', value: 'Military Grade' },
      { trait_type: 'Interface', value: 'Neural Link' },
      { trait_type: 'Special Feature', value: 'AI Assistant' },
      { trait_type: 'Rarity Score', value: '84.6' }
    ],
    stats: {
      processing: 90,
      security: 95,
      stealth: 78,
      compatibility: 85,
      efficiency: 88
    },
    compatibleGames: ['Cyber Heist', 'Neural Hack', 'Digital Shadows'],
    social: {
      likes: 156,
      views: 1320,
      shares: 38
    }
  },
  {
    id: 'nft-7',
    listingId: 'listing-7',
    tokenId: '6666',
    name: 'Space Station Module Alpha',
    description: 'A modular space station component with life support systems and research facilities for space exploration games.',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=400&fit=crop&crop=center',
    collection: 'Cosmic Infrastructure',
    category: 'Virtual Real Estate',
    utilityType: 'Space Station',
    pricePerSecond: 0.000694, // ~2.5 STT/hour
    minDuration: 7200, // 2 hours
    maxDuration: 1209600, // 2 weeks
    collateralRequired: 5.0,
    isRented: true,
    owner: '0x6666777788889999aaaabbbbccccddddeeeeffff',
    renter: '0x0000111122223333444455556666777788889999',
    timeLeft: '1d 8h',
    rarity: 'Legendary',
    rentalStartTime: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
    totalCost: 40.0,
    rentalCount: 8,
    totalEarned: 67.50,
    lastRented: '16 hours ago',
    contractAddress: '0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
    attributes: [
      { trait_type: 'Module Type', value: 'Research Lab' },
      { trait_type: 'Capacity', value: '20 Personnel' },
      { trait_type: 'Power Output', value: '500 MW' },
      { trait_type: 'Life Support', value: 'Advanced' },
      { trait_type: 'Research Bonus', value: '+25%' },
      { trait_type: 'Rarity Score', value: '96.2' }
    ],
    stats: {
      capacity: 20,
      efficiency: 85,
      safety: 92,
      research: 88,
      maintenance: 75
    },
    compatibleGames: ['Space Colony', 'Galactic Empire', 'Stellar Research'],
    social: {
      likes: 389,
      views: 2800,
      shares: 76
    }
  },
  {
    id: 'nft-8',
    listingId: 'listing-8',
    tokenId: '1111',
    name: 'Enchanted Forest Realm',
    description: 'A magical forest realm with mystical creatures and ancient secrets. Perfect for fantasy role-playing and adventure games.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center',
    collection: 'Mystical Realms',
    category: 'Virtual Real Estate',
    utilityType: 'Adventure Zone',
    pricePerSecond: 0.000111, // ~0.4 STT/hour
    minDuration: 3600, // 1 hour
    maxDuration: 432000, // 5 days
    collateralRequired: 2.2,
    isRented: false,
    owner: '0x7777888899990000aaaabbbbccccddddeeeeffff',
    timeLeft: null,
    rarity: 'Epic',
    rentalStartTime: null,
    totalCost: 0,
    rentalCount: 35,
    totalEarned: 52.80,
    lastRented: '1 day ago',
    contractAddress: '0x2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1',
    attributes: [
      { trait_type: 'Biome', value: 'Enchanted Forest' },
      { trait_type: 'Magic Level', value: 'High' },
      { trait_type: 'Creature Density', value: 'Rich' },
      { trait_type: 'Hidden Secrets', value: '12' },
      { trait_type: 'Quest Potential', value: 'Legendary' },
      { trait_type: 'Rarity Score', value: '91.8' }
    ],
    stats: {
      exploration: 95,
      danger: 60,
      resources: 88,
      magic: 92,
      beauty: 98
    },
    compatibleGames: ['Forest Quest', 'Mystical Adventures', 'Realm Explorer'],
    social: {
      likes: 467,
      views: 3600,
      shares: 89
    }
  }
];

// Available NFTs (not currently rented)
export const AVAILABLE_NFTS = ENHANCED_NFT_ITEMS.filter(nft => !nft.isRented);

// Rented NFTs (currently in use)
export const RENTED_NFTS = ENHANCED_NFT_ITEMS.filter(nft => nft.isRented);

// NFTs by category
export const NFTS_BY_CATEGORY = {
  'Gaming Asset': ENHANCED_NFT_ITEMS.filter(nft => nft.category === 'Gaming Asset'),
  'Avatar': ENHANCED_NFT_ITEMS.filter(nft => nft.category === 'Avatar'),
  'Virtual Real Estate': ENHANCED_NFT_ITEMS.filter(nft => nft.category === 'Virtual Real Estate')
};

// NFTs by rarity
export const NFTS_BY_RARITY = {
  'Common': ENHANCED_NFT_ITEMS.filter(nft => nft.rarity === 'Common'),
  'Rare': ENHANCED_NFT_ITEMS.filter(nft => nft.rarity === 'Rare'),
  'Epic': ENHANCED_NFT_ITEMS.filter(nft => nft.rarity === 'Epic'),
  'Legendary': ENHANCED_NFT_ITEMS.filter(nft => nft.rarity === 'Legendary'),
  'Mythic': ENHANCED_NFT_ITEMS.filter(nft => nft.rarity === 'Mythic')
};

export default ENHANCED_NFT_ITEMS;