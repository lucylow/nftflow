import { Client } from 'pg';
import Redis from 'ioredis';
import { CacheService } from './cache';
import { MetadataService } from './metadata';
import { somniaTestnet } from '../chains/somnia';
import { JobData } from '../types';

export class WorkerService {
  private db: Client;
  private redis: Redis;
  private cacheService: CacheService;
  private metadataService: MetadataService;
  private isRunning = false;
  private workers: Map<string, Worker> = new Map();

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is required');
    }

    this.db = new Client({ connectionString: process.env.DATABASE_URL });
    this.redis = new Redis(process.env.REDIS_URL);
    this.cacheService = new CacheService();
    this.metadataService = new MetadataService();
  }

  async start() {
    try {
      await this.db.connect();
      this.isRunning = true;

      console.log('Starting worker service...');

      // Initialize workers for different job types
      this.initializeWorkers();

      // Start processing jobs
      this.processJobs();

      console.log('Worker service started successfully');
    } catch (error) {
      console.error('Failed to start worker service:', error);
      throw error;
    }
  }

  async stop() {
    this.isRunning = false;
    await this.db.end();
    await this.redis.quit();
    console.log('Worker service stopped');
  }

  private initializeWorkers() {
    // Listing processing worker
    this.workers.set('process-listing', new Worker('process-listing', this.processListing.bind(this)));
    
    // Metadata processing worker
    this.workers.set('process-metadata', new Worker('process-metadata', this.processMetadata.bind(this)));
    
    // Metrics calculation worker
    this.workers.set('calculate-metrics', new Worker('calculate-metrics', this.calculateMetrics.bind(this)));
    
    // Cache warming worker
    this.workers.set('warm-cache', new Worker('warm-cache', this.warmCache.bind(this)));
    
    // Cleanup worker
    this.workers.set('cleanup', new Worker('cleanup', this.cleanup.bind(this)));
  }

  private async processJobs() {
    while (this.isRunning) {
      try {
        // Process jobs from different queues
        for (const [queueName, worker] of this.workers) {
          const job = await this.redis.lpop(`queue:${queueName}`);
          if (job) {
            try {
              const jobData: JobData = JSON.parse(job);
              await worker.process(jobData);
            } catch (error) {
              console.error(`Error processing job in queue ${queueName}:`, error);
              // Optionally retry or move to dead letter queue
              await this.handleFailedJob(queueName, job, error);
            }
          }
        }

        // Sleep for a short interval before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error in job processing loop:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async processListing(jobData: JobData) {
    const { signer, signature, ...listingData } = jobData.payload;
    
    console.log(`Processing listing for ${listingData.nftContract}:${listingData.tokenId}`);

    // Validate the listing data
    if (!this.validateListingData(listingData)) {
      throw new Error('Invalid listing data');
    }

    // Check if listing already exists
    const existingListing = await this.db.query(
      'SELECT id FROM nft_listings WHERE nft_contract = $1 AND token_id = $2',
      [listingData.nftContract, listingData.tokenId]
    );

    if (existingListing.rows.length > 0) {
      console.log('Listing already exists, updating...');
      await this.updateListing(existingListing.rows[0].id, listingData);
    } else {
      console.log('Creating new listing...');
      await this.createListing(listingData);
    }

    // Invalidate relevant caches
    await this.cacheService.invalidateListings();
    
    console.log(`Successfully processed listing for ${listingData.nftContract}:${listingData.tokenId}`);
  }

  private async processMetadata(jobData: JobData) {
    const { chainId, nftContract, tokenId, metadata } = jobData.payload;
    
    console.log(`Processing metadata for ${nftContract}:${tokenId}`);

    // Validate metadata
    const validation = await this.metadataService.validateMetadata(metadata);
    if (!validation.valid) {
      throw new Error(`Invalid metadata: ${validation.errors.join(', ')}`);
    }

    // Store metadata on IPFS/Arweave
    const { cid, arweaveId, uris } = await this.metadataService.storeMetadata(metadata);

    // Cache in database
    const metadataId = `${chainId}:${nftContract}:${tokenId}`;
    await this.db.query(
      `INSERT INTO nft_metadata (id, chain_id, nft_contract, token_id, name, description, image_url, animation_url, attributes, metadata_uri, cached_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         image_url = EXCLUDED.image_url,
         animation_url = EXCLUDED.animation_url,
         attributes = EXCLUDED.attributes,
         metadata_uri = EXCLUDED.metadata_uri,
         cached_at = NOW()`,
      [
        metadataId,
        chainId,
        nftContract,
        tokenId,
        metadata.name,
        metadata.description,
        metadata.image,
        metadata.animation_url,
        JSON.stringify(metadata.attributes || []),
        `ipfs://${cid}`
      ]
    );

    console.log(`Successfully processed metadata for ${nftContract}:${tokenId} - CID: ${cid}`);
  }

  private async calculateMetrics(jobData: JobData) {
    const { date } = jobData.payload;
    
    console.log(`Calculating metrics for ${date}`);

    // Calculate daily metrics
    const metrics = await this.db.query(`
      SELECT 
        COUNT(DISTINCT l.id) as total_listings,
        COUNT(DISTINCT CASE WHEN l.active THEN l.id END) as active_listings,
        COUNT(DISTINCT r.id) as total_rentals,
        COUNT(DISTINCT CASE WHEN r.status = 'active' THEN r.id END) as active_rentals,
        COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as completed_rentals,
        COALESCE(SUM(CASE WHEN r.status = 'completed' THEN r.total_price END), 0) as total_volume,
        COUNT(DISTINCT u.address) as total_users
      FROM nft_listings l
      FULL OUTER JOIN rentals r ON DATE(r.created_at) = $1
      FULL OUTER JOIN users u ON DATE(u.created_at) = $1
    `, [date]);

    // Store metrics
    await this.db.query(
      `INSERT INTO metrics_daily (date, total_listings, active_listings, total_rentals, active_rentals, completed_rentals, total_volume, total_users)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (date) DO UPDATE SET
         total_listings = EXCLUDED.total_listings,
         active_listings = EXCLUDED.active_listings,
         total_rentals = EXCLUDED.total_rentals,
         active_rentals = EXCLUDED.active_rentals,
         completed_rentals = EXCLUDED.completed_rentals,
         total_volume = EXCLUDED.total_volume,
         total_users = EXCLUDED.total_users`,
      [
        date,
        metrics.rows[0].total_listings,
        metrics.rows[0].active_listings,
        metrics.rows[0].total_rentals,
        metrics.rows[0].active_rentals,
        metrics.rows[0].completed_rentals,
        metrics.rows[0].total_volume,
        metrics.rows[0].total_users
      ]
    );

    console.log(`Successfully calculated metrics for ${date}`);
  }

  private async warmCache(jobData: JobData) {
    console.log('Warming cache...');

    // Warm marketplace listings cache
    const listings = await this.db.query(`
      SELECT 
        l.*,
        m.name,
        m.description,
        m.image_url,
        m.attributes
      FROM nft_listings l
      LEFT JOIN nft_metadata m ON m.id = l.id
      WHERE l.active = true
      ORDER BY l.created_at DESC
      LIMIT 100
    `);

    await this.cacheService.cacheListings('marketplace:featured', listings.rows, 300);

    // Warm user statistics cache
    const stats = await this.db.query(`
      SELECT 
        COUNT(DISTINCT l.id) as total_listings,
        COUNT(DISTINCT CASE WHEN l.active THEN l.id END) as active_listings,
        COUNT(DISTINCT r.id) as total_rentals,
        COUNT(DISTINCT CASE WHEN r.status = 'active' THEN r.id END) as active_rentals,
        COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as completed_rentals,
        COALESCE(SUM(CASE WHEN r.status = 'completed' THEN r.total_price END), 0) as total_volume,
        COUNT(DISTINCT u.address) as total_users
      FROM nft_listings l
      FULL OUTER JOIN rentals r ON 1=1
      FULL OUTER JOIN users u ON 1=1
    `);

    await this.cacheService.set('marketplace-stats', stats.rows[0], 300);

    console.log('Cache warming completed');
  }

  private async cleanup(jobData: JobData) {
    console.log('Running cleanup tasks...');

    // Clean up old events (keep last 30 days)
    await this.db.query(
      'DELETE FROM events WHERE observed_at < NOW() - INTERVAL \'30 days\''
    );

    // Clean up old cache entries
    const oldCacheKeys = await this.redis.keys('cache:*');
    for (const key of oldCacheKeys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) { // No expiration set
        await this.redis.expire(key, 3600); // Set 1 hour expiration
      }
    }

    // Clean up old metrics (keep last 365 days)
    await this.db.query(
      'DELETE FROM metrics_hourly WHERE date_hour < NOW() - INTERVAL \'365 days\''
    );

    console.log('Cleanup tasks completed');
  }

  private validateListingData(data: any): boolean {
    return (
      data.nftContract &&
      data.tokenId !== undefined &&
      data.pricePerSecond &&
      data.minDuration &&
      data.maxDuration &&
      data.minDuration <= data.maxDuration
    );
  }

  private async createListing(data: any) {
    const listingId = `${somniaTestnet.id}:${data.nftContract}:${data.tokenId}`;
    
    await this.db.query(
      `INSERT INTO nft_listings (id, chain_id, nft_contract, token_id, owner, price_per_second, min_duration, max_duration, created_at, updated_at, as_of_block)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9)`,
      [
        listingId,
        somniaTestnet.id,
        data.nftContract,
        data.tokenId,
        data.owner,
        data.pricePerSecond,
        data.minDuration,
        data.maxDuration,
        0 // Will be updated by event ingestion
      ]
    );
  }

  private async updateListing(listingId: string, data: any) {
    await this.db.query(
      `UPDATE nft_listings SET 
         price_per_second = $2,
         min_duration = $3,
         max_duration = $4,
         active = true,
         updated_at = NOW()
       WHERE id = $1`,
      [
        listingId,
        data.pricePerSecond,
        data.minDuration,
        data.maxDuration
      ]
    );
  }

  private async handleFailedJob(queueName: string, job: string, error: any) {
    console.error(`Job failed in queue ${queueName}:`, error);
    
    // Move to dead letter queue
    await this.redis.rpush(`queue:${queueName}:failed`, JSON.stringify({
      job,
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }

  // Public methods for adding jobs to queues
  async addJob(queueName: string, jobData: JobData, priority: number = 0) {
    const job = JSON.stringify({ ...jobData, priority });
    await this.redis.rpush(`queue:${queueName}`, job);
  }

  async scheduleJob(queueName: string, jobData: JobData, delay: number) {
    const job = JSON.stringify(jobData);
    await this.redis.zadd(`queue:${queueName}:scheduled`, Date.now() + delay, job);
  }
}

class Worker {
  constructor(
    private name: string,
    private processor: (jobData: JobData) => Promise<void>
  ) {}

  async process(jobData: JobData): Promise<void> {
    console.log(`Worker ${this.name} processing job:`, jobData.type);
    await this.processor(jobData);
  }
}

// Export singleton instance
export const workerService = new WorkerService();
