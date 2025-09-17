import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, User } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'purchase' | 'sale' | 'listing' | 'follow';
  description: string;
  timestamp: string;
  amount?: string;
}

interface ActivityFeedProps {
  address?: string;
  activities?: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities = [] 
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'purchase':
        return '🛒';
      case 'sale':
        return '💰';
      case 'listing':
        return '📝';
      case 'follow':
        return '👥';
      default:
        return '📄';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {activity.timestamp}
                    {activity.amount && (
                      <span className="ml-2 font-semibold">{activity.amount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;