import { ethers } from 'ethers';

export interface SomniaEvent {
  type: 'block' | 'transaction' | 'contract' | 'metric';
  data: any;
  timestamp: number;
  blockNumber?: number;
  transactionHash?: string;
}

export interface SomniaWebSocketConfig {
  rpcUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export class SomniaWebSocketService {
  private ws: WebSocket | null = null;
  private config: SomniaWebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<(event: SomniaEvent) => void>> = new Map();
  private isConnected = false;
  private provider: ethers.BrowserProvider | null = null;
  private lastBlockNumber = 0;

  constructor(config?: Partial<SomniaWebSocketConfig>) {
    this.config = {
      rpcUrl: 'wss://dream-rpc.somnia.network/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...config
    };
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // Initialize provider for block monitoring
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }

      // Connect to WebSocket
      this.ws = new WebSocket(this.config.rpcUrl);
      
      this.ws.onopen = () => {
        console.log('🔌 Connected to Somnia WebSocket');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('block', { type: 'block', data: { status: 'connected' }, timestamp: Date.now() });
        
        // Start monitoring blocks
        this.startBlockMonitoring();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from Somnia WebSocket');
        this.isConnected = false;
        this.emit('block', { type: 'block', data: { status: 'disconnected' }, timestamp: Date.now() });
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { type: 'metric', data: { error: 'WebSocket connection error' }, timestamp: Date.now() });
      };

    } catch (error) {
      console.error('Failed to connect to Somnia WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private async startBlockMonitoring() {
    if (!this.provider) return;

    try {
      const currentBlock = await this.provider.getBlockNumber();
      this.lastBlockNumber = currentBlock;

      // Monitor new blocks
      this.provider.on('block', async (blockNumber) => {
        if (blockNumber > this.lastBlockNumber) {
          this.lastBlockNumber = blockNumber;
          
          try {
            const block = await this.provider!.getBlock(blockNumber);
            const blockTime = await this.calculateBlockTime(blockNumber);
            
            this.emit('block', {
              type: 'block',
              data: {
                blockNumber,
                blockTime,
                transactionCount: block.transactions.length,
                gasUsed: block.gasUsed.toString(),
                gasLimit: block.gasLimit.toString(),
                timestamp: block.timestamp
              },
              timestamp: Date.now(),
              blockNumber
            });

            // Monitor transactions in this block
            this.monitorBlockTransactions(block);
          } catch (error) {
            console.error('Failed to process block:', error);
          }
        }
      });
    } catch (error) {
      console.error('Failed to start block monitoring:', error);
    }
  }

  private async calculateBlockTime(blockNumber: number): Promise<number> {
    if (!this.provider) return 0;

    try {
      const currentBlock = await this.provider.getBlock(blockNumber);
      const previousBlock = await this.provider.getBlock(blockNumber - 1);
      return currentBlock.timestamp - previousBlock.timestamp;
    } catch (error) {
      return 0;
    }
  }

  private async monitorBlockTransactions(block: ethers.Block) {
    if (!this.provider) return;

    try {
      for (const txHash of block.transactions.slice(0, 10)) { // Monitor first 10 transactions
        const tx = await this.provider.getTransaction(txHash);
        const receipt = await this.provider.getTransactionReceipt(txHash);
        
        if (tx && receipt) {
          this.emit('transaction', {
            type: 'transaction',
            data: {
              hash: txHash,
              from: tx.from,
              to: tx.to,
              value: tx.value.toString(),
              gasPrice: tx.gasPrice?.toString(),
              gasUsed: receipt.gasUsed.toString(),
              status: receipt.status,
              blockNumber: receipt.blockNumber
            },
            timestamp: Date.now(),
            blockNumber: receipt.blockNumber,
            transactionHash: txHash
          });
        }
      }
    } catch (error) {
      console.error('Failed to monitor transactions:', error);
    }
  }

  private handleMessage(data: any) {
    // Handle different types of WebSocket messages
    if (data.type === 'block') {
      this.emit('block', {
        type: 'block',
        data: data.data,
        timestamp: Date.now(),
        blockNumber: data.data.blockNumber
      });
    } else if (data.type === 'transaction') {
      this.emit('transaction', {
        type: 'transaction',
        data: data.data,
        timestamp: Date.now(),
        transactionHash: data.data.hash
      });
    } else if (data.type === 'metric') {
      this.emit('metric', {
        type: 'metric',
        data: data.data,
        timestamp: Date.now()
      });
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  // Event listener management
  on(eventType: string, callback: (event: SomniaEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: (event: SomniaEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(eventType: string, event: SomniaEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Subscribe to specific contract events
  async subscribeToContractEvents(contractAddress: string, abi: any): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const contract = new ethers.Contract(contractAddress, abi, this.provider);
      
      // Listen to common events
      contract.on('Transfer', (from, to, tokenId, event) => {
        this.emit('contract', {
          type: 'contract',
          data: {
            contractAddress,
            event: 'Transfer',
            from,
            to,
            tokenId: tokenId.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash
          },
          timestamp: Date.now(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      contract.on('RentalCreated', (listingId, owner, renter, duration, price, event) => {
        this.emit('contract', {
          type: 'contract',
          data: {
            contractAddress,
            event: 'RentalCreated',
            listingId,
            owner,
            renter,
            duration: duration.toString(),
            price: price.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash
          },
          timestamp: Date.now(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      contract.on('PaymentStreamCreated', (streamId, sender, recipient, amount, duration, event) => {
        this.emit('contract', {
          type: 'contract',
          data: {
            contractAddress,
            event: 'PaymentStreamCreated',
            streamId: streamId.toString(),
            sender,
            recipient,
            amount: amount.toString(),
            duration: duration.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash
          },
          timestamp: Date.now(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      console.log(`✅ Subscribed to contract events for ${contractAddress}`);
    } catch (error) {
      console.error('Failed to subscribe to contract events:', error);
      throw error;
    }
  }

  // Get real-time network metrics
  async getRealTimeMetrics(): Promise<any> {
    if (!this.provider) return null;

    try {
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();
      const network = await this.provider.getNetwork();

      return {
        blockNumber,
        gasPrice: gasPrice.gasPrice?.toString(),
        chainId: Number(network.chainId),
        networkName: network.name,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to get real-time metrics:', error);
      return null;
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.provider) {
      this.provider.removeAllListeners();
      this.provider = null;
    }

    this.isConnected = false;
    this.eventListeners.clear();
    console.log('🔌 Disconnected from Somnia WebSocket service');
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}

// Export singleton instance
export const somniaWebSocketService = new SomniaWebSocketService();


