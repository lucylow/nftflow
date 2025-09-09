import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

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

// Re-export contract addresses
export { CONTRACT_ADDRESSES };

// Contract ABIs
export const NFTFLOW_ABI = [
  // Events
  "event RentalListed(bytes32 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address owner, uint256 pricePerSecond)",
  "event RentalCreated(uint256 indexed rentalId, address indexed nftContract, uint256 indexed tokenId, address owner, address renter, uint256 duration, uint256 totalCost)",
  "event RentalCompleted(uint256 indexed rentalId, address indexed renter, bool successful)",
  "event CollateralDeposited(address indexed user, uint256 amount)",
  "event CollateralWithdrawn(address indexed user, uint256 amount)",
  
  // Functions
  "function listForRental(address nftContract, uint256 tokenId, uint256 pricePerSecond, uint256 minDuration, uint256 maxDuration, uint256 collateralRequired) external",
  "function rentNFT(bytes32 listingId, uint256 duration) external payable",
  "function completeRental(uint256 rentalId) external",
  "function depositCollateral() external payable",
  "function withdrawCollateral(uint256 amount) external",
  "function getRental(uint256 rentalId) external view returns (tuple(address nftContract, uint256 tokenId, address owner, address renter, uint256 pricePerSecond, uint256 startTime, uint256 endTime, uint256 collateralAmount, bool active, bool completed))",
  "function getListing(bytes32 listingId) external view returns (tuple(address nftContract, uint256 tokenId, address owner, uint256 pricePerSecond, uint256 minRentalDuration, uint256 maxRentalDuration, uint256 collateralRequired, bool active))",
  "function userCollateralBalance(address user) external view returns (uint256)",
  "function platformFeePercentage() external view returns (uint256)",
  "function nextRentalId() external view returns (uint256)"
];

export const PAYMENT_STREAM_ABI = [
  // Events
  "event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 deposit, uint256 ratePerSecond, uint256 startTime, uint256 stopTime)",
  "event StreamWithdrawn(uint256 indexed streamId, address indexed recipient, uint256 amount)",
  "event StreamCancelled(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 senderBalance, uint256 recipientBalance)",
  
  // Functions
  "function createStream(address recipient, uint256 startTime, uint256 stopTime) external payable returns (uint256 streamId)",
  "function withdrawFromStream(uint256 streamId, uint256 amount) external",
  "function cancelStream(uint256 streamId) external",
  "function balanceOf(uint256 streamId) external view returns (uint256)",
  "function getStream(uint256 streamId) external view returns (tuple(address sender, address recipient, uint256 deposit, uint256 ratePerSecond, uint256 startTime, uint256 stopTime, uint256 remainingBalance, bool active))",
  "function isStreamActive(uint256 streamId) external view returns (bool)",
  "function getStreamRate(uint256 streamId) external view returns (uint256)",
  "function getTotalStreamed(uint256 streamId) external view returns (uint256)"
];

export const REPUTATION_SYSTEM_ABI = [
  // Events
  "event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore, bool success)",
  "event AchievementUnlocked(address indexed user, uint256 indexed achievementId, string achievementName)",
  "event UserBlacklisted(address indexed user, bool blacklisted)",
  
  // Functions
  "function updateReputation(address user, bool success) external",
  "function getCollateralMultiplier(address user) external view returns (uint256)",
  "function getUserReputation(address user) external view returns (tuple(uint256 totalRentals, uint256 successfulRentals, uint256 reputationScore, uint256 lastUpdated, bool blacklisted))",
  "function getSuccessRate(address user) external view returns (uint256)",
  "function hasAchievement(address user, uint256 achievementId) external view returns (bool)",
  "function getAchievement(uint256 achievementId) external view returns (tuple(string name, string description, uint256 requirement, uint256 rewardPoints, bool active))",
  "function getUserAchievements(address user) external view returns (uint256[])",
  "function getTotalAchievements() external view returns (uint256)"
];

export const MOCK_PRICE_ORACLE_ABI = [
  "function getPricePerSecond(address nftContract, uint256 tokenId) external view returns (uint256 pricePerSecond)",
  "function getFloorPrice(address nftContract) external view returns (uint256 floorPrice)",
  "function updatePrice(address nftContract, uint256 tokenId, uint256 pricePerSecond) external",
  "function hasPrice(address nftContract, uint256 tokenId) external view returns (bool)",
  "function setFloorPrice(address nftContract, uint256 floorPrice) external"
];

export const MOCK_ERC721_ABI = [
  "function mint(address to, uint256 tokenId) external",
  "function safeMint(address to) external",
  "function burn(uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function tokenURI(uint256 tokenId) external view returns (string)"
];

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
