import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Target,
  Gauge,
  BarChart3,
  RefreshCw,
  Pause,
  Play
} from 'lucide-react';
import { SOMNIA_CONFIG, SomniaUtils } from '@/config/somniaConfig';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  icon: React.ReactNode;
}

const SomniaPerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealTime, setIsRealTime] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock performance data with some randomization for real-time feel
      const performanceData: PerformanceMetric[] = [
        {
          name: 'Transactions Per Second',
          value: Math.floor(Math.random() * 100000) + 900000, // 900k - 1M TPS
          target: 1000000,
          unit: 'TPS',
          status: 'excellent',
          description: 'Real-time transaction throughput',
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          name: 'Block Time',
          value: Math.floor(Math.random() * 20) + 80, // 80-100ms
          target: 100,
          unit: 'ms',
          status: 'excellent',
          description: 'Average block confirmation time',
          icon: <Clock className="w-5 h-5" />
        },
        {
          name: 'Gas Price',
          value: parseFloat((Math.random() * 0.5 + 0.3).toFixed(4)), // 0.3-0.8 Gwei
          target: 1,
          unit: 'Gwei',
          status: 'excellent',
          description: 'Current network gas price',
          icon: <DollarSign className="w-5 h-5" />
        },
        {
          name: 'Network Utilization',
          value: Math.floor(Math.random() * 15) + 10, // 10-25%
          target: 80,
          unit: '%',
          status: 'excellent',
          description: 'Network capacity utilization',
          icon: <Gauge className="w-5 h-5" />
        },
        {
          name: 'Finality Time',
          value: parseFloat((Math.random() * 0.3 + 0.7).toFixed(1)), // 0.7-1.0s
          target: 1,
          unit: 's',
          status: 'excellent',
          description: 'Transaction finality time',
          icon: <CheckCircle className="w-5 h-5" />
        },
        {
          name: 'Active Connections',
          value: Math.floor(Math.random() * 3000) + 15000, // 15k-18k
          target: 100000,
          unit: '',
          status: 'good',
          description: 'Active network connections',
          icon: <Activity className="w-5 h-5" />
        }
      ];
      
      setMetrics(performanceData);
      setIsLoading(false);
    };

    fetchPerformanceData();
    
    // Update every 3 seconds when real-time is enabled
    let interval: NodeJS.Timeout | null = null;
    if (isRealTime) {
      interval = setInterval(() => {
        fetchPerformanceData();
        setLastUpdateTime(Date.now());
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRealTime]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-400/10';
      case 'good': return 'text-blue-400 bg-blue-400/10';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const calculateProgress = (value: number, target: number, isLowerBetter: boolean = false) => {
    if (isLowerBetter) {
      return Math.min(100, (target / value) * 100);
    }
    return Math.min(100, (value / target) * 100);
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'TPS') {
      return value.toLocaleString();
    } else if (unit === 'ms') {
      return value.toFixed(1);
    } else if (unit === 'Gwei') {
      return value.toFixed(4);
    } else if (unit === '%') {
      return value.toFixed(1);
    } else if (unit === 's') {
      return value.toFixed(1);
    }
    return value.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-700 rounded-lg p-4">
                <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-slate-600 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Somnia Performance Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time monitoring of the world's fastest blockchain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isRealTime ? "default" : "secondary"} className="gap-1">
            <Activity className={`w-3 h-3 ${isRealTime ? 'animate-pulse' : ''}`} />
            {isRealTime ? 'Live' : 'Paused'}
          </Badge>
          <Button
            onClick={() => setIsRealTime(!isRealTime)}
            variant="outline"
            size="sm"
          >
            {isRealTime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => {
              const fetchData = async () => {
                setIsLoading(true);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const performanceData: PerformanceMetric[] = [
                  {
                    name: 'Transactions Per Second',
                    value: Math.floor(Math.random() * 100000) + 900000,
                    target: 1000000,
                    unit: 'TPS',
                    status: 'excellent',
                    description: 'Real-time transaction throughput',
                    icon: <TrendingUp className="w-5 h-5" />
                  },
                  {
                    name: 'Block Time',
                    value: Math.floor(Math.random() * 20) + 80,
                    target: 100,
                    unit: 'ms',
                    status: 'excellent',
                    description: 'Average block confirmation time',
                    icon: <Clock className="w-5 h-5" />
                  },
                  {
                    name: 'Gas Price',
                    value: parseFloat((Math.random() * 0.5 + 0.3).toFixed(4)),
                    target: 1,
                    unit: 'Gwei',
                    status: 'excellent',
                    description: 'Current network gas price',
                    icon: <DollarSign className="w-5 h-5" />
                  },
                  {
                    name: 'Network Utilization',
                    value: Math.floor(Math.random() * 15) + 10,
                    target: 80,
                    unit: '%',
                    status: 'excellent',
                    description: 'Network capacity utilization',
                    icon: <Gauge className="w-5 h-5" />
                  },
                  {
                    name: 'Finality Time',
                    value: parseFloat((Math.random() * 0.3 + 0.7).toFixed(1)),
                    target: 1,
                    unit: 's',
                    status: 'excellent',
                    description: 'Transaction finality time',
                    icon: <CheckCircle className="w-5 h-5" />
                  },
                  {
                    name: 'Active Connections',
                    value: Math.floor(Math.random() * 3000) + 15000,
                    target: 100000,
                    unit: '',
                    status: 'good',
                    description: 'Active network connections',
                    icon: <Activity className="w-5 h-5" />
                  }
                ];
                
                setMetrics(performanceData);
                setIsLoading(false);
              };
              
              fetchData();
              setLastUpdateTime(Date.now());
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/30 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                    <div className="text-cyan-400">{metric.icon}</div>
                    {metric.name}
                  </CardTitle>
                  <Badge className={`text-xs ${getStatusColor(metric.status)}`}>
                    {getStatusIcon(metric.status)}
                    <span className="ml-1 capitalize">{metric.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-cyan-400">
                    {formatValue(metric.value, metric.unit)}
                  </div>
                  <div className="text-sm text-slate-500">{metric.unit}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Target: {formatValue(metric.target, metric.unit)}</span>
                    <span>
                      {metric.value > metric.target ? 'Exceeds' : 'Progress'}: {
                        calculateProgress(metric.value, metric.target, metric.unit === 'ms' || metric.unit === 'Gwei' || metric.unit === 's').toFixed(1)
                      }%
                    </span>
                  </div>
                  <Progress 
                    value={calculateProgress(metric.value, metric.target, metric.unit === 'ms' || metric.unit === 'Gwei' || metric.unit === 's')} 
                    className="h-2"
                  />
                </div>
                
                <div className="text-xs text-slate-500">
                  {metric.description}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Somnia Advantages */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-xl text-cyan-400 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Somnia Network Advantages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-3xl font-bold text-cyan-400 mb-2">1M+</div>
              <div className="text-sm text-slate-300">Transactions Per Second</div>
              <div className="text-xs text-slate-500 mt-1">Unprecedented throughput</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-3xl font-bold text-cyan-400 mb-2">&lt;100ms</div>
              <div className="text-sm text-slate-300">Block Time</div>
              <div className="text-xs text-slate-500 mt-1">Sub-second finality</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-3xl font-bold text-cyan-400 mb-2">&lt;$0.01</div>
              <div className="text-sm text-slate-300">Transaction Cost</div>
              <div className="text-xs text-slate-500 mt-1">Sub-cent fees</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-3xl font-bold text-cyan-400 mb-2">EVM</div>
              <div className="text-sm text-slate-300">Compatible</div>
              <div className="text-xs text-slate-500 mt-1">Full compatibility</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Comparison */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Network</th>
                  <th className="text-right py-2 text-slate-300">TPS</th>
                  <th className="text-right py-2 text-slate-300">Block Time</th>
                  <th className="text-right py-2 text-slate-300">Gas Price</th>
                  <th className="text-right py-2 text-slate-300">Finality</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 text-cyan-400 font-semibold">Somnia</td>
                  <td className="text-right py-2 text-green-400">1,000,000+</td>
                  <td className="text-right py-2 text-green-400">&lt;100ms</td>
                  <td className="text-right py-2 text-green-400">&lt;1 Gwei</td>
                  <td className="text-right py-2 text-green-400">&lt;1s</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 text-slate-300">Ethereum</td>
                  <td className="text-right py-2 text-slate-400">15</td>
                  <td className="text-right py-2 text-slate-400">12s</td>
                  <td className="text-right py-2 text-slate-400">20+ Gwei</td>
                  <td className="text-right py-2 text-slate-400">6+ min</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-2 text-slate-300">Polygon</td>
                  <td className="text-right py-2 text-slate-400">7,000</td>
                  <td className="text-right py-2 text-slate-400">2s</td>
                  <td className="text-right py-2 text-slate-400">30+ Gwei</td>
                  <td className="text-right py-2 text-slate-400">2+ min</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-300">Solana</td>
                  <td className="text-right py-2 text-slate-400">65,000</td>
                  <td className="text-right py-2 text-slate-400">400ms</td>
                  <td className="text-right py-2 text-slate-400">0.00025 SOL</td>
                  <td className="text-right py-2 text-slate-400">13s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SomniaPerformanceDashboard;
