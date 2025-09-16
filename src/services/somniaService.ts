import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { 
  NFTFLOW_ABI, 
  PAYMENT_STREAM_ABI, 
  REPUTATION_SYSTEM_ABI, 
  MOCK_PRICE_ORACLE_ABI 
} from '@/lib/contracts';

export interface SomniaMetrics {
  totalTransactions: number;
  totalVolumeSTT: string;
  averageGasPrice: string;
  blockTime: number;
  throughputTPS: number;
  microPaymentCount: number;
  activeRentals: number;
  networkHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface SomniaNetworkInfo {
  chainId: number;
  name: string;
  currency: string;
  blockExplorerUrl: string;
  rpcUrl: string;
  blockTime: number;
  gasPrice: string;
  isHealthy: boolean;
  lastBlockNumber: number;
}

export class SomniaService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contracts: {
    nftFlow?: ethers.Contract;
    paymentStream?: ethers.Contract;
    reputationSystem?: ethers.Contract;
    priceOracle?: ethers.Contract;
  } = {};
  
  private metrics: SomniaMetrics = {
    totalTransactions: 0,
    totalVolumeSTT: '0',
    averageGasPrice: '0',
    blockTime: 0,
    throughputTPS: 0,
    microPaymentCount: 0,
    activeRentals: 0,
    networkHealth: 'excellent'
  };

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async connect(): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get signer
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      
      // Ensure we're on Somnia testnet
      await this.ensureSomniaNetwork();
      
      // Initialize contracts
      await this.initializeContracts();
      
      // Start metrics monitoring
      this.startMetricsMonitoring();
      
      return address;
    } catch (error) {
      console.error('Failed to connect to Somnia:', error);
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
                rpcUrls: ['https://dream-rpc.somnia.network/'],
                nativeCurrency: {
                  name: 'Somnia Test Token',
                  symbol: 'STT',
                  decimals: 18,
                },
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

  private async initializeContracts() {
    if (!this.signer) return;

    try {
      // Initialize core contracts
      this.contracts.nftFlow = new ethers.Contract(
        CONTRACT_ADDRESSES.NFTFlow,
        NFTFLOW_ABI,
        this.signer
      );

      this.contracts.paymentStream = new ethers.Contract(
        CONTRACT_ADDRESSES.PaymentStream,
        PAYMENT_STREAM_ABI,
        this.signer
      );

      this.contracts.reputationSystem = new ethers.Contract(
        CONTRACT_ADDRESSES.ReputationSystem,
        REPUTATION_SYSTEM_ABI,
        this.signer
      );

      this.contracts.priceOracle = new ethers.Contract(
        CONTRACT_ADDRESSES.MockPriceOracle,
        MOCK_PRICE_ORACLE_ABI,
        this.signer
      );

      console.log('✅ Somnia contracts initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Somnia contracts:', error);
      throw error;
    }
  }

  private startMetricsMonitoring() {
    // Monitor network metrics every 30 seconds
    setInterval(async () => {
      try {
        await this.updateMetrics();
      } catch (error) {
        console.error('Failed to update Somnia metrics:', error);
      }
    }, 30000);

    // Initial metrics update
    this.updateMetrics();
  }

  private async updateMetrics() {
    if (!this.provider) return;

    try {
      // Get current block info
      const blockNumber = await this.provider.getBlockNumber();
      const block = await this.provider.getBlock(blockNumber);
      const gasPrice = await this.provider.getFeeData();

      // Calculate block time (approximate)
      const previousBlock = await this.provider.getBlock(blockNumber - 1);
      const blockTime = block.timestamp - previousBlock.timestamp;

      // Update metrics
      this.metrics.blockTime = blockTime;
      this.metrics.averageGasPrice = ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
      this.metrics.lastBlockNumber = blockNumber;

      // Estimate throughput (transactions per second)
      this.metrics.throughputTPS = block.transactions.length / blockTime;

      // Determine network health based on metrics
      this.determineNetworkHealth();

      console.log('📊 Somnia metrics updated:', this.metrics);
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }

  private determineNetworkHealth() {
    const { blockTime, throughputTPS } = this.metrics;

    if (blockTime <= 1 && throughputTPS >= 1000) {
      this.metrics.networkHealth = 'excellent';
    } else if (blockTime <= 2 && throughputTPS >= 500) {
      this.metrics.networkHealth = 'good';
    } else if (blockTime <= 5 && throughputTPS >= 100) {
      this.metrics.networkHealth = 'fair';
    } else {
      this.metrics.networkHealth = 'poor';
    }
  }

  // Micro-payment functionality leveraging Somnia's low fees
  async createMicroRental(
    nftContract: string,
    tokenId: string,
    pricePerSecond: string,
    duration: number
  ): Promise<string> {
    if (!this.contracts.nftFlow || !this.signer) {
      throw new Error('Contracts not initialized');
    }

    try {
      // Calculate total cost (very small due to Somnia's low fees)
      const totalCost = ethers.parseEther(pricePerSecond) * BigInt(duration);
      
      // Estimate gas for micro-transaction
      const gasEstimate = await this.contracts.nftFlow.rentNFT.estimateGas(
        ethers.keccak256(ethers.toUtf8Bytes(`${nftContract}-${tokenId}`)),
        duration,
        { value: totalCost }
      );

      // Execute micro-rental transaction
      const tx = await this.contracts.nftFlow.rentNFT(
        ethers.keccak256(ethers.toUtf8Bytes(`${nftContract}-${tokenId}`)),
        duration,
        { value: totalCost, gasLimit: gasEstimate }
      );

      // Wait for confirmation (fast on Somnia)
      const receipt = await tx.wait();
      
      // Update metrics
      this.metrics.microPaymentCount++;
      this.metrics.totalTransactions++;
      this.metrics.totalVolumeSTT = ethers.formatEther(
        BigInt(this.metrics.totalVolumeSTT) + totalCost
      );

      console.log('✅ Micro-rental created:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to create micro-rental:', error);
      throw error;
    }
  }

  // Real-time payment streaming
  async createPaymentStream(
    recipient: string,
    amount: string,
    duration: number
  ): Promise<string> {
    if (!this.contracts.paymentStream || !this.signer) {
      throw new Error('Payment stream contract not initialized');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + duration;

      const tx = await this.contracts.paymentStream.createStream(
        recipient,
        startTime,
        endTime,
        { value: amountWei }
      );

      const receipt = await tx.wait();
      console.log('✅ Payment stream created:', receipt.transactionHash);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to create payment stream:', error);
      throw error;
    }
  }

  // Get network information
  async getNetworkInfo(): Promise<SomniaNetworkInfo> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();

      return {
        chainId: Number(network.chainId),
        name: 'Somnia Testnet',
        currency: 'STT',
        blockExplorerUrl: 'https://shannon-explorer.somnia.network/',
        rpcUrl: 'https://dream-rpc.somnia.network/',
        blockTime: this.metrics.blockTime,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        isHealthy: this.metrics.networkHealth === 'excellent' || this.metrics.networkHealth === 'good',
        lastBlockNumber: blockNumber
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }

  // Get current metrics
  getMetrics(): SomniaMetrics {
    return { ...this.metrics };
  }

  // Get contract instances
  getContracts() {
    return { ...this.contracts };
  }

  // Check if service is ready
  isReady(): boolean {
    return !!(this.provider && this.signer && this.contracts.nftFlow);
  }

  // Disconnect
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.metrics = {
      totalTransactions: 0,
      totalVolumeSTT: '0',
      averageGasPrice: '0',
      blockTime: 0,
      throughputTPS: 0,
      microPaymentCount: 0,
      activeRentals: 0,
      networkHealth: 'excellent'
    };
  }
}

// Export singleton instance
export const somniaService = new SomniaService();
