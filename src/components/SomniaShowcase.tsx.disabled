import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Clock, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Gauge,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from '@/hooks/use-toast';

interface SomniaStats {
  totalMicroTransactions: number;
  totalHighFrequencyEvents: number;
  totalRealTimeStreams: number;
  totalValueProcessed: string;
}

interface StreamData {
  id: number;
  streamer: string;
  recipient: string;
  totalAmount: string;
  startTime: number;
  endTime: number;
  streamedAmount: string;
  isActive: boolean;
}

const SomniaShowcase: React.FC = () => {
  const { account, contract } = useWeb3();
  const [stats, setStats] = useState<SomniaStats | null>(null);
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStreams, setActiveStreams] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (account && contract) {
      loadSomniaData();
    }
  }, [account, contract]);

  const loadSomniaData = async () => {
    try {
      if (contract?.somniaOptimizedFeatures) {
        const platformStats = await contract.somniaOptimizedFeatures.getPlatformStats();
        setStats({
          totalMicroTransactions: Number(platformStats.totalMicroTransactions),
          totalHighFrequencyEvents: Number(platformStats.totalHighFrequencyEvents),
          totalRealTimeStreams: Number(platformStats.totalRealTimeStreams),
          totalValueProcessed: platformStats.totalValueProcessed.toString()
        });
      }
    } catch (error) {
      console.error('Error loading Somnia data:', error);
    }
  };

  const demonstrateMicroTransaction = async () => {
    if (!account || !contract?.somniaOptimizedFeatures) return;
    
    setLoading(true);
    try {
      const tx = await contract.somniaOptimizedFeatures.createMicroTransaction(
        account, // Send to self for demo
        "Somnia micro-transaction demonstration",
        { value: '1000000000000000' } // 0.001 ETH
      );
      
      await tx.wait();
      
      toast({
        title: "Micro-transaction created!",
        description: "Demonstrating Somnia's sub-cent transaction fees",
      });
      
      loadSomniaData();
    } catch (error) {
      console.error('Error creating micro-transaction:', error);
      toast({
        title: "Error",
        description: "Failed to create micro-transaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const demonstrateSubSecondFinality = async () => {
    if (!account || !contract?.somniaOptimizedFeatures) return;
    
    setLoading(true);
    try {
      const startTime = Date.now();
      
      const tx = await contract.somniaOptimizedFeatures.demonstrateSubSecondFinality(
        { value: '1000000000000000' } // 0.001 ETH
      );
      
      await tx.wait();
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      toast({
        title: "Sub-second finality demonstrated!",
        description: `Transaction processed in ${processingTime}ms`,
      });
      
      loadSomniaData();
    } catch (error) {
      console.error('Error demonstrating sub-second finality:', error);
      toast({
        title: "Error",
        description: "Failed to demonstrate sub-second finality",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRealTimeStream = async () => {
    if (!account || !contract?.somniaOptimizedFeatures) return;
    
    setLoading(true);
    try {
      const duration = 60; // 60 seconds
      const tx = await contract.somniaOptimizedFeatures.createRealTimeStream(
        account, // Stream to self for demo
        duration,
        { value: '100000000000000000' } // 0.1 ETH
      );
      
      await tx.wait();
      
      toast({
        title: "Real-time stream created!",
        description: `Streaming 0.1 ETH over ${duration} seconds`,
      });
      
      loadSomniaData();
    } catch (error) {
      console.error('Error creating real-time stream:', error);
      toast({
        title: "Error",
        description: "Failed to create real-time stream",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStream = async (streamId: number) => {
    if (!contract?.somniaOptimizedFeatures) return;
    
    try {
      const tx = await contract.somniaOptimizedFeatures.updateRealTimeStream(streamId);
      await tx.wait();
      
      toast({
        title: "Stream updated!",
        description: "Real-time payment streaming in action",
      });
      
      loadSomniaData();
    } catch (error) {
      console.error('Error updating stream:', error);
    }
  };

  const formatValue = (value: string) => {
    return `${(Number(value) / 1e18).toFixed(6)} ETH`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Somnia Capabilities Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Micro Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMicroTransactions.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sub-cent fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Frequency Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalHighFrequencyEvents.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              1M+ TPS ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real-time Streams</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRealTimeStreams.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sub-second finality
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalValueProcessed ? formatValue(stats.totalValueProcessed) : '0 ETH'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total volume
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Somnia Capabilities Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Somnia Capabilities Demo
            </CardTitle>
            <CardDescription>
              Experience Somnia's unique features in action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <h4 className="font-medium text-blue-800">Sub-cent Micro Transactions</h4>
                  <p className="text-sm text-blue-600">Create micro-transactions with minimal fees</p>
                </div>
                <Button 
                  onClick={demonstrateMicroTransaction} 
                  disabled={loading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Demo
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <h4 className="font-medium text-green-800">Sub-second Finality</h4>
                  <p className="text-sm text-green-600">Experience lightning-fast transaction confirmation</p>
                </div>
                <Button 
                  onClick={demonstrateSubSecondFinality} 
                  disabled={loading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Gauge className="h-4 w-4 mr-2" />
                  Demo
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <h4 className="font-medium text-purple-800">Real-time Streaming</h4>
                  <p className="text-sm text-purple-600">Create payment streams that update every second</p>
                </div>
                <Button 
                  onClick={createRealTimeStream} 
                  disabled={loading}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Real-time performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transaction Speed</span>
                <Badge className="bg-green-100 text-green-800">Sub-second</Badge>
              </div>
              <Progress value={100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Fee Efficiency</span>
                <Badge className="bg-blue-100 text-blue-800">Sub-cent</Badge>
              </div>
              <Progress value={100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Throughput Capacity</span>
                <Badge className="bg-purple-100 text-purple-800">1M+ TPS</Badge>
              </div>
              <Progress value={100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Network Uptime</span>
                <Badge className="bg-green-100 text-green-800">99.9%</Badge>
              </div>
              <Progress value={99.9} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Somnia Network Specifications
          </CardTitle>
          <CardDescription>
            Technical capabilities that make NFTFlow possible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Throughput:</span>
                  <span className="font-medium">1M+ TPS</span>
                </div>
                <div className="flex justify-between">
                  <span>Finality:</span>
                  <span className="font-medium">&lt;1 second</span>
                </div>
                <div className="flex justify-between">
                  <span>Block Time:</span>
                  <span className="font-medium">~100ms</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Economics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Transaction Fees:</span>
                  <span className="font-medium">&lt;$0.01</span>
                </div>
                <div className="flex justify-between">
                  <span>Gas Price:</span>
                  <span className="font-medium">~1 gwei</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Cost:</span>
                  <span className="font-medium">Minimal</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>EVM Compatible:</span>
                  <span className="font-medium">✓ Yes</span>
                </div>
                <div className="flex justify-between">
                  <span>Smart Contracts:</span>
                  <span className="font-medium">✓ Full Support</span>
                </div>
                <div className="flex justify-between">
                  <span>Micro-transactions:</span>
                  <span className="font-medium">✓ Native</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={loadSomniaData} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
        <Button onClick={() => window.open('https://somnia.network', '_blank')}>
          Learn More About Somnia
        </Button>
      </div>
    </div>
  );
};

export default SomniaShowcase;
