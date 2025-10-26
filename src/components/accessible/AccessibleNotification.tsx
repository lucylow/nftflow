import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AccessibleNotificationProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  };
  onClose: () => void;
  highContrast: boolean;
}

export const AccessibleNotification: React.FC<AccessibleNotificationProps> = ({
  notification,
  onClose,
  highContrast
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const styles = {
    success: highContrast 
      ? 'bg-green-600 text-white border-2 border-white' 
      : 'bg-green-500 text-white',
    error: highContrast 
      ? 'bg-red-600 text-white border-2 border-white' 
      : 'bg-red-500 text-white',
    warning: highContrast 
      ? 'bg-yellow-600 text-white border-2 border-white' 
      : 'bg-yellow-500 text-white',
    info: highContrast 
      ? 'bg-cyan-600 text-white border-2 border-white' 
      : 'bg-cyan-500 text-white'
  };

  const Icon = icons[notification.type];

  // Auto-announce to screen readers
  useEffect(() => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `${notification.type}: ${notification.message}`;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [notification]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`
        rounded-lg p-4 shadow-lg min-w-80 max-w-sm
        ${styles[notification.type]}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-grow">
          <p className="text-sm font-medium">{notification.message}</p>
          <p className="text-xs opacity-90 mt-1">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`
            flex-shrink-0 p-1 rounded transition-colors
            ${highContrast 
              ? 'hover:bg-white hover:bg-opacity-20' 
              : 'hover:bg-black hover:bg-opacity-20'
            }
            focus:outline-none focus:ring-2 focus:ring-white
          `}
          aria-label="Close notification"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
};
