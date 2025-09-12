import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock, 
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
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

const AnalyticsDashboard: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

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
  };

  const loadAnalyticsData = useCallback(async () => {
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

  if (loading) {
    return (
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
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground">Analytics data is not available at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">Platform performance and market insights</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <PieChart>
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
                  </PieChart>
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
  );
};

export default AnalyticsDashboard;
