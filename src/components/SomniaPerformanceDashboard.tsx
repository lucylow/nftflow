import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  BarChart3
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

  useEffect(() => {
    // Simulate fetching real-time Somnia performance data
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock performance data
      const performanceData: PerformanceMetric[] = [
        {
          name: 'Transactions Per Second',
          value: 125000, // Current TPS
          target: 1000000, // Somnia's max TPS
          unit: 'TPS',
          status: 'excellent',
          description: 'Real-time transaction throughput',
          icon: <TrendingUp className="w-5 h-5" />
        },
        {
          name: 'Block Time',
          value: 85, // Current block time in ms
          target: 100, // Somnia's target (<100ms)
          unit: 'ms',
          status: 'excellent',
          description: 'Average block confirmation time',
          icon: <Clock className="w-5 h-5" />
        },
        {
          name: 'Gas Price',
          value: 0.0005, // Current gas price in Gwei
          target: 1, // Somnia's target (<1 Gwei)
          unit: 'Gwei',
          status: 'excellent',
          description: 'Current network gas price',
          icon: <DollarSign className="w-5 h-5" />
        },
        {
          name: 'Network Utilization',
          value: 12.5, // Current utilization %
          target: 80, // Target utilization %
          unit: '%',
          status: 'excellent',
          description: 'Network capacity utilization',
          icon: <Gauge className="w-5 h-5" />
        },
        {
          name: 'Finality Time',
          value: 0.8, // Current finality time in seconds
          target: 1, // Somnia's target (<1 second)
          unit: 's',
          status: 'excellent',
          description: 'Transaction finality time',
          icon: <CheckCircle className="w-5 h-5" />
        },
        {
          name: 'Active Connections',
          value: 15420, // Current active connections
          target: 100000, // Target connections
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
    
    // Update every 5 seconds
    const interval = setInterval(fetchPerformanceData, 5000);
    
    return () => clearInterval(interval);
  }, []);

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
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Somnia Network Performance Dashboard
        </h2>
        <p className="text-slate-400">
          Real-time monitoring of Somnia's revolutionary blockchain capabilities
        </p>
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
