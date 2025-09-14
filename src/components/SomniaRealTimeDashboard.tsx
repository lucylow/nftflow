import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Activity,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Database,
  Network,
  Gauge,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { useSomniaRealTime } from '@/hooks/useSomniaRealTime';
import { SOMNIA_CONFIG, SomniaUtils } from '@/config/somniaConfig';

interface NetworkMetrics {
  timestamp: number;
  tps: number;
  blockTime: number;
  gasPrice: number;
  activeUsers: number;
  totalTransactions: number;
  networkUtilization: number;
}

const SomniaRealTimeDashboard: React.FC = () => {
  const {
    blockNumber,
    blockData,
    pendingTxs,
    confirmedTxs,
    stats,
    startPolling,
    stopPolling,
    isPolling
  } = useSomniaRealTime();

  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<NetworkMetrics>({
    timestamp: Date.now(),
    tps: 0,
    blockTime: 0,
    gasPrice: 0,
    activeUsers: 0,
    totalTransactions: 0,
    networkUtilization: 0
  });

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetric: NetworkMetrics = {
        timestamp: Date.now(),
        tps: Math.floor(Math.random() * 200000) + 800000, // 800k - 1M TPS
        blockTime: Math.floor(Math.random() * 30) + 70, // 70-100ms
        gasPrice: parseFloat((Math.random() * 0.8 + 0.1).toFixed(3)), // 0.1-0.9 gwei
        activeUsers: Math.floor(Math.random() * 5000) + 15000, // 15k-20k users
        totalTransactions: Math.floor(Math.random() * 1000000) + 5000000, // 5M+ transactions
        networkUtilization: Math.floor(Math.random() * 20) + 10 // 10-30% utilization
      };

      setCurrentMetrics(newMetric);
      setNetworkMetrics(prev => {
        const updated = [...prev, newMetric];
        return updated.slice(-50); // Keep last 50 data points
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { excellent: number; good: number; warning: number }) => {
    if (value >= thresholds.excellent) return 'text-green-500 bg-green-500/10';
    if (value >= thresholds.good) return 'text-blue-500 bg-blue-500/10';
    if (value >= thresholds.warning) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const metricCards = [
    {
      title: 'Transactions Per Second',
      value: formatNumber(currentMetrics.tps),
      unit: 'TPS',
      icon: <TrendingUp className="w-5 h-5" />,
      trend: '+12.5%',
      trendUp: true,
      status: getStatusColor(currentMetrics.tps, { excellent: 900000, good: 700000, warning: 500000 })
    },
    {
      title: 'Block Time',
      value: currentMetrics.blockTime.toString(),
      unit: 'ms',
      icon: <Clock className="w-5 h-5" />,
      trend: '-2.1%',
      trendUp: false,
      status: getStatusColor(100 - currentMetrics.blockTime, { excellent: 30, good: 20, warning: 10 })
    },
    {
      title: 'Gas Price',
      value: currentMetrics.gasPrice.toString(),
      unit: 'Gwei',
      icon: <DollarSign className="w-5 h-5" />,
      trend: '-8.3%',
      trendUp: false,
      status: getStatusColor(1 - currentMetrics.gasPrice, { excellent: 0.7, good: 0.5, warning: 0.3 })
    },
    {
      title: 'Active Users',
      value: formatNumber(currentMetrics.activeUsers),
      unit: '',
      icon: <Users className="w-5 h-5" />,
      trend: '+5.7%',
      trendUp: true,
      status: getStatusColor(currentMetrics.activeUsers, { excellent: 18000, good: 16000, warning: 14000 })
    },
    {
      title: 'Network Load',
      value: currentMetrics.networkUtilization.toString(),
      unit: '%',
      icon: <Gauge className="w-5 h-5" />,
      trend: '+1.2%',
      trendUp: true,
      status: getStatusColor(50 - currentMetrics.networkUtilization, { excellent: 35, good: 25, warning: 15 })
    },
    {
      title: 'Total Transactions',
      value: formatNumber(currentMetrics.totalTransactions),
      unit: '',
      icon: <Database className="w-5 h-5" />,
      trend: '+15.2%',
      trendUp: true,
      status: 'text-green-500 bg-green-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Somnia Network Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of the world's fastest blockchain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isPolling ? "default" : "secondary"} className="gap-1">
            <Activity className={`w-3 h-3 ${isPolling ? 'animate-pulse' : ''}`} />
            {isPolling ? 'Live' : 'Paused'}
          </Badge>
          <Button
            onClick={isPolling ? stopPolling : startPolling}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isPolling ? 'animate-spin' : ''}`} />
            {isPolling ? 'Pause' : 'Start'}
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="text-primary">{metric.icon}</div>
                    {metric.title}
                  </CardTitle>
                  <Badge className={`text-xs ${metric.status}`}>
                    {metric.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">
                    {metric.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.unit}
                  </div>
                </div>
                <div className={`text-xs mt-2 ${metric.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.trend} from last hour
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Current Block Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Current Block
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Block Number:</span>
                  <span className="font-mono">{blockNumber.toLocaleString()}</span>
                </div>
                {blockData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timestamp:</span>
                      <span className="font-mono">
                        {new Date(blockData.timestamp * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Used:</span>
                      <span className="font-mono">
                        {formatNumber(parseInt(blockData.gasUsed))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Limit:</span>
                      <span className="font-mono">
                        {formatNumber(parseInt(blockData.gasLimit))}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Transaction Pool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Transaction Pool
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending:</span>
                  <Badge variant="outline">{pendingTxs.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed:</span>
                  <Badge variant="default">{confirmedTxs.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Block Time:</span>
                  <span className="font-mono">
                    {(stats.averageBlockTime / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Status:</span>
                  <Badge 
                    variant={stats.networkCongestion === 'low' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {stats.networkCongestion}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingTxs.slice(0, 5).map((tx) => (
                  <div key={tx.hash} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="font-mono text-sm truncate max-w-[200px]">
                      {tx.hash}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {SomniaUtils.formatBlockTime(tx.timestamp)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">TPS Utilization</span>
                    <span className="text-sm">{((currentMetrics.tps / 1000000) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(currentMetrics.tps / 1000000) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Network Load</span>
                    <span className="text-sm">{currentMetrics.networkUtilization}%</span>
                  </div>
                  <Progress value={currentMetrics.networkUtilization} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-green-500 mb-2">98.7</div>
                <div className="text-muted-foreground">Excellent Performance</div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-green-500 font-semibold">99.2%</div>
                    <div className="text-muted-foreground">Uptime</div>
                  </div>
                  <div>
                    <div className="text-green-500 font-semibold">98.5%</div>
                    <div className="text-muted-foreground">Speed</div>
                  </div>
                  <div>
                    <div className="text-green-500 font-semibold">98.4%</div>
                    <div className="text-muted-foreground">Efficiency</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Network</th>
                      <th className="text-right py-2">TPS</th>
                      <th className="text-right py-2">Block Time</th>
                      <th className="text-right py-2">Gas Fee</th>
                      <th className="text-right py-2">Finality</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-primary/5">
                      <td className="py-2 font-semibold text-primary">Somnia</td>
                      <td className="text-right py-2 text-green-500">1,000,000+</td>
                      <td className="text-right py-2 text-green-500">&lt;100ms</td>
                      <td className="text-right py-2 text-green-500">&lt;$0.01</td>
                      <td className="text-right py-2 text-green-500">&lt;1s</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Ethereum</td>
                      <td className="text-right py-2 text-muted-foreground">15</td>
                      <td className="text-right py-2 text-muted-foreground">12s</td>
                      <td className="text-right py-2 text-muted-foreground">$2-50</td>
                      <td className="text-right py-2 text-muted-foreground">6+ min</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Polygon</td>
                      <td className="text-right py-2 text-muted-foreground">7,000</td>
                      <td className="text-right py-2 text-muted-foreground">2s</td>
                      <td className="text-right py-2 text-muted-foreground">$0.01-1</td>
                      <td className="text-right py-2 text-muted-foreground">2+ min</td>
                    </tr>
                    <tr>
                      <td className="py-2">Solana</td>
                      <td className="text-right py-2 text-muted-foreground">65,000</td>
                      <td className="text-right py-2 text-muted-foreground">400ms</td>
                      <td className="text-right py-2 text-muted-foreground">$0.00025</td>
                      <td className="text-right py-2 text-muted-foreground">13s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SomniaRealTimeDashboard;