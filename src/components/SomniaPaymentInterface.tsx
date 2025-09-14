import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Activity,
  Gauge
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { SOMNIA_CONFIG, SomniaUtils } from '@/config/somniaConfig';

interface SomniaPaymentInterfaceProps {
  nft: {
    contractAddress: string;
    tokenId: string;
    owner: string;
    name: string;
    image: string;
    pricePerSecond: number;
  };
  duration: number;
  onPaymentComplete: (result: any) => void;
}

const SomniaPaymentInterface: React.FC<SomniaPaymentInterfaceProps> = ({ 
  nft, 
  duration, 
  onPaymentComplete 
}) => {
  const [priceInfo, setPriceInfo] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRenting, setIsRenting] = useState(false);
  const [usdAmount, setUsdAmount] = useState(0);
  const [gasRecommendations, setGasRecommendations] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkStats, setNetworkStats] = useState({
    currentTPS: 0,
    blockTime: 0,
    gasPrice: '0',
    networkLoad: 0
  });
  
  const { isConnected, account, balance } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    if (nft && duration && isConnected) {
      calculateRentalCost();
      loadUserStats();
      loadGasRecommendations();
      loadNetworkStats();
    }
  }, [nft, duration, isConnected, account]);

  // Real-time network stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadNetworkStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const calculateRentalCost = async () => {
    setIsCalculating(true);
    setError(null);
    
    try {
      // Mock calculation for now - replace with actual service
      const pricePerSecond = nft.pricePerSecond || 0.000001; // ETH per second
      const totalCost = pricePerSecond * duration;
      const gasCost = parseFloat(SomniaUtils.calculateGasCost(200000));
      const totalWithGas = totalCost + gasCost;
      
      const costInfo = {
        pricePerSecond: SomniaUtils.sttToWei(pricePerSecond.toString()),
        totalCost: SomniaUtils.sttToWei(totalCost.toString()),
        gasCost: SomniaUtils.sttToWei(gasCost.toString()),
        totalWithGas: SomniaUtils.sttToWei(totalWithGas.toString())
      };
      
      setPriceInfo(costInfo);
      
      // Mock USD conversion
      setUsdAmount(totalWithGas * 2000); // Assuming 1 STT = $2000
    } catch (error) {
      console.error('Error calculating cost:', error);
      setError('Failed to calculate rental cost');
    } finally {
      setIsCalculating(false);
    }
  };

  const loadUserStats = async () => {
    if (!account) return;
    
    try {
      // Mock user stats
      const stats = {
        totalSpent: '5.234567',
        totalEarned: '12.789123',
        totalRentals: 23,
        successRate: 96.5
      };
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadGasRecommendations = async () => {
    try {
      const recommendations = {
        slow: '0.1',
        standard: '0.5',
        fast: '1.0'
      };
      setGasRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading gas recommendations:', error);
    }
  };

  const loadNetworkStats = async () => {
    try {
      // Mock real-time network stats
      const stats = {
        currentTPS: Math.floor(Math.random() * 50000) + 100000,
        blockTime: Math.floor(Math.random() * 50) + 50,
        gasPrice: (Math.random() * 0.5 + 0.1).toFixed(3),
        networkLoad: Math.floor(Math.random() * 30) + 10
      };
      setNetworkStats(stats);
    } catch (error) {
      console.error('Error loading network stats:', error);
    }
  };

  const handleRent = async () => {
    if (!priceInfo || !account) return;
    
    setIsRenting(true);
    setError(null);
    
    try {
      // Check if user has sufficient balance
      const userBalance = parseFloat(balance || '0');
      const totalCost = parseFloat(SomniaUtils.weiToSTT(priceInfo.totalWithGas));
      
      if (userBalance < totalCost) {
        throw new Error('Insufficient STT balance');
      }
      
      toast({
        title: "Processing Rental",
        description: "Your rental is being processed on Somnia Network...",
      });
      
      // Simulate rental process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        rentalId: `rental_${Date.now()}`,
        nft: nft,
        duration: duration,
        cost: priceInfo.totalWithGas
      };
      
      toast({
        title: "Rental Successful",
        description: "Your NFT rental has been confirmed!",
      });
      
      onPaymentComplete(result);
      await loadUserStats();
      
    } catch (error) {
      console.error('Rental failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Rental failed';
      setError(errorMessage);
      toast({
        title: "Rental Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRenting(false);
    }
  };

  const formatSTT = (amount: string) => {
    const sttAmount = SomniaUtils.weiToSTT(amount);
    return parseFloat(sttAmount).toFixed(6);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Error</span>
          </div>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={calculateRentalCost} variant="destructive">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-xl">Somnia Network Rental</div>
              <div className="text-sm text-muted-foreground font-normal">
                Ultra-fast, sub-cent transactions
              </div>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Activity className="w-3 h-3 mr-1" />
              Live Network
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Network Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Real-time Network Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {networkStats.currentTPS.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">TPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {networkStats.blockTime}ms
              </div>
              <div className="text-xs text-muted-foreground">Block Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {networkStats.gasPrice}
              </div>
              <div className="text-xs text-muted-foreground">Gwei</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {networkStats.networkLoad}%
              </div>
              <div className="text-xs text-muted-foreground">Load</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Rental Details */}
      {isCalculating ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Calculating costs...</span>
            </div>
          </CardContent>
        </Card>
      ) : priceInfo ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Rental Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-mono text-primary">
                  {formatDuration(duration)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price per second:</span>
                <span className="font-mono">
                  {formatSTT(priceInfo.pricePerSecond)} STT
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rental cost:</span>
                <span className="font-mono text-primary text-lg">
                  {formatSTT(priceInfo.totalCost)} STT
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Network fee:</span>
                <span className="font-mono text-muted-foreground">
                  {formatSTT(priceInfo.gasCost)} STT
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Total with fees:</span>
                  <span className="font-mono text-primary font-bold text-xl">
                    {formatSTT(priceInfo.totalWithGas)} STT
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-muted-foreground">Approx USD:</span>
                  <span className="text-muted-foreground">${usdAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* User Balance & Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Your Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Your balance:</span>
                <span className="font-mono text-lg">
                  {balance || '0.000000'} STT
                </span>
              </div>
              
              {userStats && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total spent:</div>
                    <div className="font-mono">{userStats.totalSpent} STT</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total earned:</div>
                    <div className="font-mono text-green-500">{userStats.totalEarned} STT</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Rentals:</div>
                    <div className="font-mono">{userStats.totalRentals}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Success rate:</div>
                    <div className="font-mono">{userStats.successRate}%</div>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-2">
                  Balance after rental: {balance ? (parseFloat(balance) - parseFloat(formatSTT(priceInfo.totalWithGas))).toFixed(6) : '0.000000'} STT
                </div>
                <Progress 
                  value={balance ? Math.min(100, (parseFloat(formatSTT(priceInfo.totalWithGas)) / parseFloat(balance)) * 100) : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Gas Price Info */}
          {gasRecommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Gas Price Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground">Slow</div>
                    <div className="font-mono">{gasRecommendations.slow} gwei</div>
                  </div>
                  <div className="text-center">
                    <div className="text-primary">Standard</div>
                    <div className="font-mono text-primary">{gasRecommendations.standard} gwei</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-500">Fast</div>
                    <div className="font-mono text-green-500">{gasRecommendations.fast} gwei</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Action Button */}
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={handleRent}
                disabled={
                  !balance || 
                  parseFloat(balance) < parseFloat(formatSTT(priceInfo.totalWithGas)) ||
                  isRenting ||
                  !isConnected
                }
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isRenting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Processing on Somnia...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Rent with {formatSTT(priceInfo.totalWithGas)} STT</span>
                  </div>
                )}
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Powered by Somnia Network • Sub-second confirmation • Ultra-low fees
                </p>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    1M+ TPS
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    &lt;100ms
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <DollarSign className="w-3 h-3" />
                    &lt;$0.01
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse text-muted-foreground">
              Calculating rental cost...
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default SomniaPaymentInterface;
