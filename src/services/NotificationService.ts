import { toast } from '@/hooks/use-toast';

interface Notification {
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp?: Date;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  rental: boolean;
  offers: boolean;
}

class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();

  // Send notification to a specific user
  sendNotification(userAddress: string, notification: Notification): void {
    // Add timestamp if not provided
    if (!notification.timestamp) {
      notification.timestamp = new Date();
    }

    // Store notification
    if (!this.notifications.has(userAddress)) {
      this.notifications.set(userAddress, []);
    }
    this.notifications.get(userAddress)!.push(notification);

    // Show toast notification if user is current user
    if (this.isCurrentUser(userAddress)) {
      this.showToastNotification(notification);
    }

    // Send other types of notifications based on preferences
    this.sendBasedOnPreferences(userAddress, notification);
  }

  // Check if the address belongs to the current user
  private isCurrentUser(userAddress: string): boolean {
    // This would check against the connected wallet address
    // For now, we'll assume it's the current user
    return true;
  }

  // Show toast notification
  private showToastNotification(notification: Notification): void {
    const variant = this.getToastVariant(notification.type);
    
    toast({
      title: notification.title,
      description: notification.message,
      variant: variant
    });
  }

  // Get toast variant based on notification type
  private getToastVariant(type: string): "default" | "destructive" {
    switch (type) {
      case 'rental-started':
      case 'rental-completed':
      case 'payment-received':
      case 'reputation-milestone':
        return 'default';
      case 'rental-failed':
      case 'payment-failed':
        return 'destructive';
      default:
        return 'default';
    }
  }

  // Send notifications based on user preferences
  private sendBasedOnPreferences(userAddress: string, notification: Notification): void {
    const prefs = this.preferences.get(userAddress) || this.getDefaultPreferences();
    
    // Email notifications
    if (prefs.email && this.shouldSendEmail(notification.type)) {
      this.sendEmailNotification(userAddress, notification);
    }

    // Push notifications
    if (prefs.push && this.shouldSendPush(notification.type)) {
      this.sendPushNotification(userAddress, notification);
    }

    // SMS notifications (for critical events)
    if (prefs.sms && this.shouldSendSMS(notification.type)) {
      this.sendSMSNotification(userAddress, notification);
    }
  }

  // Check if email should be sent for this notification type
  private shouldSendEmail(type: string): boolean {
    return ['rental-started', 'rental-completed', 'payment-received'].includes(type);
  }

  // Check if push notification should be sent
  private shouldSendPush(type: string): boolean {
    return ['rental-started', 'rental-completed', 'reputation-milestone'].includes(type);
  }

  // Check if SMS should be sent (critical events only)
  private shouldSendSMS(type: string): boolean {
    return ['rental-failed', 'payment-failed'].includes(type);
  }

  // Send email notification (placeholder)
  private sendEmailNotification(userAddress: string, notification: Notification): void {
    console.log(`Email notification sent to ${userAddress}:`, notification);
    // Implement actual email sending logic here
  }

  // Send push notification (placeholder)
  private sendPushNotification(userAddress: string, notification: Notification): void {
    console.log(`Push notification sent to ${userAddress}:`, notification);
    // Implement actual push notification logic here
  }

  // Send SMS notification (placeholder)
  private sendSMSNotification(userAddress: string, notification: Notification): void {
    console.log(`SMS notification sent to ${userAddress}:`, notification);
    // Implement actual SMS sending logic here
  }

  // Get user notifications
  getUserNotifications(userAddress: string): Notification[] {
    return this.notifications.get(userAddress) || [];
  }

  // Mark notification as read
  markAsRead(userAddress: string, notificationIndex: number): void {
    const notifications = this.notifications.get(userAddress);
    if (notifications && notifications[notificationIndex]) {
      // Remove the notification or mark it as read
      notifications.splice(notificationIndex, 1);
    }
  }

  // Clear all notifications for a user
  clearNotifications(userAddress: string): void {
    this.notifications.set(userAddress, []);
  }

  // Set user notification preferences
  setPreferences(userAddress: string, preferences: NotificationPreferences): void {
    this.preferences.set(userAddress, preferences);
  }

  // Get user notification preferences
  getPreferences(userAddress: string): NotificationPreferences {
    return this.preferences.get(userAddress) || this.getDefaultPreferences();
  }

  // Get default notification preferences
  private getDefaultPreferences(): NotificationPreferences {
    return {
      email: true,
      push: false,
      sms: false,
      rental: true,
      offers: true
    };
  }

  // Get unread notification count
  getUnreadCount(userAddress: string): number {
    return this.notifications.get(userAddress)?.length || 0;
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();
