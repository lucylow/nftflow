import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBlockNumber, useFeeData } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  Database, 
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import SomniaService, { type NetworkStats } from '@/services/somniaService';

interface NetworkMetricProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit: string;
  description: string;
  status?: 'good' | 'warning' | 'critical';
}

const NetworkMetric: React.FC<NetworkMetricProps> = ({ 
  icon, 
  title, 
  value, 
  unit, 
  description, 
  status = 'good' 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-cyan-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 p-4 rounded-lg border border-slate-700"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-cyan-400">{icon}</div>
        <div className="text-sm text-slate-400">{title}</div>
        {getStatusIcon()}
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <div className={`text-2xl font-bold ${getStatusColor()}`}>{value}</div>
        <div className="text-sm text-slate-500">{unit}</div>
      </div>
      <div className="text-xs text-slate-500">{description}</div>
    </motion.div>
  );
};

const SomniaNetworkMonitor: React.FC = () => {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    tps: 0,
    blockTime: 0,
    gasPrice: 0,
    pendingTransactions: 0,
    blockNumber: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    chainId: 50312, // Somnia Testnet
  });
  
  const { data: feeData } = useFeeData({
    watch: true,
    chainId: 50312,
    formatUnits: 'gwei',
  });

  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        const somniaService = new SomniaService();
        const stats = await somniaService.getNetworkStats();
        
        setNetworkStats(stats);
        setLastUpdate(new Date());
        setUpdateCount(prev => prev + 1);
        setIsConnected(true);
      } catch (error) {
        console.error('Error fetching network stats:', error);
        setIsConnected(false);
      }
    };

    fetchNetworkStats();
    const interval = setInterval(fetchNetworkStats, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, [blockNumber, feeData]);

  const getTPSStatus = (tps: number): 'good' | 'warning' | 'critical' => {
    if (tps > 1000) return 'good';
    if (tps > 100) return 'warning';
    return 'critical';
  };

  const getBlockTimeStatus = (blockTime: number): 'good' | 'warning' | 'critical' => {
    if (blockTime < 1000) return 'good'; // Sub-second
    if (blockTime < 5000) return 'warning';
    return 'critical';
  };

  const getGasPriceStatus = (gasPrice: number): 'good' | 'warning' | 'critical' => {
    if (gasPrice < 1) return 'good'; // Very low gas
    if (gasPrice < 10) return 'warning';
    return 'critical';
  };

  const getPendingTxStatus = (pendingTx: number): 'good' | 'warning' | 'critical' => {
    if (pendingTx < 100) return 'good';
    if (pendingTx < 500) return 'warning';
    return 'critical';
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-cyan-500/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Somnia Network Live Monitor
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-slate-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Updates: {updateCount}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <NetworkMetric
          icon={<TrendingUp className="w-5 h-5" />}
          title="Transactions per Second"
          value={networkStats.tps.toFixed(1)}
          unit="TPS"
          description="Real-time throughput"
          status={getTPSStatus(networkStats.tps)}
        />
        
        <NetworkMetric
          icon={<Clock className="w-5 h-5" />}
          title="Block Time"
          value={networkStats.blockTime.toFixed(0)}
          unit="ms"
          description="Average block time"
          status={getBlockTimeStatus(networkStats.blockTime)}
        />
        
        <NetworkMetric
          icon={<Database className="w-5 h-5" />}
          title="Gas Price"
          value={networkStats.gasPrice.toFixed(2)}
          unit="Gwei"
          description="Current gas price"
          status={getGasPriceStatus(networkStats.gasPrice)}
        />
        
        <NetworkMetric
          icon={<Activity className="w-5 h-5" />}
          title="Pending Tx"
          value={networkStats.pendingTransactions}
          unit=""
          description="Transactions in mempool"
          status={getPendingTxStatus(networkStats.pendingTransactions)}
        />
      </div>
      
      {/* Real-time block number display */}
      <Card className="bg-slate-900/50 border-slate-700 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Database className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-slate-400 text-sm">Current Block</div>
                <motion.div
                  key={blockNumber}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-mono text-cyan-400 text-lg"
                >
                  #{blockNumber?.toString()}
                </motion.div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-sm">Last Update</div>
              <div className="text-cyan-400 text-sm">{formatTimeAgo(lastUpdate)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Network Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Throughput</span>
                <Badge 
                  variant={getTPSStatus(networkStats.tps) === 'good' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {getTPSStatus(networkStats.tps) === 'good' ? 'Excellent' : 
                   getTPSStatus(networkStats.tps) === 'warning' ? 'Good' : 'Poor'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Latency</span>
                <Badge 
                  variant={getBlockTimeStatus(networkStats.blockTime) === 'good' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {getBlockTimeStatus(networkStats.blockTime) === 'good' ? 'Sub-second' : 
                   getBlockTimeStatus(networkStats.blockTime) === 'warning' ? 'Fast' : 'Slow'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Cost Efficiency</span>
                <Badge 
                  variant={getGasPriceStatus(networkStats.gasPrice) === 'good' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {getGasPriceStatus(networkStats.gasPrice) === 'good' ? 'Ultra Low' : 
                   getGasPriceStatus(networkStats.gasPrice) === 'warning' ? 'Low' : 'High'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Somnia Advantages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">1M+ TPS Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">Sub-second Finality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">Sub-cent Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">EVM Compatible</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Real-time Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Update Frequency</span>
                <span className="text-sm text-cyan-400">2s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Data Freshness</span>
                <span className="text-sm text-cyan-400">Live</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Connection</span>
                <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SomniaNetworkMonitor;
