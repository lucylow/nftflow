import { ethers } from 'ethers';

// Somnia Network Configuration
const SOMNIA_CONFIG = {
  TESTNET: {
    RPC_URL: 'https://dream-rpc.somnia.network/',
    WS_RPC_URL: 'wss://dream-rpc.somnia.network/',
    CHAIN_ID: 50312,
    BLOCK_EXPLORER: 'https://shannon-explorer.somnia.network/',
    CURRENCY: 'STT'
  },
  MAINNET: {
    RPC_URL: 'https://mainnet-rpc.somnia.network/',
    WS_RPC_URL: 'wss://mainnet-rpc.somnia.network/',
    CHAIN_ID: 50311,
    BLOCK_EXPLORER: 'https://explorer.somnia.network/',
    CURRENCY: 'STT'
  }
};

interface RentalEvent {
  rentalId: string;
  nftContract: string;
  tokenId: string;
  lender: string;
  tenant: string;
  startTime: number;
  endTime: number;
  pricePerSecond: string;
  totalPrice: string;
  transactionHash: string;
  blockNumber: number;
  utilityType: number;
}

interface NetworkStats {
  tps: number;
  blockTime: number;
  gasPrice: number;
  pendingTransactions: number;
  blockNumber: number;
}

class SomniaService {
  private provider: ethers.JsonRpcProvider;
  private wsProvider: ethers.WebSocketProvider;
  private wallet: ethers.Wallet;
  private nftFlowInterface: ethers.Interface;
  private isInitialized = false;

  constructor() {
    // Utilize Somnia's high-performance RPC
    this.provider = new ethers.JsonRpcProvider(SOMNIA_CONFIG.TESTNET.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', this.provider);
    
    // Leverage Somnia's WebSocket for real-time events
    this.wsProvider = new ethers.WebSocketProvider(SOMNIA_CONFIG.TESTNET.WS_RPC_URL);
    
    // Initialize contract interface
    this.nftFlowInterface = new ethers.Interface([
      'event NFTRented(bytes32 indexed rentalId, address indexed nftContract, uint256 indexed tokenId, address lender, address tenant, uint256 startTime, uint256 endTime, uint256 pricePerSecond, uint256 totalPrice)',
      'event RentalCompleted(bytes32 indexed rentalId, uint256 finalAmount)',
      'event RentalCancelled(bytes32 indexed rentalId, uint256 refundAmount)',
      'event PaymentStreamUpdated(bytes32 indexed rentalId, uint256 releasedAmount)'
    ]);
    
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Use Somnia's sub-second finality for real-time event processing
      this.wsProvider.on('block', async (blockNumber) => {
        await this.processNewBlock(blockNumber);
      });

      // Monitor rental events in real-time
      this.wsProvider.on('logs', async (log) => {
        await this.handleRentalEvent(log);
      });

      this.isInitialized = true;
      console.log('🚀 Somnia Service initialized with real-time monitoring');
    } catch (error) {
      console.error('Failed to initialize Somnia service:', error);
    }
  }

  async processNewBlock(blockNumber: number) {
    try {
      // Leverage Somnia's high TPS for rapid block processing
      const block = await this.provider.getBlock(blockNumber);
      
      if (!block) return;

      // Process transactions in parallel using Somnia's capabilities
      const transactionPromises = block.transactions.map(txHash => 
        this.processTransaction(txHash)
      );
      
      await Promise.all(transactionPromises);
      
      // Update network statistics
      await this.updateNetworkStats(blockNumber);
      
    } catch (error) {
      console.error('Error processing block:', error);
    }
  }

  async processTransaction(txHash: string) {
    try {
      // Use Somnia's fast finality for immediate transaction processing
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt || !receipt.logs) return;

      // Process NFT rental events in real-time
      const rentalEvents = receipt.logs.filter(log => 
        log.address.toLowerCase() === process.env.NFTFLOW_CONTRACT_ADDRESS?.toLowerCase()
      );
      
      await Promise.all(
        rentalEvents.map(event => this.handleRentalEvent(event))
      );
      
    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  }

