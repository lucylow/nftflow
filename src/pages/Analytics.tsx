import { useState, useEffect } from "react";
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
  TrendingDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Analytics = () => {
  const [realTimeStats, setRealTimeStats] = useState({
    totalRentals: 15843,
    activeRentals: 2456,
    totalVolume: 89567.89,
    avgRentalDuration: 4.2,
    tps: 1247893,
    blockTime: 0.4,
    gasPrice: 0.001
  });

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
    { name: "Cosmic Wizard #1234", rentals: 156, volume: 2543.67, change: "+23%" },
    { name: "Digital Dragon #777", rentals: 143, volume: 1987.45, change: "+18%" },
    { name: "Neon Cat #9999", rentals: 134, volume: 1765.23, change: "+15%" },
    { name: "Space Ape #456", rentals: 128, volume: 1654.78, change: "+12%" },
    { name: "Cyber Punk #101", rentals: 119, volume: 1543.92, change: "+8%" }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Real-Time Analytics
          </h1>
          <p className="text-muted-foreground text-lg">
            Live platform statistics powered by Somnia's high-performance blockchain
          </p>
        </motion.div>

        <Tabs defaultValue="platform" className="space-y-8">
          <TabsList className="bg-card/50 border-border backdrop-blur-sm">
            <TabsTrigger value="platform" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Platform Stats
            </TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Network Performance
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Trending NFTs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="space-y-8">
            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm mb-1">{metric.label}</p>
                          <p className="text-2xl font-bold">{metric.value}</p>
                        </div>
                        <div className="text-primary">
                          <metric.icon className="w-8 h-8" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge variant="default" className="bg-success/10 text-success border-success/20">
                          {metric.change}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Rental Volume (7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">Chart visualization would go here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-accent" />
                    Rental Duration Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">Pie chart visualization would go here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {networkMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all">
                    <CardContent className="p-6 text-center">
                      <div className="text-primary mb-4">
                        <metric.icon className="w-10 h-10 mx-auto animate-pulse-glow" />
                      </div>
                      <p className="text-3xl font-bold mb-2">{metric.value}</p>
                      <p className="text-muted-foreground text-sm mb-3">{metric.label}</p>
                      <Badge variant="outline" className="border-accent/50 text-accent">
                        {metric.change}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Somnia Network Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="font-medium">Network Health</span>
                    </div>
                    <Badge variant="default" className="bg-success/20 text-success">
                      Excellent
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">Validator Nodes</div>
                      <div className="text-2xl font-bold text-primary">142</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">Network Uptime</div>
                      <div className="text-2xl font-bold text-success">99.97%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="space-y-8">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Top Performing NFTs (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingNFTs.map((nft, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{nft.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {nft.rentals} rentals • {nft.volume.toFixed(2)} STT volume
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="default" 
                        className="bg-success/10 text-success border-success/20"
                      >
                        {nft.change}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;