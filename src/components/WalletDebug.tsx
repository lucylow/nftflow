import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useWeb3 } from '../contexts/Web3Context';

export default function WalletDebug() {
  const { isConnected, account, chainId, balance } = useWeb3();
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Wallet Debug (Simplified)</CardTitle>
          <CardDescription className="text-slate-300">
            Basic wallet connection information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-slate-300">
            <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p>Account: {account || 'None'}</p>
            <p>Chain ID: {chainId || 'None'}</p>
            <p>Balance: {balance ? `${balance} STT` : 'None'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}