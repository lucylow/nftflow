// src/services/somniaWebSocketService.js
import { ethers } from 'ethers';
import { SOMNIA_CONFIG } from '../config/constants.js';

/**
 * SomniaWebSocketService
 * Real-time WebSocket event listening for NFTFlow on Somnia Network
 * Leverages Somnia's WebSocket capabilities for instant event notifications
 */
class SomniaWebSocketService {
  constructor(network = 'testnet') {
    this.network = network;
    this.wsUrl = SOMNIA_CONFIG[network.toUpperCase()].WS_URL;
    this.provider = null;
    this.contracts = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.eventCallbacks = new Map();
    this.eventQueue = [];
    this.processing = false;
    this.batchSize = 10;
    this.processingInterval = 1000;
    
    // Contract configurations
    this.contractConfigs = {
      NFTFlowSOMI: {
        address: process.env.NFTFLOW_CONTRACT_ADDRESS,
        abi: this.getNFTFlowABI()
      },
      PaymentStreamSOMI: {
        address: process.env.PAYMENT_STREAM_CONTRACT_ADDRESS,
        abi: this.getPaymentStreamABI()
      },
      ReputationSystem: {
        address: process.env.REPUTATION_CONTRACT_ADDRESS,
        abi: this.getReputationABI()
      }
    };
  }

