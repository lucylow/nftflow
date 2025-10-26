import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface EnhancedNotificationProps {
  notification: Notification;
  onClose: () => void;
  onMarkAsRead?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: {
    bg: 'bg-green-500/10 border-green-500/50',
    text: 'text-green-400',
    icon: 'text-green-500',
    iconBg: 'bg-green-500/20',
  },
  error: {
    bg: 'bg-red-500/10 border-red-500/50',
    text: 'text-red-400',
    icon: 'text-red-500',
    iconBg: 'bg-red-500/20',
  },
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/50',
    text: 'text-yellow-400',
    icon: 'text-yellow-500',
    iconBg: 'bg-yellow-500/20',
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/50',
    text: 'text-blue-400',
    icon: 'text-blue-500',
    iconBg: 'bg-blue-500/20',
  },
};

export const EnhancedNotification: React.FC<EnhancedNotificationProps> = ({
  notification,
  onClose,
  onMarkAsRead,
  position = 'top-right',
}) => {
  const Icon = icons[notification.type];
  const style = styles[notification.type];

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`fixed ${positionClasses[position]} z-50 w-full max-w-sm`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`glass-strong rounded-lg border ${style.bg} shadow-xl overflow-hidden hover-lift`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center`}
            >
              <Icon className={`w-5 h-5 ${style.icon}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm mb-1 ${style.text}`}>
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              {(notification.action || onMarkAsRead) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                  {notification.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={notification.action.onClick}
                      className="text-xs"
                    >
                      {notification.action.label}
                    </Button>
                  )}
                  {onMarkAsRead && !notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onMarkAsRead}
                      className="text-xs"
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface NotificationContainerProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  children,
  position = 'top-right',
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}>
      <div className="flex flex-col gap-2 items-end">
        <AnimatePresence mode="popLayout">
          {children}
        </AnimatePresence>
      </div>
    </div>
  );
};

