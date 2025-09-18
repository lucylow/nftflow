import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWeb3 } from '@/contexts/Web3Context-minimal';
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletTest = () => {
  const { 
    isConnected, 
    isConnecting, 
    account, 
    balance, 
    chainId, 
    isBlockchainReady,
    serviceStatus,
    connectWallet, 
    disconnectWallet,
    refreshBalance,
    switchNetwork
  } = useWeb3();
  const { toast } = useToast();

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
      await switchNetwork(50312);
      toast({
        title: "Network Switched",
        description: "Successfully connected to Somnia Testnet",
      });
    } catch (error: unknown) {
      toast({
        title: "Network Switch Failed",
        description: error instanceof Error ? error.message : "Failed to switch network",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Wallet Connection Test</h1>
        <p className="text-gray-400">Test and verify wallet connection functionality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wallet className="w-5 h-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Wallet Status</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Blockchain Ready</span>
              <Badge variant={isBlockchainReady ? "default" : "secondary"}>
                {isBlockchainReady ? "Ready" : "Not Ready"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Service Status</span>
              <div className="flex gap-2">
                <Badge variant={serviceStatus.blockchain ? "default" : "secondary"}>
                  Blockchain
                </Badge>
                <Badge variant={serviceStatus.mock ? "default" : "secondary"}>
                  Mock
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              {!isConnected ? (
                <Button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={disconnectWallet}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  Disconnect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <>
                <div>
                  <label className="text-sm text-gray-300">Address</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-slate-900/50 px-2 py-1 rounded flex-1">
                      {account}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="p-1"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Balance</label>
                  <div className="text-lg font-mono text-white mt-1">
                    {balance ? `${parseFloat(balance).toFixed(4)} ${chainId === 50312 ? 'STT' : 'ETH'}` : '0'}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Network</label>
                  <div className="flex items-center gap-2 mt-1">
                    {chainId === 50312 ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Somnia Testnet</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">Chain ID: {chainId}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshBalance}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Balance
                  </Button>
                  
                  {chainId !== 50312 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSwitchNetwork}
                      className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Switch to Somnia
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Connect your wallet to view account information</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6 bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">1</div>
              <div>
                <p className="font-medium">Install MetaMask</p>
                <p className="text-gray-400">Make sure you have MetaMask browser extension installed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">2</div>
              <div>
                <p className="font-medium">Connect Wallet</p>
                <p className="text-gray-400">Click "Connect Wallet" to establish connection</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">3</div>
              <div>
                <p className="font-medium">Switch Network</p>
                <p className="text-gray-400">Switch to Somnia Testnet (Chain ID: 50312) for full functionality</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">4</div>
              <div>
                <p className="font-medium">Test Features</p>
                <p className="text-gray-400">Try refreshing balance and switching networks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletTest;
