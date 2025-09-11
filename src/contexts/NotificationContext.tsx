import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'rental' | 'achievement' | 'payment' | 'system';
  metadata?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Mock notifications for demonstration
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Rental Completed',
      message: 'Your rental of "Legendary Dragon Sword" has been completed successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      category: 'rental',
      metadata: { nftId: '123', rentalId: '456' }
    },
    {
      id: '2',
      type: 'info',
      title: 'Achievement Unlocked',
      message: 'You have unlocked the "Power User" achievement! +500 points',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      category: 'achievement',
      metadata: { achievementId: 'power_user', points: 500 }
    },
    {
      id: '3',
      type: 'success',
      title: 'Payment Received',
      message: 'You received 0.025 STT from your NFT rental',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: true,
      category: 'payment',
      metadata: { amount: '0.025', currency: 'STT' }
    },
    {
      id: '4',
      type: 'warning',
      title: 'Rental Expiring Soon',
      message: 'Your rental of "VIP Metaverse Pass" expires in 15 minutes',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      read: false,
      category: 'rental',
      metadata: { nftId: '789', expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
    },
    {
      id: '5',
      type: 'info',
      title: 'System Update',
      message: 'NFTFlow has been updated with new features. Check out the analytics dashboard!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      category: 'system'
    }
  ];

  useEffect(() => {
    if (isConnected && account) {
      // Initialize with mock data
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
      
      // In a real implementation, you would connect to WebSocket here
      // connectToNotificationService();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isConnected, account]);

  const connectToNotificationService = () => {
    if (!account) return;

    try {
      // In a real implementation, this would connect to your WebSocket service
      // wsRef.current = new WebSocket(`wss://your-api.com/notifications?address=${account}`);
      
      // wsRef.current.onopen = () => {
      //   console.log('Connected to notification service');
      // };
      
      // wsRef.current.onmessage = (event) => {
      //   const notification = JSON.parse(event.data);
      //   addNotification(notification);
      // };
      
      // wsRef.current.onclose = () => {
      //   console.log('Disconnected from notification service');
      //   // Reconnect after 5 seconds
      //   setTimeout(connectToNotificationService, 5000);
      // };
    } catch (error) {
      console.error('Failed to connect to notification service:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast({
      title: newNotification.title,
      description: newNotification.message,
      variant: newNotification.type === 'error' ? 'destructive' : 'default'
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