  async handleRentalEvent(event: ethers.Log) {
    try {
      // Leverage Somnia's low latency for instant event handling
      const parsedEvent = this.nftFlowInterface.parseLog(event);
      
      if (!parsedEvent) return;

      switch (parsedEvent.name) {
        case 'NFTRented':
          await this.handleNewRental(parsedEvent.args, event);
          break;
        case 'RentalCompleted':
          await this.handleRentalCompletion(parsedEvent.args, event);
          break;
        case 'RentalCancelled':
          await this.handleRentalCancellation(parsedEvent.args, event);
          break;
        case 'PaymentStreamUpdated':
          await this.handlePaymentStreamUpdate(parsedEvent.args, event);
          break;
      }
    } catch (error) {
      console.error('Error handling rental event:', error);
    }
  }

  async handleNewRental(rentalData: any, event: ethers.Log) {
    // Use Somnia's high throughput for immediate database updates
    const rental: RentalEvent = {
      rentalId: rentalData.rentalId,
      nftContract: rentalData.nftContract.toLowerCase(),
      tokenId: rentalData.tokenId.toString(),
      lender: rentalData.lender.toLowerCase(),
      tenant: rentalData.tenant.toLowerCase(),
      startTime: Number(rentalData.startTime),
      endTime: Number(rentalData.endTime),
      pricePerSecond: formatEther(rentalData.pricePerSecond),
      totalPrice: formatEther(rentalData.totalPrice),
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      utilityType: Number(rentalData.utilityType || 0)
    };

    // Instant database update leveraging Somnia's speed
    await this.saveRentalToDatabase(rental);

    // Real-time notification using Somnia's low latency
    await this.sendRealTimeNotification(rental);
    
    console.log(`🎯 New rental processed: ${rental.rentalId}`);
  }

  async handleRentalCompletion(rentalData: any, event: ethers.Log) {
    const rentalId = rentalData.rentalId;
    const finalAmount = formatEther(rentalData.finalAmount);
    
    // Update rental status in real-time
    await this.updateRentalStatus(rentalId, 'completed', finalAmount);
    
    console.log(`✅ Rental completed: ${rentalId}`);
  }

  async handleRentalCancellation(rentalData: any, event: ethers.Log) {
    const rentalId = rentalData.rentalId;
    const refundAmount = formatEther(rentalData.refundAmount);
    
    // Update rental status in real-time
    await this.updateRentalStatus(rentalId, 'cancelled', refundAmount);
    
    console.log(`❌ Rental cancelled: ${rentalId}`);
  }

  async handlePaymentStreamUpdate(rentalData: any, event: ethers.Log) {
    const rentalId = rentalData.rentalId;
    const releasedAmount = formatEther(rentalData.releasedAmount);
    
    // Update payment stream in real-time
    await this.updatePaymentStream(rentalId, releasedAmount);
    
    console.log(`💰 Payment stream updated: ${rentalId} - ${releasedAmount} STT`);
  }

  async saveRentalToDatabase(rental: RentalEvent) {
    // Simulate database save - in real implementation, use your database
    console.log('💾 Saving rental to database:', rental.rentalId);
    
    // This would integrate with your database (MongoDB, PostgreSQL, etc.)
    // await Rental.findOneAndUpdate(
    //   { rentalId: rental.rentalId },
    //   rental,
    //   { upsert: true, new: true }
    // );
  }

  async updateRentalStatus(rentalId: string, status: string, amount: string) {
    console.log(`📊 Updating rental status: ${rentalId} - ${status} - ${amount} STT`);
    
    // This would update your database
    // await Rental.findOneAndUpdate(
    //   { rentalId },
    //   { status, finalAmount: amount, updatedAt: new Date() }
    // );
  }

