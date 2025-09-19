import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Menu, 
  ChevronDown, 
  ChevronRight,
  Home,
  Store,
  Plus,
  Upload,
  BarChart3,
  TrendingUp,
  Building2,
  Crown,
  Palette,
  Zap,
  Database,
  Users,
  Wallet,
  CreditCard,
  User,
  Globe,
  Search,
  Settings,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { navigationConfig, getNavItemsByCategory } from '@/config/navigation';
import WalletConnect from './WalletConnect';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['main']);

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    '🏠': Home,
    '🏪': Store,
    '✨': Plus,
    '📤': Upload,
    '📊': BarChart3,
    '📈': TrendingUp,
    '🏛️': Building2,
    '👑': Crown,
    '🎨': Palette,
    '⚡': Zap,
    '🗄️': Database,
    '👥': Users,
    '💳': Wallet,
    '🧪': Zap,
    '🔄': CreditCard,
    '👤': User,
    '📱': Globe,
    '🔍': Search,
    '🌟': Users,
    '🛒': Store,
    '🎭': Palette,
    '🎯': Target,
    '🚀': Zap,
    '🔧': Settings,
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredNavItems = navigationConfig.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = filteredNavItems.reduce((acc, item) => {
    if (!acc[item.category!]) {
      acc[item.category!] = [];
    }
    acc[item.category!].push(item);
    return acc;
  }, {} as Record<string, typeof navigationConfig>);

  const categoryLabels = {
    main: 'Main',
    features: 'Features',
    user: 'User',
    tools: 'Tools',
    additional: 'More'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Navigation Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-72 sm:w-80 bg-background border-r border-border z-50 xl:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Navigation Items */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category}>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-2 h-auto"
                        onClick={() => toggleCategory(category)}
                      >
                        <span className="font-medium">
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </span>
                        {expandedCategories.includes(category) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <AnimatePresence>
                        {expandedCategories.includes(category) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 space-y-1">
                              {items.map((item) => {
                                const IconComponent = iconMap[item.icon] || Home;
                                const isActive = location.pathname === item.href;
                                
                                return (
                                  <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                      isActive 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'hover:bg-muted'
                                    }`}
                                  >
                                    <IconComponent className="h-4 w-4" />
                                    <span className="flex-1">{item.label}</span>
                                    {item.badge && (
                                      <Badge variant="secondary" className="text-xs">
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Wallet Connect Section */}
              <div className="p-4 border-t border-border">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Connect Wallet</div>
                  <WalletConnect />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <div className="text-sm text-muted-foreground text-center">
                  NFTFlow v1.0
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNavigation;
