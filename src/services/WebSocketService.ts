import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { NFTFLOW_ABI } from '@/lib/contracts';
import { notificationService } from './NotificationService';

interface WebSocketConfig {
  wssRpcUrl: string;
  chainId: number;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

interface RentalEvent {
  nftContract: string;
  tokenId: string;
  lender: string;
  tenant: string;
  expires: Date;
  price: string;
  txHash: string;
  blockNumber: number;
}

interface PaymentEvent {
  streamId: string;
  amount: string;
  txHash: string;
}

class WebSocketService {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private subscriptions: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private config: WebSocketConfig;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      wssRpcUrl: 'wss://testnet.somnia.network',
      chainId: 50311,
      reconnectAttempts: 0,
      maxReconnectAttempts: 10
    };
  }

  // Initialize WebSocket connection
  async init(): Promise<void> {
    try {
      // Create WebSocket provider for real-time events
      this.provider = new ethers.BrowserProvider(
        new ethers.WebSocketProvider(this.config.wssRpcUrl, this.config.chainId)
      );
      
      // Create contract instance for event listening
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESSES.NFTFlow,
        NFTFLOW_ABI,
        this.provider
      );
      
      // Set up event listeners
      await this.setupEventListeners();
      
      console.log('WebSocket service initialized successfully');
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('Failed to initialize WebSocket service:', error);
      this.handleReconnection();
    }
  }

  // Set up event listeners for real-time updates
  private async setupEventListeners(): Promise<void> {
    if (!this.contract) return;

    // Listen for new rentals
    this.contract.on('RentalCreated', (
      nftContract: string,
      tokenId: bigint,
      lender: string,
      tenant: string,
      expires: bigint,
      price: bigint,
      event: unknown
    ) => {
      this.handleRentalCreated({
        nftContract,
        tokenId: tokenId.toString(),
        lender,
        tenant,
        expires: new Date(Number(expires) * 1000),
        price: ethers.formatEther(price),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });

    // Listen for rental completions
    this.contract.on('RentalCompleted', (
      nftContract: string,
      tokenId: bigint,
      lender: string,
      tenant: string,
      event: unknown
    ) => {
      this.handleRentalCompleted({
        nftContract,
        tokenId: tokenId.toString(),
        lender,
        tenant,
        txHash: event.transactionHash
      });
    });

    // Listen for payment releases
    this.contract.on('FundsReleased', (
      streamId: string,
      amount: bigint,
      event: unknown
    ) => {
      this.handleFundsReleased({
        streamId,
        amount: ethers.formatEther(amount),
        txHash: event.transactionHash
      });
    });

    // Listen for reputation updates
    this.contract.on('ReputationUpdated', (
      user: string,
      newScore: bigint,
      success: boolean,
      event: unknown
    ) => {
      this.handleReputationUpdated({
        user,
        newScore: newScore.toString(),
        success,
        txHash: event.transactionHash
      });
    });
  }

  // Handle new rental event
  private handleRentalCreated(rentalData: RentalEvent): void {
    // Update UI in real-time
    this.emitToSubscribers('rental-created', rentalData);
    
    // Send notification to relevant users
    notificationService.sendNotification(rentalData.tenant, {
      type: 'rental-started',
      title: 'Rental Started',
      message: `Your rental of NFT #${rentalData.tokenId} has begun`,
      data: rentalData
    });
    
    notificationService.sendNotification(rentalData.lender, {
      type: 'rental-created',
      title: 'NFT Rented Out',
      message: `Your NFT #${rentalData.tokenId} has been rented`,
      data: rentalData
    });
  }

  // Handle rental completion event
  private handleRentalCompleted(rentalData: Record<string, unknown>): void {
    // Update UI in real-time
    this.emitToSubscribers('rental-completed', rentalData);
    
    // Send notifications
    notificationService.sendNotification(rentalData.tenant, {
      type: 'rental-completed',
      title: 'Rental Completed',
      message: `Your rental of NFT #${rentalData.tokenId} has ended`,
      data: rentalData
    });

    notificationService.sendNotification(rentalData.lender, {
      type: 'rental-returned',
      title: 'NFT Returned',
      message: `Your NFT #${rentalData.tokenId} has been returned`,
      data: rentalData
    });
  }

  // Handle funds released event
  private handleFundsReleased(paymentData: PaymentEvent): void {
    // Update UI in real-time
    this.emitToSubscribers('funds-released', paymentData);
    
    // Send notification
    notificationService.sendNotification('', {
      type: 'payment-received',
      title: 'Payment Received',
      message: `Received ${paymentData.amount} STT from stream ${paymentData.streamId.slice(0, 8)}...`,
      data: paymentData
    });
  }

  // Handle reputation update event
  private handleReputationUpdated(reputationData: Record<string, unknown>): void {
    // Update UI in real-time
    this.emitToSubscribers('reputation-updated', reputationData);
    
    // Send notification if significant change
    if (parseInt(reputationData.newScore) >= 750) {
      notificationService.sendNotification(reputationData.user, {
        type: 'reputation-milestone',
        title: 'Reputation Milestone',
        message: `Congratulations! You've reached ${reputationData.newScore} reputation points`,
        data: reputationData
      });
    }
  }

  // Subscribe to real-time events
  subscribe(eventType: string, callback: (...args: unknown[]) => void): () => void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    this.subscriptions.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      if (this.subscriptions.has(eventType)) {
        this.subscriptions.get(eventType)!.delete(callback);
      }
    };
  }

  // Emit events to all subscribers
  private emitToSubscribers(eventType: string, data: unknown): void {
    if (this.subscriptions.has(eventType)) {
      this.subscriptions.get(eventType)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event subscriber:', error);
        }
      });
    }
  }

  // Handle reconnection on failure
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(() => this.init(), delay);
    } else {
      console.error('Max reconnection attempts reached. WebSocket service unavailable.');
      // Fallback to polling
      this.startPollingFallback();
    }
  }

  // Fallback polling mechanism when WebSocket fails
  private startPollingFallback(): void {
    console.log('Starting polling fallback for real-time updates');
    // Implement polling logic here if needed
  }

  // Get connection status
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    if (this.provider && this.contract) {
      return 'connected';
    } else if (this.reconnectAttempts > 0 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      return 'connecting';
    } else if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      return 'error';
    }
    return 'disconnected';
  }

  // Clean up resources
  destroy(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.contract) {
      this.contract.removeAllListeners();
    }
    
    if (this.provider) {
      this.provider.removeAllListeners();
    }
    
    this.subscriptions.clear();
  }
}

// Create and export singleton instance
export const webSocketService = new WebSocketService();
