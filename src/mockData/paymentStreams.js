// src/mockData/paymentStreams.js
export const PAYMENT_STREAMS = [
  {
    id: 'stream-1',
    streamAddress: '0xStreamAddress123',
    rentalId: 'rental-1',
    payer: '0x99d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
    payee: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59',
    totalAmount: '0.75',
    releasedAmount: '0.3375',
    startTime: '2024-03-20T10:30:00Z',
    endTime: '2024-03-20T11:30:00Z',
    duration: 3600,
    ratePerSecond: '0.00000208',
    isActive: true,
    isCancelled: false,
    lastReleaseTime: '2024-03-20T10:45:00Z',
    lastReleaseAmount: '0.1125',
    nextReleaseIn: 900, // seconds
    progress: 45,
    transactions: [
      {
        hash: '0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'stream_created',
        timestamp: '2024-03-20T10:30:05Z',
        amount: '0.75',
        status: 'confirmed'
      },
      {
        hash: '0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'funds_released',
        timestamp: '2024-03-20T10:45:00Z',
        amount: '0.1125',
        status: 'confirmed'
      }
    ]
  },
  {
    id: 'stream-2',
    streamAddress: '0xStreamAddress456',
    rentalId: 'rental-2',
    payer: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59',
    payee: '0x99d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
    totalAmount: '8.5',
    releasedAmount: '6.375',
    startTime: '2024-03-20T09:15:00Z',
    endTime: '2024-03-20T12:15:00Z',
    duration: 10800,
    ratePerSecond: '0.00002361',
    isActive: true,
    isCancelled: false,
    lastReleaseTime: '2024-03-20T11:15:00Z',
    lastReleaseAmount: '2.125',
    nextReleaseIn: 1800, // 30 minutes
    progress: 75,
    transactions: [
      {
        hash: '0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'stream_created',
        timestamp: '2024-03-20T09:15:03Z',
        amount: '8.5',
        status: 'confirmed'
      },
      {
        hash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'funds_released',
        timestamp: '2024-03-20T10:15:00Z',
        amount: '2.125',
        status: 'confirmed'
      },
      {
        hash: '0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'funds_released',
        timestamp: '2024-03-20T11:15:00Z',
        amount: '2.125',
        status: 'confirmed'
      }
    ]
  },
  {
    id: 'stream-3',
    streamAddress: '0xStreamAddress789',
    rentalId: 'rental-3',
    payer: '0x8a1d4d8b6c3e9f2a5b7c4d6e8f1a3b5c7d9e0f2',
    payee: '0x9b2e4d6f8a1c3e5f7b9d2c4e6f8a1b3d5f7e9c1',
    totalAmount: '5.55',
    releasedAmount: '3.33',
    startTime: '2024-03-21T14:20:00Z',
    endTime: '2024-03-21T17:20:00Z',
    duration: 10800,
    ratePerSecond: '0.00000154',
    isActive: true,
    isCancelled: false,
    lastReleaseTime: '2024-03-21T15:20:00Z',
    lastReleaseAmount: '1.85',
    nextReleaseIn: 3600, // 1 hour
    progress: 60,
    transactions: [
      {
        hash: '0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'stream_created',
        timestamp: '2024-03-21T14:20:03Z',
        amount: '5.55',
        status: 'confirmed'
      },
      {
        hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'funds_released',
        timestamp: '2024-03-21T15:20:00Z',
        amount: '1.85',
        status: 'confirmed'
      }
    ]
  },
  {
    id: 'stream-4',
    streamAddress: '0xStreamAddress012',
    rentalId: 'rental-4',
    payer: '0x7c3e5f9a1b4d6e8f2a5c7d9e1b3f5a7c9d2e4f6',
    payee: '0x8a1d4d8b6c3e9f2a5b7c4d6e8f1a3b5c7d9e0f2',
    totalAmount: '6.75',
    releasedAmount: '1.69',
    startTime: '2024-03-22T09:00:00Z',
    endTime: '2024-03-22T12:00:00Z',
    duration: 10800,
    ratePerSecond: '0.00000188',
    isActive: true,
    isCancelled: false,
    lastReleaseTime: '2024-03-22T09:45:00Z',
    lastReleaseAmount: '0.84',
    nextReleaseIn: 2700, // 45 minutes
    progress: 25,
    transactions: [
      {
        hash: '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        type: 'stream_created',
        timestamp: '2024-03-22T09:00:04Z',
        amount: '6.75',
        status: 'confirmed'
      },
      {
        hash: '0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123',
        type: 'funds_released',
        timestamp: '2024-03-22T09:45:00Z',
        amount: '0.84',
        status: 'confirmed'
      }
    ]
  }
];

