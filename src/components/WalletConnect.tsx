import { motion } from "framer-motion";
import { Wallet, User, LogOut, Copy, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/contexts/Web3Context";
import { LoadingSpinner } from "@/components/ui/skeleton";
import { isMetaMaskInstalled } from "@/lib/web3";

const WalletConnect = () => {
  const { 
    isConnected, 
    isConnecting, 
    account, 
    balance, 
    chainId,
    nftFlowContract,
    connectWallet, 
    disconnectWallet,
    switchNetwork 
  } = useWeb3();
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask browser extension to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "MetaMask disconnected",
    });
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      // Switch to Somnia devnet (Chain ID: 50312)
      await switchNetwork(50312);
    } catch (error: any) {
      toast({
        title: "Network Switch Failed",
        description: error.message || "Failed to switch network",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isConnecting ? (
            <LoadingSpinner size="sm" className="mr-2 text-white" />
          ) : (
            <Wallet className="w-4 h-4 mr-2" />
          )}
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
        {!isMetaMaskInstalled() && (
          <p className="text-xs text-yellow-500 text-center">
            MetaMask not detected
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-slate-300">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
              </span>
              <button 
                onClick={copyAddress}
                className="p-1 hover:bg-slate-600 rounded transition-colors"
              >
                <Copy className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="text-xs text-slate-400">
              {balance ? `${parseFloat(balance).toFixed(4)} ${chainId === 50312 ? 'STT' : 'ETH'}` : `0 ${chainId === 50312 ? 'STT' : 'ETH'}`}
            </div>
            {!nftFlowContract && (
              <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                Contracts not deployed
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSwitchNetwork}
          className="border-slate-600 text-slate-300 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400"
          title="Switch to Somnia Devnet"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDisconnect}
          className="border-slate-600 text-slate-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default WalletConnect;