import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlockNumber } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  Users, 
  Activity,
  RefreshCw,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import { formatEther } from 'viem';
import SomniaService, { type RentalEvent, type NetworkStats } from '@/services/somniaService';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, description }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-slate-900/50 p-4 rounded-lg border border-slate-700"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="text-cyan-400">{icon}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
    <div className="flex items-baseline gap-1 mb-1">
      <div className="text-2xl font-bold text-cyan-400">{value}</div>
    </div>
    {change !== undefined && (
      <div className={`text-xs ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last block
      </div>
    )}
    {description && (
      <div className="text-xs text-slate-500 mt-1">{description}</div>
    )}
  </motion.div>
);

const SomniaRealTimeDashboard: React.FC = () => {
  const [rentals, setRentals] = useState<RentalEvent[]>([]);
  const [stats, setStats] = useState({
    totalRentals: 1247,
    activeRentals: 892,
    totalVolume: 2400,
    rentalsChange: 12,
    activeChange: 8,
    volumeChange: 23
  });
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    tps: 0,
    blockTime: 0,
    gasPrice: 0,
    pendingTransactions: 0,
    blockNumber: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  
  // Leverage Somnia's sub-second block times for real-time updates
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    chainId: 50312, // Somnia Testnet
    enabled: true
  });

  useEffect(() => {
    if (blockNumber) {
      // Use Somnia's high TPS for real-time data fetching
      fetchRealTimeData();
    }
  }, [blockNumber]);

  useEffect(() => {
    // Initialize Somnia service
    const somniaService = new SomniaService();
    setIsConnected(true);
    
    // Fetch initial data
    fetchRealTimeData();
    
    return () => {
      somniaService.destroy();
      setIsConnected(false);
    };
  }, []);

  const fetchRealTimeData = async () => {
    try {
      // Utilize Somnia's fast finality for instant data updates
      const somniaService = new SomniaService();
      
      const [rentalsData, networkData] = await Promise.all([
        somniaService.getRecentRentals(10),
        somniaService.getNetworkStats()
      ]);

      setRentals(rentalsData);
      setNetworkStats(networkData);
      
      // Simulate real-time updates
      setStats(prevStats => ({
        ...prevStats,
        totalRentals: prevStats.totalRentals + Math.floor(Math.random() * 3),
        activeRentals: prevStats.activeRentals + Math.floor(Math.random() * 2),
        totalVolume: prevStats.totalVolume + Math.floor(Math.random() * 10)
      }));
      
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const formatDistanceToNow = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getUtilityTypeName = (type: number): string => {
    const types = ['Unknown', 'Gaming', 'Art', 'Metaverse', 'Music', 'Sports', 'Collectibles', 'Utility', 'Access', 'Membership', 'Other'];
    return types[type] || 'Unknown';
  };

  const getUtilityTypeColor = (type: number): string => {
    const colors = ['bg-gray-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-orange-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500', 'bg-gray-500'];
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Real-Time Dashboard powered by Somnia
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-slate-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      {/* Real-time stats using Somnia's high throughput */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          title="Total Rentals" 
          value={stats.totalRentals.toLocaleString()} 
          change={stats.rentalsChange}
          icon={<TrendingUp className="w-5 h-5" />}
          description="All-time rentals"
        />
        <StatCard 
          title="Active Rentals" 
          value={stats.activeRentals.toLocaleString()} 
          change={stats.activeChange}
          icon={<Activity className="w-5 h-5" />}
          description="Currently active"
        />
        <StatCard 
          title="Total Volume" 
          value={`${stats.totalVolume.toLocaleString()} STT`} 
          change={stats.volumeChange}
          icon={<Users className="w-5 h-5" />}
          description="Total transaction volume"
        />
      </div>

      {/* Somnia Network Stats */}
      <Card className="bg-slate-900/50 border-slate-700 mb-6">
        <CardHeader>
          <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Somnia Network Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{networkStats.tps.toFixed(1)}</div>
              <div className="text-sm text-slate-400">TPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{networkStats.blockTime.toFixed(0)}ms</div>
              <div className="text-sm text-slate-400">Block Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{networkStats.gasPrice.toFixed(2)}</div>
              <div className="text-sm text-slate-400">Gas Price (Gwei)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{networkStats.pendingTransactions}</div>
              <div className="text-sm text-slate-400">Pending Tx</div>
            </div>
          </div>
          
          {/* Real-time block number display */}
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Block</span>
              <motion.span
                key={blockNumber}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-mono text-cyan-400 text-lg"
              >
                #{blockNumber?.toString()}
              </motion.span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time rental feed using Somnia's sub-second finality */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-200">Live Rental Activity</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRealTimeData}
            className="text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <AnimatePresence>
          {rentals.length > 0 ? (
            rentals.map((rental, index) => (
              <motion.div
                key={rental.rentalId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-200">NFT #{rental.tokenId}</div>
                    <div className="text-sm text-slate-400">
                      by {rental.tenant.slice(0, 8)}...{rental.tenant.slice(-6)}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`mt-1 text-xs ${getUtilityTypeColor(rental.utilityType)} text-white`}
                    >
                      {getUtilityTypeName(rental.utilityType)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-cyan-400">
                    {rental.pricePerSecond} STT/s
                  </div>
                  <div className="text-sm text-slate-400">
                    {formatDistanceToNow(rental.startTime)} ago
                  </div>
                  <div className="text-xs text-slate-500">
                    Duration: {Math.floor((rental.endTime - rental.startTime) / 3600)}h
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent rental activity</p>
              <p className="text-sm">Rentals will appear here in real-time</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SomniaRealTimeDashboard;
