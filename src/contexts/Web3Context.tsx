import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { 
  getProvider, 
  getSigner, 
  getNFTFlowContract, 
  getPaymentStreamContract, 
  getReputationSystemContract,
  getMockPriceOracleContract,
  getDynamicPricingContract,
  getUtilityTrackerContract,
  switchToNetwork,
  NETWORKS,
  formatEther,
  CONTRACT_ADDRESSES,
  isMetaMaskInstalled,
  isMetaMaskConnected,
  getMetaMaskAccount
} from '@/lib/web3';

interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  balance: string | null;
  chainId: number | null;
  
  // Contract instances
  nftFlowContract: ethers.Contract | null;
  paymentStreamContract: ethers.Contract | null;
  reputationSystemContract: ethers.Contract | null;
  priceOracleContract: ethers.Contract | null;
  dynamicPricingContract: ethers.Contract | null;
  utilityTrackerContract: ethers.Contract | null;
  
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
  
  const [nftFlowContract, setNftFlowContract] = useState<ethers.Contract | null>(null);
  const [paymentStreamContract, setPaymentStreamContract] = useState<ethers.Contract | null>(null);
  const [reputationSystemContract, setReputationSystemContract] = useState<ethers.Contract | null>(null);
  const [priceOracleContract, setPriceOracleContract] = useState<ethers.Contract | null>(null);
  const [dynamicPricingContract, setDynamicPricingContract] = useState<ethers.Contract | null>(null);
  const [utilityTrackerContract, setUtilityTrackerContract] = useState<ethers.Contract | null>(null);

  // Initialize contracts when connected
  const initializeContracts = async () => {
    try {
      // Check if contract addresses are set (not zero addresses)
      if (CONTRACT_ADDRESSES.NFTFlow === '0x0000000000000000000000000000000000000000') {
        console.warn('Contract addresses not set. Please deploy contracts first.');
        return;
      }

      const nftFlow = await getNFTFlowContract();
      const paymentStream = await getPaymentStreamContract();
      const reputationSystem = await getReputationSystemContract();
      const priceOracle = await getMockPriceOracleContract();
      
      // Only initialize these if addresses are set (not zero addresses)
      let dynamicPricing = null;
      let utilityTracker = null;
      
      if (CONTRACT_ADDRESSES.DynamicPricing !== '0x0000000000000000000000000000000000000000') {
        try {
          dynamicPricing = await getDynamicPricingContract();
        } catch (error) {
          console.warn('Failed to initialize DynamicPricing contract:', error);
        }
      }
      
      if (CONTRACT_ADDRESSES.UtilityTracker !== '0x0000000000000000000000000000000000000000') {
        try {
          utilityTracker = await getUtilityTrackerContract();
        } catch (error) {
          console.warn('Failed to initialize UtilityTracker contract:', error);
        }
      }
      
      setNftFlowContract(nftFlow);
      setPaymentStreamContract(paymentStream);
      setReputationSystemContract(reputationSystem);
      setPriceOracleContract(priceOracle);
      setDynamicPricingContract(dynamicPricing);
      setUtilityTrackerContract(utilityTracker);
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      // Don't throw error - allow wallet connection without contracts
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask to connect your wallet.');
    }

    setIsConnecting(true);
    try {
      // First, try to get accounts without requesting access
      let accounts;
      try {
        accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
      } catch (error) {
        console.warn('Failed to get existing accounts:', error);
        accounts = [];
      }

      // If no accounts are available, request access
      if (!accounts || accounts.length === 0) {
        try {
          accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
        } catch (requestError: any) {
          // Handle specific MetaMask errors
          if (requestError.code === 4001) {
            throw new Error('Connection rejected. Please approve the connection in MetaMask.');
          } else if (requestError.code === -32002) {
            throw new Error('Connection request already pending. Please check MetaMask and try again.');
          } else if (requestError.code === -32603) {
            throw new Error('Internal MetaMask error. Please refresh the page and try again.');
          } else if (requestError.message?.includes('User denied') || requestError.message?.includes('denied')) {
            throw new Error('Connection denied. Please try again and approve the connection.');
          } else if (requestError.message?.includes('locked') || requestError.message?.includes('unlock')) {
            throw new Error('MetaMask is locked. Please unlock your wallet and try again.');
          } else {
            throw new Error('Failed to connect to MetaMask. Please ensure MetaMask is unlocked and try again.');
          }
        }
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in MetaMask or unlock your wallet.');
      }

      const provider = getProvider();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setAccount(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      
      // Initialize contracts (this won't fail the connection if contracts aren't deployed)
      await initializeContracts();
      
      // Get initial balance
      await refreshBalance();
      
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      // Re-throw the error with proper message
      if (error.message) {
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
    setPaymentStreamContract(null);
    setReputationSystemContract(null);
    setPriceOracleContract(null);
    setDynamicPricingContract(null);
    setUtilityTrackerContract(null);
  };

  // Switch network
  const switchNetwork = async (targetChainId: number) => {
    try {
      await switchToNetwork(targetChainId);
      setChainId(targetChainId);
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (!account) return;
    
    try {
      const provider = getProvider();
      const balance = await provider.getBalance(account);
      setBalance(formatEther(balance));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) {
        console.log('MetaMask not installed');
        return;
      }

      try {
        const isConnected = await isMetaMaskConnected();
        if (isConnected) {
          const account = await getMetaMaskAccount();
          if (account) {
            const provider = getProvider();
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            
            setAccount(address);
            setChainId(Number(network.chainId));
            setIsConnected(true);
            
            await initializeContracts();
            await refreshBalance();
          }
        }
      } catch (error) {
        console.error('Failed to check connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          refreshBalance();
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        // Reinitialize contracts on chain change
        if (isConnected) {
          initializeContracts();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isConnected]);

  const value: Web3ContextType = {
    isConnected,
    isConnecting,
    account,
    balance,
    chainId,
    nftFlowContract,
    paymentStreamContract,
    reputationSystemContract,
    priceOracleContract,
    dynamicPricingContract,
    utilityTrackerContract,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
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
