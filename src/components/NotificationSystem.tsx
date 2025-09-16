import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Clock,
  Settings,
  Filter
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationSystem: React.FC = () => {
  const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead, clearAllNotifications } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'rental' | 'achievement' | 'payment' | 'system'>('all');

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'rental':
      case 'achievement':
      case 'payment':
      case 'system':
        return notification.category === filter;
      default:
        return true;
    }
  });

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'rental') return <Clock className="w-4 h-4" />;
    if (category === 'achievement') return <CheckCircle className="w-4 h-4" />;
    if (category === 'payment') return <BellRing className="w-4 h-4" />;
    if (category === 'system') return <Settings className="w-4 h-4" />;
    
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-purple-400" />
              <div>
                <CardTitle className="text-white">Notifications</CardTitle>
                <CardDescription>
                  Stay updated with your NFT rental activities
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                {unreadCount} unread
              </Badge>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
              { key: 'rental', label: 'Rentals', count: notifications.filter(n => n.category === 'rental').length },
              { key: 'achievement', label: 'Achievements', count: notifications.filter(n => n.category === 'achievement').length },
              { key: 'payment', label: 'Payments', count: notifications.filter(n => n.category === 'payment').length },
              { key: 'system', label: 'System', count: notifications.filter(n => n.category === 'system').length },
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key as any)}
                className={`whitespace-nowrap ${
                  filter === key 
                    ? 'bg-purple-600 text-white' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {label}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-96">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      notification.read 
                        ? 'bg-slate-700/30 border-slate-600/50' 
                        : 'bg-slate-700/50 border-slate-500/50 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification.read ? 'bg-slate-600/50' : 'bg-purple-500/20'
                      }`}>
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              notification.read ? 'text-slate-300' : 'text-white'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              notification.read ? 'text-slate-400' : 'text-slate-300'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-slate-500">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              <Badge 
                                variant="outline" 
                                className="text-xs border-slate-600 text-slate-400"
                              >
                                {notification.category}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            )}
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0 hover:bg-green-500/20"
                                >
                                  <Check className="h-3 w-3 text-green-400" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-6 w-6 p-0 hover:bg-red-500/20"
                              >
                                <X className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  No notifications found
                </h3>
                <p className="text-slate-500">
                  {filter === 'all' 
                    ? "You're all caught up! No notifications to show."
                    : `No ${filter} notifications found.`
                  }
                </p>
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-600/50">
              <div className="text-sm text-slate-400">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllNotifications}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSystem;