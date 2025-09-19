import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Menu, X, Bell, Search, Sun, Moon, Settings, Check, X as XIcon, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import WalletConnect from "./WalletConnect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/use-theme";
import { useNotifications } from "@/contexts/NotificationContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMainNavItems, getUserNavItems } from '@/config/navigation';
import MobileNavigation from './MobileNavigation';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, isOpen, setIsOpen, markAsRead, deleteNotification, markAllAsRead } = useNotifications();

  const navItems = getMainNavItems().concat([
    { label: "DAO", href: "/dao", icon: "🏛️", badge: undefined },
    { label: "Create", href: "/creativity", icon: "🎨", badge: "Hot" }
  ]);

  const userItems = getUserNavItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-lg' 
          : 'bg-background/80 backdrop-blur-md border-b border-border/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - Always visible */}
          <Link to="/" className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-1.5 sm:p-2 bg-gradient-to-r from-primary to-accent rounded-lg"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-lg sm:text-xl font-bold">
              NFTFlow
            </span>
          </Link>

          {/* Search Bar - Responsive */}
          <div className={`flex-1 max-w-sm sm:max-w-md mx-2 sm:mx-4 lg:mx-6 transition-all duration-300 ${
            isSearchFocused ? 'block' : 'hidden sm:block'
          }`}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  placeholder="Search NFTs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-7 sm:pl-10 h-8 sm:h-9 text-sm bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation - Hidden on smaller screens */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-all duration-200 relative group ${
                  location.pathname === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                <span className="text-xs font-medium hidden 2xl:inline">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 ml-1">
                    {item.badge}
                  </Badge>
                )}
                {location.pathname === item.href && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions - Responsive */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Notifications */}
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 sm:h-9 sm:w-9 p-0">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-primary">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Notifications
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="h-6 px-2 text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Mark all read
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                  </CardDescription>
                </CardHeader>
                <ScrollArea className="h-80">
                  {notifications.length > 0 ? (
                    <div className="space-y-2 p-2">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            notification.read 
                              ? 'bg-muted/20 border-muted' 
                              : 'bg-background border-border shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                              <p className={`text-xs ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <XIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </ScrollArea>
                {notifications.length > 5 && (
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all notifications
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Wallet Connect - Responsive */}
            <div className="hidden sm:block">
              <WalletConnect />
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
        </div>


        {/* Mobile Navigation */}
        <MobileNavigation 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      </div>
    </motion.header>
  );
};

export default Header;