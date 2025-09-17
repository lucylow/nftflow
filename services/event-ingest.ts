import { Client } from 'pg';
import { createPublicClient, webSocket, http, parseAbiItem, formatUnits } from 'viem';
import { Redis } from 'ioredis';
import { somniaTestnet } from '../chains/somnia';
import { keccak256, toHex } from 'viem';

// ABI definitions for events we want to track
const NFTFlowCoreABI = [
  parseAbiItem('event RentalStarted(bytes32 rentalId, address nftContract, uint256 tokenId, address lender, address tenant, uint256 startTime, uint256 endTime, uint256 totalPrice)'),
  parseAbiItem('event RentalCompleted(bytes32 rentalId)'),
  parseAbiItem('event RentalCancelled(bytes32 rentalId, address cancelledBy)'),
  parseAbiItem('event NFTListed(address nftContract, uint256 tokenId, address owner, uint256 pricePerSecond, uint256 minDuration, uint256 maxDuration)'),
  parseAbiItem('event NFTDelisted(address nftContract, uint256 tokenId)'),
  parseAbiItem('event DisputeCreated(bytes32 indexed rentalId, address indexed disputer, string disputeType)'),
  parseAbiItem('event DisputeResolved(bytes32 indexed rentalId, bool inFavorOfRenter)')
];

const PaymentStreamABI = [
  parseAbiItem('event StreamCreated(address streamId, address lender, address renter, uint256 totalAmount, uint256 startTime, uint256 endTime)'),
  parseAbiItem('event FundsReleased(address streamId, uint256 amount)'),
  parseAbiItem('event StreamCancelled(address streamId, address cancelledBy)')
];

interface EventLog {
  blockNumber: bigint;
  transactionHash: string;
  logIndex: number;
  args: any;
}

export class EventIngestService {
  private db: Client;
  private redis: Redis;
  private client: ReturnType<typeof createPublicClient>;
  private isRunning = false;
  private chainId: number;

  constructor() {
    this.db = new Client({ connectionString: process.env.DATABASE_URL });
    this.redis = new Redis(process.env.REDIS_URL);
    this.chainId = somniaTestnet.id;
    
    this.client = createPublicClient({
      chain: somniaTestnet,
      transport: webSocket(process.env.SOMNIA_WS_RPC!),
    });
  }

  async start() {
    try {
      await this.db.connect();
      this.isRunning = true;
      
      console.log('Starting event ingestion service...');
      console.log(`Chain ID: ${this.chainId}`);
      console.log(`RPC URL: ${process.env.SOMNIA_WS_RPC}`);
      
      // Subscribe to blockchain events
      await this.subscribeToEvents();
      
      // Start backfill process for missed events
      await this.backfillEvents();
      
      console.log('Event ingestion service started successfully');
    } catch (error) {
      console.error('Failed to start event ingestion service:', error);
      throw error;
    }
  }

  async stop() {
    this.isRunning = false;
    await this.db.end();
    await this.redis.quit();
    console.log('Event ingestion service stopped');
  }

  private async subscribeToEvents() {
    const nftFlowCoreAddress = process.env.NFTFLOW_CORE_ADDRESS as `0x${string}`;
    const paymentStreamFactoryAddress = process.env.PAYMENT_STREAM_FACTORY_ADDRESS as `0x${string}`;

    // Watch for Rental events
    this.client.watchEvent({
      address: nftFlowCoreAddress,
      event: parseAbiItem('event RentalStarted(bytes32 rentalId, address nftContract, uint256 tokenId, address lender, address tenant, uint256 startTime, uint256 endTime, uint256 totalPrice)'),
      onLogs: (logs) => this.handleRentalStarted(logs),
    });

    this.client.watchEvent({
      address: nftFlowCoreAddress,
      event: parseAbiItem('event RentalCompleted(bytes32 rentalId)'),
      onLogs: (logs) => this.handleRentalCompleted(logs),
    });

    this.client.watchEvent({
      address: nftFlowCoreAddress,
      event: parseAbiItem('event RentalCancelled(bytes32 rentalId, address cancelledBy)'),
      onLogs: (logs) => this.handleRentalCancelled(logs),
    });

    this.client.watchEvent({
      address: nftFlowCoreAddress,
      event: parseAbiItem('event NFTListed(address nftContract, uint256 tokenId, address owner, uint256 pricePerSecond, uint256 minDuration, uint256 maxDuration)'),
      onLogs: (logs) => this.handleNFTListed(logs),
    });

    this.client.watchEvent({
      address: nftFlowCoreAddress,
      event: parseAbiItem('event NFTDelisted(address nftContract, uint256 tokenId)'),
      onLogs: (logs) => this.handleNFTDelisted(logs),
    });

    // Watch for Payment Stream events
    this.client.watchEvent({
      address: paymentStreamFactoryAddress,
      event: parseAbiItem('event StreamCreated(address streamId, address lender, address renter, uint256 totalAmount, uint256 startTime, uint256 endTime)'),
      onLogs: (logs) => this.handleStreamCreated(logs),
    });

    this.client.watchEvent({
      address: paymentStreamFactoryAddress,
      event: parseAbiItem('event FundsReleased(address streamId, uint256 amount)'),
      onLogs: (logs) => this.handleFundsReleased(logs),
    });

    console.log('Event subscriptions established');
  }

