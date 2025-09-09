import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertCircle, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayDuration?: number;
  className?: string;
}

const tooltipVariants = {
  default: {
    icon: Info,
    className: 'bg-popover text-popover-foreground border-border',
    iconClassName: 'text-muted-foreground'
  },
  info: {
    icon: Info,
    className: 'bg-primary/10 text-primary border-primary/20',
    iconClassName: 'text-primary'
  },
  success: {
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/20',
    iconClassName: 'text-success'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-warning/10 text-warning border-warning/20',
    iconClassName: 'text-warning'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    iconClassName: 'text-destructive'
  }
};

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  children,
  content,
  variant = 'default',
  side = 'top',
  delayDuration = 300,
  className
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);
  
  const tooltipConfig = tooltipVariants[variant];
  const Icon = tooltipConfig.icon;

  const showTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delayDuration);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getSideClasses = () => {
    switch (side) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (side) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-current';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-current';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-current';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-current';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-current';
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 px-3 py-2 rounded-lg border shadow-lg backdrop-blur-sm',
              'max-w-xs text-sm font-medium',
              getSideClasses(),
              tooltipConfig.className,
              className
            )}
            role="tooltip"
          >
            <div className="flex items-start gap-2">
              <Icon className={cn('h-4 w-4 flex-shrink-0 mt-0.5', tooltipConfig.iconClassName)} />
              <div className="flex-1">
                {content}
              </div>
            </div>
            
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-0 h-0 border-4',
                getArrowClasses()
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Convenience components for common tooltip types
export const InfoTooltip: React.FC<Omit<EnhancedTooltipProps, 'variant'>> = (props) => (
  <EnhancedTooltip {...props} variant="info" />
);

export const SuccessTooltip: React.FC<Omit<EnhancedTooltipProps, 'variant'>> = (props) => (
  <EnhancedTooltip {...props} variant="success" />
);

export const WarningTooltip: React.FC<Omit<EnhancedTooltipProps, 'variant'>> = (props) => (
  <EnhancedTooltip {...props} variant="warning" />
);

export const ErrorTooltip: React.FC<Omit<EnhancedTooltipProps, 'variant'>> = (props) => (
  <EnhancedTooltip {...props} variant="error" />
);

// Simple tooltip for quick help text
export const HelpTooltip: React.FC<{ children: React.ReactNode; helpText: string }> = ({
  children,
  helpText
}) => (
  <EnhancedTooltip
    content={helpText}
    variant="info"
    side="top"
    delayDuration={200}
  >
    <div className="inline-flex items-center gap-1">
      {children}
      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
    </div>
  </EnhancedTooltip>
);
