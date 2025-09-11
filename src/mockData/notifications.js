// src/mockData/notifications.js
export const NOTIFICATIONS = {
  system: [
    {
      id: 'system-1',
      type: 'system_update',
      title: 'New Features Available',
      message: 'We\'ve added new rental management tools and analytics',
      timestamp: '2024-03-20T09:00:00Z',
      read: false,
      priority: 'medium'
    },
    {
      id: 'system-2',
      type: 'network_update',
      title: 'Somnia Network Upgrade',
      message: 'Somnia mainnet upgrade scheduled for March 25th',
      timestamp: '2024-03-19T14:30:00Z',
      read: true,
      priority: 'high'
    },
    {
      id: 'system-3',
      type: 'maintenance_notice',
      title: 'Scheduled Maintenance',
      message: 'Platform will be down for maintenance on March 25th from 2:00 AM to 4:00 AM UTC',
      timestamp: '2024-03-21T16:00:00Z',
      read: true,
      priority: 'medium'
    },
    {
      id: 'system-4',
      type: 'new_feature',
      title: 'New Feature: Bulk Rental',
      message: 'You can now rent multiple NFTs in a single transaction',
      timestamp: '2024-03-20T12:30:00Z',
      read: false,
      priority: 'low'
    }
  ],
  user: [
    {
      id: 'user-notif-1',
      type: 'rental_started',
      title: 'Rental Started',
      message: 'Your rental of Somnia Punk #1234 has begun',
      timestamp: '2024-03-20T10:30:00Z',
      read: false,
      action: { type: 'view_rental', id: 'rental-1' }
    },
    {
      id: 'user-notif-2',
      type: 'payment_received',
      title: 'Payment Received',
      message: 'You received 0.75 STT from your rental',
      timestamp: '2024-03-20T10:30:05Z',
      read: false,
      action: { type: 'view_wallet', id: 'wallet' }
    },
    {
      id: 'user-notif-3',
      type: 'rental_ending',
      title: 'Rental Ending Soon',
      message: 'Your rental of GameFi Champion #1357 will expire in 1 hour',
      timestamp: '2024-03-21T13:20:00Z',
      read: false,
      action: { type: 'view_rental', id: 'rental-3' }
    },
    {
      id: 'user-notif-4',
      type: 'price_alert',
      title: 'Price Alert Triggered',
      message: 'Somnia Punk #1234 has dropped to 0.65 STT',
      timestamp: '2024-03-22T10:30:00Z',
      read: false,
      action: { type: 'view_nft', id: 'nft-1' }
    },
    {
      id: 'user-notif-5',
      type: 'new_follower',
      title: 'New Follower',
      message: 'CryptoCollector started following you',
      timestamp: '2024-03-19T16:45:00Z',
      read: false,
      action: { type: 'view_profile', id: 'user-1' }
    },
    {
      id: 'user-notif-6',
      type: 'new_message',
      title: 'New Message',
      message: 'You have a new message from CryptoInvestor',
      timestamp: '2024-03-22T09:15:00Z',
      read: true,
      action: { type: 'view_messages', id: 'messages' }
    },
    {
      id: 'user-notif-7',
      type: 'community_update',
      title: 'Community Update',
      message: 'New features added to the Somnia Punks collection',
      timestamp: '2024-03-21T18:45:00Z',
      read: true,
      action: { type: 'view_community', id: 'community-somnia-punks' }
    }
  ]
};