  private async handleRentalStarted(logs: EventLog[]) {
    for (const log of logs) {
      try {
        const { rentalId, nftContract, tokenId, lender, tenant, startTime, endTime, totalPrice } = log.args;
        
        // Store raw event
        await this.storeEvent('RentalStarted', log, {
          rentalId,
          nftContract,
          tokenId,
          lender,
          tenant,
          startTime: startTime.toString(),
          endTime: endTime.toString(),
          totalPrice: totalPrice.toString()
        });

        // Update rental projection
        const listingId = this.generateListingId(this.chainId, nftContract, tokenId);
        
        await this.db.query(
          `INSERT INTO rentals (id, listing_id, renter, lender, start_time, end_time, status, total_price, collateral_amount, created_at, updated_at, as_of_block)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), $10)
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status,
             updated_at = NOW(),
             as_of_block = EXCLUDED.as_of_block`,
          [
            rentalId,
            listingId,
            tenant,
            lender,
            new Date(Number(startTime) * 1000),
            new Date(Number(endTime) * 1000),
            'active',
            parseFloat(formatUnits(totalPrice, 18)),
            parseFloat(formatUnits(totalPrice, 18)) * 2, // Assuming 2x collateral
            log.blockNumber
          ]
        );

        // Update user statistics
        await this.updateUserStats(tenant, 'rental_started');
        await this.updateUserStats(lender, 'rental_started');

        // Invalidate relevant caches
        await this.invalidateCaches(['user', 'marketplace', 'rentals']);

        console.log(`Processed RentalStarted: ${rentalId}`);
      } catch (error) {
        console.error('Error processing RentalStarted:', error);
      }
    }
  }

  private async handleRentalCompleted(logs: EventLog[]) {
    for (const log of logs) {
      try {
        const { rentalId } = log.args;
        
        await this.storeEvent('RentalCompleted', log, { rentalId });

        await this.db.query(
          `UPDATE rentals SET status = 'completed', updated_at = NOW(), as_of_block = $2 WHERE id = $1`,
          [rentalId, log.blockNumber]
        );

        // Update user statistics
        const rental = await this.db.query('SELECT renter, lender FROM rentals WHERE id = $1', [rentalId]);
        if (rental.rows.length > 0) {
          const { renter, lender } = rental.rows[0];
          await this.updateUserStats(renter, 'rental_completed');
          await this.updateUserStats(lender, 'rental_completed');
        }

        await this.invalidateCaches(['user', 'rentals']);

        console.log(`Processed RentalCompleted: ${rentalId}`);
      } catch (error) {
        console.error('Error processing RentalCompleted:', error);
      }
    }
  }

  private async handleRentalCancelled(logs: EventLog[]) {
    for (const log of logs) {
      try {
        const { rentalId, cancelledBy } = log.args;
        
        await this.storeEvent('RentalCancelled', log, { rentalId, cancelledBy });

        await this.db.query(
          `UPDATE rentals SET status = 'cancelled', updated_at = NOW(), as_of_block = $2 WHERE id = $1`,
          [rentalId, log.blockNumber]
        );

        await this.invalidateCaches(['rentals']);

        console.log(`Processed RentalCancelled: ${rentalId}`);
      } catch (error) {
        console.error('Error processing RentalCancelled:', error);
      }
    }
  }

