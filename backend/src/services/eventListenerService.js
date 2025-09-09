import { ethers } from 'ethers';
import Redis from 'ioredis';
import { SOMNIA_CONFIG, SOMNIA_ABIS } from '../config/somnia.config.js';
import logger from '../utils/logger.js';

class SomniaEventListenerService {
  constructor() {
    this.provider = null;
    this.wsProvider = null;
    this.redis = new Redis(process.env.REDIS_URL);
    this.eventSubscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.isConnected = false;
    this.contracts = new Map();
  }

  async initialize() {
    try {
      await this.setupProviders();
      await this.setupContracts();
      await this.setupEventListeners();
      await this.startHealthCheck();
      logger.info('Somnia Event Listener Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Event Listener Service:', error);
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
    // Setup NFTFlow contract
    if (SOMNIA_CONFIG.CONTRACTS.NFTFLOW_CORE) {
      this.contracts.set('NFTFlow', new ethers.Contract(
        SOMNIA_CONFIG.CONTRACTS.NFTFLOW_CORE,
        SOMNIA_ABIS.NFTFLOW_CORE,
        this.wsProvider
      ));
    }

    // Setup Payment Stream contract
    if (SOMNIA_CONFIG.CONTRACTS.PAYMENT_STREAM) {
      this.contracts.set('PaymentStream', new ethers.Contract(
        SOMNIA_CONFIG.CONTRACTS.PAYMENT_STREAM,
        SOMNIA_ABIS.PAYMENT_STREAM,
        this.wsProvider
      ));
    }

    // Setup Somnia Optimized Features contract
    if (SOMNIA_CONFIG.CONTRACTS.SOMNIA_OPTIMIZED_FEATURES) {
      this.contracts.set('SomniaOptimizedFeatures', new ethers.Contract(
        SOMNIA_CONFIG.CONTRACTS.SOMNIA_OPTIMIZED_FEATURES,
        SOMNIA_ABIS.SOMNIA_OPTIMIZED_FEATURES,
        this.wsProvider
      ));
    }
  }

  async setupEventListeners() {
    // Listen for new blocks - leverage Somnia's 800ms block time
    this.wsProvider.on('block', async (blockNumber) => {
      await this.processNewBlock(blockNumber);
    });

    // Listen for rental contract events
    await this.setupRentalEventListeners();
    
    // Listen for payment stream events
    await this.setupPaymentStreamListeners();
    
    // Listen for Somnia optimized features events
    await this.setupSomniaOptimizedEventListeners();
  }

  async setupRentalEventListeners() {
    const rentalContract = this.contracts.get('NFTFlow');
    if (!rentalContract) {
      logger.warn('NFTFlow contract not available for event listening');
      return;
    }

    // NFT Rented Event
    rentalContract.on('NFTRented', async (rentalId, nftContract, tokenId, lender, tenant, startTime, endTime, totalPrice, paymentStream) => {
      try {
        await this.handleRentalStarted({
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

    // Rental Completed Event
    rentalContract.on('RentalCompleted', async (rentalId, tenant, successful) => {
      try {
        await this.handleRentalCompleted({
          rentalId: rentalId.toString(),
          tenant: tenant.toLowerCase(),
          successful
        });
      } catch (error) {
        logger.error('Error processing RentalCompleted event:', error);
      }
    });

    // Rental Listed Event
    rentalContract.on('RentalListed', async (listingId, nftContract, tokenId, owner, pricePerSecond) => {
      try {
        await this.handleRentalListed({
          listingId: listingId.toString(),
          nftContract: nftContract.toLowerCase(),
          tokenId: tokenId.toString(),
          owner: owner.toLowerCase(),
          pricePerSecond: pricePerSecond.toString()
        });
      } catch (error) {
        logger.error('Error processing RentalListed event:', error);
      }
    });

    logger.info('Rental event listeners set up successfully');
  }

  async setupPaymentStreamListeners() {
    const streamContract = this.contracts.get('PaymentStream');
    if (!streamContract) {
      logger.warn('PaymentStream contract not available for event listening');
      return;
    }

    // Stream Created Event
    streamContract.on('StreamCreated', async (streamId, payer, payee, totalAmount, startTime, endTime) => {
      try {
        await this.handleStreamCreated({
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

    // Funds Released Event
    streamContract.on('FundsReleased', async (streamId, amount) => {
      try {
        await this.handleFundsReleased({
          streamId: streamId.toLowerCase(),
          amount: amount.toString()
        });
      } catch (error) {
        logger.error('Error processing FundsReleased event:', error);
      }
    });

    logger.info('Payment stream event listeners set up successfully');
  }

  async setupSomniaOptimizedEventListeners() {
    const somniaContract = this.contracts.get('SomniaOptimizedFeatures');
    if (!somniaContract) {
      logger.warn('SomniaOptimizedFeatures contract not available for event listening');
      return;
    }

    // Micro Transaction Created Event
    somniaContract.on('MicroTransactionCreated', async (transactionId, from, to, amount, purpose) => {
      try {
        await this.handleMicroTransactionCreated({
          transactionId: transactionId.toString(),
          from: from.toLowerCase(),
          to: to.toLowerCase(),
          amount: amount.toString(),
          purpose
        });
      } catch (error) {
        logger.error('Error processing MicroTransactionCreated event:', error);
      }
    });

    // High Frequency Event Started
    somniaContract.on('HighFrequencyEventStarted', async (eventId, eventType, participantCount, totalValue) => {
      try {
        await this.handleHighFrequencyEventStarted({
          eventId: eventId.toString(),
          eventType,
          participantCount: Number(participantCount),
          totalValue: totalValue.toString()
        });
      } catch (error) {
        logger.error('Error processing HighFrequencyEventStarted event:', error);
      }
    });

    // Real-time Stream Created
    somniaContract.on('RealTimeStreamCreated', async (streamId, streamer, recipient, totalAmount, duration) => {
      try {
        await this.handleRealTimeStreamCreated({
          streamId: streamId.toString(),
          streamer: streamer.toLowerCase(),
          recipient: recipient.toLowerCase(),
          totalAmount: totalAmount.toString(),
          duration: Number(duration)
        });
      } catch (error) {
        logger.error('Error processing RealTimeStreamCreated event:', error);
      }
    });

    // Somnia Capability Demonstrated
    somniaContract.on('SomniaCapabilityDemonstrated', async (capability, value, timestamp) => {
      try {
        await this.handleSomniaCapabilityDemonstrated({
          capability,
          value: value.toString(),
          timestamp: Number(timestamp)
        });
      } catch (error) {
        logger.error('Error processing SomniaCapabilityDemonstrated event:', error);
      }
    });

    logger.info('Somnia optimized event listeners set up successfully');
  }

  async processNewBlock(blockNumber) {
    // Leverage Somnia's 800ms block time for real-time processing
    const startTime = Date.now();
    
    try {
      // Cache block info for analytics
      await this.redis.zadd('recent_blocks', blockNumber, JSON.stringify({
        number: blockNumber,
        timestamp: Date.now(),
        processed: false
      }));

      // Update performance metrics
      const blockTime = Date.now() - startTime;
      await this.updatePerformanceMetrics(blockNumber, blockTime);

      // Broadcast block update to connected clients
      await this.broadcastBlockUpdate(blockNumber);

      // Clean up old blocks (keep last 1000)
      await this.redis.zremrangebyrank('recent_blocks', 0, -1001);

    } catch (error) {
      logger.error(`Error processing block ${blockNumber}:`, error);
    }
  }

  async handleRentalStarted(rentalData) {
    try {
      // Store in database
      await this.storeRentalData(rentalData);
      
      // Cache for real-time access
      await this.redis.hset(
        `rental:${rentalData.rentalId}`,
        rentalData
      );

      // Set expiration for rental data
      await this.redis.expire(`rental:${rentalData.rentalId}`, 86400 * 30); // 30 days

      // Broadcast to connected clients
      await this.broadcastRentalUpdate('started', rentalData);

      // Update analytics
      await this.updateRentalAnalytics('started', rentalData);

      logger.info(`Rental started: ${rentalData.rentalId}`);
    } catch (error) {
      logger.error('Error handling rental started:', error);
    }
  }

  async handleRentalCompleted(rentalData) {
    try {
      // Update rental status
      await this.updateRentalStatus(rentalData.rentalId, 'completed');
      
      // Update cache
      await this.redis.hset(`rental:${rentalData.rentalId}`, 'status', 'completed');
      
      // Broadcast completion
      await this.broadcastRentalUpdate('completed', rentalData);
      
      // Update analytics
      await this.updateRentalAnalytics('completed', rentalData);

      logger.info(`Rental completed: ${rentalData.rentalId}`);
    } catch (error) {
      logger.error('Error handling rental completed:', error);
    }
  }

  async handleRentalListed(listingData) {
    try {
      // Store listing data
      await this.storeListingData(listingData);
      
      // Cache for real-time access
      await this.redis.hset(
        `listing:${listingData.listingId}`,
        listingData
      );

      // Set expiration for listing data
      await this.redis.expire(`listing:${listingData.listingId}`, 86400 * 7); // 7 days

      // Broadcast to connected clients
      await this.broadcastListingUpdate('listed', listingData);

      // Update analytics
      await this.updateListingAnalytics('listed', listingData);

      logger.info(`Rental listed: ${listingData.listingId}`);
    } catch (error) {
      logger.error('Error handling rental listed:', error);
    }
  }

  async handleStreamCreated(streamData) {
    try {
      // Store stream data
      await this.storeStreamData(streamData);
      
      // Cache for real-time access
      await this.redis.hset(`stream:${streamData.streamId}`, streamData);
      
      // Set expiration for stream data
      await this.redis.expire(`stream:${streamData.streamId}`, 86400 * 7); // 7 days
      
      // Broadcast stream creation
      await this.broadcastStreamUpdate('created', streamData);

      logger.info(`Payment stream created: ${streamData.streamId}`);
    } catch (error) {
      logger.error('Error handling stream created:', error);
    }
  }

  async handleFundsReleased(streamData) {
    try {
      // Update stream released amount
      await this.updateStreamReleasedAmount(streamData.streamId, streamData.amount);
      
      // Update cache
      const currentReleased = await this.redis.hget(`stream:${streamData.streamId}`, 'releasedAmount') || '0';
      const newReleased = (BigInt(currentReleased) + BigInt(streamData.amount)).toString();
      await this.redis.hset(`stream:${streamData.streamId}`, 'releasedAmount', newReleased);
      
      // Broadcast funds release
      await this.broadcastStreamUpdate('funds_released', {
        streamId: streamData.streamId,
        amount: streamData.amount,
        newTotal: newReleased
      });

      logger.info(`Funds released from stream ${streamData.streamId}: ${streamData.amount}`);
    } catch (error) {
      logger.error('Error handling funds released:', error);
    }
  }

  async handleMicroTransactionCreated(transactionData) {
    try {
      // Store micro transaction data
      await this.storeMicroTransactionData(transactionData);
      
      // Cache for real-time access
      await this.redis.hset(`micro_tx:${transactionData.transactionId}`, transactionData);
      
      // Set expiration
      await this.redis.expire(`micro_tx:${transactionData.transactionId}`, 86400); // 1 day
      
      // Broadcast micro transaction
      await this.broadcastMicroTransactionUpdate('created', transactionData);

      // Update analytics
      await this.updateMicroTransactionAnalytics(transactionData);

      logger.info(`Micro transaction created: ${transactionData.transactionId}`);
    } catch (error) {
      logger.error('Error handling micro transaction created:', error);
    }
  }

  async handleHighFrequencyEventStarted(eventData) {
    try {
      // Store high frequency event data
      await this.storeHighFrequencyEventData(eventData);
      
      // Cache for real-time access
      await this.redis.hset(`hf_event:${eventData.eventId}`, eventData);
      
      // Set expiration
      await this.redis.expire(`hf_event:${eventData.eventId}`, 86400); // 1 day
      
      // Broadcast high frequency event
      await this.broadcastHighFrequencyEventUpdate('started', eventData);

      // Update analytics
      await this.updateHighFrequencyEventAnalytics(eventData);

      logger.info(`High frequency event started: ${eventData.eventId}`);
    } catch (error) {
      logger.error('Error handling high frequency event started:', error);
    }
  }

  async handleRealTimeStreamCreated(streamData) {
    try {
      // Store real-time stream data
      await this.storeRealTimeStreamData(streamData);
      
      // Cache for real-time access
      await this.redis.hset(`rt_stream:${streamData.streamId}`, streamData);
      
      // Set expiration
      await this.redis.expire(`rt_stream:${streamData.streamId}`, 86400); // 1 day
      
      // Broadcast real-time stream creation
      await this.broadcastRealTimeStreamUpdate('created', streamData);

      logger.info(`Real-time stream created: ${streamData.streamId}`);
    } catch (error) {
      logger.error('Error handling real-time stream created:', error);
    }
  }

  async handleSomniaCapabilityDemonstrated(capabilityData) {
    try {
      // Store capability demonstration data
      await this.storeCapabilityDemonstrationData(capabilityData);
      
      // Cache for real-time access
      await this.redis.lpush('capability_demos', JSON.stringify(capabilityData));
      
      // Keep only last 1000 demonstrations
      await this.redis.ltrim('capability_demos', 0, 999);
      
      // Broadcast capability demonstration
      await this.broadcastCapabilityDemonstration(capabilityData);

      logger.info(`Somnia capability demonstrated: ${capabilityData.capability}`);
    } catch (error) {
      logger.error('Error handling capability demonstration:', error);
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
        await this.setupEventListeners();
        logger.info('Successfully reconnected to Somnia WebSocket');
      } catch (error) {
        logger.error('Reconnection failed:', error);
        this.handleReconnection();
      }
    }, delay);
  }

  async startHealthCheck() {
    setInterval(async () => {
      try {
        if (this.isConnected) {
          // Test connection with block number query
          await this.wsProvider.getBlockNumber();
          
          // Update health metrics
          await this.redis.set('ws_health', JSON.stringify({
            connected: true,
            lastCheck: Date.now(),
            reconnectAttempts: this.reconnectAttempts
          }), 'EX', 60);
        }
      } catch (error) {
        logger.error('Health check failed:', error);
        this.isConnected = false;
        this.handleReconnection();
      }
    }, SOMNIA_CONFIG.PERFORMANCE.keepAliveInterval);
  }

  // Data persistence methods (implement based on your database choice)
  async storeRentalData(rentalData) {
    // Implementation depends on your database choice
    // Could be MongoDB, PostgreSQL, etc.
  }

  async updateRentalStatus(rentalId, status) {
    // Update rental status in database
  }

  async storeListingData(listingData) {
    // Store listing data in database
  }

  async storeStreamData(streamData) {
    // Store payment stream data
  }

  async updateStreamReleasedAmount(streamId, amount) {
    // Update stream released amount in database
  }

  async storeMicroTransactionData(transactionData) {
    // Store micro transaction data
  }

  async storeHighFrequencyEventData(eventData) {
    // Store high frequency event data
  }

  async storeRealTimeStreamData(streamData) {
    // Store real-time stream data
  }

  async storeCapabilityDemonstrationData(capabilityData) {
    // Store capability demonstration data
  }

  // Broadcasting methods (implement based on your WebSocket solution)
  async broadcastRentalUpdate(type, data) {
    // Broadcast via WebSocket to connected clients
    // Could use Socket.IO or similar
  }

  async broadcastListingUpdate(type, data) {
    // Broadcast listing updates
  }

  async broadcastStreamUpdate(type, data) {
    // Broadcast stream updates
  }

  async broadcastMicroTransactionUpdate(type, data) {
    // Broadcast micro transaction updates
  }

  async broadcastHighFrequencyEventUpdate(type, data) {
    // Broadcast high frequency event updates
  }

  async broadcastRealTimeStreamUpdate(type, data) {
    // Broadcast real-time stream updates
  }

  async broadcastCapabilityDemonstration(data) {
    // Broadcast capability demonstration
  }

  async broadcastBlockUpdate(blockNumber) {
    // Broadcast new block information
  }

  // Analytics methods
  async updatePerformanceMetrics(blockNumber, processingTime) {
    // Track Somnia performance metrics
    await this.redis.lpush('block_processing_times', JSON.stringify({
      blockNumber,
      processingTime,
      timestamp: Date.now()
    }));
    
    // Keep only last 1000 entries
    await this.redis.ltrim('block_processing_times', 0, 999);
  }

  async updateRentalAnalytics(type, data) {
    // Update rental analytics for dashboard
    const today = new Date().toISOString().split('T')[0];
    
    await this.redis.hincrby(`analytics:${today}`, `rentals_${type}`, 1);
    
    if (type === 'started') {
      await this.redis.hincrby(`analytics:${today}`, 'total_volume', 
        Math.round(parseFloat(data.totalPrice || '0')));
    }
  }

  async updateListingAnalytics(type, data) {
    // Update listing analytics
    const today = new Date().toISOString().split('T')[0];
    await this.redis.hincrby(`analytics:${today}`, `listings_${type}`, 1);
  }

  async updateMicroTransactionAnalytics(data) {
    // Update micro transaction analytics
    const today = new Date().toISOString().split('T')[0];
    await this.redis.hincrby(`analytics:${today}`, 'micro_transactions', 1);
    await this.redis.hincrby(`analytics:${today}`, 'micro_transaction_volume', 
      Math.round(parseFloat(data.amount || '0')));
  }

  async updateHighFrequencyEventAnalytics(data) {
    // Update high frequency event analytics
    const today = new Date().toISOString().split('T')[0];
    await this.redis.hincrby(`analytics:${today}`, 'hf_events', 1);
    await this.redis.hincrby(`analytics:${today}`, 'hf_event_participants', data.participantCount);
  }

  async destroy() {
    try {
      if (this.wsProvider) {
        this.wsProvider.destroy();
      }
      if (this.redis) {
        this.redis.disconnect();
      }
      logger.info('Event Listener Service destroyed');
    } catch (error) {
      logger.error('Error destroying Event Listener Service:', error);
    }
  }
}

export default SomniaEventListenerService;
