import React from 'react';
import { cn } from '@/lib/utils';

// Mobile-optimized touch targets
export const MobileButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'default' | 'lg';
  }
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const baseClasses = 'touch-manipulation select-none';
  const sizeClasses = {
    sm: 'min-h-[44px] px-4 py-2 text-sm',
    default: 'min-h-[48px] px-6 py-3 text-base',
    lg: 'min-h-[52px] px-8 py-4 text-lg'
  };
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95',
    outline: 'border border-input bg-background hover:bg-accent active:bg-accent/80',
    ghost: 'hover:bg-accent active:bg-accent/80'
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50',
        className
      )}
      {...props}
    />
  );
});

MobileButton.displayName = 'MobileButton';

// Mobile-optimized input
export const MobileInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'min-h-[48px] px-4 py-3 text-base rounded-lg border border-input bg-background',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
        'touch-manipulation',
        className
      )}
      {...props}
    />
  );
});

MobileInput.displayName = 'MobileInput';

// Mobile-optimized card
export const MobileCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    interactive?: boolean;
  }
>(({ className, interactive = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-card/50 backdrop-blur-sm',
        'p-4 shadow-sm',
        interactive && 'active:scale-[0.98] transition-transform duration-150',
        className
      )}
      {...props}
    />
  );
});

MobileCard.displayName = 'MobileCard';

// Mobile-optimized grid
export const MobileGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    columns?: 1 | 2 | 3 | 4;
    gap?: 'sm' | 'default' | 'lg';
  }
>(({ className, columns = 2, gap = 'default', ...props }, ref) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };
  
  const gapClasses = {
    sm: 'gap-3',
    default: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      {...props}
    />
  );
});

MobileGrid.displayName = 'MobileGrid';

// Mobile-optimized spacing
export const MobileSpacing = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'default' | 'lg' | 'xl';
  }
>(({ className, size = 'default', ...props }, ref) => {
  const sizeClasses = {
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  return (
    <div
      ref={ref}
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
});

MobileSpacing.displayName = 'MobileSpacing';

// Mobile-optimized text
export const MobileText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: 'sm' | 'default' | 'lg' | 'xl';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  }
>(({ className, size = 'default', weight = 'normal', ...props }, ref) => {
  const sizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <p
      ref={ref}
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        'leading-relaxed',
        className
      )}
      {...props}
    />
  );
});

MobileText.displayName = 'MobileText';
