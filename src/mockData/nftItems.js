// src/mockData/nftItems.js
export const NFT_ITEMS = [
  {
    id: 'nft-1',
    collectionId: 'collection-1',
    tokenId: '1234',
    name: 'Somnia Punk #1234',
    description: 'A unique digital collectible from the Somnia Punks collection',
    image: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1234',
    animation_url: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1234.mp4',
    external_url: 'https://somniapunks.io/token/1234',
    attributes: [
      { trait_type: 'Background', value: 'Blue' },
      { trait_type: 'Type', value: 'Human' },
      { trait_type: 'Mouth', value: 'Smile' },
      { trait_type: 'Eyes', value: 'Laser Eyes' },
      { trait_type: 'Head', value: 'Cap' },
      { trait_type: 'Accessory', value: 'Gold Chain' },
      { trait_type: 'Rarity Score', value: '92.5' }
    ],
    owner: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59',
    creator: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59',
    currentPrice: '0.75',
    pricePerSecond: '0.00000208', // 0.75 STT / 3600 seconds = 0.000208 STT/second
    isListed: true,
    isRented: false,
    rentalCount: 15,
    totalEarned: '5.25',
    lastRented: '2024-03-15T14:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    contractAddress: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
    chain: 'Somnia',
    metadata: {
      resolution: '4000x4000',
      file_type: 'PNG',
      file_size: '4.2 MB',
      created_with: 'Procreate',
      license: 'Commercial Use'
    },
    social: {
      likes: 142,
      views: 1250,
      shares: 35
    }
  },
  {
    id: 'nft-2',
    collectionId: 'collection-2',
    tokenId: '5678',
    name: 'Dreamscape Estate #5678',
    description: 'A premium virtual real estate parcel in the Dreamscape metaverse',
    image: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/5678',
    animation_url: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/5678.glb',
    external_url: 'https://dreamscaperealms.io/token/5678',
    attributes: [
      { trait_type: 'Environment', value: 'Forest' },
      { trait_type: 'Size', value: 'Estate' },
      { trait_type: 'Resources', value: 'Legendary' },
      { trait_type: 'Waterfront', value: 'Yes' },
      { trait_type: 'Elevation', value: 'Mountain' },
      { trait_type: 'Rarity Score', value: '98.7' }
    ],
    owner: '0x99d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
    creator: '0x99d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
    currentPrice: '8.5',
    pricePerSecond: '0.00002361', // 8.5 STT / 3600 seconds = 0.002361 STT/second
    isListed: true,
    isRented: true,
    rentalCount: 8,
    totalEarned: '22.75',
    lastRented: '2024-03-20T09:15:00Z',
    createdAt: '2024-02-20T14:00:00Z',
    contractAddress: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
    chain: 'Somnia',
    metadata: {
      resolution: '8192x8192',
      file_type: 'GLB',
      file_size: '28.7 MB',
      created_with: 'Blender',
      license: 'Commercial Use with Attribution'
    },
    social: {
      likes: 287,
      views: 2150,
      shares: 62
    }
  },
  {
    id: 'nft-3',
    collectionId: 'collection-3',
    tokenId: '7890',
    name: 'Somnia Skyline #7890 - Neon Dawn',
    description: 'A breathtaking view of a cyberpunk city at dawn with neon lights reflecting off towering skyscrapers',
    image: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/7890',
    animation_url: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/7890.mp4',
    external_url: 'https://somniaskylines.io/token/7890',
    attributes: [
      { trait_type: 'Time of Day', value: 'Dawn' },
      { trait_type: 'City Type', value: 'Cyberpunk' },
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Special Effect', value: 'Neon Reflection' },
      { trait_type: 'Resolution', value: '8K' },
      { trait_type: 'Rarity Score', value: '87.3' }
    ],
    owner: '0x8a1d4d8b6c3e9f2a5b7c4d6e8f1a3b5c7d9e0f2',
    creator: '0x8a1d4d8b6c3e9f2a5b7c4d6e8f1a3b5c7d9e0f2',
    currentPrice: '2.25',
    pricePerSecond: '0.00000625',
    isListed: true,
    isRented: false,
    rentalCount: 8,
    totalEarned: '12.50',
    lastRented: '2024-03-18T16:45:00Z',
    createdAt: '2024-02-10T11:20:00Z',
    contractAddress: '0x7c8e2d3f4a5b6c9d1e2f3a4b5c6d7e8f9a0b1c2',
    chain: 'Somnia',
    metadata: {
      resolution: '7680x4320',
      file_type: 'MP4',
      file_size: '15.8 MB',
      created_with: 'Blender, After Effects',
      license: 'Commercial Use',
      audio: 'Included'
    },
    social: {
      likes: 215,
      views: 1850,
      shares: 42
    }
  },
  {
    id: 'nft-4',
    collectionId: 'collection-4',
    tokenId: '2468',
    name: 'Metaverse Avatar #2468 - Cyber Samurai',
    description: 'A futuristic samurai avatar with augmented reality enhancements and traditional armor elements',
    image: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/2468',
    animation_url: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/2468.glb',
    external_url: 'https://metaverseavatars.io/token/2468',
    attributes: [
      { trait_type: 'Species', value: 'Human' },
      { trait_type: 'Outfit', value: 'Armor' },
      { trait_type: 'Accessory', value: 'Katana' },
      { trait_type: 'Rarity', value: 'Epic' },
      { trait_type: 'Special Feature', value: 'AR Visor' },
      { trait_type: 'Rarity Score', value: '94.2' }
    ],
    owner: '0x9b2e4d6f8a1c3e5f7b9d2c4e6f8a1b3d5f7e9c1',
    creator: '0x9b2e4d6f8a1c3e5f7b9d2c4e6f8a1b3d5f7e9c1',
    currentPrice: '1.85',
    pricePerSecond: '0.00000514',
    isListed: true,
    isRented: true,
    rentalCount: 12,
    totalEarned: '18.75',
    lastRented: '2024-03-21T14:20:00Z',
    createdAt: '2024-03-05T09:15:00Z',
    contractAddress: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    chain: 'Somnia',
    metadata: {
      resolution: '4096x4096',
      file_type: 'GLB',
      file_size: '22.3 MB',
      created_with: 'Maya, Substance Painter',
      license: 'Commercial Use',
      rigged: true,
      polygon_count: '125K'
    },
    social: {
      likes: 178,
      views: 1520,
      shares: 31
    }
  },
  {
    id: 'nft-5',
    collectionId: 'collection-5',
    tokenId: '1357',
    name: 'GameFi Champion #1357 - Pyro Mage',
    description: 'A powerful fire mage champion with area-of-effect spells and damage-over-time abilities',
    image: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1357',
    animation_url: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1357.glb',
    external_url: 'https://gamefichampions.io/token/1357',
    attributes: [
      { trait_type: 'Class', value: 'Mage' },
      { trait_type: 'Element', value: 'Fire' },
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Level', value: '50' },
      { trait_type: 'Special Ability', value: 'Meteor Shower' },
      { trait_type: 'Rarity Score', value: '98.7' }
    ],
    owner: '0x7c3e5f9a1b4d6e8f2a5c7d9e1b3f5a7c9d2e4f6',
    creator: '0x7c3e5f9a1b4d6e8f2a5c7d9e1b3f5a7c9d2e4f6',
    currentPrice: '8.75',
    pricePerSecond: '0.00002431',
    isListed: true,
    isRented: false,
    rentalCount: 6,
    totalEarned: '35.25',
    lastRented: '2024-03-19T20:30:00Z',
    createdAt: '2024-01-20T16:45:00Z',
    contractAddress: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
    chain: 'Somnia',
    metadata: {
      resolution: '4096x4096',
      file_type: 'GLB',
      file_size: '18.7 MB',
      created_with: 'ZBrush, Unity',
      license: 'Commercial Use with Attribution',
      rigged: true,
      polygon_count: '98K',
      game_stats: 'Damage: 85, Defense: 40, Speed: 60'
    },
    social: {
      likes: 342,
      views: 2750,
      shares: 67
    }
  }
];



