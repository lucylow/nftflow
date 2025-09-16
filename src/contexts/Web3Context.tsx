import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { hybridNFTService } from '@/services/hybridNFTService';
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
  const initializeContracts = async () => {
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
  };

  // Connect wallet using hybrid service
  const connectWallet = async () => {
    console.log('🔌 Starting wallet connection process...');
    setIsConnecting(true);
    
    try {
      // Use hybrid service to connect
      const address = await hybridNFTService.connectWallet();
      
      // Update service status
      const status = hybridNFTService.getServiceStatus();
      setServiceStatus(status);
      setIsBlockchainReady(hybridNFTService.isBlockchainReady());
      
      // Get account and balance
      const account = await hybridNFTService.getAccount();
      const balance = await hybridNFTService.getBalance();
      const network = await hybridNFTService.getNetwork();
      
      console.log('✅ Wallet connected successfully:', {
        address: account,
        chainId: network.chainId,
        networkName: network.name,
        blockchainReady: hybridNFTService.isBlockchainReady(),
        balance
      });
      
      setAccount(account);
      setBalance(balance);
      setChainId(network.chainId);
      setIsConnected(true);
      
      // Initialize contracts if blockchain is ready
      if (hybridNFTService.isBlockchainReady()) {
        console.log('📋 Initializing blockchain contracts...');
        await initializeContracts();
      } else {
        console.log('🎭 Running in mock mode');
      }
      
      console.log('🎉 Wallet connection process completed successfully');
      
    } catch (error: unknown) {
      console.error('❌ Failed to connect wallet:', error);
      
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
    try {
      const balance = await hybridNFTService.getBalance();
      setBalance(balance);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  // Refresh blockchain connection
  const refreshBlockchainConnection = async () => {
    try {
      await hybridNFTService.refreshBlockchainConnection();
      const status = hybridNFTService.getServiceStatus();
      setServiceStatus(status);
      setIsBlockchainReady(hybridNFTService.isBlockchainReady());
      
      if (hybridNFTService.isBlockchainReady()) {
        await initializeContracts();
      }
    } catch (error) {
      console.error('Failed to refresh blockchain connection:', error);
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
  }, []);

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
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('connect', handleConnect);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        // Clean up event listeners
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [isConnected, account]);

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
