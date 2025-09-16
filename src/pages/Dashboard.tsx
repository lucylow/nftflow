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
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from '@/contexts/Web3Context';
import { MockDataService } from '@/mockData/mockDataService';
import { hybridDataService } from '@/services/hybridDataService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataSourceInfo, setDataSourceInfo] = useState<any>(null);
  const { toast } = useToast();
  const { account, isConnected, balance, chainId } = useWeb3();
  const navigate = useNavigate();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (account && isConnected) {
        try {
          setIsLoading(true);
          const data = await hybridDataService.getDashboardData(account);
          const dataInfo = hybridDataService.getDataSourceInfo();
          setDashboardData(data);
          setDataSourceInfo(dataInfo);
          
          // Show toast if real data is available
          if (dataInfo.hasRealData) {
            toast({
              title: "Real Blockchain Data Loaded",
              description: "Your dashboard is now showing live data from the blockchain!",
            });
          } else {
            toast({
              title: "Demo Mode",
              description: "Showing mock data. Connect to blockchain for real data.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Failed to load dashboard data:', error);
          toast({
            title: "Data Load Error",
            description: "Failed to load dashboard data. Using fallback data.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [account, isConnected, toast]);

  const handleRefresh = async () => {
    if (!account || !isConnected) return;
    
    setIsRefreshing(true);
    try {
      const data = await hybridDataService.getDashboardData(account);
      const dataInfo = hybridDataService.getDataSourceInfo();
      setDashboardData(data);
      setDataSourceInfo(dataInfo);
      
      toast({
        title: "Data Refreshed",
        description: dataInfo.hasRealData ? "Live blockchain data updated!" : "Mock data refreshed.",
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Use real data if available, otherwise fallback to mock data
  const userStats = dashboardData?.userStats || [
    { label: "Total Earned", value: "156.78 STT", change: "+12.5%" },
    { label: "Active Rentals", value: "8", change: "+2" },
    { label: "Total Rented", value: "47 NFTs", change: "+5" },
    { label: "Reputation Score", value: "4.8/5", change: "+0.1" }
  ];


  // Get data from hybrid service
  const userNFTs = dashboardData?.userNFTs || [];
  const activeRentals = dashboardData?.activeRentals || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const earningsHistory = dashboardData?.earningsHistory || [];
  const userListings = dashboardData?.userListings || [];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700/50 max-w-md mx-auto">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Connect Your Wallet</h3>
              <p className="text-slate-400">
                Connect your wallet to view your dashboard and manage your NFT rentals.
              </p>
              <Button 
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => navigate('/')}
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
              <p className="text-slate-300">Manage your NFT rentals and earnings</p>
            </div>
            <div className="flex gap-3">
              {dataSourceInfo && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className={`w-2 h-2 rounded-full ${dataSourceInfo.hasRealData ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm text-slate-300">
                    {dataSourceInfo.hasRealData ? 'Live Data' : 'Demo Mode'}
                  </span>
                </div>
              )}
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {isRefreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button 
                size="lg"
                onClick={() => {
                  toast({
                    title: "Settings",
                    description: "Settings panel opened",
                  });
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
        </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="my-nfts" className="data-[state=active]:bg-purple-600">My NFTs</TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-purple-600">Earnings</TabsTrigger>
            <TabsTrigger value="management" className="data-[state=active]:bg-purple-600">Management</TabsTrigger>
            <TabsTrigger value="streams" className="data-[state=active]:bg-purple-600">Streams</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {userStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-full">
                          <DollarSign className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge 
                          variant="default"
                      className="text-xs bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-slate-400 ml-2">this week</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

            {/* Active Rentals */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5" />
                  Active Rentals
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeRentals.slice(0, 4).map((nft) => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  {recentActivity.slice(0, 6).map((activity, index) => (
                  <motion.div
                      key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'rental' ? 'bg-green-500' :
                          activity.type === 'return' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`} />
                        <div>
                          <p className="text-white font-medium">{activity.action}</p>
                          <p className="text-slate-400 text-sm">{activity.time}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="default"
                        className={activity.amount.startsWith('+') ? 
                          "bg-green-500/20 text-green-400 border-green-500/30" : 
                          "bg-slate-500/20 text-slate-400 border-slate-500/30"
                        }
                      >
                        {activity.amount}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-nfts" className="space-y-6">
            {/* Active Rentals Section */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Current Rentals
                </CardTitle>
                <CardDescription className="text-slate-400">NFTs you are currently renting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userNFTs.filter(nft => nft.isRented).map((nft) => (
                    <Card key={nft.id} className="bg-slate-700/30 border-slate-700/30 backdrop-blur-sm hover:border-purple-500/30 transition-all">
                      <CardContent className="p-4">
                        <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                          <img 
                            src={nft.image} 
                            alt={nft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-white">{nft.name}</h3>
                          <p className="text-sm text-slate-400">{nft.collectionId}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {nft.rarity}
                            </Badge>
                            <Badge variant="default" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                              Rented
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {userNFTs.filter(nft => nft.isRented).length === 0 && (
                    <div className="col-span-full text-center py-8 text-slate-400">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active rentals</p>
                      <p className="text-sm">Start renting NFTs from the marketplace!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Listings Section */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    My Listed NFTs
                  </div>
                  <Button 
                    onClick={() => navigate('/marketplace')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    List New NFT
                  </Button>
                </CardTitle>
                <CardDescription className="text-slate-400">NFTs you have listed for rental</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userNFTs.filter(nft => !nft.isRented).map((nft) => (
                    <Card key={nft.id} className="bg-slate-700/30 border-slate-700/30 backdrop-blur-sm hover:border-purple-500/30 transition-all">
                      <CardContent className="p-4">
                        <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                          <img 
                            src={nft.image} 
                            alt={nft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-white">{nft.name}</h3>
                          <p className="text-sm text-slate-400">{nft.collectionId}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {nft.rarity}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Available
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Price:</span>
                              <span className="font-medium text-white">{nft.currentPrice} STT/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Total Earnings:</span>
                              <span className="font-medium text-green-400">{nft.totalEarned || 0} STT</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Rentals:</span>
                              <span className="font-medium text-white">{nft.rentalCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {userNFTs.filter(nft => !nft.isRented).length === 0 && (
                    <div className="col-span-full text-center py-8 text-slate-400">
                      <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No listed NFTs</p>
                      <p className="text-sm">List your first NFT to start earning!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <Wallet className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {dashboardData?.realEarnings?.totalEarned?.toFixed(2) || '156.78'} STT
                  </p>
                  <p className="text-slate-400 text-sm">Total Earned</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {(dashboardData?.realEarnings?.totalEarned * 0.15)?.toFixed(2) || '23.45'} STT
                  </p>
                  <p className="text-slate-400 text-sm">This Month</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {(dashboardData?.realEarnings?.totalEarned * 0.04)?.toFixed(2) || '5.67'} STT
                  </p>
                  <p className="text-slate-400 text-sm">Today</p>
                </CardContent>
              </Card>
            </div>

            {/* Earnings History Chart */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Earnings History (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsHistory.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-white">{new Date(day.date).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-400">{day.rentals} rentals</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-green-400">{day.amount} STT</p>
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>

            {/* Top Earning NFTs */}
            <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Top Earning NFTs
            </CardTitle>
          </CardHeader>
          <CardContent>
                <div className="space-y-4">
                  {userListings.map((nft, index) => (
                    <div key={nft.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <img src={nft.image} alt={nft.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-white">{nft.name}</p>
                          <p className="text-sm text-slate-400">{nft.collection}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">{nft.totalEarnings} STT</p>
                        <p className="text-sm text-slate-400">{nft.rentalCount} rentals</p>
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-8">
            <NFTManagement />
            <BulkOperations />
            <GamificationDashboard />
          </TabsContent>

          <TabsContent value="streams" className="space-y-8">
            <PaymentStreamManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;