import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { 
  NFTFLOW_ABI, 
  PAYMENT_STREAM_ABI, 
  REPUTATION_SYSTEM_ABI, 
  MOCK_PRICE_ORACLE_ABI, 
  MOCK_ERC721_ABI,
  DYNAMIC_PRICING_ABI,
  UTILITY_TRACKER_ABI
} from './contracts';

interface Network {
  chainId: number;
  name: string;
  rpcUrl?: string;
  currency: string;
  blockExplorerUrl?: string;
}

// Network configuration
export const NETWORKS = {
  hardhat: {
    chainId: 1337,
    name: 'Hardhat',
    rpcUrl: 'http://localhost:8545',
    currency: 'ETH'
  },
  somniaTestnet: {
    chainId: 50312,
    name: 'Somnia Testnet',
    rpcUrl: 'https://dream-rpc.somnia.network/',
    currency: 'STT',
    blockExplorerUrl: 'https://shannon-explorer.somnia.network/'
  }
};

// Re-export contract addresses and ABIs
export { CONTRACT_ADDRESSES };
export { 
  NFTFLOW_ABI, 
  PAYMENT_STREAM_ABI, 
  REPUTATION_SYSTEM_ABI, 
  MOCK_PRICE_ORACLE_ABI, 
  MOCK_ERC721_ABI,
  DYNAMIC_PRICING_ABI,
  UTILITY_TRACKER_ABI
};

// Web3 provider setup
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to hardhat local network
  return new ethers.JsonRpcProvider(NETWORKS.hardhat.rpcUrl);
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// Contract instances
export const getNFTFlowContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESSES.NFTFlow, NFTFLOW_ABI, signer);
};

export const getPaymentStreamContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESSES.PaymentStream, PAYMENT_STREAM_ABI, signer);
};

export const getReputationSystemContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESSES.ReputationSystem, REPUTATION_SYSTEM_ABI, signer);
};

export const getMockPriceOracleContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESSES.MockPriceOracle, MOCK_PRICE_ORACLE_ABI, signer);
};

export const getMockERC721Contract = async (address: string) => {
  const signer = await getSigner();
  return new ethers.Contract(address, MOCK_ERC721_ABI, signer);
};

export const getDynamicPricingContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESSES.DynamicPricing, DYNAMIC_PRICING_ABI, signer);
};

export const getUtilityTrackerContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESSES.UtilityTracker, UTILITY_TRACKER_ABI, signer);
};

// Utility functions
export const formatEther = (value: string | bigint) => {
  return ethers.formatEther(value);
};

export const parseEther = (value: string) => {
  return ethers.parseEther(value);
};

export const formatUnits = (value: string | bigint, decimals: number = 18) => {
  return ethers.formatUnits(value, decimals);
};

export const parseUnits = (value: string, decimals: number = 18) => {
  return ethers.parseUnits(value, decimals);
};

// Network switching
export const switchToNetwork = async (chainId: number) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask not available. Please install MetaMask to switch networks.');
  }

  const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
  if (!network) {
    throw new Error(`Network configuration not found for chain ID ${chainId}`);
  }

  try {
    // First, try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    
    // Verify the switch was successful
    const provider = new ethers.BrowserProvider(window.ethereum);
    const networkInfo = await provider.getNetwork();
    if (Number(networkInfo.chainId) !== chainId) {
      throw new Error(`Failed to switch to network ${network.name}. Current chain ID: ${networkInfo.chainId}`);
    }
    
  } catch (switchError: unknown) {
    const error = switchError as { code?: number; message?: string };
    
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: network.name,
            rpcUrls: [network.rpcUrl],
            nativeCurrency: {
              name: network.currency,
              symbol: network.currency,
              decimals: 18,
            },
            blockExplorerUrls: (network as Network).blockExplorerUrl ? [(network as Network).blockExplorerUrl] : undefined,
          }],
        });
        
        // Verify the network was added and switched successfully
        const provider = new ethers.BrowserProvider(window.ethereum);
        const networkInfo = await provider.getNetwork();
        if (Number(networkInfo.chainId) !== chainId) {
          throw new Error(`Failed to switch to ${network.name} after adding. Current chain ID: ${networkInfo.chainId}`);
        }
        
      } catch (addError: unknown) {
        const addErr = addError as { code?: number; message?: string };
        if (addErr.code === 4001) {
          throw new Error('Network addition rejected. Please approve adding the Somnia network in MetaMask.');
        } else if (addErr.code === -32602) {
          throw new Error('Invalid network parameters. Please check the network configuration.');
        } else if (addErr.code === -32603) {
          throw new Error('Internal MetaMask error while adding network. Please try again.');
        } else {
          throw new Error(`Failed to add ${network.name} network: ${addErr.message || 'Unknown error'}`);
        }
      }
    } else if (error.code === 4001) {
      throw new Error('Network switch rejected. Please approve the network switch in MetaMask.');
    } else if (error.code === -32602) {
      throw new Error('Invalid chain ID. Please check the network configuration.');
    } else if (error.code === -32603) {
      throw new Error('Internal MetaMask error. Please refresh the page and try again.');
    } else if (error.code === -32002) {
      throw new Error('Network switch request already pending. Please check MetaMask and try again.');
    } else {
      throw new Error(`Failed to switch to ${network.name}: ${error.message || 'Unknown error'}`);
    }
  }
};

// MetaMask utility functions
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum;
};

export const isMetaMaskConnected = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) return false;
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    }) as string[];
    return accounts && accounts.length > 0;
  } catch (error) {
    console.warn('Failed to check MetaMask connection:', error);
    return false;
  }
};

export const getMetaMaskAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) return null;
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    }) as string[];
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.warn('Failed to get MetaMask account:', error);
    return null;
  }
};

// Ensure user is connected to Somnia network
export const ensureSomniaNetwork = async (): Promise<void> => {
  console.log('🌐 Checking current network...');
  
  if (!isMetaMaskInstalled()) {
    console.error('❌ MetaMask not available');
    throw new Error('MetaMask not available. Please install MetaMask to connect to Somnia network.');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
    
    console.log('📊 Current network info:', {
      chainId: currentChainId,
      name: network.name,
      isSomnia: currentChainId === 50312
    });
    
    // If not on Somnia testnet, switch to it
    if (currentChainId !== 50312) {
      console.log(`🔄 Switching from ${currentChainId} to Somnia Testnet (50312)`);
      await switchToNetwork(50312);
      console.log('✅ Successfully switched to Somnia Testnet');
    } else {
      console.log('✅ Already on Somnia Testnet');
    }
  } catch (error) {
    console.error('❌ Failed to ensure Somnia network:', error);
    throw error;
  }
};

// Get current network info
export const getCurrentNetwork = async () => {
  if (!isMetaMaskInstalled()) return null;
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    return {
      chainId,
      name: network.name,
      isSomnia: chainId === 50312,
      networkConfig: Object.values(NETWORKS).find(n => n.chainId === chainId)
    };
  } catch (error) {
    console.error('Failed to get current network:', error);
    return null;
  }
};

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
