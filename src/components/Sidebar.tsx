import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Store, 
  Plus, 
  Upload, 
  BarChart3, 
  TrendingUp, 
  Building2, 
  Crown, 
  Palette, 
  Database, 
  Users, 
  Bell, 
  User, 
  Wallet,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
  Activity,
  Star,
  Heart,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useWeb3 } from '@/contexts/Web3Context';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { isConnected, account } = useWeb3();

  // Auto-collapse on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainNavItems = [
    { label: 'Home', href: '/', icon: Home, badge: null },
    { label: 'Marketplace', href: '/marketplace', icon: Store, badge: null },
    { label: 'Create', href: '/create', icon: Plus, badge: 'New' },
    { label: 'Upload', href: '/upload', icon: Upload, badge: null },
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3, badge: null },
    { label: 'Analytics', href: '/analytics', icon: TrendingUp, badge: null },
  ];

  const featuresNavItems = [
    { label: 'DAO', href: '/dao', icon: Building2, badge: null },
    { label: 'Governance', href: '/governance', icon: Crown, badge: null },
    { label: 'Creativity', href: '/creativity', icon: Palette, badge: 'Hot' },
    { label: 'Subgraph', href: '/subgraph', icon: Database, badge: null },
    { label: 'Social', href: '/social', icon: Users, badge: null },
    { label: 'Notifications', href: '/notifications', icon: Bell, badge: null },
  ];

  const toolsNavItems = [
    { label: 'Wallet', href: '/wallet', icon: Wallet, badge: null },
    { label: 'Wallet Test', href: '/wallet-test', icon: Zap, badge: 'Test' },
    { label: 'Rental Flow', href: '/rental', icon: CreditCard, badge: null },
    { label: 'Profile', href: '/profile', icon: User, badge: null },
    { label: 'Mobile', href: '/mobile', icon: Globe, badge: null },
  ];

  const quickActions = [
    { label: 'Connect Wallet', icon: Wallet, action: 'connect' },
    { label: 'Browse NFTs', icon: Store, action: 'browse' },
    { label: 'Create NFT', icon: Plus, action: 'create' },
    { label: 'View Analytics', icon: BarChart3, action: 'analytics' },
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'connect':
        // Handle wallet connection
        break;
      case 'browse':
        window.location.href = '/marketplace';
        break;
      case 'create':
        window.location.href = '/create';
        break;
      case 'analytics':
        window.location.href = '/analytics';
        break;
    }
  };

  const NavSection = ({ title, items, showTitle = true }: { 
    title: string; 
    items: Array<{ label: string; href: string; icon: any; badge: string | null }>; 
    showTitle?: boolean;
  }) => (
    <div className="space-y-1">
      {showTitle && !isCollapsed && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </h3>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.label}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {item.badge}
                    </Badge>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 60 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`bg-background/95 backdrop-blur-xl border-r border-border/50 flex flex-col h-screen sticky top-0 z-40 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-2"
            >
              <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NFTFlow
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Wallet Status */}
      <div className="p-4 border-b border-border/50">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {isConnected && account && (
                <div className="text-xs font-mono text-muted-foreground truncate">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <NavSection title="Main" items={mainNavItems} />
          <Separator />
          <NavSection title="Features" items={featuresNavItems} />
          <Separator />
          <NavSection title="Tools" items={toolsNavItems} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border/50">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.action)}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Icon className="w-3 h-3" />
                      <span className="truncate">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between text-xs text-muted-foreground"
            >
              <span>NFTFlow v1.0</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Settings className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <HelpCircle className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