  async updatePaymentStream(rentalId: string, releasedAmount: string) {
    console.log(`💸 Updating payment stream: ${rentalId} - ${releasedAmount} STT`);
    
    // This would update payment stream data
    // await PaymentStream.findOneAndUpdate(
    //   { rentalId },
    //   { releasedAmount, lastUpdate: new Date() }
    // );
  }

  async sendRealTimeNotification(rental: RentalEvent) {
    // Real-time notification using WebSocket or Server-Sent Events
    console.log(`📢 Sending real-time notification for rental: ${rental.rentalId}`);
    
    // This would send notifications to connected clients
    // websocketServer.emit('newRental', rental);
  }

  async updateNetworkStats(blockNumber: number) {
    try {
      // Leverage Somnia's high throughput for real-time analytics
      const [feeData, pendingCount] = await Promise.all([
        this.provider.getFeeData(),
        this.getPendingTransactionCount()
      ]);

      const stats: NetworkStats = {
        tps: await this.calculateTPS(),
        blockTime: await this.calculateBlockTime(),
        gasPrice: Number(feeData.gasPrice),
        pendingTransactions: pendingCount,
        blockNumber: blockNumber
      };

      // Store network stats for dashboard
      await this.storeNetworkStats(stats);
      
    } catch (error) {
      console.error('Error updating network stats:', error);
    }
  }

  async calculateTPS(): Promise<number> {
    try {
      const currentBlock = await this.provider.getBlock('latest');
      const previousBlock = await this.provider.getBlock(currentBlock!.number - 1);
      
      if (!currentBlock || !previousBlock) return 0;
      
      const timeDiff = currentBlock.timestamp - previousBlock.timestamp;
      const txCount = currentBlock.transactions.length;
      
      return timeDiff > 0 ? txCount / timeDiff : 0;
    } catch (error) {
      console.error('Error calculating TPS:', error);
      return 0;
    }
  }

  async calculateBlockTime(): Promise<number> {
    try {
      const currentBlock = await this.provider.getBlock('latest');
      const previousBlock = await this.provider.getBlock(currentBlock!.number - 1);
      
      if (!currentBlock || !previousBlock) return 0;
      
      return (currentBlock.timestamp - previousBlock.timestamp) * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error calculating block time:', error);
      return 0;
    }
  }

  async getPendingTransactionCount(): Promise<number> {
    try {
      // This would get pending transaction count from mempool
      // For now, return a mock value
      return Math.floor(Math.random() * 100);
    } catch (error) {
      console.error('Error getting pending transaction count:', error);
      return 0;
    }
  }

  async storeNetworkStats(stats: NetworkStats) {
    console.log('📈 Network stats:', stats);
    
    // This would store stats in your database or cache
    // await NetworkStats.findOneAndUpdate(
    //   { timestamp: new Date() },
    //   stats,
    //   { upsert: true }
    // );
  }

  // Public methods for frontend integration
  async getNetworkStats(): Promise<NetworkStats> {
    const blockNumber = await this.provider.getBlockNumber();
    const feeData = await this.provider.getFeeData();
    
    return {
      tps: await this.calculateTPS(),
      blockTime: await this.calculateBlockTime(),
      gasPrice: Number(feeData.gasPrice),
      pendingTransactions: await this.getPendingTransactionCount(),
      blockNumber: blockNumber
    };
  }

  async getRecentRentals(limit: number = 10): Promise<RentalEvent[]> {
    // This would fetch recent rentals from database
    console.log(`📋 Fetching recent rentals (limit: ${limit})`);
    return [];
  }

  async getRentalById(rentalId: string): Promise<RentalEvent | null> {
    // This would fetch rental by ID from database
    console.log(`🔍 Fetching rental: ${rentalId}`);
    return null;
  }

  // Cleanup method
  async destroy() {
    if (this.wsProvider) {
      this.wsProvider.removeAllListeners();
      this.wsProvider.destroy();
    }
    this.isInitialized = false;
    console.log('🛑 Somnia Service destroyed');
  }
}

export default SomniaService;
export { SOMNIA_CONFIG, type RentalEvent, type NetworkStats };
