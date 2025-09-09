import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  persistent?: boolean;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const toastVariants = {
  default: {
    icon: Info,
    className: 'bg-background border-border text-foreground',
    iconClassName: 'text-primary'
  },
  success: {
    icon: CheckCircle,
    className: 'bg-success/10 border-success/20 text-success-foreground',
    iconClassName: 'text-success'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-destructive/10 border-destructive/20 text-destructive-foreground',
    iconClassName: 'text-destructive'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-warning/10 border-warning/20 text-warning-foreground',
    iconClassName: 'text-warning'
  },
  info: {
    icon: Info,
    className: 'bg-primary/10 border-primary/20 text-primary-foreground',
    iconClassName: 'text-primary'
  }
};

const ToastComponent: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const variant = toastVariants[toast.variant || 'default'];
  const Icon = variant.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        variant.className
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', variant.iconClassName)} />
      
      <div className="flex-1 space-y-1">
        {toast.title && (
          <div className="font-semibold text-sm">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="inline-flex items-center gap-1 text-xs font-medium underline hover:no-underline"
          >
            {toast.action.label}
            <ExternalLink className="h-3 w-3" />
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Enhanced toast hook
export const useEnhancedToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration (unless persistent)
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = React.useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ title, description, variant: 'success', ...options });
  }, [addToast]);

  const error = React.useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ title, description, variant: 'error', ...options });
  }, [addToast]);

  const warning = React.useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ title, description, variant: 'warning', ...options });
  }, [addToast]);

  const info = React.useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ title, description, variant: 'info', ...options });
  }, [addToast]);

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info
  };
};
