import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WalletConnect from '@/components/WalletConnect';
import { useWeb3 } from '@/contexts/Web3Context';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

const SimpleWallet = () => {
  const { isConnected, account, chainId, balance } = useWeb3();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2 text-purple-400">
            <Shield className="h-6 w-6" />
            <span>Wallet Connection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <WalletConnect />
          </div>
          
          {isConnected && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                {chainId === 50312 ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400">Connected to Somnia Testnet</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400">Wrong Network</span>
                  </>
                )}
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg space-y-2">
                <div className="text-sm text-slate-300">
                  <span className="font-medium">Account:</span>
                  <div className="font-mono text-xs break-all">{account}</div>
                </div>
                <div className="text-sm text-slate-300">
                  <span className="font-medium">Balance:</span>
                  <span className="ml-2">{balance ? `${parseFloat(balance).toFixed(4)} STT` : '0 STT'}</span>
                </div>
                <div className="text-sm text-slate-300">
                  <span className="font-medium">Chain ID:</span>
                  <span className="ml-2">{chainId}</span>
                </div>
              </div>
            </div>
          )}
          
          {!isConnected && (
            <div className="text-center text-slate-400 text-sm">
              Connect your MetaMask wallet to access NFTFlow features
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleWallet;