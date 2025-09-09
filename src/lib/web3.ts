import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { 
  NFTFLOW_ABI, 
  PAYMENT_STREAM_ABI, 
  REPUTATION_SYSTEM_ABI, 
  MOCK_PRICE_ORACLE_ABI, 
  MOCK_ERC721_ABI 
} from './contracts';

// Network configuration
export const NETWORKS = {
  hardhat: {
    chainId: 1337,
    name: 'Hardhat',
    rpcUrl: 'http://localhost:8545',
    currency: 'ETH'
  },
  somniaTestnet: {
    chainId: 50311,
    name: 'Somnia Testnet',
    rpcUrl: 'https://testnet.somnia.network',
    currency: 'STT'
  }
};

// Re-export contract addresses and ABIs
export { CONTRACT_ADDRESSES };
export { 
  NFTFLOW_ABI, 
  PAYMENT_STREAM_ABI, 
  REPUTATION_SYSTEM_ABI, 
  MOCK_PRICE_ORACLE_ABI, 
  MOCK_ERC721_ABI 
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
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
        if (network) {
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
            }],
          });
        }
      } else {
        throw switchError;
      }
    }
  }
};

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: any;
  }
}
