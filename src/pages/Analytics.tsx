import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  DollarSign,
  Zap,
  Users,
  BarChart3,
  PieChart,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalVolume: number;
  totalRentals: number;
  activeUsers: number;
  averageRentalDuration: number;
  topCollections: Array<{ name: string; volume: number; rentals: number }>;
  hourlyVolume: Array<{ hour: string; volume: number; rentals: number }>;
  dailyVolume: Array<{ date: string; volume: number; rentals: number }>;
  utilityTypes: Array<{ type: string; count: number; volume: number }>;
  priceDistribution: Array<{ range: string; count: number }>;
  userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

const Analytics = () => {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    totalRentals: 15843,
    activeRentals: 2456,
    totalVolume: 89567.89,
    avgRentalDuration: 4.2,
    tps: 1247893,
    blockTime: 0.4,
    gasPrice: 0.001
  });

  // Mock data for demonstration
  const mockAnalyticsData: AnalyticsData = {
    totalVolume: 1247.89,
    totalRentals: 2847,
    activeUsers: 1243,
    averageRentalDuration: 4.2,
    topCollections: [
      { name: 'Epic Gaming Weapons', volume: 234.5, rentals: 456 },
      { name: 'Metaverse Land', volume: 189.2, rentals: 234 },
      { name: 'AI Services', volume: 156.8, rentals: 189 },
      { name: 'Virtual Galleries', volume: 134.7, rentals: 167 },
      { name: 'Creative Tools', volume: 98.3, rentals: 145 }
    ],
    hourlyVolume: [
      { hour: '00:00', volume: 12.3, rentals: 23 },
      { hour: '04:00', volume: 8.7, rentals: 15 },
      { hour: '08:00', volume: 45.2, rentals: 78 },
      { hour: '12:00', volume: 67.8, rentals: 112 },
      { hour: '16:00', volume: 89.4, rentals: 145 },
      { hour: '20:00', volume: 56.1, rentals: 89 }
    ],
    dailyVolume: [
      { date: '2024-01-01', volume: 45.2, rentals: 78 },
      { date: '2024-01-02', volume: 52.8, rentals: 89 },
      { date: '2024-01-03', volume: 38.7, rentals: 67 },
      { date: '2024-01-04', volume: 61.3, rentals: 98 },
      { date: '2024-01-05', volume: 73.9, rentals: 124 },
      { date: '2024-01-06', volume: 89.4, rentals: 145 },
      { date: '2024-01-07', volume: 95.7, rentals: 156 }
    ],
    utilityTypes: [
      { type: 'Gaming', count: 1245, volume: 456.7 },
      { type: 'Metaverse', count: 892, volume: 234.5 },
      { type: 'AI Services', count: 567, volume: 189.2 },
      { type: 'Art & Display', count: 445, volume: 134.7 },
      { type: 'Education', count: 334, volume: 98.3 },
      { type: 'Health & Wellness', count: 223, volume: 67.8 }
    ],
    priceDistribution: [
      { range: '0-0.001', count: 1245 },
      { range: '0.001-0.01', count: 892 },
      { range: '0.01-0.1', count: 567 },
      { range: '0.1-1.0', count: 445 },
      { range: '1.0+', count: 334 }
    ],
    userGrowth: [
      { date: '2024-01-01', newUsers: 45, totalUsers: 1234 },
      { date: '2024-01-02', newUsers: 52, totalUsers: 1286 },
      { date: '2024-01-03', newUsers: 38, totalUsers: 1324 },
      { date: '2024-01-04', newUsers: 61, totalUsers: 1385 },
      { date: '2024-01-05', newUsers: 73, totalUsers: 1458 },
      { date: '2024-01-06', newUsers: 89, totalUsers: 1547 },
      { date: '2024-01-07', newUsers: 95, totalUsers: 1642 }
    ]
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from your analytics API
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Failed to Load Analytics",
        description: "Could not load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
    toast({
      title: "Analytics Updated",
      description: "Analytics data has been refreshed",
    });
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Volume (STT)', analyticsData.totalVolume.toString()],
      ['Total Rentals', analyticsData.totalRentals.toString()],
      ['Active Users', analyticsData.activeUsers.toString()],
      ['Average Rental Duration (hours)', analyticsData.averageRentalDuration.toString()]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nftflow-analytics-${timeframe}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        ...prev,
        totalRentals: prev.totalRentals + Math.floor(Math.random() * 3),
        activeRentals: prev.activeRentals + Math.floor(Math.random() * 5) - 2,
        totalVolume: prev.totalVolume + Math.random() * 10,
        tps: 1200000 + Math.floor(Math.random() * 100000),
        blockTime: 0.3 + Math.random() * 0.2
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const trendingNFTs = [
    { name: "Cosmic Wizard #1234", rentals: 156, volume: 2543.67, change: "+23%", category: "Gaming Weapon", avgDuration: 4.2 },
    { name: "AI Trading Bot License", rentals: 143, volume: 1987.45, change: "+18%", category: "AI Service", avgDuration: 12.5 },
    { name: "Virtual Real Estate Plot", rentals: 134, volume: 1765.23, change: "+15%", category: "Virtual Land", avgDuration: 48.0 },
    { name: "Music Production Studio", rentals: 128, volume: 1654.78, change: "+12%", category: "Creative Tool", avgDuration: 6.8 },
    { name: "Fitness Coach AI", rentals: 119, volume: 1543.92, change: "+8%", category: "Health Service", avgDuration: 2.5 },
    { name: "Luxury Car Showroom", rentals: 98, volume: 1423.56, change: "+6%", category: "Virtual Showroom", avgDuration: 3.2 },
    { name: "Language Learning Tutor", rentals: 87, volume: 1234.78, change: "+4%", category: "Education", avgDuration: 8.5 },
    { name: "Virtual Fashion Designer", rentals: 76, volume: 1098.34, change: "+2%", category: "Fashion Design", avgDuration: 5.1 },
    { name: "Crypto Trading Signals", rentals: 65, volume: 987.45, change: "-1%", category: "Financial Service", avgDuration: 24.0 },
    { name: "Virtual Pet Companion", rentals: 54, volume: 876.23, change: "-3%", category: "Digital Companion", avgDuration: 1.8 }
  ];

  const categoryStats = [
    { category: "Gaming Utilities", volume: 15432.45, rentals: 1245, avgPrice: 12.4 },
    { category: "AI Services", volume: 12345.67, rentals: 567, avgPrice: 21.8 },
    { category: "Virtual Land", volume: 9876.54, rentals: 234, avgPrice: 42.2 },
    { category: "Creative Tools", volume: 8765.43, rentals: 678, avgPrice: 12.9 },
    { category: "Health & Wellness", volume: 6543.21, rentals: 456, avgPrice: 14.4 },
    { category: "Education", volume: 5432.10, rentals: 345, avgPrice: 15.7 },
    { category: "Financial Services", volume: 4321.09, rentals: 123, avgPrice: 35.1 },
    { category: "Virtual Showrooms", volume: 3210.98, rentals: 234, avgPrice: 13.7 }
  ];

  const hourlyStats = [
    { hour: "00:00", rentals: 45, volume: 234.56 },
    { hour: "01:00", rentals: 32, volume: 167.89 },
    { hour: "02:00", rentals: 28, volume: 145.23 },
    { hour: "03:00", rentals: 23, volume: 119.67 },
    { hour: "04:00", rentals: 19, volume: 98.45 },
    { hour: "05:00", rentals: 26, volume: 134.78 },
    { hour: "06:00", rentals: 38, volume: 198.34 },
    { hour: "07:00", rentals: 52, volume: 267.89 },
    { hour: "08:00", rentals: 67, volume: 345.67 },
    { hour: "09:00", rentals: 78, volume: 401.23 },
    { hour: "10:00", rentals: 89, volume: 456.78 },
    { hour: "11:00", rentals: 95, volume: 489.12 },
    { hour: "12:00", rentals: 87, volume: 445.67 },
    { hour: "13:00", rentals: 92, volume: 472.34 },
    { hour: "14:00", rentals: 98, volume: 501.89 },
    { hour: "15:00", rentals: 105, volume: 538.45 },
    { hour: "16:00", rentals: 112, volume: 574.23 },
    { hour: "17:00", rentals: 108, volume: 552.67 },
    { hour: "18:00", rentals: 95, volume: 487.34 },
    { hour: "19:00", rentals: 82, volume: 420.12 },
    { hour: "20:00", rentals: 76, volume: 389.45 },
    { hour: "21:00", rentals: 68, volume: 348.78 },
    { hour: "22:00", rentals: 58, volume: 297.34 },
    { hour: "23:00", rentals: 49, volume: 251.67 }
  ];

  const platformMetrics = [
    { label: "Total Rentals", value: realTimeStats.totalRentals.toLocaleString(), icon: Activity, change: "+12.5%" },
    { label: "Active Rentals", value: realTimeStats.activeRentals.toLocaleString(), icon: Users, change: "+8.3%" },
    { label: "Total Volume", value: `${realTimeStats.totalVolume.toFixed(2)} STT`, icon: DollarSign, change: "+15.7%" },
    { label: "Avg Duration", value: `${realTimeStats.avgRentalDuration}h`, icon: Clock, change: "+2.1%" }
  ];

  const networkMetrics = [
    { label: "Network TPS", value: realTimeStats.tps.toLocaleString(), icon: Zap, change: "Real-time" },
    { label: "Block Time", value: `${realTimeStats.blockTime.toFixed(1)}s`, icon: Activity, change: "Sub-second" },
    { label: "Gas Price", value: `${realTimeStats.gasPrice} STT`, icon: DollarSign, change: "Ultra-low" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
              <p className="text-muted-foreground">Analytics data is not available at this time</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Platform performance and market insights
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalVolume.toLocaleString()} STT</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +12.5% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalRentals.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +8.2% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +15.3% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.averageRentalDuration}h</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1 text-red-500" />
                -2.1% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volume Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Volume Trend</CardTitle>
                  <CardDescription>Daily volume and rental count</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.dailyVolume}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="volume" 
                        stackId="1" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Utility Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Utility Types</CardTitle>
                  <CardDescription>Distribution by utility type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.utilityTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, count }) => `${type}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.utilityTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Collections */}
            <Card>
              <CardHeader>
                <CardTitle>Top Collections</CardTitle>
                <CardDescription>Highest volume collections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topCollections.map((collection, index) => (
                    <div key={collection.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <h4 className="font-medium">{collection.name}</h4>
                          <p className="text-sm text-muted-foreground">{collection.rentals} rentals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{collection.volume} STT</div>
                        <div className="text-sm text-muted-foreground">Volume</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volume" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Volume */}
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Volume</CardTitle>
                  <CardDescription>Volume distribution by hour</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.hourlyVolume}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Price Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Distribution</CardTitle>
                  <CardDescription>Rental price ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.priceDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Performance</CardTitle>
                <CardDescription>Detailed collection analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topCollections.map((collection, index) => (
                    <div key={collection.name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{collection.name}</h4>
                        <Badge variant="secondary">#{index + 1}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold">{collection.volume} STT</div>
                          <div className="text-sm text-muted-foreground">Total Volume</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{collection.rentals}</div>
                          <div className="text-sm text-muted-foreground">Total Rentals</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-muted-foreground mb-1">Average Price</div>
                        <div className="text-lg font-medium">
                          {(collection.volume / collection.rentals).toFixed(4)} STT/rental
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users and total user count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newUsers" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="totalUsers" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;