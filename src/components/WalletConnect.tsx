import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, User, LogOut, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Mock wallet connection state
const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address] = useState("0x1234...5678");
  const [balance] = useState("1,234.56");
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnected(true);
    setIsConnecting(false);
    toast({
      title: "Wallet Connected",
      description: "Successfully connected to MetaMask",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "MetaMask disconnected",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText("0x1234567890abcdef1234567890abcdef12345678");
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
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
              <span className="font-mono text-slate-300">{address}</span>
              <button 
                onClick={copyAddress}
                className="p-1 hover:bg-slate-600 rounded transition-colors"
              >
                <Copy className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="text-xs text-slate-400">
              {balance} STT
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="border-slate-600 text-slate-300"
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