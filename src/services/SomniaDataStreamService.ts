/**
 * Somnia Data Streams Integration Service
 * 
 * Integrates with Somnia Data Streams for real-time updates:
 * - Rental status changes
 * - Payment stream updates
 * - Agent actions and recommendations
 * - Market data from DIA Oracle
 */

export interface StreamSubscription {
  id: string;
  topic: string;
  callback: (data: any) => void;
  active: boolean;
}

export class SomniaDataStreamService {
  private subscriptions: Map<string, StreamSubscription> = new Map();
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Initialize connection to Somnia Data Streams
   */
  async initialize(web3Provider?: any): Promise<void> {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      // In production, this would connect to the actual Somnia Data Stream endpoint
      const wsUrl = process.env.VITE_SOMNIA_STREAM_URL || 'wss://streams.somnia.network/subscribe';
      
      // For now, we'll use a mock WebSocket connection
      console.log('Initializing Somnia Data Stream connection...');
      
      // Mock WebSocket for demonstration
      this.websocket = new EventTarget() as any;
      
      // Simulate connection
      setTimeout(() => {
        this.reconnectAttempts = 0;
        console.log('Connected to Somnia Data Streams');
        this.subscribeToActiveStreams();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to initialize Somnia Data Stream:', error);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.initialize(web3Provider), 2000 * this.reconnectAttempts);
      }
    }
  }

  /**
   * Subscribe to a data stream topic
   */
  subscribe(topic: string, callback: (data: any) => void): string {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: StreamSubscription = {
      id: subscriptionId,
      topic,
      callback,
      active: true,
    };

    this.subscriptions.set(subscriptionId, subscription);
    
    console.log(`Subscribed to topic: ${topic} (ID: ${subscriptionId})`);
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from a data stream
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
      this.subscriptions.delete(subscriptionId);
      console.log(`Unsubscribed from subscription: ${subscriptionId}`);
    }
  }

  /**
   * Subscribe to active streams for real-time rental updates
   */
  private subscribeToActiveStreams(): void {
    // Subscribe to rental events
    this.subscribe('rentals.created', (data) => {
      console.log('New rental created:', data);
      this.broadcastToSubscribers('rental.created', data);
    });

    this.subscribe('rentals.completed', (data) => {
      console.log('Rental completed:', data);
      this.broadcastToSubscribers('rental.completed', data);
    });

    this.subscribe('rentals.cancelled', (data) => {
      console.log('Rental cancelled:', data);
      this.broadcastToSubscribers('rental.cancelled', data);
    });

    // Subscribe to payment stream updates
    this.subscribe('payments.stream.created', (data) => {
      console.log('Payment stream created:', data);
      this.broadcastToSubscribers('payment.stream.created', data);
    });

    this.subscribe('payments.stream.withdrawn', (data) => {
      console.log('Payment withdrawn:', data);
      this.broadcastToSubscribers('payment.stream.withdrawn', data);
    });

    // Subscribe to market data from DIA Oracle
    this.subscribe('market.data.updated', (data) => {
      console.log('Market data updated:', data);
      this.broadcastToSubscribers('market.data.updated', data);
    });

    // Subscribe to agent actions
    this.subscribe('agents.action.completed', (data) => {
      console.log('Agent action completed:', data);
      this.broadcastToSubscribers('agent.action.completed', data);
    });

    // Simulate real-time updates
    this.startMockUpdates();
  }

  /**
   * Broadcast data to subscribers
   */
  private broadcastToSubscribers(eventType: string, data: any): void {
    this.subscriptions.forEach((subscription) => {
      if (subscription.active && subscription.topic === eventType) {
        subscription.callback(data);
      }
    });
  }

  /**
   * Mock real-time updates for demonstration
   */
  private startMockUpdates(): void {
    // Simulate periodic market updates
    setInterval(() => {
      const mockMarketData = {
        averagePrice: 0.001 + Math.random() * 0.001,
        demandLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        timestamp: Date.now(),
      };
      
      this.broadcastToSubscribers('market.data.updated', mockMarketData);
    }, 30000); // Every 30 seconds

    // Simulate agent actions
    setInterval(() => {
      const mockAgentAction = {
        agentType: ['intelligent_rental', 'discovery', 'trust_assessment'][Math.floor(Math.random() * 3)],
        action: 'price_adjustment',
        data: {
          listingId: 'listing-' + Math.floor(Math.random() * 1000),
          newPrice: 0.001 + Math.random() * 0.001,
        },
        timestamp: Date.now(),
      };
      
      this.broadcastToSubscribers('agent.action.completed', mockAgentAction);
    }, 60000); // Every minute
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): StreamSubscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.active);
  }

  /**
   * Close connection
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.subscriptions.clear();
    console.log('Disconnected from Somnia Data Streams');
  }
}

// Export singleton instance
export const somniaDataStreamService = new SomniaDataStreamService();
