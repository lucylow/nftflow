import { motion } from "framer-motion";
import { Wallet, User, LogOut, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/contexts/Web3Context";

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
    try {
      await connectWallet();
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
      // Switch to local Hardhat network (where contracts are deployed)
      await switchNetwork(1337);
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
      <Button 
        onClick={handleConnect}
        disabled={isConnecting}
        size="sm"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {isConnecting ? (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
          />
        ) : (
          <Wallet className="w-4 h-4 mr-2" />
        )}
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
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
              {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0 ETH'}
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
          title="Switch to Local Hardhat"
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