import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Network, 
  Gauge,
  Microscope,
  Rocket,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { somniaService, SomniaMetrics, SomniaNetworkInfo } from '@/services/somniaService';
import { useWeb3 } from '@/contexts/Web3Context';
import MicroPaymentDemo from './MicroPaymentDemo';
import RealTimeEvents from './RealTimeEvents';

const SomniaDashboard: React.FC = () => {
  const { isConnected, account } = useWeb3();
  const [metrics, setMetrics] = useState<SomniaMetrics | null>(null);
  const [networkInfo, setNetworkInfo] = useState<SomniaNetworkInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!isConnected || !somniaService.isReady()) {
        setIsLoading(false);
        return;
      }

      try {
        const currentMetrics = somniaService.getMetrics();
        const currentNetworkInfo = await somniaService.getNetworkInfo();
        
        setMetrics(currentMetrics);
        setNetworkInfo(currentNetworkInfo);
      } catch (error) {
        console.error('Failed to load Somnia data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Update metrics every 10 seconds
    const interval = setInterval(() => {
      if (somniaService.isReady()) {
        const currentMetrics = somniaService.getMetrics();
        setMetrics(currentMetrics);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-400 bg-green-400/20';
      case 'good': return 'text-blue-400 bg-blue-400/20';
      case 'fair': return 'text-yellow-400 bg-yellow-400/20';
      case 'poor': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'fair': return <AlertTriangle className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-12 text-center">
            <Network className="w-16 h-16 mx-auto text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Connect to Somnia</h3>
            <p className="text-slate-400 mb-6">
              Connect your wallet to Somnia Testnet to view real-time blockchain metrics and features.
            </p>
            <Button 
              onClick={() => somniaService.connect()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Connect to Somnia
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Somnia Blockchain Dashboard</h1>
            <p className="text-slate-400">Real-time metrics and Somnia-specific features</p>
          </div>
        </div>
        
        {networkInfo && (
          <div className="flex items-center gap-4">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Network className="w-3 h-3 mr-1" />
              Somnia Testnet
            </Badge>
            <Badge className={`${getHealthColor(networkInfo.isHealthy ? 'excellent' : 'fair')} border-0`}>
              {getHealthIcon(networkInfo.isHealthy ? 'excellent' : 'fair')}
              <span className="ml-1">{networkInfo.isHealthy ? 'Network Healthy' : 'Network Issues'}</span>
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-400">
              Block #{networkInfo.lastBlockNumber}
            </Badge>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Network Performance */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-green-400" />
              Network Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Block Time</span>
              <span className="text-white font-mono">
                {metrics?.blockTime ? `${metrics.blockTime}s` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Throughput</span>
              <span className="text-white font-mono">
                {metrics?.throughputTPS ? `${metrics.throughputTPS.toFixed(0)} TPS` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Gas Price</span>
              <span className="text-white font-mono">
                {metrics?.averageGasPrice ? `${metrics.averageGasPrice} Gwei` : 'N/A'}
              </span>
            </div>
            <Progress 
              value={metrics?.networkHealth === 'excellent' ? 100 : metrics?.networkHealth === 'good' ? 75 : metrics?.networkHealth === 'fair' ? 50 : 25} 
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Transaction Metrics */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Transaction Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Transactions</span>
              <span className="text-white font-mono">
                {metrics?.totalTransactions.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Volume (STT)</span>
              <span className="text-white font-mono">
                {metrics?.totalVolumeSTT ? parseFloat(metrics.totalVolumeSTT).toFixed(4) : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Micro Payments</span>
              <span className="text-white font-mono">
                {metrics?.microPaymentCount.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active Rentals</span>
              <span className="text-white font-mono">
                {metrics?.activeRentals.toLocaleString() || '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Somnia Features */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-purple-400" />
              Somnia Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Sub-second Finality</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Micro-payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Low Gas Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">High Throughput</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Micro-Payment Demo */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Microscope className="w-5 h-5 text-pink-400" />
              Micro-Payment Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">
              Test Somnia's micro-payment capabilities with sub-cent transactions.
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  onClick={() => {
                    // Demo micro-payment
                    console.log('Micro-payment demo clicked');
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Test Micro-Payment
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </div>
              <div className="text-xs text-slate-500">
                Cost: ~0.001 STT • Time: &lt;1 second
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Health */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-green-400" />
              Network Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Overall Health</span>
                <Badge className={`${getHealthColor(metrics?.networkHealth || 'excellent')} border-0`}>
                  {getHealthIcon(metrics?.networkHealth || 'excellent')}
                  <span className="ml-1 capitalize">{metrics?.networkHealth || 'Excellent'}</span>
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Block Time</span>
                  <span className="text-white">{metrics?.blockTime || 0}s</span>
                </div>
                <Progress 
                  value={metrics?.blockTime ? Math.max(0, 100 - (metrics.blockTime * 20)) : 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Throughput</span>
                  <span className="text-white">{metrics?.throughputTPS?.toFixed(0) || 0} TPS</span>
                </div>
                <Progress 
                  value={metrics?.throughputTPS ? Math.min(100, (metrics.throughputTPS / 10)) : 0} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6 bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Somnia Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => {
                // Open block explorer
                window.open('https://shannon-explorer.somnia.network/', '_blank');
              }}
            >
              <Network className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
            
            <Button 
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
              onClick={() => {
                // Refresh metrics
                const currentMetrics = somniaService.getMetrics();
                setMetrics(currentMetrics);
              }}
            >
              <Gauge className="w-4 h-4 mr-2" />
              Refresh Metrics
            </Button>
            
            <Button 
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/10"
              onClick={() => {
                // Test network connection
                somniaService.getNetworkInfo().then(setNetworkInfo);
              }}
            >
              <Activity className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Micro-Payment Demo */}
      <MicroPaymentDemo className="mt-8" />

      {/* Real-Time Events */}
      <RealTimeEvents className="mt-8" />
    </div>
  );
};

export default SomniaDashboard;
