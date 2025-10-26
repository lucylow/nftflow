import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  balance: string | null;
  chainId: number | null;
  
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
  refreshBlockchainConnection: () => Promise<void>;
  createMicroRental: () => Promise<any>;
  createPaymentStream: () => Promise<any>;
  getSomniaMetrics: () => any;
  getSomniaNetworkInfo: () => Promise<any>;
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

  // Minimal connect wallet function - no timeouts, no complex logic
  const connectWallet = async () => {
    console.log('🔌 Starting minimal wallet connection...');
    setIsConnecting(true);
    
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask browser extension.');
      }

      // Simple connection - just request accounts
      console.log('🔑 Requesting account access...');
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }

      console.log('✅ Account access granted:', accounts[0]);
      
      // Set basic state immediately
      setAccount(accounts[0]);
      setIsConnected(true);
      setServiceStatus({ blockchain: true, mock: false });
      setIsBlockchainReady(true);
      
      // Try to get additional info in background (don't block on this)
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(address);
        
        setAccount(address);
        setChainId(Number(network.chainId));
        setBalance(ethers.formatEther(balance));
        
        console.log('✅ Additional wallet info loaded:', {
          address,
          chainId: Number(network.chainId),
          balance: ethers.formatEther(balance)
        });
      } catch (infoError) {
        console.warn('⚠️ Could not load additional wallet info:', infoError);
        // Don't fail the connection if we can't get additional info
      }
      
      console.log('🎉 Minimal wallet connection completed successfully');
      
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
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setNftFlowContract(null);
  }, []);

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
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [account, isConnected]);

  // Refresh blockchain connection
  const refreshBlockchainConnection = useCallback(async () => {
    try {
      if (window.ethereum && window.ethereum.selectedAddress) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        setAccount(address);
        setChainId(Number(network.chainId));
        setIsConnected(true);
        setServiceStatus({ blockchain: true, mock: false });
        setIsBlockchainReady(true);
        
        // Refresh balance
        await refreshBalance();
      }
    } catch (error) {
      console.error('Failed to refresh blockchain connection:', error);
    }
  }, [refreshBalance]);

  // Initialize connection on mount
  useEffect(() => {
    refreshBlockchainConnection();
  }, [refreshBlockchainConnection]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          console.log('No accounts found, disconnecting wallet');
          disconnectWallet();
        } else if (accounts[0] !== account) {
          console.log('Account changed to:', accounts[0]);
          setAccount(accounts[0]);
          refreshBalance();
        }
      };

      const handleChainChanged = () => {
        console.log('Chain changed, refreshing blockchain connection');
        refreshBlockchainConnection();
      };

      const handleDisconnect = () => {
        console.log('MetaMask disconnected');
        disconnectWallet();
      };

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        // Clean up event listeners
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [account, disconnectWallet, refreshBalance, refreshBlockchainConnection]);

  // Mock functions for compatibility
  const createMicroRental = async () => { 
    console.log('createMicroRental called - mock implementation');
    return { success: true, message: 'Mock implementation' };
  };
  
  const createPaymentStream = async () => { 
    console.log('createPaymentStream called - mock implementation');
    return { success: true, message: 'Mock implementation' };
  };
  
  const getSomniaMetrics = () => {
    console.log('getSomniaMetrics called - mock implementation');
    return {
      totalTransactions: 0,
      activeUsers: 0,
      totalVolume: '0'
    };
  };
  
  const getSomniaNetworkInfo = async () => {
    console.log('getSomniaNetworkInfo called - mock implementation');
    return {
      chainId: chainId || 50312,
      name: 'Somnia Testnet',
      blockNumber: 0
    };
  };

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
    createMicroRental,
    createPaymentStream,
    getSomniaMetrics,
    getSomniaNetworkInfo,
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

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      selectedAddress?: string;
      networkVersion?: string;
    };
  }
}
