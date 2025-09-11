import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, Bell, Search, Sun, Moon, Settings, Check, X as XIcon } from "lucide-react";
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

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, isOpen, setIsOpen, markAsRead, deleteNotification, markAllAsRead } = useNotifications();

  const navItems = [
    { label: "Marketplace", href: "/marketplace", icon: "🏪" },
    { label: "Create", href: "/create", icon: "✨" },
    { label: "Upload", href: "/upload", icon: "📤" },
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Analytics", href: "/analytics", icon: "📈" },
    { label: "Creativity", href: "/creativity", icon: "🎨" },
    { label: "Subgraph", href: "/subgraph", icon: "📊" },
    { label: "Live Feed", href: "/live-feed", icon: "⚡" },
    { label: "DAO", href: "/dao", icon: "🏛️" },
    { label: "Governance", href: "/governance", icon: "👑" },
    { label: "Profile", href: "/profile", icon: "👤" }
  ];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg"
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NFTFlow
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search NFTs, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 relative group ${
                  location.pathname === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                {location.pathname === item.href && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSearch(!showSearch)}
              className="relative"
            >
              <Search className="w-4 h-4" />
            </Button>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-primary">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <WalletConnect />
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Animated Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="hidden md:block overflow-hidden border-t border-border"
            >
              <div className="py-4">
                <form onSubmit={handleSearch} className="max-w-md mx-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search NFTs, collections, creators..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                      autoFocus
                    />
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="py-4 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="px-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search NFTs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-muted/50 border-border/50"
                    />
                  </div>
                </form>

                {/* Mobile Navigation */}
                <div className="space-y-2 px-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                        location.pathname === item.href
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Mobile Actions */}
                <div className="px-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Notifications</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-primary">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <WalletConnect />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;