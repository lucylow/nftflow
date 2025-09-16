import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { 
  NFTFLOW_ABI, 
  PAYMENT_STREAM_ABI, 
  REPUTATION_SYSTEM_ABI, 
  MOCK_PRICE_ORACLE_ABI, 
  MOCK_ERC721_ABI 
} from '@/lib/contracts';

export interface NFTRentalListing {
  id: string;
  nftContract: string;
  tokenId: string;
  owner: string;
  pricePerSecond: string;
  minDuration: number;
  maxDuration: number;
  collateralRequired: string;
  isActive: boolean;
  metadata?: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: any }>;
  };
}

export interface RentalInfo {
  renter: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  totalPaid: string;
}

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contracts: {
    nftFlow?: ethers.Contract;
    paymentStream?: ethers.Contract;
    reputationSystem?: ethers.Contract;
    priceOracle?: ethers.Contract;
  } = {};

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get signer
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      
      // Initialize contracts
      await this.initializeContracts();
      
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async ensureSomniaNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not available');
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId as string, 16);

      if (currentChainId !== 50312) {
        // Try to switch to Somnia testnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xc4a0' }], // 50312 in hex
          });
        } catch (switchError: any) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xc4a0',
                chainName: 'Somnia Testnet',
                nativeCurrency: {
                  name: 'Somnia Test Token',
                  symbol: 'STT',
                  decimals: 18,
                },
                rpcUrls: ['https://dream-rpc.somnia.network/'],
                blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error('Failed to ensure Somnia network:', error);
      throw error;
    }
  }

  private async initializeContracts(): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer not available');
    }

    try {
      // Initialize NFTFlow contract
      if (CONTRACT_ADDRESSES.NFTFlow !== '0x0000000000000000000000000000000000000000') {
        this.contracts.nftFlow = new ethers.Contract(
          CONTRACT_ADDRESSES.NFTFlow,
          NFTFLOW_ABI,
          this.signer
        );
        console.log('✅ NFTFlow contract initialized');
      }

      // Initialize PaymentStream contract
      if (CONTRACT_ADDRESSES.PaymentStream !== '0x0000000000000000000000000000000000000000') {
        this.contracts.paymentStream = new ethers.Contract(
          CONTRACT_ADDRESSES.PaymentStream,
          PAYMENT_STREAM_ABI,
          this.signer
        );
        console.log('✅ PaymentStream contract initialized');
      }

      // Initialize ReputationSystem contract
      if (CONTRACT_ADDRESSES.ReputationSystem !== '0x0000000000000000000000000000000000000000') {
        this.contracts.reputationSystem = new ethers.Contract(
          CONTRACT_ADDRESSES.ReputationSystem,
          REPUTATION_SYSTEM_ABI,
          this.signer
        );
        console.log('✅ ReputationSystem contract initialized');
      }

      // Initialize MockPriceOracle contract
      if (CONTRACT_ADDRESSES.MockPriceOracle !== '0x0000000000000000000000000000000000000000') {
        this.contracts.priceOracle = new ethers.Contract(
          CONTRACT_ADDRESSES.MockPriceOracle,
          MOCK_PRICE_ORACLE_ABI,
          this.signer
        );
        console.log('✅ MockPriceOracle contract initialized');
      }
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      throw error;
    }
  }

  async getAccount(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  }

  async getBalance(): Promise<string> {
    if (!this.signer) return '0';
    try {
      const address = await this.signer.getAddress();
      const balance = await this.provider!.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async getNetwork(): Promise<{ chainId: number; name: string }> {
    if (!this.provider) {
      throw new Error('Provider not available');
    }
    const network = await this.provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name
    };
  }

  // NFT Rental Functions
  async listNFTForRental(
    nftContract: string,
    tokenId: string,
    pricePerSecond: string,
    minDuration: number,
    maxDuration: number,
    collateralRequired: string
  ): Promise<string> {
    if (!this.contracts.nftFlow) {
      throw new Error('NFTFlow contract not initialized');
    }

    try {
      const tx = await this.contracts.nftFlow.listForRental(
        nftContract,
        tokenId,
        ethers.parseEther(pricePerSecond),
        minDuration,
        maxDuration,
        ethers.parseEther(collateralRequired)
      );

      const receipt = await tx.wait();
      console.log('NFT listed for rental:', receipt);
      return receipt.hash;
    } catch (error) {
      console.error('Failed to list NFT for rental:', error);
      throw error;
    }
  }

  async rentNFT(listingId: string, duration: number): Promise<string> {
    if (!this.contracts.nftFlow) {
      throw new Error('NFTFlow contract not initialized');
    }

    try {
      // Get listing details to calculate total cost
      const listing = await this.contracts.nftFlow.getRentalListing(listingId);
      const totalCost = BigInt(listing.pricePerSecond) * BigInt(duration);
      const collateral = BigInt(listing.collateralRequired);
      const totalAmount = totalCost + collateral;

      const tx = await this.contracts.nftFlow.rentNFT(listingId, duration, {
        value: totalAmount
      });

      const receipt = await tx.wait();
      console.log('NFT rented:', receipt);
      return receipt.hash;
    } catch (error) {
      console.error('Failed to rent NFT:', error);
      throw error;
    }
  }

  async returnNFT(listingId: string): Promise<string> {
    if (!this.contracts.nftFlow) {
      throw new Error('NFTFlow contract not initialized');
    }

    try {
      const tx = await this.contracts.nftFlow.returnNFT(listingId);
      const receipt = await tx.wait();
      console.log('NFT returned:', receipt);
      return receipt.hash;
    } catch (error) {
      console.error('Failed to return NFT:', error);
      throw error;
    }
  }

  async getRentalListing(listingId: string): Promise<NFTRentalListing | null> {
    if (!this.contracts.nftFlow) {
      throw new Error('NFTFlow contract not initialized');
    }

    try {
      const listing = await this.contracts.nftFlow.getRentalListing(listingId);
      
      // Try to get metadata
      let metadata = null;
      try {
        const erc721Contract = new ethers.Contract(
          listing.nftContract,
          MOCK_ERC721_ABI,
          this.signer!
        );
        const tokenURI = await erc721Contract.tokenURI(listing.tokenId);
        
        if (tokenURI.startsWith('http')) {
          const response = await fetch(tokenURI);
          metadata = await response.json();
        }
      } catch (error) {
        console.warn('Could not fetch metadata:', error);
      }

      return {
        id: listingId,
        nftContract: listing.nftContract,
        tokenId: listing.tokenId.toString(),
        owner: listing.owner,
        pricePerSecond: ethers.formatEther(listing.pricePerSecond),
        minDuration: Number(listing.minDuration),
        maxDuration: Number(listing.maxDuration),
        collateralRequired: ethers.formatEther(listing.collateralRequired),
        isActive: listing.isActive,
        metadata
      };
    } catch (error) {
      console.error('Failed to get rental listing:', error);
      return null;
    }
  }

  async getRentalInfo(listingId: string): Promise<RentalInfo | null> {
    if (!this.contracts.nftFlow) {
      throw new Error('NFTFlow contract not initialized');
    }

    try {
      const rentalInfo = await this.contracts.nftFlow.getRentalInfo(listingId);
      
      return {
        renter: rentalInfo.renter,
        startTime: Number(rentalInfo.startTime),
        endTime: Number(rentalInfo.endTime),
        isActive: rentalInfo.isActive,
        totalPaid: ethers.formatEther(rentalInfo.totalPaid || 0)
      };
    } catch (error) {
      console.error('Failed to get rental info:', error);
      return null;
    }
  }

  async getAllRentalListings(): Promise<NFTRentalListing[]> {
    if (!this.contracts.nftFlow) {
      throw new Error('NFTFlow contract not initialized');
    }

    try {
      // This would need to be implemented in the contract or use events
      // For now, we'll return an empty array and rely on mock data
      const listings: NFTRentalListing[] = [];
      
      // You could implement event listening here to get all listings
      // const filter = this.contracts.nftFlow.filters.NFTListedForRental();
      // const events = await this.contracts.nftFlow.queryFilter(filter);
      
      return listings;
    } catch (error) {
      console.error('Failed to get all rental listings:', error);
      return [];
    }
  }

  // Check if contracts are properly initialized
  isContractReady(): boolean {
    return !!this.contracts.nftFlow;
  }

  // Get contract instances for direct access
  getContracts() {
    return this.contracts;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
