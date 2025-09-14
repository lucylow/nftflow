import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { SOMNIA_CONFIG, SomniaNetwork } from '@/config/somniaConfig';

interface NetworkStatus {
  connected: boolean;
  chainId: number | null;
  isSomnia: boolean;
  blockNumber: number;
  gasPrice: string;
  latency: number;
  lastUpdate: number;
}

const SomniaNetworkStatus: React.FC = () => {
  const { isConnected, account } = useWeb3();
  const { toast } = useToast();
  
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    connected: false,
    chainId: null,
    isSomnia: false,
    blockNumber: 0,
    gasPrice: '0',
    latency: 0,
    lastUpdate: Date.now()
  });
  
  const [isChecking, setIsChecking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check network status
  const checkNetworkStatus = async () => {
    setIsChecking(true);
    
    try {
      const startTime = Date.now();
      
      // Check if connected to Somnia
      const isSomniaConnected = await SomniaNetwork.isConnected();
      const networkInfo = await SomniaNetwork.getCurrentNetwork();
      
      let blockNumber = 0;
      let gasPrice = '0';
      
      if (window.ethereum && isSomniaConnected) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          blockNumber = await provider.getBlockNumber();
          const feeData = await provider.getFeeData();
          gasPrice = feeData.gasPrice?.toString() || '0';
        } catch (error) {
          console.error('Error fetching network data:', error);
        }
      }
      
      const latency = Date.now() - startTime;
      
      setNetworkStatus({
        connected: isConnected && !!networkInfo,
        chainId: networkInfo?.chainId || null,
        isSomnia: isSomniaConnected,
        blockNumber,
        gasPrice,
        latency,
        lastUpdate: Date.now()
      });
      
    } catch (error) {
      console.error('Network status check failed:', error);
      setNetworkStatus(prev => ({
        ...prev,
        connected: false,
        lastUpdate: Date.now()
      }));
    } finally {
      setIsChecking(false);
    }
  };

  // Switch to Somnia Network
  const handleSwitchToSomnia = async () => {
    try {
      await SomniaNetwork.switchToSomnia();
      toast({
        title: "Network Switch Successful",
        description: "Successfully connected to Somnia Network",
      });
      setTimeout(checkNetworkStatus, 1000);
    } catch (error) {
      console.error('Failed to switch to Somnia:', error);
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch to Somnia Network. Please try manually.",
        variant: "destructive",
      });
    }
  };

  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh) {
      checkNetworkStatus();
      const interval = setInterval(checkNetworkStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isConnected]);

  // Initial check
  useEffect(() => {
    checkNetworkStatus();
  }, [isConnected]);

  const getStatusColor = () => {
    if (!networkStatus.connected) return 'text-red-500 bg-red-500/10';
    if (!networkStatus.isSomnia) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  const getStatusIcon = () => {
    if (!networkStatus.connected) return <WifiOff className="w-4 h-4" />;
    if (!networkStatus.isSomnia) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!networkStatus.connected) return 'Disconnected';
    if (!networkStatus.isSomnia) return 'Wrong Network';
    return 'Connected to Somnia';
  };

  const formatGasPrice = (gasPrice: string) => {
    try {
      const gwei = parseFloat(gasPrice) / 1e9;
      return gwei.toFixed(3);
    } catch {
      return '0.000';
    }
  };

  const getLatencyStatus = (latency: number) => {
    if (latency < 100) return { color: 'text-green-500', status: 'Excellent' };
    if (latency < 300) return { color: 'text-blue-500', status: 'Good' };
    if (latency < 1000) return { color: 'text-yellow-500', status: 'Fair' };
    return { color: 'text-red-500', status: 'Poor' };
  };

  const latencyStatus = getLatencyStatus(networkStatus.latency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Somnia Network Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
                Auto Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={checkNetworkStatus}
                disabled={isChecking}
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${getStatusColor()}`}>
                {getStatusIcon()}
              </div>
              <div>
                <div className="font-semibold">{getStatusText()}</div>
                <div className="text-sm text-muted-foreground">
                  {networkStatus.chainId ? `Chain ID: ${networkStatus.chainId}` : 'No network detected'}
                </div>
              </div>
            </div>
            
            {!networkStatus.isSomnia && networkStatus.connected && (
              <Button onClick={handleSwitchToSomnia} size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Switch to Somnia
              </Button>
            )}
          </div>

          {/* Network Metrics */}
          {networkStatus.isSomnia && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">
                  {networkStatus.blockNumber.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Block Number</div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">
                  {formatGasPrice(networkStatus.gasPrice)}
                </div>
                <div className="text-sm text-muted-foreground">Gas Price (Gwei)</div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className={`text-2xl font-bold ${latencyStatus.color}`}>
                  {networkStatus.latency}ms
                </div>
                <div className="text-sm text-muted-foreground">Latency</div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <Badge variant="outline" className="text-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Network Status</div>
              </div>
            </div>
          )}

          {/* Somnia Network Advantages */}
          {networkStatus.isSomnia && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <div className="text-sm font-semibold text-primary mb-2">
                Connected to Somnia Network
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-bold text-green-500">1M+ TPS</div>
                  <div className="text-muted-foreground">Throughput</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-500">&lt;100ms</div>
                  <div className="text-muted-foreground">Block Time</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-500">&lt;$0.01</div>
                  <div className="text-muted-foreground">Tx Cost</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-500">&lt;1s</div>
                  <div className="text-muted-foreground">Finality</div>
                </div>
              </div>
            </div>
          )}

          {/* Connection Instructions */}
          {!networkStatus.connected && (
            <div className="p-4 rounded-lg bg-muted/50 border border-muted">
              <div className="text-sm font-semibold mb-2">
                Connect to Somnia Network
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>1. Connect your wallet (MetaMask recommended)</p>
                <p>2. Add Somnia Network to your wallet</p>
                <p>3. Switch to Somnia Network</p>
                <p>4. Start enjoying ultra-fast, low-cost transactions</p>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {new Date(networkStatus.lastUpdate).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SomniaNetworkStatus;