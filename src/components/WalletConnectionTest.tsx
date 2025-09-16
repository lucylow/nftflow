import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeb3 } from '@/contexts/Web3Context';
import { hybridDataService } from '@/services/hybridDataService';
import { useToast } from '@/hooks/use-toast';
import { Wallet, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

const WalletConnectionTest = () => {
  const { 
    isConnected, 
    isConnecting, 
    account, 
    balance, 
    chainId, 
    isBlockchainReady,
    serviceStatus,
    connectWallet,
    refreshBalance,
    refreshBlockchainConnection
  } = useWeb3();
  
  const [dataSourceInfo, setDataSourceInfo] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadDataSourceInfo = async () => {
      try {
        const info = hybridDataService.getDataSourceInfo();
        setDataSourceInfo(info);
      } catch (error) {
        console.error('Failed to load data source info:', error);
      }
    };

    loadDataSourceInfo();
  }, [isConnected, isBlockchainReady]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet!",
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      await refreshBlockchainConnection();
      await refreshBalance();
      
      const info = hybridDataService.getDataSourceInfo();
      setDataSourceInfo(info);
      
      toast({
        title: "Connection Tested",
        description: info.hasRealData ? "Blockchain connection is working!" : "Using mock data mode",
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Test Failed",
        description: "Failed to test blockchain connection",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1337: return 'Hardhat Local';
      case 50312: return 'Somnia Testnet';
      default: return `Chain ID: ${chainId}`;
    }
  };

  const getNetworkBadgeColor = (chainId: number | null) => {
    switch (chainId) {
      case 1337: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 50312: return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="w-5 h-5" />
            Wallet Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Connection Status:</span>
            <Badge 
              variant="default"
              className={
                isConnected 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }
            >
              {isConnected ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>

          {/* Account Address */}
          {account && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Account:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-slate-700/50 px-2 py-1 rounded text-green-400">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const explorerUrl = chainId === 1337 
                      ? `http://localhost:8545` 
                      : `https://shannon-explorer.somnia.network/address/${account}`;
                    window.open(explorerUrl, '_blank');
                  }}
                  className="p-1 h-6 w-6"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Balance */}
          {balance && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Balance:</span>
              <span className="font-mono text-white">
                {parseFloat(balance).toFixed(4)} {chainId === 1337 ? 'ETH' : 'STT'}
              </span>
            </div>
          )}

          {/* Network */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Network:</span>
            <Badge 
              variant="outline"
              className={getNetworkBadgeColor(chainId)}
            >
              {getNetworkName(chainId)}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!isConnected ? (
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Service Status */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Blockchain Service Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Blockchain Ready:</span>
            <Badge 
              variant="default"
              className={
                isBlockchainReady 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              }
            >
              {isBlockchainReady ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Ready
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Service Status:</span>
            <div className="flex gap-2">
              <Badge 
                variant="outline"
                className={
                  serviceStatus.blockchain 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                }
              >
                Blockchain: {serviceStatus.blockchain ? 'Active' : 'Inactive'}
              </Badge>
              <Badge 
                variant="outline"
                className={
                  serviceStatus.mock 
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                }
              >
                Mock: {serviceStatus.mock ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Info */}
      {dataSourceInfo && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Data Source Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Data Source:</span>
              <Badge 
                variant="default"
                className={
                  dataSourceInfo.hasRealData 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                }
              >
                {dataSourceInfo.hasRealData ? 'Real Blockchain Data' : 'Mock Data'}
              </Badge>
            </div>

            {dataSourceInfo.hasRealData && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You are connected to the blockchain and viewing real data from smart contracts.
                </AlertDescription>
              </Alert>
            )}

            {!dataSourceInfo.hasRealData && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  You are in demo mode using mock data. Connect to the blockchain to see real data.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Contract Status:</h4>
                <div className="space-y-1">
                  {Object.entries(dataSourceInfo.contractAddresses || {}).map(([contract, status]) => (
                    <div key={contract} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{contract}:</span>
                      <Badge 
                        variant="outline"
                        className={
                          status === 'Connected' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }
                      >
                        {status as string}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletConnectionTest;
