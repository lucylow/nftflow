import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  Wallet, 
  Settings, 
  BarChart3,
  Calendar,
  Eye,
  Edit,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Trophy,
  Image,
  DollarSign,
  Zap,
  Bell,
  Layers,
  Smartphone,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from "@/components/ui/enhanced-tabs";
import { TabOverflow } from "@/components/ui/tab-overflow";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import NFTCard from "@/components/NFTCard";
import UserDashboard from "@/components/UserDashboard";
import NFTManagement from "@/components/NFTManagement";
import PaymentStreamManagement from "@/components/PaymentStreamManagement";
import GamificationDashboard from "@/components/GamificationDashboard";
import NotificationSystem from "@/components/NotificationSystem";
import BulkOperations from "@/components/BulkOperations";
import MobileOptimizations from "@/components/MobileOptimizations";
import SocialFeatures from "@/components/SocialFeatures";
import { NFTCardSkeleton, StatsCardSkeleton, ActivitySkeleton, DashboardSkeleton, LoadingSpinner } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const { toast } = useToast();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const userStats = [
    { label: "Total Earned", value: "156.78 STT", change: "+12.5%" },
    { label: "Active Rentals", value: "8", change: "+2" },
    { label: "Total Rented", value: "47 NFTs", change: "+5" },
    { label: "Reputation Score", value: "4.8/5", change: "+0.1" }
  ];

  const activeRentals = [
    {
      id: "1",
      name: "Cosmic Wizard #1234",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      collection: "Cosmic Wizards",
      pricePerHour: 0.5,
      pricePerSecond: 0.5 / 3600,
      isRented: true,
      owner: "0x1234567890abcdef",
      timeLeft: "2h 15m",
      rarity: "Rare",
      utilityType: "Gaming Weapon",
      rentalStartTime: "2024-01-15T10:30:00Z",
      totalCost: 1.25
    },
    {
      id: "2",
      name: "Galaxy Punk #5678", 
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
      collection: "Galaxy Punks",
      pricePerHour: 1.2,
      pricePerSecond: 1.2 / 3600,
      isRented: true,
      owner: "0x9876543210fedcba", 
      timeLeft: "45m",
      rarity: "Epic",
      utilityType: "Gaming Avatar",
      rentalStartTime: "2024-01-15T14:00:00Z",
      totalCost: 2.4
    },
    {
      id: "3",
      name: "AI Trading Bot License",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
      collection: "AI Services",
      pricePerHour: 0.0432,
      pricePerSecond: 0.000012,
      isRented: true,
      owner: "0x7777888899990000",
      timeLeft: "1d 3h",
      rarity: "Epic",
      utilityType: "AI Service",
      rentalStartTime: "2024-01-14T09:15:00Z",
      totalCost: 1.08
    },
    {
      id: "4",
      name: "Virtual Real Estate Plot",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop",
      collection: "Metaverse Land",
      pricePerHour: 0.0288,
      pricePerSecond: 0.000008,
      isRented: true,
      owner: "0x4444555566667777",
      timeLeft: "2d 5h",
      rarity: "Legendary",
      utilityType: "Virtual Land",
      rentalStartTime: "2024-01-13T16:45:00Z",
      totalCost: 1.44
    },
    {
      id: "5",
      name: "Music Production Studio",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      collection: "Creative Tools",
      pricePerHour: 0.0144,
      pricePerSecond: 0.000004,
      isRented: true,
      owner: "0x2222333344445555",
      timeLeft: "4h 30m",
      rarity: "Rare",
      utilityType: "Creative Tool",
      rentalStartTime: "2024-01-15T12:00:00Z",
      totalCost: 0.65
    }
  ];

  const recentActivity = [
    { type: "rental", action: "Rented Cosmic Wizard #1234", time: "2 hours ago", amount: "+1.5 STT", nftId: "1" },
    { type: "return", action: "Returned Space Ape #456", time: "5 hours ago", amount: "-0.8 STT", nftId: "456" },
    { type: "rental", action: "Rented AI Trading Bot License", time: "1 day ago", amount: "+1.08 STT", nftId: "3" },
    { type: "earning", action: "Earned from Virtual Real Estate Plot", time: "2 days ago", amount: "+1.44 STT", nftId: "4" },
    { type: "rental", action: "Rented Music Production Studio", time: "3 days ago", amount: "+0.65 STT", nftId: "5" },
    { type: "return", action: "Returned Digital Dragon #777", time: "4 days ago", amount: "-2.5 STT", nftId: "777" },
    { type: "earning", action: "Earned from Neon Cat #9999", time: "5 days ago", amount: "+3.2 STT", nftId: "9999" },
    { type: "rental", action: "Rented Galaxy Punk #5678", time: "6 days ago", amount: "+2.4 STT", nftId: "2" },
    { type: "return", action: "Returned Luxury Car Showroom", time: "1 week ago", amount: "-4.0 STT", nftId: "111" },
    { type: "earning", action: "Earned from Crypto Trading Signals", time: "1 week ago", amount: "+8.0 STT", nftId: "666" }
  ];

  const userListings = [
    {
      id: "1",
      name: "Digital Art Gallery Space",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
      collection: "Virtual Galleries",
      pricePerSecond: 0.000002,
      isRented: false,
      owner: "0x5555666677778888",
      rarity: "Rare",
      utilityType: "Art Display",
      totalEarnings: 12.5,
      rentalCount: 8,
      lastRented: "2 days ago"
    },
    {
      id: "2",
      name: "Fitness Coach AI",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
      collection: "Health & Wellness",
      pricePerSecond: 0.000002,
      isRented: true,
      owner: "0x6666777788889999",
      timeLeft: "3h 45m",
      rarity: "Common",
      utilityType: "Health Service",
      totalEarnings: 8.3,
      rentalCount: 15,
      lastRented: "Currently rented"
    },
    {
      id: "3",
      name: "Language Learning Tutor",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop",
      collection: "Education Services",
      pricePerSecond: 0.0000015,
      isRented: false,
      owner: "0x0000111122223333",
      rarity: "Common",
      utilityType: "Education",
      totalEarnings: 5.7,
      rentalCount: 12,
      lastRented: "1 week ago"
    }
  ];

  const earningsHistory = [
    { date: "2024-01-15", amount: 5.67, rentals: 3 },
    { date: "2024-01-14", amount: 8.23, rentals: 5 },
    { date: "2024-01-13", amount: 12.45, rentals: 7 },
    { date: "2024-01-12", amount: 6.78, rentals: 4 },
    { date: "2024-01-11", amount: 9.12, rentals: 6 },
    { date: "2024-01-10", amount: 15.34, rentals: 9 },
    { date: "2024-01-09", amount: 7.89, rentals: 5 }
  ];

  // Show full page skeleton on initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground">Manage your NFT rentals and earnings</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-border text-muted-foreground hover:bg-muted/50"
              >
                {isRefreshing ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button 
                variant="premium" 
                size="lg"
                onClick={() => {
                  toast({
                    title: "Settings",
                    description: "Settings panel opened",
                  });
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </motion.div>

        <EnhancedTabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          animated={true}
          keyboardNavigation={true}
        >
          <TabOverflow 
            maxVisibleTabs={6}
            className="bg-card/50 border-border backdrop-blur-sm rounded-md p-1"
          >
            <EnhancedTabsTrigger 
              value="overview" 
              variant="pills"
              icon={<BarChart3 className="w-4 h-4" />}
            >
              Overview
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="my-nfts" 
              variant="pills"
              icon={<Image className="w-4 h-4" />}
              badge={userNFTs?.length || 0}
            >
              My NFTs
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="earnings" 
              variant="pills"
              icon={<DollarSign className="w-4 h-4" />}
            >
              Earnings
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="nfts" 
              variant="pills"
              icon={<Settings className="w-4 h-4" />}
            >
              Management
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="streams" 
              variant="pills"
              icon={<Zap className="w-4 h-4" />}
            >
              Streams
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="gamification" 
              variant="pills"
              icon={<Trophy className="w-4 h-4" />}
            >
              Achievements
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="notifications" 
              variant="pills"
              icon={<Bell className="w-4 h-4" />}
              badge={unreadNotifications}
            >
              Notifications
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="bulk" 
              variant="pills"
              icon={<Layers className="w-4 h-4" />}
            >
              Bulk Ops
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="mobile" 
              variant="pills"
              icon={<Smartphone className="w-4 h-4" />}
            >
              Mobile
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="social" 
              variant="pills"
              icon={<Users className="w-4 h-4" />}
            >
              Social
            </EnhancedTabsTrigger>
          </TabOverflow>

          <EnhancedTabsContent value="overview" className="space-y-8">
            {/* User Dashboard Component */}
            <UserDashboard />

            {/* Progress Overview */}
            {!isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Monthly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Earnings Target</span>
                        <span className="text-foreground font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rental Activity</span>
                        <span className="text-foreground font-medium">60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reputation Score</span>
                        <span className="text-foreground font-medium">96%</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Plus className="w-4 h-4 mr-2" />
                      List New NFT
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Filter className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Active Rentals */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Active Rentals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <NFTCardSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeRentals.map((nft) => (
                      <NFTCard key={nft.id} nft={nft} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <ActivitySkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'rental' ? 'bg-success' :
                            activity.type === 'return' ? 'bg-warning' :
                            'bg-primary'
                          }`} />
                          <div>
                            <p className="text-foreground font-medium">{activity.action}</p>
                            <p className="text-muted-foreground text-sm">{activity.time}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={activity.amount.startsWith('+') ? "default" : "secondary"}
                          className={activity.amount.startsWith('+') ? 
                            "bg-success/20 text-success" : 
                            "bg-muted text-muted-foreground"
                          }
                        >
                          {activity.amount}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </EnhancedTabsContent>

          <EnhancedTabsContent value="my-nfts" className="space-y-6">
            {/* Active Rentals Section */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Current Rentals
                </CardTitle>
                <CardDescription>NFTs you are currently renting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeRentals.map((nft) => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* My Listings Section */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    My Listed NFTs
                  </div>
                  <Button variant="premium">
                    <Plus className="w-4 h-4 mr-2" />
                    List New NFT
                  </Button>
                </CardTitle>
                <CardDescription>NFTs you have listed for rental</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userListings.map((nft) => (
                    <Card key={nft.id} className="bg-card/30 border-border/30 backdrop-blur-sm hover:border-primary/30 transition-all">
                      <CardContent className="p-4">
                        <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                          <img 
                            src={nft.image} 
                            alt={nft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground">{nft.name}</h3>
                          <p className="text-sm text-muted-foreground">{nft.collection}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {nft.rarity}
                            </Badge>
                            <Badge variant={nft.isRented ? "default" : "secondary"} className="text-xs">
                              {nft.isRented ? "Rented" : "Available"}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Earnings:</span>
                              <span className="font-medium text-success">{nft.totalEarnings} STT</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rentals:</span>
                              <span className="font-medium">{nft.rentalCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Rented:</span>
                              <span className="font-medium">{nft.lastRented}</span>
                            </div>
                          </div>
                          {nft.isRented && (
                            <div className="mt-2 p-2 bg-primary/10 rounded text-center">
                              <p className="text-sm text-primary font-medium">
                                Time Left: {nft.timeLeft}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </EnhancedTabsContent>

          <EnhancedTabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Wallet className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">156.78 STT</p>
                  <p className="text-muted-foreground text-sm">Total Earned</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">23.45 STT</p>
                  <p className="text-muted-foreground text-sm">This Month</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">5.67 STT</p>
                  <p className="text-muted-foreground text-sm">Today</p>
                </CardContent>
              </Card>
            </div>

            {/* Earnings History Chart */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Earnings History (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsHistory.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-medium text-foreground">{new Date(day.date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">{day.rentals} rentals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">{day.amount} STT</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Earning NFTs */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Top Earning NFTs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userListings.map((nft, index) => (
                    <div key={nft.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <img src={nft.image} alt={nft.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-foreground">{nft.name}</p>
                          <p className="text-sm text-muted-foreground">{nft.collection}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">{nft.totalEarnings} STT</p>
                        <p className="text-sm text-muted-foreground">{nft.rentalCount} rentals</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </EnhancedTabsContent>


          <EnhancedTabsContent value="nfts" className="space-y-8">
            <NFTManagement />
          </EnhancedTabsContent>

          <EnhancedTabsContent value="streams" className="space-y-8">
            <PaymentStreamManagement />
          </EnhancedTabsContent>

          <EnhancedTabsContent value="gamification" className="space-y-8">
            <GamificationDashboard />
          </EnhancedTabsContent>


          <EnhancedTabsContent value="notifications" className="space-y-8">
            <NotificationSystem />
          </EnhancedTabsContent>

          <EnhancedTabsContent value="bulk" className="space-y-8">
            <BulkOperations />
          </EnhancedTabsContent>

          <EnhancedTabsContent value="mobile" className="space-y-8">
            <MobileOptimizations />
          </EnhancedTabsContent>

          <EnhancedTabsContent value="social" className="space-y-8">
            <SocialFeatures />
          </EnhancedTabsContent>
        </EnhancedTabs>
      </div>
    </div>
  );
};

export default Dashboard;