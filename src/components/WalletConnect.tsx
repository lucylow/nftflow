import { motion } from "framer-motion";
import { Wallet, User, LogOut, Copy, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/contexts/Web3Context-minimal";
import { LoadingSpinner } from "@/components/ui/skeleton";
import { isMetaMaskInstalled, getCurrentNetwork } from "@/lib/web3";

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
      console.log('🔌 Attempting to connect wallet...');
      await connectWallet();
      
      // Check if we're on the right network
      if (chainId && chainId !== 50312) {
        toast({
          title: "Wallet Connected",
          description: "Connected to MetaMask, but please switch to Somnia Testnet for full functionality",
          variant: "default",
        });
      } else {
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask on Somnia Testnet",
        });
      }
    } catch (error: unknown) {
      console.error('❌ Wallet connection failed:', error);
      
      let errorMessage = "Failed to connect wallet";
      
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Connection cancelled by user";
        } else if (error.message.includes("MetaMask not installed")) {
          errorMessage = "MetaMask not installed. Please install MetaMask browser extension";
        } else if (error.message.includes("network")) {
          errorMessage = "Network connection failed. Please check your internet connection";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
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
      console.log('🌐 Attempting to switch to Somnia Testnet...');
      await switchNetwork(50312);
      toast({
        title: "Network Switched",
        description: "Successfully connected to Somnia Testnet",
      });
    } catch (error: unknown) {
      console.error('❌ Network switch failed:', error);
      
      let errorMessage = "Failed to switch network";
      
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Network switch cancelled by user";
        } else if (error.message.includes("not found")) {
          errorMessage = "Somnia Testnet not found in MetaMask. Please add it manually";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Network Switch Failed",
        description: errorMessage,
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
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          title={!isMetaMaskInstalled() ? "Install MetaMask to connect wallet" : "Connect your MetaMask wallet"}
        >
          {isConnecting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2 text-white" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
        {!isMetaMaskInstalled() && (
          <div className="text-center">
            <p className="text-xs text-yellow-500 mb-1">
              MetaMask not detected
            </p>
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Install MetaMask
            </a>
          </div>
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
                title="Copy wallet address"
              >
                <Copy className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="text-xs text-slate-400">
              {balance ? `${parseFloat(balance).toFixed(4)} ${chainId === 50312 ? 'STT' : 'ETH'}` : `0 ${chainId === 50312 ? 'STT' : 'ETH'}`}
            </div>
            <div className="flex items-center gap-2">
              {chainId === 50312 ? (
                <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Somnia Testnet
                </div>
              ) : (
                <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Wrong Network
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-2">
        {chainId !== 50312 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSwitchNetwork}
            className="border-slate-600 text-slate-300 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400"
            title="Switch to Somnia Testnet"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDisconnect}
          className="border-slate-600 text-slate-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400"
          title="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default WalletConnect;