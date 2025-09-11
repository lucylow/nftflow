import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { isMetaMaskInstalled, getCurrentNetwork, ensureSomniaNetwork } from '../lib/web3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

export default function WalletDebug() {
  const { 
    isConnected, 
    isConnecting, 
    account, 
    balance, 
    chainId,
    connectWallet, 
    disconnectWallet 
  } = useWeb3();
  
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setError(null);
    const info: any = {};

    try {
      // Check MetaMask installation
      info.metaMaskInstalled = isMetaMaskInstalled();
      
      if (info.metaMaskInstalled) {
        // Check current network
        const network = await getCurrentNetwork();
        info.currentNetwork = network;
        
        // Check if we can access window.ethereum
        info.ethereumAvailable = !!window.ethereum;
        
        // Check if we can get accounts
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          info.accounts = accounts;
          info.hasAccounts = accounts && accounts.length > 0;
        } catch (e) {
          info.accountsError = e instanceof Error ? e.message : 'Unknown error';
        }
        
        // Check if we can get chain ID
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          info.chainId = chainId;
        } catch (e) {
          info.chainIdError = e instanceof Error ? e.message : 'Unknown error';
        }
      }
      
      setDebugInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const testSomniaConnection = async () => {
    try {
      setError(null);
      await ensureSomniaNetwork();
      await runDiagnostics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Somnia');
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection Debug</CardTitle>
          <CardDescription>Diagnostic information for wallet connection issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runDiagnostics} variant="outline">
              Run Diagnostics
            </Button>
            <Button onClick={testSomniaConnection} variant="outline">
              Test Somnia Connection
            </Button>
          </div>

          {error && (
            <Alert>
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Connection Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Connected:</span>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Connecting:</span>
                  <Badge variant={isConnecting ? "default" : "secondary"}>
                    {isConnecting ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Account:</span>
                  <span className="text-sm font-mono">
                    {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chain ID:</span>
                  <span>{chainId || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <span>{balance ? `${balance} STT` : "None"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Debug Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>MetaMask Installed:</span>
                  <Badge variant={debugInfo.metaMaskInstalled ? "default" : "destructive"}>
                    {debugInfo.metaMaskInstalled ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Ethereum Available:</span>
                  <Badge variant={debugInfo.ethereumAvailable ? "default" : "destructive"}>
                    {debugInfo.ethereumAvailable ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Has Accounts:</span>
                  <Badge variant={debugInfo.hasAccounts ? "default" : "secondary"}>
                    {debugInfo.hasAccounts ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Current Chain ID:</span>
                  <span className="text-sm font-mono">
                    {debugInfo.chainId || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>On Somnia:</span>
                  <Badge variant={debugInfo.currentNetwork?.isSomnia ? "default" : "destructive"}>
                    {debugInfo.currentNetwork?.isSomnia ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {debugInfo.accounts && (
            <div>
              <h3 className="font-semibold mb-2">Accounts</h3>
              <div className="space-y-1">
                {debugInfo.accounts.map((account: string, index: number) => (
                  <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {account}
                  </div>
                ))}
              </div>
            </div>
          )}

          {debugInfo.accountsError && (
            <Alert>
              <AlertDescription>
                <strong>Accounts Error:</strong> {debugInfo.accountsError}
              </AlertDescription>
            </Alert>
          )}

          {debugInfo.chainIdError && (
            <Alert>
              <AlertDescription>
                <strong>Chain ID Error:</strong> {debugInfo.chainIdError}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
            <Button 
              onClick={disconnectWallet}
              variant="outline"
              disabled={!isConnected}
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