  private async handleNFTListed(logs: EventLog[]) {
    for (const log of logs) {
      try {
        const { nftContract, tokenId, owner, pricePerSecond, minDuration, maxDuration } = log.args;
        
        await this.storeEvent('NFTListed', log, {
          nftContract,
          tokenId,
          owner,
          pricePerSecond: pricePerSecond.toString(),
          minDuration: minDuration.toString(),
          maxDuration: maxDuration.toString()
        });

        const listingId = this.generateListingId(this.chainId, nftContract, tokenId);
        
        await this.db.query(
          `INSERT INTO nft_listings (id, chain_id, nft_contract, token_id, owner, price_per_second, min_duration, max_duration, created_at, updated_at, as_of_block)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9)
           ON CONFLICT (chain_id, nft_contract, token_id) DO UPDATE SET
             owner = EXCLUDED.owner,
             price_per_second = EXCLUDED.price_per_second,
             min_duration = EXCLUDED.min_duration,
             max_duration = EXCLUDED.max_duration,
             active = true,
             updated_at = NOW(),
             as_of_block = EXCLUDED.as_of_block`,
          [
            listingId,
            this.chainId,
            nftContract,
            tokenId,
            owner,
            parseFloat(formatUnits(pricePerSecond, 18)),
            Number(minDuration),
            Number(maxDuration),
            log.blockNumber
          ]
        );

        await this.invalidateCaches(['marketplace', 'listings']);

        console.log(`Processed NFTListed: ${nftContract}:${tokenId}`);
      } catch (error) {
        console.error('Error processing NFTListed:', error);
      }
    }
  }

  private async handleNFTDelisted(logs: EventLog[]) {
    for (const log of logs) {
      try {
        const { nftContract, tokenId } = log.args;
        
        await this.storeEvent('NFTDelisted', log, { nftContract, tokenId });

        const listingId = this.generateListingId(this.chainId, nftContract, tokenId);
        
        await this.db.query(
          `UPDATE nft_listings SET active = false, updated_at = NOW(), as_of_block = $2 WHERE id = $1`,
          [listingId, log.blockNumber]
        );

        await this.invalidateCaches(['marketplace', 'listings']);

        console.log(`Processed NFTDelisted: ${nftContract}:${tokenId}`);
      } catch (error) {
        console.error('Error processing NFTDelisted:', error);
      }
    }
  }

  private async handleStreamCreated(logs: EventLog[]) {
    for (const log of logs) {
      try {
        const { streamId, lender, renter, totalAmount, startTime, endTime } = log.args;
        
        await this.storeEvent('StreamCreated', log, {
          streamId,
          lender,
          renter,
          totalAmount: totalAmount.toString(),
          startTime: startTime.toString(),
          endTime: endTime.toString()
        });

        // Find associated rental
        const rental = await this.db.query(
          'SELECT id FROM rentals WHERE renter = $1 AND lender = $2 AND start_time = $3',
          [renter, lender, new Date(Number(startTime) * 1000)]
        );

        const rentalId = rental.rows.length > 0 ? rental.rows[0].id : null;
        
        await this.db.query(
          `INSERT INTO streams (id, rental_id, lender, renter, total_amount, start_time, end_time, status, created_at, updated_at, as_of_block)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW(), $8)
           ON CONFLICT (id) DO UPDATE SET
             status = 'active',
             updated_at = NOW(),
             as_of_block = EXCLUDED.as_of_block`,
          [
            streamId,
            rentalId,
            lender,
            renter,
            parseFloat(formatUnits(totalAmount, 18)),
            new Date(Number(startTime) * 1000),
            new Date(Number(endTime) * 1000),
            log.blockNumber
          ]
        );

        await this.invalidateCaches(['streams']);

        console.log(`Processed StreamCreated: ${streamId}`);
      } catch (error) {
        console.error('Error processing StreamCreated:', error);
      }
    }
  }

  private async handleFundsReleased(logs: EventLog[]) {
    for (const log of logs) {
      try {
        const { streamId, amount } = log.args;
        
        await this.storeEvent('FundsReleased', log, {
          streamId,
          amount: amount.toString()
        });

        await this.db.query(
          `UPDATE streams SET released_amount = released_amount + $2, updated_at = NOW(), as_of_block = $3 WHERE id = $1`,
          [streamId, parseFloat(formatUnits(amount, 18)), log.blockNumber]
        );

        await this.invalidateCaches(['streams']);

        console.log(`Processed FundsReleased: ${streamId}`);
      } catch (error) {
        console.error('Error processing FundsReleased:', error);
      }
    }
  }

  private async storeEvent(topic: string, log: EventLog, payload: any) {
    await this.db.query(
      `INSERT INTO events (chain_id, block_number, tx_hash, log_index, topic, kind, payload)
       VALUES ($1, $2, $3, $4, $5, 'onchain', $6)
       ON CONFLICT (chain_id, tx_hash, log_index) DO NOTHING`,
      [
        this.chainId,
        log.blockNumber,
        log.transactionHash,
        log.logIndex,
        topic,
        JSON.stringify(payload)
      ]
    );
  }

  private generateListingId(chainId: number, nftContract: string, tokenId: bigint): string {
    return `${chainId}:${nftContract}:${tokenId}`;
  }

  private async updateUserStats(address: string, action: string) {
    const reputationChange = this.getReputationChange(action);
    
    if (reputationChange !== 0) {
      await this.db.query(
        `INSERT INTO users (address, reputation_score, updated_at)
         VALUES ($1, 500 + $2, NOW())
         ON CONFLICT (address) DO UPDATE SET
           reputation_score = GREATEST(0, LEAST(1000, users.reputation_score + $2)),
           updated_at = NOW()`,
        [address, reputationChange]
      );
    }

    // Update rental counts
    if (action === 'rental_started') {
      await this.db.query(
        `INSERT INTO users (address, total_rentals, updated_at)
         VALUES ($1, 1, NOW())
         ON CONFLICT (address) DO UPDATE SET
           total_rentals = users.total_rentals + 1,
           updated_at = NOW()`,
        [address]
      );
    } else if (action === 'rental_completed') {
      await this.db.query(
        `UPDATE users SET successful_rentals = successful_rentals + 1, updated_at = NOW() WHERE address = $1`,
        [address]
      );
    }
  }

  private getReputationChange(action: string): number {
    const reputationChanges: { [key: string]: number } = {
      'rental_started': 5,
      'rental_completed': 10,
      'rental_cancelled': -5,
      'dispute_created': -10,
      'dispute_resolved_favor': 15,
      'dispute_resolved_against': -20
    };
    
    return reputationChanges[action] || 0;
  }

  private async invalidateCaches(types: string[]) {
    for (const type of types) {
      const keys = await this.redis.keys(`cache-tag:${type}:*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }

  private async backfillEvents() {
    console.log('Starting event backfill...');
    
    try {
      // Get the last processed block
      const lastBlock = await this.db.query(
        'SELECT MAX(block_number) as last_block FROM events WHERE chain_id = $1',
        [this.chainId]
      );
      
      const fromBlock = lastBlock.rows[0].last_block || 0;
      const toBlock = await this.client.getBlockNumber();
      
      if (fromBlock >= toBlock) {
        console.log('No new blocks to backfill');
        return;
      }
      
      console.log(`Backfilling events from block ${fromBlock} to ${toBlock}`);
      
      // Process events in batches
      const batchSize = 1000;
      for (let start = fromBlock; start < toBlock; start += batchSize) {
        const end = Math.min(start + batchSize, toBlock);
        await this.processBlockRange(start, end);
      }
      
      console.log('Event backfill completed');
    } catch (error) {
      console.error('Error during backfill:', error);
    }
  }

  private async processBlockRange(fromBlock: bigint, toBlock: bigint) {
    try {
      const nftFlowCoreAddress = process.env.NFTFLOW_CORE_ADDRESS as `0x${string}`;
      
      // Get all events in the block range
      const logs = await this.client.getLogs({
        address: nftFlowCoreAddress,
        fromBlock,
        toBlock,
      });
      
      // Process each log
      for (const log of logs) {
        // Determine event type and process accordingly
        // This is a simplified version - in practice, you'd parse the log topics
        console.log(`Processing log: ${log.transactionHash}:${log.logIndex}`);
      }
    } catch (error) {
      console.error(`Error processing block range ${fromBlock}-${toBlock}:`, error);
    }
  }
}

// Export singleton instance
export const eventIngestService = new EventIngestService();
