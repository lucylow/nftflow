import { ethers } from 'ethers';
import { SOMNIA_CONFIG, SOMNIA_ABIS } from '../config/somnia.config.js';
import logger from '../utils/logger.js';

class SomniaService {
  constructor() {
    this.provider = null;
    this.wsProvider = null;
    this.wallet = null;
    this.contracts = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  async initialize() {
    try {
      await this.setupProviders();
      await this.setupContracts();
      await this.setupWallet();
      this.isConnected = true;
      logger.info('Somnia Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Somnia Service:', error);
      throw error;
    }
  }

  async setupProviders() {
    const config = process.env.NODE_ENV === 'production' 
      ? SOMNIA_CONFIG.MAINNET 
      : SOMNIA_CONFIG.TESTNET;

    // HTTP Provider for stable queries
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl, {
      name: 'somnia',
      chainId: config.chainId
    });

    // WebSocket Provider for real-time events
    this.wsProvider = new ethers.WebSocketProvider(config.wsUrl);
    
    // Enhanced connection handling
    this.wsProvider._websocket.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.info('WebSocket connection established');
    };

    this.wsProvider._websocket.onclose = () => {
      this.isConnected = false;
      logger.warn('WebSocket connection closed, attempting reconnection...');
      this.handleReconnection();
    };

    this.wsProvider._websocket.onerror = (error) => {
      logger.error('WebSocket error:', error);
    };

    await this.wsProvider._waitUntilReady();
  }

  async setupContracts() {
    const config = process.env.NODE_ENV === 'production' 
      ? SOMNIA_CONFIG.MAINNET 
      : SOMNIA_CONFIG.TESTNET;

    // Setup MultiCall contract for atomic operations
    const multiCallAddress = config.chainId === 5031 
      ? SOMNIA_CONFIG.CONTRACTS.MULTICALL_V3.mainnet
      : SOMNIA_CONFIG.CONTRACTS.MULTICALL_V3.testnet;

    this.contracts.set('MultiCall', new ethers.Contract(
      multiCallAddress,
      SOMNIA_ABIS.MULTICALL_V3,
      this.provider
    ));

    // Setup DIA Oracle for price feeds
    this.contracts.set('DIAOracle', new ethers.Contract(
      SOMNIA_CONFIG.CONTRACTS.DIA_ORACLE,
      SOMNIA_ABIS.DIA_ORACLE,
      this.provider
    ));

    // Setup NFTFlow core contract
    if (SOMNIA_CONFIG.CONTRACTS.NFTFLOW_CORE) {
      this.contracts.set('NFTFlow', new ethers.Contract(
        SOMNIA_CONFIG.CONTRACTS.NFTFLOW_CORE,
        SOMNIA_ABIS.NFTFLOW_CORE,
        this.provider
      ));
    }

    // Setup Payment Stream contract
    if (SOMNIA_CONFIG.CONTRACTS.PAYMENT_STREAM) {
      this.contracts.set('PaymentStream', new ethers.Contract(
        SOMNIA_CONFIG.CONTRACTS.PAYMENT_STREAM,
        SOMNIA_ABIS.PAYMENT_STREAM,
        this.provider
      ));
    }
  }

  async setupWallet() {
    if (process.env.OPERATOR_PRIVATE_KEY) {
      this.wallet = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY, this.provider);
      logger.info(`Wallet initialized: ${this.wallet.address}`);
    }
  }

  async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    setTimeout(async () => {
      try {
        await this.setupProviders();
        await this.setupContracts();
        logger.info('Successfully reconnected to Somnia');
      } catch (error) {
        logger.error('Reconnection failed:', error);
        this.handleReconnection();
      }
    }, delay);
  }

  // Somnia-specific utility methods
  async getOptimalGasPrice() {
    try {
      const gasPrice = await this.provider.getGasPrice();
      // Somnia's low fees allow us to use higher gas prices for speed
      return gasPrice * 2n;
    } catch (error) {
      logger.error('Failed to get gas price:', error);
      return ethers.parseUnits('1', 'gwei'); // Fallback
    }
  }

  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();
      
      return {
        chainId: Number(network.chainId),
        name: network.name,
        blockNumber,
        gasPrice: gasPrice.toString(),
        isConnected: this.isConnected
      };
    } catch (error) {
      logger.error('Failed to get network info:', error);
      return null;
    }
  }

  async executeMultiCall(calls, value = 0) {
    try {
      const multiCallContract = this.contracts.get('MultiCall');
      if (!multiCallContract) {
        throw new Error('MultiCall contract not initialized');
      }

      const gasPrice = await this.getOptimalGasPrice();
      
      const tx = await multiCallContract.aggregate(calls, {
        value: value,
        gasLimit: 500000, // Somnia's low gas costs allow generous limits
        gasPrice: gasPrice
      });

      return await tx.wait();
    } catch (error) {
      logger.error('MultiCall execution failed:', error);
      throw error;
    }
  }

  async getNFTPrice(nftContract, tokenId) {
    try {
      const oracleContract = this.contracts.get('DIAOracle');
      if (!oracleContract) {
        logger.warn('DIA Oracle not available, using fallback price');
        return ethers.parseEther('0.001'); // Fallback price
      }

      const price = await oracleContract.getPrice(nftContract, tokenId);
      return price;
    } catch (error) {
      logger.warn(`Oracle price not available for ${nftContract}:${tokenId}, using fallback`);
      return ethers.parseEther('0.001'); // Fallback price
    }
  }

  async createMicroTransaction(to, purpose, value = '1000000000000000') {
    try {
      const somniaOptimizedContract = this.contracts.get('SomniaOptimizedFeatures');
      if (!somniaOptimizedContract) {
        throw new Error('SomniaOptimizedFeatures contract not initialized');
      }

      const gasPrice = await this.getOptimalGasPrice();
      
      const tx = await somniaOptimizedContract.createMicroTransaction(to, purpose, {
        value: value,
        gasPrice: gasPrice
      });

      return await tx.wait();
    } catch (error) {
      logger.error('Micro transaction creation failed:', error);
      throw error;
    }
  }

  async demonstrateSubSecondFinality(value = '1000000000000000') {
    try {
      const somniaOptimizedContract = this.contracts.get('SomniaOptimizedFeatures');
      if (!somniaOptimizedContract) {
        throw new Error('SomniaOptimizedFeatures contract not initialized');
      }

      const startTime = Date.now();
      
      const tx = await somniaOptimizedContract.demonstrateSubSecondFinality({
        value: value
      });

      const receipt = await tx.wait();
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      return {
        txHash: receipt.hash,
        processingTime,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Sub-second finality demonstration failed:', error);
      throw error;
    }
  }

  async createRealTimeStream(recipient, duration, value) {
    try {
      const somniaOptimizedContract = this.contracts.get('SomniaOptimizedFeatures');
      if (!somniaOptimizedContract) {
        throw new Error('SomniaOptimizedFeatures contract not initialized');
      }

      const gasPrice = await this.getOptimalGasPrice();
      
      const tx = await somniaOptimizedContract.createRealTimeStream(recipient, duration, {
        value: value,
        gasPrice: gasPrice
      });

      return await tx.wait();
    } catch (error) {
      logger.error('Real-time stream creation failed:', error);
      throw error;
    }
  }

  async batchMicroTransactions(recipients, amounts, purposes) {
    try {
      const somniaOptimizedContract = this.contracts.get('SomniaOptimizedFeatures');
      if (!somniaOptimizedContract) {
        throw new Error('SomniaOptimizedFeatures contract not initialized');
      }

      const totalValue = amounts.reduce((sum, amount) => sum + BigInt(amount), 0n);
      const gasPrice = await this.getOptimalGasPrice();
      
      const tx = await somniaOptimizedContract.batchMicroTransactions(
        recipients, 
        amounts, 
        purposes,
        {
          value: totalValue,
          gasPrice: gasPrice
        }
      );

      return await tx.wait();
    } catch (error) {
      logger.error('Batch micro transactions failed:', error);
      throw error;
    }
  }

  // Event listening methods
  async listenToRentalEvents(callback) {
    try {
      const nftFlowContract = this.contracts.get('NFTFlow');
      if (!nftFlowContract) {
        throw new Error('NFTFlow contract not initialized');
      }

      // Listen for NFTRented events
      nftFlowContract.on('NFTRented', async (rentalId, nftContract, tokenId, lender, tenant, startTime, endTime, totalPrice, paymentStream) => {
        try {
          await callback({
            type: 'rental_started',
            rentalId: rentalId.toString(),
            nftContract: nftContract.toLowerCase(),
            tokenId: tokenId.toString(),
            lender: lender.toLowerCase(),
            tenant: tenant.toLowerCase(),
            startTime: new Date(Number(startTime) * 1000),
            endTime: new Date(Number(endTime) * 1000),
            totalPrice: totalPrice.toString(),
            paymentStream: paymentStream.toLowerCase()
          });
        } catch (error) {
          logger.error('Error processing NFTRented event:', error);
        }
      });

      // Listen for RentalCompleted events
      nftFlowContract.on('RentalCompleted', async (rentalId, tenant, successful) => {
        try {
          await callback({
            type: 'rental_completed',
            rentalId: rentalId.toString(),
            tenant: tenant.toLowerCase(),
            successful
          });
        } catch (error) {
          logger.error('Error processing RentalCompleted event:', error);
        }
      });

      logger.info('Rental event listeners set up successfully');
    } catch (error) {
      logger.error('Failed to set up rental event listeners:', error);
      throw error;
    }
  }

  async listenToStreamEvents(callback) {
    try {
      const paymentStreamContract = this.contracts.get('PaymentStream');
      if (!paymentStreamContract) {
        throw new Error('PaymentStream contract not initialized');
      }

      // Listen for StreamCreated events
      paymentStreamContract.on('StreamCreated', async (streamId, payer, payee, totalAmount, startTime, endTime) => {
        try {
          await callback({
            type: 'stream_created',
            streamId: streamId.toLowerCase(),
            payer: payer.toLowerCase(),
            payee: payee.toLowerCase(),
            totalAmount: totalAmount.toString(),
            startTime: new Date(Number(startTime) * 1000),
            endTime: new Date(Number(endTime) * 1000)
          });
        } catch (error) {
          logger.error('Error processing StreamCreated event:', error);
        }
      });

      // Listen for FundsReleased events
      paymentStreamContract.on('FundsReleased', async (streamId, amount) => {
        try {
          await callback({
            type: 'funds_released',
            streamId: streamId.toLowerCase(),
            amount: amount.toString()
          });
        } catch (error) {
          logger.error('Error processing FundsReleased event:', error);
        }
      });

      logger.info('Payment stream event listeners set up successfully');
    } catch (error) {
      logger.error('Failed to set up payment stream event listeners:', error);
      throw error;
    }
  }

  // Performance monitoring
  async getPerformanceMetrics() {
    try {
      const startTime = Date.now();
      const blockNumber = await this.provider.getBlockNumber();
      const networkLatency = Date.now() - startTime;
      
      const block = await this.provider.getBlock(blockNumber);
      const previousBlock = await this.provider.getBlock(blockNumber - 1);
      
      let tps = 0;
      let blockTime = 0;
      
      if (block && previousBlock) {
        blockTime = (block.timestamp - previousBlock.timestamp) * 1000; // Convert to milliseconds
        tps = blockTime > 0 ? block.transactions.length / (blockTime / 1000) : 0;
      }
      
      return {
        tps: tps,
        blockTime: blockTime,
        networkLatency: networkLatency,
        blockNumber: blockNumber,
        timestamp: Date.now(),
        isConnected: this.isConnected
      };
    } catch (error) {
      logger.error('Failed to get performance metrics:', error);
      return null;
    }
  }

  async destroy() {
    try {
      if (this.wsProvider) {
        this.wsProvider.destroy();
      }
      logger.info('Somnia Service destroyed');
    } catch (error) {
      logger.error('Error destroying Somnia Service:', error);
    }
  }
}

export default SomniaService;
