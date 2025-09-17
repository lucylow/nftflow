import express from 'express';
import { Client } from 'pg';
import Redis from 'ioredis';
import { createPublicClient, http, recoverTypedDataAddress } from 'viem';
import { somniaTestnet } from '../chains/somnia';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createRedisStore } from 'rate-limit-redis';
import helmet from 'helmet';
import compression from 'compression';
import { CacheService } from '../services/cache';
import { MetadataService } from '../services/metadata';

const app = express();

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}
if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required');
}
if (!process.env.SOMNIA_HTTP_RPC) {
  throw new Error('SOMNIA_HTTP_RPC environment variable is required');
}

const db = new Client({ connectionString: process.env.DATABASE_URL });
const redis = new Redis(process.env.REDIS_URL);
const cacheService = new CacheService();
const metadataService = new MetadataService();

const client = createPublicClient({
  chain: somniaTestnet,
  transport: http(process.env.SOMNIA_HTTP_RPC),
});

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  store: createRedisStore(redis),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// EIP-712 domain definition
const DOMAIN = {
  name: 'NFTFlow',
  version: '1',
  chainId: somniaTestnet.id,
  verifyingContract: process.env.NFTFLOW_CORE_ADDRESS as `0x${string}`,
};

// EIP-712 type definitions
const TYPES = {
  Listing: [
    { name: 'nftContract', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'pricePerSecond', type: 'uint256' },
    { name: 'minDuration', type: 'uint256' },
    { name: 'maxDuration', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
  RentalRequest: [
    { name: 'rentalId', type: 'bytes32' },
    { name: 'nftContract', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'duration', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

// Middleware for database connection
app.use(async (req, res, next) => {
  try {
    if (!db._connected) {
      await db.connect();
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// API Routes

// Get marketplace listings
app.get('/api/listings', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      collection, 
      minPrice, 
      maxPrice, 
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const cacheKey = `listings:${page}:${limit}:${collection}:${minPrice}:${maxPrice}:${sortBy}:${sortOrder}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    let query = `
      SELECT 
        l.*,
        m.name,
        m.description,
        m.image_url,
        m.animation_url,
        m.attributes,
        u.reputation_score as owner_reputation
      FROM nft_listings l
      LEFT JOIN nft_metadata m ON m.id = l.id
      LEFT JOIN users u ON u.address = l.owner
      WHERE l.active = true
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (collection) {
      query += ` AND l.nft_contract = $${++paramCount}`;
      params.push(collection);
    }
    
    if (minPrice) {
      query += ` AND l.price_per_second >= $${++paramCount}`;
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += ` AND l.price_per_second <= $${++paramCount}`;
      params.push(maxPrice);
    }
    
    // Validate sort parameters
    const allowedSortFields = ['created_at', 'price_per_second', 'updated_at'];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY l.${sortField} ${order} LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    
    const result = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM nft_listings l WHERE l.active = true';
    const countParams: any[] = [];
    let countParamCount = 0;
    
    if (collection) {
      countQuery += ` AND l.nft_contract = $${++countParamCount}`;
      countParams.push(collection);
    }
    
    if (minPrice) {
      countQuery += ` AND l.price_per_second >= $${++countParamCount}`;
      countParams.push(minPrice);
    }
    
    if (maxPrice) {
      countQuery += ` AND l.price_per_second <= $${++countParamCount}`;
      countParams.push(maxPrice);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    const response = {
      listings: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    };
    
    // Cache for 15 seconds
    await cacheService.set(cacheKey, response, 15);
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific listing
app.get('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cacheKey = `listing:${id}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const result = await db.query(
      `SELECT 
        l.*,
        m.name,
        m.description,
        m.image_url,
        m.animation_url,
        m.attributes,
        u.reputation_score as owner_reputation,
        u.total_rentals,
        u.successful_rentals
      FROM nft_listings l
      LEFT JOIN nft_metadata m ON m.id = l.id
      LEFT JOIN users u ON u.address = l.owner
      WHERE l.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    const listing = result.rows[0];
    
    // Cache for 30 seconds
    await cacheService.set(cacheKey, listing, 30);
    
    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create listing with EIP-712 signature
app.post('/api/listings', async (req, res) => {
  try {
    const { signature, typedData } = req.body;
    
    if (!signature || !typedData) {
      return res.status(400).json({ error: 'Signature and typed data required' });
    }
    
    // Recover the signer address
    const signer = await recoverTypedDataAddress({
      domain: DOMAIN,
      types: TYPES,
      primaryType: 'Listing',
      message: typedData.message,
      signature: signature as `0x${string}`,
    });
    
    // Verify nonce and deadline
    const currentNonce = await redis.get(`nonce:${signer}`);
    if (typedData.message.nonce !== parseInt(currentNonce || '0')) {
      return res.status(400).json({ error: 'Invalid nonce' });
    }
    
    if (typedData.message.deadline < Math.floor(Date.now() / 1000)) {
      return res.status(400).json({ error: 'Signature expired' });
    }
    
    // Validate listing parameters
    const { nftContract, tokenId, pricePerSecond, minDuration, maxDuration } = typedData.message;
    
    if (minDuration > maxDuration) {
      return res.status(400).json({ error: 'Minimum duration cannot exceed maximum duration' });
    }
    
    // Check if user has sufficient reputation
    const userResult = await db.query('SELECT reputation_score FROM users WHERE address = $1', [signer]);
    const reputationScore = userResult.rows.length > 0 ? userResult.rows[0].reputation_score : 500;
    
    const minReputation = await getConfigValue('reputation_threshold');
    if (reputationScore < minReputation) {
      return res.status(400).json({ error: 'Insufficient reputation score' });
    }
    
    // Store the listing intent (will be processed by a worker)
    await redis.rpush('pending-listings', JSON.stringify({
      ...typedData.message,
      signer,
      signature,
      timestamp: Date.now()
    }));
    
    // Increment nonce
    await redis.incr(`nonce:${signer}`);
    
    // Invalidate listings cache
    await cacheService.invalidateListings();
    
    res.json({ 
      success: true, 
      message: 'Listing submitted for processing',
      listingId: `${somniaTestnet.id}:${nftContract}:${tokenId}`
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's listings
app.get('/api/users/:address/listings', async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const cacheKey = `user-listings:${address}:${page}:${limit}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const result = await db.query(
      `SELECT 
        l.*,
        m.name,
        m.description,
        m.image_url,
        m.attributes
      FROM nft_listings l
      LEFT JOIN nft_metadata m ON m.id = l.id
      WHERE l.owner = $1
      ORDER BY l.created_at DESC
      LIMIT $2 OFFSET $3`,
      [address, Number(limit), (Number(page) - 1) * Number(limit)]
    );
    
    // Cache for 30 seconds
    await cacheService.set(cacheKey, result.rows, 30);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's rentals
app.get('/api/users/:address/rentals', async (req, res) => {
  try {
    const { address } = req.params;
    const { status, type = 'all' } = req.query; // type: 'as_renter' | 'as_lender' | 'all'
    
    const cacheKey = `user-rentals:${address}:${status}:${type}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    let query = `
      SELECT 
        r.*,
        l.nft_contract,
        l.token_id,
        l.price_per_second,
        m.name as nft_name,
        m.image_url as nft_image
      FROM rentals r
      JOIN nft_listings l ON r.listing_id = l.id
      LEFT JOIN nft_metadata m ON m.id = l.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (type === 'as_renter') {
      query += ` AND r.renter = $${++paramCount}`;
      params.push(address);
    } else if (type === 'as_lender') {
      query += ` AND r.lender = $${++paramCount}`;
      params.push(address);
    } else {
      query += ` AND (r.renter = $${++paramCount} OR r.lender = $${++paramCount})`;
      params.push(address, address);
    }
    
    if (status) {
      query += ` AND r.status = $${++paramCount}`;
      params.push(status);
    }
    
    query += ` ORDER BY r.created_at DESC`;
    
    const result = await db.query(query, params);
    
    // Cache for 15 seconds
    await cacheService.set(cacheKey, result.rows, 15);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user rentals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/users/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const cacheKey = `user:${address}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const result = await db.query(
      `SELECT 
        u.*,
        COUNT(DISTINCT l.id) as total_listings,
        COUNT(DISTINCT CASE WHEN l.active THEN l.id END) as active_listings,
        COUNT(DISTINCT r.id) as total_rentals,
        COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as completed_rentals
      FROM users u
      LEFT JOIN nft_listings l ON l.owner = u.address
      LEFT JOIN rentals r ON (r.renter = u.address OR r.lender = u.address)
      WHERE u.address = $1
      GROUP BY u.address`,
      [address]
    );
    
    if (result.rows.length === 0) {
      // Create user if doesn't exist
      await db.query(
        'INSERT INTO users (address) VALUES ($1) ON CONFLICT (address) DO NOTHING',
        [address]
      );
      
      const newUser = await db.query('SELECT * FROM users WHERE address = $1', [address]);
      return res.json(newUser.rows[0]);
    }
    
    const user = result.rows[0];
    
    // Cache for 60 seconds
    await cacheService.set(cacheKey, user, 60);
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get marketplace statistics
app.get('/api/stats', async (req, res) => {
  try {
    const cacheKey = 'marketplace-stats';
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const stats = await db.query(`
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
    
    const result = stats.rows[0];
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, 300);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Store NFT metadata
app.post('/api/metadata', async (req, res) => {
  try {
    const { chainId, nftContract, tokenId, metadata } = req.body;
    
    if (!chainId || !nftContract || !tokenId || !metadata) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Store metadata on IPFS/Arweave
    const { cid, arweaveId } = await metadataService.storeMetadata(metadata);
    
    // Cache in database
    const metadataId = `${chainId}:${nftContract}:${tokenId}`;
    await db.query(
      `INSERT INTO nft_metadata (id, chain_id, nft_contract, tokenId, name, description, image_url, animation_url, attributes, metadata_uri, cached_at)
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
    
    res.json({ 
      success: true, 
      cid, 
      arweaveId,
      metadataUri: `ipfs://${cid}`
    });
  } catch (error) {
    console.error('Error storing metadata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nonce for EIP-712 signing
app.get('/api/nonce/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const nonce = await redis.get(`nonce:${address}`) || '0';
    
    res.json({ nonce: parseInt(nonce) });
  } catch (error) {
    console.error('Error getting nonce:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    // Check redis connection
    await redis.ping();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message 
    });
  }
});

// Helper function to get configuration values
async function getConfigValue(key: string): Promise<number> {
  const result = await db.query('SELECT value FROM config_parameters WHERE key = $1', [key]);
  return result.rows.length > 0 ? result.rows[0].value : 0;
}

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await db.connect();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await db.end();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await db.end();
  await redis.quit();
  process.exit(0);
});

startServer();

export default app;
