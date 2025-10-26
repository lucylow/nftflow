import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
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
  getMetaMaskAccount,
  ensureSomniaNetwork,
  getCurrentNetwork
} from '@/lib/web3';
import { somniaService } from '@/services/somniaService';

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
  
  // Somnia-specific methods
  createMicroRental: (nftContract: string, tokenId: string, pricePerSecond: string, duration: number) => Promise<string>;
  createPaymentStream: (recipient: string, amount: string, duration: number) => Promise<string>;
  getSomniaMetrics: () => any;
  getSomniaNetworkInfo: () => Promise<any>;
  
  // Contract instances
  nftFlowContract: ethers.Contract | null;
  paymentStreamContract: ethers.Contract | null;
  reputationSystemContract: ethers.Contract | null;
  priceOracleContract: ethers.Contract | null;
  dynamicPricingContract: ethers.Contract | null;
  utilityTrackerContract: ethers.Contract | null;
  
  // Legacy contract support
  contract?: ethers.Contract | null;
  gamificationContract?: ethers.Contract | null;
  achievementSystemContract?: ethers.Contract | null;
  microRentalContract?: ethers.Contract | null;
  
  // Methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshBlockchainConnection: () => Promise<void>;
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
  const [paymentStreamContract, setPaymentStreamContract] = useState<ethers.Contract | null>(null);
  const [reputationSystemContract, setReputationSystemContract] = useState<ethers.Contract | null>(null);
  const [priceOracleContract, setPriceOracleContract] = useState<ethers.Contract | null>(null);
  const [dynamicPricingContract, setDynamicPricingContract] = useState<ethers.Contract | null>(null);
  const [utilityTrackerContract, setUtilityTrackerContract] = useState<ethers.Contract | null>(null);

  // Initialize contracts when connected
  const initializeContracts = useCallback(async () => {
    try {
      console.log('🔧 Initializing contracts...');
      
      // Check if contract addresses are set (not zero addresses)
      if (CONTRACT_ADDRESSES.NFTFlow === '0x0000000000000000000000000000000000000000') {
        console.warn('⚠️ Contract addresses not set. Running in mock mode.');
        return;
      }

      // Initialize core contracts with error handling
      const contracts = await Promise.allSettled([
        getNFTFlowContract(),
        getPaymentStreamContract(),
        getReputationSystemContract(),
        getMockPriceOracleContract()
      ]);

      const [nftFlowResult, paymentStreamResult, reputationSystemResult, priceOracleResult] = contracts;

      if (nftFlowResult.status === 'fulfilled') {
        setNftFlowContract(nftFlowResult.value);
        console.log('✅ NFTFlow contract initialized');
      } else {
        console.warn('⚠️ Failed to initialize NFTFlow contract:', nftFlowResult.reason);
      }

      if (paymentStreamResult.status === 'fulfilled') {
        setPaymentStreamContract(paymentStreamResult.value);
        console.log('✅ PaymentStream contract initialized');
      } else {
        console.warn('⚠️ Failed to initialize PaymentStream contract:', paymentStreamResult.reason);
      }

      if (reputationSystemResult.status === 'fulfilled') {
        setReputationSystemContract(reputationSystemResult.value);
        console.log('✅ ReputationSystem contract initialized');
      } else {
        console.warn('⚠️ Failed to initialize ReputationSystem contract:', reputationSystemResult.reason);
      }

      if (priceOracleResult.status === 'fulfilled') {
        setPriceOracleContract(priceOracleResult.value);
        console.log('✅ MockPriceOracle contract initialized');
      } else {
        console.warn('⚠️ Failed to initialize MockPriceOracle contract:', priceOracleResult.reason);
      }
      
      // Only initialize these if addresses are set (not zero addresses)
      if (CONTRACT_ADDRESSES.DynamicPricing !== '0x0000000000000000000000000000000000000000') {
        try {
          const dynamicPricing = await getDynamicPricingContract();
          setDynamicPricingContract(dynamicPricing);
          console.log('✅ DynamicPricing contract initialized');
        } catch (error) {
          console.warn('⚠️ Failed to initialize DynamicPricing contract:', error);
        }
      }
      
      if (CONTRACT_ADDRESSES.UtilityTracker !== '0x0000000000000000000000000000000000000000') {
        try {
          const utilityTracker = await getUtilityTrackerContract();
          setUtilityTrackerContract(utilityTracker);
          console.log('✅ UtilityTracker contract initialized');
        } catch (error) {
          console.warn('⚠️ Failed to initialize UtilityTracker contract:', error);
        }
      }

      console.log('🎉 Contract initialization completed');
    } catch (error) {
      console.error('❌ Failed to initialize contracts:', error);
      // Don't throw error - allow wallet connection without contracts
      console.log('🔄 Continuing in mock mode...');
    }
  }, []);

  // Connect wallet using direct MetaMask connection
  const connectWallet = async () => {
    console.log('🔌 Starting wallet connection process...');
    setIsConnecting(true);
    
    try {
      // Check if MetaMask is installed
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask not installed. Please install MetaMask browser extension.');
      }

      // Check if ethereum object is available (for Lovable dev compatibility)
      if (!window.ethereum || typeof window.ethereum.request !== 'function') {
        throw new Error('Ethereum provider not available. Please ensure MetaMask is installed and enabled.');
      }

      // Request account access with timeout
      console.log('🔑 Requesting account access...');
      const accounts = await Promise.race([
        window.ethereum.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        )
      ]);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }

      console.log('✅ Account access granted:', accounts[0]);
      
      // Get provider and signer
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
      
      // Update state first
      setAccount(address);
      setBalance(formattedBalance);
      setChainId(chainId);
      setIsConnected(true);
      
      // Try to ensure Somnia network (but don't fail if it doesn't work)
      try {
        console.log('🌐 Attempting to switch to Somnia network...');
        await ensureSomniaNetwork();
        console.log('✅ Switched to Somnia network');
      } catch (networkError) {
        console.warn('⚠️ Could not switch to Somnia network, continuing with current network:', networkError);
        // Don't throw - allow connection on any network
      }
      
      // Initialize contracts
      console.log('📋 Initializing contracts...');
      await initializeContracts();
      
      // Update service status
      setServiceStatus({ blockchain: true, mock: false });
      setIsBlockchainReady(true);
      
      console.log('🎉 Wallet connection process completed successfully');
      
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
    setPaymentStreamContract(null);
    setReputationSystemContract(null);
    setPriceOracleContract(null);
    setDynamicPricingContract(null);
    setUtilityTrackerContract(null);
  }, []);

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
  const refreshBlockchainConnection = async () => {
    try {
      if (isConnected && account) {
        // Re-initialize contracts
        await initializeContracts();
        
        // Update service status
        setServiceStatus({ blockchain: true, mock: false });
        setIsBlockchainReady(true);
        
        // Refresh balance
        await refreshBalance();
      } else {
        setServiceStatus({ blockchain: false, mock: true });
        setIsBlockchainReady(false);
      }
    } catch (error) {
      console.error('Failed to refresh blockchain connection:', error);
      setServiceStatus({ blockchain: false, mock: true });
      setIsBlockchainReady(false);
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
            // Check current network and switch to Somnia if needed
            const currentNetwork = await getCurrentNetwork();
            if (!currentNetwork?.isSomnia) {
              console.log('Not on Somnia network, switching...');
              await ensureSomniaNetwork();
            }
            
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
  }, [initializeContracts, refreshBalance]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.on) {
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

      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        console.log('Chain changed to:', newChainId);
        setChainId(newChainId);
        
        // Reinitialize contracts on chain change
        if (isConnected) {
          console.log('Reinitializing contracts after chain change');
          initializeContracts();
        }
      };

      const handleConnect = () => {
        console.log('MetaMask connected');
        // Don't automatically connect, let user initiate
      };

      const handleDisconnect = () => {
        console.log('MetaMask disconnected');
        disconnectWallet();
      };

      // Add event listeners
      if (window.ethereum.on && window.ethereum.removeListener) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('connect', handleConnect);
        window.ethereum.on('disconnect', handleDisconnect);

        return () => {
          // Clean up event listeners
          if (window.ethereum && window.ethereum.removeListener) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
            window.ethereum.removeListener('connect', handleConnect);
            window.ethereum.removeListener('disconnect', handleDisconnect);
          }
        };
      }
    }
  }, [isConnected, account, initializeContracts, refreshBalance, disconnectWallet]);

  // Somnia-specific methods
  const createMicroRental = useCallback(async (
    nftContract: string, 
    tokenId: string, 
    pricePerSecond: string, 
    duration: number
  ): Promise<string> => {
    if (!isConnected || !somniaService.isReady()) {
      throw new Error('Wallet not connected or Somnia service not ready');
    }
    return await somniaService.createMicroRental(nftContract, tokenId, pricePerSecond, duration);
  }, [isConnected]);

  const createPaymentStream = useCallback(async (
    recipient: string, 
    amount: string, 
    duration: number
  ): Promise<string> => {
    if (!isConnected || !somniaService.isReady()) {
      throw new Error('Wallet not connected or Somnia service not ready');
    }
    return await somniaService.createPaymentStream(recipient, amount, duration);
  }, [isConnected]);

  const getSomniaMetrics = useCallback(() => {
    return somniaService.getMetrics();
  }, []);

  const getSomniaNetworkInfo = useCallback(async () => {
    return await somniaService.getNetworkInfo();
  }, []);

  const value: Web3ContextType = {
    isConnected,
    isConnecting,
    account,
    balance,
    chainId,
    isBlockchainReady,
    serviceStatus,
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
