import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  getProvider, 
  getSigner, 
  formatEther,
  isMetaMaskInstalled,
  isMetaMaskConnected,
  getMetaMaskAccount,
  getCurrentNetwork
} from '@/lib/web3';

interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  balance: string | null;
  chainId: number | null;
  refreshBlockchainConnection?: () => Promise<void>;
  
  // Service status
  isBlockchainReady: boolean;
  serviceStatus: { blockchain: boolean; mock: boolean };
  
  // Contract instances (simplified)
  nftFlowContract: ethers.Contract | null;
  
  // Methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  
  // Service status
  const [isBlockchainReady, setIsBlockchainReady] = useState(false);
  const [serviceStatus, setServiceStatus] = useState({ blockchain: false, mock: true });
  
  const [nftFlowContract, setNftFlowContract] = useState<ethers.Contract | null>(null);

  // Simplified connect wallet function
  const connectWallet = async () => {
    console.log('🔌 Starting simplified wallet connection...');
    setIsConnecting(true);
    
    try {
      // Check if MetaMask is installed
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask not installed. Please install MetaMask browser extension.');
      }

      // Request account access with shorter timeout
      console.log('🔑 Requesting account access...');
      const accounts = await Promise.race([
        window.ethereum.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000) // Reduced to 10 seconds
        )
      ]);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }

      console.log('✅ Account access granted:', accounts[0]);
      
      // Get basic info
      const provider = getProvider();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Get network info
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Get balance
      const balance = await provider.getBalance(address);
      const formattedBalance = formatEther(balance);
      
      console.log('✅ Wallet connected successfully:', {
        address,
        chainId,
        networkName: network.name,
        balance: formattedBalance
      });
      
      // Update state
      setAccount(address);
      setBalance(formattedBalance);
      setChainId(chainId);
      setIsConnected(true);
      setServiceStatus({ blockchain: true, mock: false });
      setIsBlockchainReady(true);
      
      console.log('🎉 Simplified wallet connection completed successfully');
      
    } catch (error: unknown) {
      console.error('❌ Failed to connect wallet:', error);
      
      // Reset state on error
      setIsConnected(false);
      setAccount(null);
      setBalance(null);
      setChainId(null);
      setServiceStatus({ blockchain: false, mock: true });
      setIsBlockchainReady(false);
      
      // Re-throw the error with proper message
      if (error instanceof Error && error.message) {
        throw error;
      } else {
        throw new Error('Failed to connect wallet. Please ensure MetaMask is properly installed and unlocked.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setNftFlowContract(null);
  };

  // Switch network (simplified)
  const switchNetwork = async (targetChainId: number) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      setChainId(targetChainId);
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  };

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    try {
      if (account && isConnected) {
        const provider = getProvider();
        const balance = await provider.getBalance(account);
        const formattedBalance = formatEther(balance);
        setBalance(formattedBalance);
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [account, isConnected]);

  // Refresh blockchain connection
  const refreshBlockchainConnection = useCallback(async () => {
    try {
      if (isMetaMaskInstalled()) {
        const connected = await isMetaMaskConnected();
        if (connected) {
          const account = await getMetaMaskAccount();
          const network = await getCurrentNetwork();
          
          if (account && network) {
            setAccount(account);
            setChainId(network.chainId);
            setIsConnected(true);
            setServiceStatus({ blockchain: true, mock: false });
            setIsBlockchainReady(true);
            
            // Refresh balance
            await refreshBalance();
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh blockchain connection:', error);
    }
  }, [refreshBalance]);

  // Initialize connection on mount
  useEffect(() => {
    refreshBlockchainConnection();
  }, [refreshBlockchainConnection]);

  // Mock functions for compatibility
  const createMicroRental = async () => { throw new Error('Not implemented in simplified version'); };
  const createPaymentStream = async () => { throw new Error('Not implemented in simplified version'); };
  const getSomniaMetrics = () => ({});
  const getSomniaNetworkInfo = async () => ({});

  const value: Web3ContextType = {
    isConnected,
    isConnecting,
    account,
    balance,
    chainId,
    isBlockchainReady,
    serviceStatus,
    nftFlowContract,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
    refreshBlockchainConnection,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
