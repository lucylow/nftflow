import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from '@/hooks/use-toast';

interface MicroPaymentDemoProps {
  className?: string;
}

const MicroPaymentDemo: React.FC<MicroPaymentDemoProps> = ({ className }) => {
  const { 
    isConnected, 
    createMicroRental, 
    createPaymentStream,
    getSomniaMetrics 
  } = useWeb3();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nftContract: '0x1234567890123456789012345678901234567890',
    tokenId: '1',
    pricePerSecond: '0.001',
    duration: '60'
  });

  const handleMicroRental = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to Somnia Testnet first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const txHash = await createMicroRental(
        formData.nftContract,
        formData.tokenId,
        formData.pricePerSecond,
        parseInt(formData.duration)
      );
      
      setLastTransaction(txHash);
      
      toast({
        title: "Micro-Rental Created!",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to create micro-rental",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentStream = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to Somnia Testnet first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const txHash = await createPaymentStream(
        '0x1234567890123456789012345678901234567890', // recipient
        '0.01', // amount
        3600 // 1 hour duration
      );
      
      setLastTransaction(txHash);
      
      toast({
        title: "Payment Stream Created!",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to create payment stream",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const metrics = getSomniaMetrics();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Somnia Micro-Payments</h2>
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <p className="text-slate-400">
          Experience Somnia's ultra-low fees and lightning-fast transactions
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Network Status</span>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-white font-medium">Disconnected</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Gas Price</span>
            </div>
            <span className="text-white font-medium">
              {metrics?.averageGasPrice ? `${metrics.averageGasPrice} Gwei` : 'N/A'}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-400">Block Time</span>
            </div>
            <span className="text-white font-medium">
              {metrics?.blockTime ? `${metrics.blockTime}s` : 'N/A'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Demo Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Micro-Rental Demo */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-yellow-400" />
              Micro-Rental Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nftContract" className="text-slate-300">
                NFT Contract Address
              </Label>
              <Input
                id="nftContract"
                value={formData.nftContract}
                onChange={(e) => setFormData({ ...formData, nftContract: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="0x..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tokenId" className="text-slate-300">
                  Token ID
                </Label>
                <Input
                  id="tokenId"
                  value={formData.tokenId}
                  onChange={(e) => setFormData({ ...formData, tokenId: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-slate-300">
                  Duration (seconds)
                </Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pricePerSecond" className="text-slate-300">
                Price per Second (STT)
              </Label>
              <Input
                id="pricePerSecond"
                value={formData.pricePerSecond}
                onChange={(e) => setFormData({ ...formData, pricePerSecond: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            
            <Button
              onClick={handleMicroRental}
              disabled={isProcessing || !isConnected}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Create Micro-Rental
                </>
              )}
            </Button>
            
            <div className="text-xs text-slate-500 text-center">
              Cost: ~{(parseFloat(formData.pricePerSecond) * parseInt(formData.duration)).toFixed(6)} STT
            </div>
          </CardContent>
        </Card>

        {/* Payment Stream Demo */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ArrowRight className="w-5 h-5 text-green-400" />
              Payment Stream Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Recipient</span>
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  0x1234...7890
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Amount</span>
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  0.01 STT
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Duration</span>
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  1 Hour
                </Badge>
              </div>
            </div>
            
            <Button
              onClick={handlePaymentStream}
              disabled={isProcessing || !isConnected}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Create Payment Stream
                </>
              )}
            </Button>
            
            <div className="text-xs text-slate-500 text-center">
              Real-time streaming payments with Somnia's low fees
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      {lastTransaction && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Last Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300 font-mono text-sm">
                {lastTransaction}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto border-slate-600 text-slate-400 hover:bg-slate-700"
                onClick={() => {
                  window.open(`https://shannon-explorer.somnia.network/tx/${lastTransaction}`, '_blank');
                }}
              >
                View on Explorer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Highlight */}
      <Card className="bg-gradient-to-r from-purple-800/20 to-pink-800/20 border-purple-500/50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Why Somnia for Micro-Payments?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">Sub-cent transaction fees</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">Sub-second finality</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">High throughput (1M+ TPS)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">Real-time payment streaming</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MicroPaymentDemo;