  /**
   * Get NFTFlow contract ABI
   */
  getNFTFlowABI() {
    return [
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "listingId", "type": "bytes32"},
          {"indexed": true, "name": "nftContract", "type": "address"},
          {"indexed": true, "name": "tokenId", "type": "uint256"},
          {"indexed": false, "name": "owner", "type": "address"},
          {"indexed": false, "name": "pricePerSecondSOMI", "type": "uint256"},
          {"indexed": false, "name": "minDuration", "type": "uint256"},
          {"indexed": false, "name": "maxDuration", "type": "uint256"},
          {"indexed": false, "name": "verified", "type": "bool"}
        ],
        "name": "NFTListedForRent",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "rentalId", "type": "bytes32"},
          {"indexed": true, "name": "nftContract", "type": "address"},
          {"indexed": true, "name": "tokenId", "type": "uint256"},
          {"indexed": false, "name": "tenant", "type": "address"},
          {"indexed": false, "name": "duration", "type": "uint256"},
          {"indexed": false, "name": "totalPriceSOMI", "type": "uint256"},
          {"indexed": false, "name": "collateralAmountSOMI", "type": "uint256"},
          {"indexed": false, "name": "gasUsed", "type": "uint256"}
        ],
        "name": "NFTRented",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "rentalId", "type": "bytes32"},
          {"indexed": false, "name": "completionTime", "type": "uint256"},
          {"indexed": false, "name": "totalPaidSOMI", "type": "uint256"},
          {"indexed": false, "name": "successful", "type": "bool"},
          {"indexed": false, "name": "gasUsed", "type": "uint256"}
        ],
        "name": "RentalCompleted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "rentalId", "type": "bytes32"},
          {"indexed": true, "name": "disputer", "type": "address"},
          {"indexed": false, "name": "reason", "type": "string"},
          {"indexed": false, "name": "disputeTime", "type": "uint256"},
          {"indexed": false, "name": "disputeFeeSOMI", "type": "uint256"}
        ],
        "name": "RentalDisputed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "rentalId", "type": "bytes32"},
          {"indexed": true, "name": "resolver", "type": "address"},
          {"indexed": false, "name": "resolvedInFavorOfTenant", "type": "bool"},
          {"indexed": false, "name": "refundAmountSOMI", "type": "uint256"},
          {"indexed": false, "name": "gasUsed", "type": "uint256"}
        ],
        "name": "DisputeResolved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "from", "type": "address"},
          {"indexed": true, "name": "to", "type": "address"},
          {"indexed": false, "name": "amountSOMI", "type": "uint256"},
          {"indexed": false, "name": "purpose", "type": "string"},
          {"indexed": false, "name": "timestamp", "type": "uint256"}
        ],
        "name": "SOMIPaymentReceived",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "user", "type": "address"},
          {"indexed": false, "name": "amountSOMI", "type": "uint256"},
          {"indexed": false, "name": "gasUsed", "type": "uint256"},
          {"indexed": false, "name": "timestamp", "type": "uint256"}
        ],
        "name": "MicroPaymentProcessed",
        "type": "event"
      }
    ];
  }

  /**
   * Get PaymentStream contract ABI
   */
  getPaymentStreamABI() {
    return [
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "streamId", "type": "uint256"},
          {"indexed": true, "name": "sender", "type": "address"},
          {"indexed": true, "name": "recipient", "type": "address"},
          {"indexed": false, "name": "depositSOMI", "type": "uint256"},
          {"indexed": false, "name": "ratePerSecondSOMI", "type": "uint256"},
          {"indexed": false, "name": "startTime", "type": "uint256"},
          {"indexed": false, "name": "stopTime", "type": "uint256"},
          {"indexed": false, "name": "streamType", "type": "uint8"},
          {"indexed": false, "name": "milestones", "type": "uint256[]"},
          {"indexed": false, "name": "gasUsed", "type": "uint256"}
        ],
        "name": "StreamCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "streamId", "type": "uint256"},
          {"indexed": true, "name": "recipient", "type": "address"},
          {"indexed": false, "name": "amountSOMI", "type": "uint256"},
          {"indexed": false, "name": "totalWithdrawnSOMI", "type": "uint256"},
          {"indexed": false, "name": "timestamp", "type": "uint256"},
          {"indexed": false, "name": "gasUsed", "type": "uint256"}
        ],
        "name": "StreamWithdrawn",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "streamId", "type": "uint256"},
          {"indexed": false, "name": "amountSOMI", "type": "uint256"},
          {"indexed": false, "name": "timestamp", "type": "uint256"},
          {"indexed": false, "name": "gasUsed", "type": "uint256"}
        ],
        "name": "AutoReleaseExecuted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "streamId", "type": "uint256"},
          {"indexed": false, "name": "milestoneIndex", "type": "uint256"},
          {"indexed": false, "name": "amountSOMI", "type": "uint256"},
          {"indexed": false, "name": "timestamp", "type": "uint256"}
        ],
        "name": "MilestoneReached",
        "type": "event"
      }
    ];
  }

  /**
   * Get ReputationSystem contract ABI
   */
  getReputationABI() {
    return [
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "user", "type": "address"},
          {"indexed": false, "name": "score", "type": "uint256"},
          {"indexed": false, "name": "success", "type": "bool"},
          {"indexed": false, "name": "reason", "type": "string"},
          {"indexed": false, "name": "timestamp", "type": "uint256"}
        ],
        "name": "ReputationUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "user", "type": "address"},
          {"indexed": false, "name": "timestamp", "type": "uint256"}
        ],
        "name": "UserVerified",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "name": "user", "type": "address"},
          {"indexed": false, "name": "achievementId", "type": "uint256"},
          {"indexed": false, "name": "timestamp", "type": "uint256"}
        ],
        "name": "AchievementUnlocked",
        "type": "event"
      }
    ];
  }

  /**
   * Initialize WebSocket connection and contract instances
   */
  async initialize() {
    try {
      console.log(`🔌 Connecting to Somnia ${this.network} WebSocket...`);
      
      // Create WebSocket provider
      this.provider = new ethers.WebSocketProvider(this.wsUrl);
      
      // Wait for connection to be ready
      await this.provider._waitUntilReady();
      
      // Initialize contract instances
      await this.initializeContracts();
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      console.log('✅ Successfully connected to Somnia WebSocket');
      this.setupEventListeners();
      this.startConnectionMonitor();
      this.startEventProcessor();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket connection:', error);
      this.handleReconnection();
      return false;
    }
  }

  /**
   * Initialize contract instances
   */
  async initializeContracts() {
    for (const [contractName, config] of Object.entries(this.contractConfigs)) {
      if (config.address) {
        const contract = new ethers.Contract(config.address, config.abi, this.provider);
        this.contracts.set(contractName, contract);
        console.log(`📄 Initialized ${contractName} contract at ${config.address}`);
      }
    }
  }

  /**
   * Set up event listeners for all contracts
   */
  setupEventListeners() {
    // NFTFlow events
    this.setupNFTFlowListeners();
    
    // PaymentStream events
    this.setupPaymentStreamListeners();
    
    // ReputationSystem events
    this.setupReputationListeners();
    
    // Block events
    this.setupBlockListeners();
    
    console.log('🎧 Event listeners setup complete');
  }

  /**
   * Setup NFTFlow event listeners
   */
  setupNFTFlowListeners() {
    const nftFlowContract = this.contracts.get('NFTFlowSOMI');
    if (!nftFlowContract) return;

    // NFT Listed for Rent
    const listingFilter = {
      address: this.contractConfigs.NFTFlowSOMI.address,
      topics: [ethers.id("NFTListedForRent(bytes32,address,uint256,address,uint256,uint256,uint256,bool)")]
    };

    this.provider.on(listingFilter, async (log) => {
      try {
        const parsedLog = nftFlowContract.interface.parseLog(log);
        const eventData = {
          event: 'NFTListedForRent',
          contract: 'NFTFlowSOMI',
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          listingId: parsedLog.args.listingId,
          nftContract: parsedLog.args.nftContract,
          tokenId: parsedLog.args.tokenId.toString(),
          owner: parsedLog.args.owner,
          pricePerSecondSOMI: ethers.formatEther(parsedLog.args.pricePerSecondSOMI),
          minDuration: parsedLog.args.minDuration.toString(),
          maxDuration: parsedLog.args.maxDuration.toString(),
          verified: parsedLog.args.verified,
          timestamp: new Date().toISOString()
        };
        
        console.log('🏠 New NFT Listed:', eventData);
        this.addToQueue(eventData);
        
      } catch (error) {
        console.error('Error processing NFTListedForRent event:', error);
      }
    });

    // NFT Rented
    const rentalFilter = {
      address: this.contractConfigs.NFTFlowSOMI.address,
      topics: [ethers.id("NFTRented(bytes32,address,uint256,address,uint256,uint256,uint256,uint256)")]
    };

    this.provider.on(rentalFilter, async (log) => {
      try {
        const parsedLog = nftFlowContract.interface.parseLog(log);
        const eventData = {
          event: 'NFTRented',
          contract: 'NFTFlowSOMI',
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          rentalId: parsedLog.args.rentalId,
          nftContract: parsedLog.args.nftContract,
          tokenId: parsedLog.args.tokenId.toString(),
          tenant: parsedLog.args.tenant,
          duration: parsedLog.args.duration.toString(),
          totalPriceSOMI: ethers.formatEther(parsedLog.args.totalPriceSOMI),
          collateralAmountSOMI: ethers.formatEther(parsedLog.args.collateralAmountSOMI),
          gasUsed: parsedLog.args.gasUsed.toString(),
          timestamp: new Date().toISOString()
        };
        
        console.log('🔑 NFT Rented:', eventData);
        this.addToQueue(eventData);
        
      } catch (error) {
        console.error('Error processing NFTRented event:', error);
      }
    });

    // Rental Completed
    const completionFilter = {
      address: this.contractConfigs.NFTFlowSOMI.address,
      topics: [ethers.id("RentalCompleted(bytes32,uint256,uint256,bool,uint256)")]
    };

    this.provider.on(completionFilter, async (log) => {
      try {
        const parsedLog = nftFlowContract.interface.parseLog(log);
        const eventData = {
          event: 'RentalCompleted',
          contract: 'NFTFlowSOMI',
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          rentalId: parsedLog.args.rentalId,
          completionTime: parsedLog.args.completionTime.toString(),
          totalPaidSOMI: ethers.formatEther(parsedLog.args.totalPaidSOMI),
          successful: parsedLog.args.successful,
          gasUsed: parsedLog.args.gasUsed.toString(),
          timestamp: new Date().toISOString()
        };
        
        console.log('✅ Rental Completed:', eventData);
        this.addToQueue(eventData);
        
      } catch (error) {
        console.error('Error processing RentalCompleted event:', error);
      }
    });

    // SOMI Payment Received
    const paymentFilter = {
      address: this.contractConfigs.NFTFlowSOMI.address,
      topics: [ethers.id("SOMIPaymentReceived(address,address,uint256,string,uint256)")]
    };

    this.provider.on(paymentFilter, async (log) => {
      try {
        const parsedLog = nftFlowContract.interface.parseLog(log);
        const eventData = {
          event: 'SOMIPaymentReceived',
          contract: 'NFTFlowSOMI',
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          from: parsedLog.args.from,
          to: parsedLog.args.to,
          amountSOMI: ethers.formatEther(parsedLog.args.amountSOMI),
          purpose: parsedLog.args.purpose,
          timestamp: new Date(parseInt(parsedLog.args.timestamp) * 1000).toISOString()
        };
        
        console.log('💰 SOMI Payment:', eventData);
        this.addToQueue(eventData);
        
      } catch (error) {
        console.error('Error processing SOMIPaymentReceived event:', error);
      }
    });
  }

  /**
   * Setup PaymentStream event listeners
   */
  setupPaymentStreamListeners() {
    const paymentStreamContract = this.contracts.get('PaymentStreamSOMI');
    if (!paymentStreamContract) return;

    // Stream Created
    const streamCreatedFilter = {
      address: this.contractConfigs.PaymentStreamSOMI.address,
      topics: [ethers.id("StreamCreated(uint256,address,address,uint256,uint256,uint256,uint256,uint8,uint256[],uint256)")]
    };

    this.provider.on(streamCreatedFilter, async (log) => {
      try {
        const parsedLog = paymentStreamContract.interface.parseLog(log);
        const eventData = {
          event: 'StreamCreated',
          contract: 'PaymentStreamSOMI',
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          streamId: parsedLog.args.streamId.toString(),
          sender: parsedLog.args.sender,
          recipient: parsedLog.args.recipient,
          depositSOMI: ethers.formatEther(parsedLog.args.depositSOMI),
          ratePerSecondSOMI: ethers.formatEther(parsedLog.args.ratePerSecondSOMI),
          startTime: parsedLog.args.startTime.toString(),
          stopTime: parsedLog.args.stopTime.toString(),
          streamType: parsedLog.args.streamType.toString(),
          milestones: parsedLog.args.milestones.map(m => m.toString()),
          gasUsed: parsedLog.args.gasUsed.toString(),
          timestamp: new Date().toISOString()
        };
        
        console.log('💧 Stream Created:', eventData);
        this.addToQueue(eventData);
        
      } catch (error) {
        console.error('Error processing StreamCreated event:', error);
      }
    });

    // Stream Withdrawn
    const streamWithdrawnFilter = {
      address: this.contractConfigs.PaymentStreamSOMI.address,
      topics: [ethers.id("StreamWithdrawn(uint256,address,uint256,uint256,uint256,uint256)")]
    };

    this.provider.on(streamWithdrawnFilter, async (log) => {
      try {
        const parsedLog = paymentStreamContract.interface.parseLog(log);
        const eventData = {
          event: 'StreamWithdrawn',
          contract: 'PaymentStreamSOMI',
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          streamId: parsedLog.args.streamId.toString(),
          recipient: parsedLog.args.recipient,
          amountSOMI: ethers.formatEther(parsedLog.args.amountSOMI),
          totalWithdrawnSOMI: ethers.formatEther(parsedLog.args.totalWithdrawnSOMI),
          timestamp: parsedLog.args.timestamp.toString(),
          gasUsed: parsedLog.args.gasUsed.toString(),
          timestamp: new Date().toISOString()
        };
        
        console.log('💸 Stream Withdrawn:', eventData);
        this.addToQueue(eventData);
        
      } catch (error) {
        console.error('Error processing StreamWithdrawn event:', error);
      }
    });

    // Milestone Reached
    const milestoneFilter = {
      address: this.contractConfigs.PaymentStreamSOMI.address,
      topics: [ethers.id("MilestoneReached(uint256,uint256,uint256,uint256)")]
    };

    this.provider.on(milestoneFilter, async (log) => {
      try {
        const parsedLog = paymentStreamContract.interface.parseLog(log);
        const eventData = {
          event: 'MilestoneReached',
          contract: 'PaymentStreamSOMI',
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          streamId: parsedLog.args.streamId.toString(),
          milestoneIndex: parsedLog.args.milestoneIndex.toString(),
          amountSOMI: ethers.formatEther(parsedLog.args.amountSOMI),
          timestamp: parsedLog.args.timestamp.toString(),
          timestamp: new Date().toISOString()
        };
        
        console.log('🎯 Milestone Reached:', eventData);
        this.addToQueue(eventData);
        
      } catch (error) {
        console.error('Error processing MilestoneReached event:', error);
      }
    });
  }

  /**
   * Setup ReputationSystem event listeners
   */
  setupReputationListeners() {
    const reputationContract = this.contracts.get('ReputationSystem');
    if (!reputationContract) return;

    // Reputation Updated
    const reputationFilter = {
      address: this.contractConfigs.ReputationSystem.address,
      topics: [ethers.id("ReputationUpdated(address,uint256,bool,string,uint256)")]
    };

    this.provider.on(reputationFilter, async (log) => {
      try {
        const parsedLog = reputationContract.interface.parseLog(log);
        const eventData = {
          event: 'ReputationUpdated',
          contract: 'ReputationSystem',
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          user: parsedLog.args.user,
          score: parsedLog.args.score.toString(),
          success: parsedLog.args.success,
          reason: parsedLog.args.reason,
          timestamp: new Date(parseInt(parsedLog.args.timestamp) * 1000).toISOString()
        };
        
        console.log('⭐ Reputation Updated:', eventData);
        this.addToQueue(eventData);
        
      } catch (error) {
        console.error('Error processing ReputationUpdated event:', error);
      }
    });

    // User Verified
    const verifiedFilter = {
      address: this.contractConfigs.ReputationSystem.address,
      topics: [ethers.id("UserVerified(address,uint256)")]
    };

    this.provider.on(verifiedFilter, async (log) => {
      try {
        const parsedLog = reputationContract.interface.parseLog(log);
        const eventData = {
          event: 'UserVerified',
          contract: 'ReputationSystem',
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          user: parsedLog.args.user,
          timestamp: new Date(parseInt(parsedLog.args.timestamp) * 1000).toISOString()
        };
        
        console.log('✅ User Verified:', eventData);
        this.addToQueue(eventData);
        
      } catch (error) {
        console.error('Error processing UserVerified event:', error);
      }
    });
  }

  /**
   * Setup block event listeners
   */
  setupBlockListeners() {
    this.provider.on("block", async (blockNumber) => {
      const eventData = {
        event: 'NewBlock',
        contract: 'Network',
        blockNumber: blockNumber,
        timestamp: new Date().toISOString()
      };
      
      console.log('🔗 New block:', blockNumber);
      this.addToQueue(eventData);
    });
  }

  /**
   * Add event to processing queue
   */
  addToQueue(eventData) {
    this.eventQueue.push(eventData);
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process event queue
   */
  async processQueue() {
    this.processing = true;
    
    while (this.eventQueue.length > 0) {
      const batch = this.eventQueue.splice(0, this.batchSize);
      await this.processBatch(batch);
      
      if (this.eventQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.processingInterval));
      }
    }
    
    this.processing = false;
  }

  /**
   * Process batch of events
   */
  async processBatch(batch) {
    try {
      // Process events in parallel
      await Promise.all(batch.map(event => this.handleEvent(event)));
      console.log(`📦 Processed batch of ${batch.length} events`);
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  }

  /**
   * Handle individual event
   */
  async handleEvent(event) {
    try {
      // Execute registered callbacks
      this.executeCallbacks(event.event, event);
      
      // Store event in database (if needed)
      await this.storeEvent(event);
      
      // Update analytics
      await this.updateAnalytics(event);
      
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }

  /**
   * Register callback for specific event types
   */
  on(eventName, callback) {
    if (!this.eventCallbacks.has(eventName)) {
      this.eventCallbacks.set(eventName, []);
    }
    this.eventCallbacks.get(eventName).push(callback);
    console.log(`📝 Registered callback for event: ${eventName}`);
  }

  /**
   * Execute all registered callbacks for an event
   */
  executeCallbacks(eventName, data) {
    const callbacks = this.eventCallbacks.get(eventName) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${eventName} callback:`, error);
      }
    });
  }

  /**
   * Store event in database
   */
  async storeEvent(event) {
    try {
      // Store event in database for historical analysis
      const response = await fetch('/api/events/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      
      if (!response.ok) {
        throw new Error('Failed to store event');
      }
    } catch (error) {
      console.error('Error storing event:', error);
    }
  }

  /**
   * Update analytics based on event
   */
  async updateAnalytics(event) {
    try {
      // Update real-time analytics
      const response = await fetch('/api/analytics/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update analytics');
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }

  /**
   * Start event processor
   */
  startEventProcessor() {
    if (this.eventProcessorInterval) {
      clearInterval(this.eventProcessorInterval);
    }
    
    this.eventProcessorInterval = setInterval(() => {
      if (this.eventQueue.length > 0 && !this.processing) {
        this.processQueue();
      }
    }, this.processingInterval);
  }

  /**
   * Monitor connection and handle reconnections
   */
  startConnectionMonitor() {
    // Keep connection alive
    this.keepAliveInterval = setInterval(async () => {
      try {
        await this.provider.getBlockNumber();
      } catch (error) {
        console.error('Connection keep-alive failed:', error.message);
        this.handleReconnection();
      }
    }, 30000); // Every 30 seconds

    // Monitor connection state
    this.connectionMonitor = setInterval(() => {
      if (!this.isConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleReconnection();
      }
    }, 5000);
  }

  /**
   * Handle reconnection logic
   */
  async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Please restart the application.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
    
    setTimeout(async () => {
      try {
        await this.initialize();
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, delay);
  }

  /**
   * Get historical events
   */
  async getHistoricalEvents(eventName, contractName, fromBlock = 0, toBlock = 'latest') {
    try {
      const contract = this.contracts.get(contractName);
      if (!contract) {
        throw new Error(`Contract ${contractName} not found`);
      }

      const filter = contract.filters[eventName]();
      const events = await contract.queryFilter(filter, fromBlock, toBlock);
      
      return events.map(event => ({
        event: eventName,
        contract: contractName,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        args: event.args,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching historical events:', error);
      return [];
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      network: this.network,
      reconnectAttempts: this.reconnectAttempts,
      contracts: Array.from(this.contracts.keys()),
      eventQueueLength: this.eventQueue.length,
      processing: this.processing
    };
  }

  /**
   * Close connection gracefully
   */
  async disconnect() {
    console.log('🔌 Disconnecting from WebSocket...');
    
    clearInterval(this.keepAliveInterval);
    clearInterval(this.connectionMonitor);
    clearInterval(this.eventProcessorInterval);
    
    if (this.provider) {
      try {
        this.provider.destroy();
        this.isConnected = false;
        console.log('✅ Disconnected successfully');
      } catch (error) {
        console.error('Error during disconnection:', error);
      }
    }
  }
}

export default new SomniaWebSocketService();
