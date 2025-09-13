import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { cn } from '@/lib/utils';

interface EnhancedTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  keyboardNavigation?: boolean;
}

interface EnhancedTabsListProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  showScrollButtons?: boolean;
}

interface EnhancedTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  variant?: "default" | "pills" | "underline";
  className?: string;
}

interface EnhancedTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

const EnhancedTabs = React.forwardRef<
  HTMLDivElement,
  EnhancedTabsProps
>(({ 
  value, 
  onValueChange, 
  children, 
  className,
  animated = true,
  keyboardNavigation = true,
  ...props 
}, ref) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target !== document.activeElement) return;

      const currentIndex = tabRefs.current.findIndex(ref => ref === document.activeElement);
      if (currentIndex === -1) return;

      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabRefs.current.length - 1;
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          newIndex = currentIndex < tabRefs.current.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = tabRefs.current.length - 1;
          break;
        default:
          return;
      }

      tabRefs.current[newIndex]?.focus();
      setFocusedIndex(newIndex);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNavigation]);

  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn(className)}
      ref={ref}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            animated,
            keyboardNavigation,
            tabRefs,
            focusedIndex,
            setFocusedIndex,
          });
        }
        return child;
      })}
    </Tabs>
  );
});

const EnhancedTabsList = React.forwardRef<
  HTMLDivElement,
  EnhancedTabsListProps & {
    animated?: boolean;
    keyboardNavigation?: boolean;
    tabRefs?: React.MutableRefObject<(HTMLButtonElement | null)[]>;
    focusedIndex?: number;
    setFocusedIndex?: (index: number) => void;
  }
>(({ 
  children, 
  className, 
  scrollable = false, 
  showScrollButtons = false,
  animated = true,
  keyboardNavigation = true,
  tabRefs,
  focusedIndex,
  setFocusedIndex,
  ...props 
}, ref) => {
  const [tabs, setTabs] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const tabChildren = React.Children.toArray(children);
    setTabs(tabChildren);
    
    if (tabRefs) {
      tabRefs.current = new Array(tabChildren.length).fill(null);
    }
  }, [children, tabRefs]);

  return (
    <TabsList
      ref={ref}
      className={cn(className)}
      scrollable={scrollable}
      showScrollButtons={showScrollButtons}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            ref: (el: HTMLButtonElement | null) => {
              if (tabRefs) {
                tabRefs.current[index] = el;
              }
              if (child.ref) {
                if (typeof child.ref === 'function') {
                  child.ref(el);
                } else {
                  child.ref.current = el;
                }
              }
            },
            animated,
            keyboardNavigation,
            focusedIndex,
            setFocusedIndex,
            tabIndex: index,
          });
        }
        return child;
      })}
    </TabsList>
  );
});

const EnhancedTabsTrigger = React.forwardRef<
  HTMLButtonElement,
  EnhancedTabsTriggerProps & {
    animated?: boolean;
    keyboardNavigation?: boolean;
    focusedIndex?: number;
    setFocusedIndex?: (index: number) => void;
    tabIndex?: number;
  }
>(({ 
  value, 
  children, 
  icon, 
  badge, 
  variant = "default", 
  className,
  animated = true,
  keyboardNavigation = true,
  focusedIndex,
  setFocusedIndex,
  tabIndex = 0,
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleFocus = () => {
    if (setFocusedIndex) {
      setFocusedIndex(tabIndex);
    }
  };

  return (
    <TabsTrigger
      ref={ref}
      value={value}
      icon={icon}
      badge={badge}
      variant={variant}
      className={cn(
        className,
        animated && "transition-all duration-200 ease-in-out",
        isHovered && animated && "scale-105",
        focusedIndex === tabIndex && "ring-2 ring-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={handleFocus}
      {...props}
    >
      {children}
    </TabsTrigger>
  );
});

const EnhancedTabsContent = React.forwardRef<
  HTMLDivElement,
  EnhancedTabsContentProps
>(({ value, children, className, animated = true, ...props }, ref) => {
  if (!animated) {
    return (
      <TabsContent
        ref={ref}
        value={value}
        className={cn(className)}
        {...props}
      >
        {children}
      </TabsContent>
    );
  }

  return (
    <TabsContent
      ref={ref}
      value={value}
      className={cn(className)}
      {...props}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </TabsContent>
  );
});

EnhancedTabs.displayName = "EnhancedTabs";
EnhancedTabsList.displayName = "EnhancedTabsList";
EnhancedTabsTrigger.displayName = "EnhancedTabsTrigger";
EnhancedTabsContent.displayName = "EnhancedTabsContent";

export { 
  EnhancedTabs, 
  EnhancedTabsList, 
  EnhancedTabsTrigger, 
  EnhancedTabsContent 
};
