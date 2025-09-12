// src/mockData/activeRentals.js
export const ACTIVE_RENTALS = [
  {
    id: 'rental-1',
    nftId: 'nft-1',
    nftName: 'Somnia Punk #1234',
    nftImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1234',
    lender: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59',
    lenderUsername: 'CryptoCollector',
    tenant: '0x99d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
    tenantUsername: 'MetaverseBuilder',
    startTime: '2024-03-20T10:30:00Z',
    endTime: '2024-03-20T11:30:00Z',
    duration: 3600, // 1 hour in seconds
    totalPrice: '0.75',
    pricePerSecond: '0.00000208',
    collateral: '1.50',
    paymentStream: '0xStreamAddress123',
    status: 'active',
    progress: 45, // Percentage completed
    timeRemaining: 1980, // seconds remaining
    totalPaid: '0.3375',
    currentStreamRate: '0.00000208 STT/s',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: 12345678,
    network: 'Somnia Testnet',
    contractAddress: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
    events: [
      {
        type: 'rental_started',
        timestamp: '2024-03-20T10:30:00Z',
        message: 'Rental started successfully',
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      },
      {
        type: 'payment_stream_created',
        timestamp: '2024-03-20T10:30:05Z',
        message: 'Payment stream created',
        txHash: '0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      }
    ]
  },
  {
    id: 'rental-2',
    nftId: 'nft-2',
    nftName: 'Dreamscape Estate #5678',
    nftImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/5678',
    lender: '0x99d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
    lenderUsername: 'MetaverseBuilder',
    tenant: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59',
    tenantUsername: 'CryptoCollector',
    startTime: '2024-03-20T09:15:00Z',
    endTime: '2024-03-20T12:15:00Z',
    duration: 10800, // 3 hours in seconds
    totalPrice: '8.5',
    pricePerSecond: '0.00002361',
    collateral: '17.0',
    paymentStream: '0xStreamAddress456',
    status: 'active',
    progress: 75,
    timeRemaining: 2700,
    totalPaid: '6.375',
    currentStreamRate: '0.00002361 STT/s',
    txHash: '0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: 12345679,
    network: 'Somnia Testnet',
    contractAddress: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
    events: [
      {
        type: 'rental_started',
        timestamp: '2024-03-20T09:15:00Z',
        message: 'Rental started successfully',
        txHash: '0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      },
      {
        type: 'payment_stream_created',
        timestamp: '2024-03-20T09:15:03Z',
        message: 'Payment stream created',
        txHash: '0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      },
      {
        type: 'funds_released',
        timestamp: '2024-03-20T10:15:00Z',
        message: '2.125 STT released to lender',
        txHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      }
    ]
  },
  {
    id: 'rental-3',
    nftId: 'nft-4',
    nftName: 'Metaverse Avatar #2468 - Cyber Samurai',
    nftImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/2468',
    lender: '0x9b2e4d6f8a1c3e5f7b9d2c4e6f8a1b3d5f7e9c1',
    lenderUsername: 'MetaGamer',
    tenant: '0x8a1d4d8b6c3e9f2a5b7c4d6e8f1a3b5c7d9e0f2',
    tenantUsername: 'DigitalArtist',
    startTime: '2024-03-21T14:20:00Z',
    endTime: '2024-03-21T17:20:00Z',
    duration: 10800, // 3 hours
    totalPrice: '5.55',
    pricePerSecond: '0.00000154',
    collateral: '11.10',
    paymentStream: '0xStreamAddress789',
    status: 'active',
    progress: 60,
    timeRemaining: 4320, // 1.2 hours remaining
    totalPaid: '3.33',
    currentStreamRate: '0.00000154 STT/s',
    txHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: 12345680,
    network: 'Somnia Testnet',
    contractAddress: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    events: [
      {
        type: 'rental_started',
        timestamp: '2024-03-21T14:20:00Z',
        message: 'Rental started successfully',
        txHash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      },
      {
        type: 'payment_stream_created',
        timestamp: '2024-03-21T14:20:03Z',
        message: 'Payment stream created',
        txHash: '0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      },
      {
        type: 'funds_released',
        timestamp: '2024-03-21T15:20:00Z',
        message: '1.85 STT released to lender',
        txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      }
    ]
  },
  {
    id: 'rental-4',
    nftId: 'nft-3',
    nftName: 'Somnia Skyline #7890 - Neon Dawn',
    nftImage: 'https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/7890',
    lender: '0x8a1d4d8b6c3e9f2a5b7c4d6e8f1a3b5c7d9e0f2',
    lenderUsername: 'DigitalArtist',
    tenant: '0x7c3e5f9a1b4d6e8f2a5c7d9e1b3f5a7c9d2e4f6',
    tenantUsername: 'CryptoInvestor',
    startTime: '2024-03-22T09:00:00Z',
    endTime: '2024-03-22T12:00:00Z',
    duration: 10800, // 3 hours
    totalPrice: '6.75',
    pricePerSecond: '0.00000188',
    collateral: '13.50',
    paymentStream: '0xStreamAddress012',
    status: 'active',
    progress: 25,
    timeRemaining: 8100, // 2.25 hours remaining
    totalPaid: '1.69',
    currentStreamRate: '0.00000188 STT/s',
    txHash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1',
    blockNumber: 12345681,
    network: 'Somnia Testnet',
    contractAddress: '0x7c8e2d3f4a5b6c9d1e2f3a4b5c6d7e8f9a0b1c2',
    events: [
      {
        type: 'rental_started',
        timestamp: '2024-03-22T09:00:00Z',
        message: 'Rental started successfully',
        txHash: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1'
      },
      {
        type: 'payment_stream_created',
        timestamp: '2024-03-22T09:00:04Z',
        message: 'Payment stream created',
        txHash: '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12'
      }
    ]
  }
];



