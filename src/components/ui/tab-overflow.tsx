import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TabOverflowProps {
  children: React.ReactNode;
  maxVisibleTabs?: number;
  className?: string;
  overflowButtonText?: string;
  showOverflowIcon?: boolean;
}

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export function TabOverflow({ 
  children, 
  maxVisibleTabs = 5, 
  className,
  overflowButtonText = "More",
  showOverflowIcon = true
}: TabOverflowProps) {
  const [visibleTabs, setVisibleTabs] = useState<TabItem[]>([]);
  const [hiddenTabs, setHiddenTabs] = useState<TabItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract tab information from children
  useEffect(() => {
    const tabItems: TabItem[] = [];
    
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type && 'value' in child.props) {
        tabItems.push({
          value: child.props.value,
          label: typeof child.props.children === 'string' 
            ? child.props.children 
            : child.props.children?.toString() || '',
          icon: child.props.icon,
          badge: child.props.badge,
          disabled: child.props.disabled
        });
      }
    });

    if (tabItems.length <= maxVisibleTabs) {
      setVisibleTabs(tabItems);
      setHiddenTabs([]);
    } else {
      setVisibleTabs(tabItems.slice(0, maxVisibleTabs - 1));
      setHiddenTabs(tabItems.slice(maxVisibleTabs - 1));
    }
  }, [children, maxVisibleTabs]);

  const handleOverflowTabClick = (value: string) => {
    // Move the clicked tab to visible tabs
    const clickedTab = hiddenTabs.find(tab => tab.value === value);
    if (clickedTab) {
      const newVisibleTabs = [...visibleTabs, clickedTab];
      const newHiddenTabs = hiddenTabs.filter(tab => tab.value !== value);
      
      setVisibleTabs(newVisibleTabs);
      setHiddenTabs(newHiddenTabs);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("flex items-center gap-1", className)}>
      {/* Visible tabs */}
      {visibleTabs.map((tab, index) => (
        <React.Fragment key={tab.value}>
          {React.Children.toArray(children).find(
            child => React.isValidElement(child) && child.props.value === tab.value
          )}
        </React.Fragment>
      ))}

      {/* Overflow button */}
      {hiddenTabs.length > 0 && (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              {showOverflowIcon ? (
                <MoreHorizontal className="h-4 w-4" />
              ) : (
                <>
                  {overflowButtonText}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
              {hiddenTabs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full min-w-[20px] text-center">
                  {hiddenTabs.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <AnimatePresence>
              {hiddenTabs.map((tab, index) => (
                <motion.div
                  key={tab.value}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DropdownMenuItem
                    onClick={() => handleOverflowTabClick(tab.value)}
                    disabled={tab.disabled}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                    <span className="flex-1 truncate">{tab.label}</span>
                    {tab.badge && (
                      <span className="ml-auto px-1.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full min-w-[20px] text-center">
                        {tab.badge}
                      </span>
                    )}
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// Hook for managing tab overflow state
export function useTabOverflow(tabs: TabItem[], maxVisibleTabs: number = 5) {
  const [visibleTabs, setVisibleTabs] = useState<TabItem[]>([]);
  const [hiddenTabs, setHiddenTabs] = useState<TabItem[]>([]);

  useEffect(() => {
    if (tabs.length <= maxVisibleTabs) {
      setVisibleTabs(tabs);
      setHiddenTabs([]);
    } else {
      setVisibleTabs(tabs.slice(0, maxVisibleTabs - 1));
      setHiddenTabs(tabs.slice(maxVisibleTabs - 1));
    }
  }, [tabs, maxVisibleTabs]);

  const moveTabToVisible = (tabValue: string) => {
    const tabToMove = hiddenTabs.find(tab => tab.value === tabValue);
    if (tabToMove) {
      setVisibleTabs(prev => [...prev, tabToMove]);
      setHiddenTabs(prev => prev.filter(tab => tab.value !== tabValue));
    }
  };

  const moveTabToHidden = (tabValue: string) => {
    const tabToMove = visibleTabs.find(tab => tab.value === tabValue);
    if (tabToMove) {
      setHiddenTabs(prev => [...prev, tabToMove]);
      setVisibleTabs(prev => prev.filter(tab => tab.value !== tabValue));
    }
  };

  return {
    visibleTabs,
    hiddenTabs,
    moveTabToVisible,
    moveTabToHidden,
  };
}
