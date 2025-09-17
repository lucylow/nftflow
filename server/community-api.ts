import express from 'express';
import { Client } from 'pg';
import Redis from 'ioredis';
import { CacheService } from '../services/cache';
import { somniaTestnet } from '../chains/somnia';

const router = express.Router();
const db = new Client({ connectionString: process.env['DATABASE_URL'] });
const redis = new Redis(process.env['REDIS_URL']);
const cacheService = new CacheService();

// Middleware for authentication (simplified)
const authMiddleware = (req: any, res: any, next: any) => {
  // In a real implementation, this would verify JWT tokens or signatures
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Extract user address from token (simplified)
  req.user = { address: '0x1234567890123456789012345678901234567890' };
  next();
};

// Profile Management API

/**
 * @route GET /api/profiles/:address
 * @desc Get user profile with social data
 */
router.get('/profiles/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const normalizedAddress = address.toLowerCase();
    
    const cacheKey = `profile:${normalizedAddress}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const profile = await db.query(`
      SELECT 
        up.*,
        upoints.points_balance,
        upoints.tier,
        upoints.discount_percentage,
        COUNT(DISTINCT uf_followers.follower_address) as followers_count,
        COUNT(DISTINCT uf_following.followee_address) as following_count,
        COUNT(DISTINCT cp.id) as posts_count,
        COUNT(DISTINCT pl.id) as likes_received
      FROM user_profiles up
      LEFT JOIN user_points upoints ON up.address = upoints.user_address
      LEFT JOIN user_follows uf_followers ON up.address = uf_followers.followee_address
      LEFT JOIN user_follows uf_following ON up.address = uf_following.follower_address
      LEFT JOIN community_posts cp ON up.address = cp.author_address
      LEFT JOIN post_likes pl ON cp.id = pl.post_id
      WHERE up.address = $1
      GROUP BY up.address, upoints.points_balance, upoints.tier, upoints.discount_percentage
    `, [normalizedAddress]);
    
    if (profile.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Get attestations and badges
    const [attestations, badges] = await Promise.all([
      db.query('SELECT * FROM user_attestations WHERE user_address = $1 ORDER BY created_at DESC', [normalizedAddress]),
      db.query('SELECT * FROM user_badges WHERE user_address = $1 AND active = true ORDER BY earned_at DESC', [normalizedAddress])
    ]);
    
    const profileData = {
      ...profile.rows[0],
      attestations: attestations.rows,
      badges: badges.rows
    };
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, profileData, 300);
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/profiles/:address/follow
 * @desc Follow a user
 */
router.post('/profiles/:address/follow', authMiddleware, async (req, res) => {
  try {
    const { address } = req.params;
    const follower = req.user.address.toLowerCase();
    const normalizedAddress = address.toLowerCase();
    
    if (follower === normalizedAddress) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    // Check if already following
    const existingFollow = await db.query(
      'SELECT 1 FROM user_follows WHERE follower_address = $1 AND followee_address = $2',
      [follower, normalizedAddress]
    );
    
    if (existingFollow.rows.length > 0) {
      return res.status(400).json({ error: 'Already following this user' });
    }
    
    // Create follow relationship
    await db.query(
      'INSERT INTO user_follows (follower_address, followee_address) VALUES ($1, $2)',
      [follower, normalizedAddress]
    );
    
    // Create activity feed entry
    await db.query(
      'INSERT INTO activity_feed (user_address, activity_type, activity_data) VALUES ($1, $2, $3)',
      [follower, 'FOLLOW', JSON.stringify({ followee: normalizedAddress })]
    );
    
    // Invalidate caches
    await cacheService.invalidateUserCache(follower);
    await cacheService.invalidateUserCache(normalizedAddress);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route DELETE /api/profiles/:address/follow
 * @desc Unfollow a user
 */
router.delete('/profiles/:address/follow', authMiddleware, async (req, res) => {
  try {
    const { address } = req.params;
    const follower = req.user.address.toLowerCase();
    const normalizedAddress = address.toLowerCase();
    
    await db.query(
      'DELETE FROM user_follows WHERE follower_address = $1 AND followee_address = $2',
      [follower, normalizedAddress]
    );
    
    // Invalidate caches
    await cacheService.invalidateUserCache(follower);
    await cacheService.invalidateUserCache(normalizedAddress);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Loyalty Points API

/**
 * @route GET /api/loyalty/balance/:address
 * @desc Get user's points balance and tier info
 */
router.get('/loyalty/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const normalizedAddress = address.toLowerCase();
    
    const cacheKey = `loyalty:${normalizedAddress}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const result = await db.query(`
      SELECT 
        upoints.*,
        COUNT(DISTINCT pt.id) as total_transactions,
        COUNT(DISTINCT rr.id) as rewards_redeemed
      FROM user_points upoints
      LEFT JOIN point_transactions pt ON upoints.user_address = pt.user_address
      LEFT JOIN redeemed_rewards rr ON upoints.user_address = rr.user_address
      WHERE upoints.user_address = $1
      GROUP BY upoints.user_address, upoints.points_balance, upoints.tier, upoints.discount_percentage
    `, [normalizedAddress]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const balanceData = result.rows[0];
    
    // Cache for 2 minutes
    await cacheService.set(cacheKey, balanceData, 120);
    
    res.json(balanceData);
  } catch (error) {
    console.error('Error fetching loyalty balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/loyalty/earn
 * @desc Award points to a user
 */
router.post('/loyalty/earn', authMiddleware, async (req, res) => {
  try {
    const { address, points, reason, reference_id, reference_type } = req.body;
    const normalizedAddress = address.toLowerCase();
    
    // Verify authorization (simplified)
    if (!isAuthorized(req.user.address, 'AWARD_POINTS')) {
      return res.status(403).json({ error: 'Not authorized to award points' });
    }
    
    if (points <= 0) {
      return res.status(400).json({ error: 'Points must be positive' });
    }
    
    // Update points balance
    await db.query(`
      INSERT INTO user_points (user_address, points_balance, points_earned_total, last_earned)
      VALUES ($1, $2, $2, NOW())
      ON CONFLICT (user_address) DO UPDATE SET
        points_balance = user_points.points_balance + $2,
        points_earned_total = user_points.points_earned_total + $2,
        last_earned = NOW()
    `, [normalizedAddress, points]);
    
    // Record transaction
    await db.query(`
      INSERT INTO point_transactions (user_address, points_amount, transaction_type, reason, reference_id, reference_type)
      VALUES ($1, $2, 'EARN', $3, $4, $5)
    `, [normalizedAddress, points, reason, reference_id, reference_type]);
    
    // Check for tier upgrade
    await checkTierUpgrade(normalizedAddress);
    
    // Invalidate cache
    await cacheService.invalidateUserCache(normalizedAddress);
    
    const newBalance = await getPointsBalance(normalizedAddress);
    
    res.json({ success: true, newBalance });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/loyalty/rewards
 * @desc Get available rewards
 */
router.get('/loyalty/rewards', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const cacheKey = `rewards:${limit}:${offset}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const rewards = await db.query(`
      SELECT 
        rc.*,
        (rc.quantity_available - rc.quantity_redeemed) as available_quantity
      FROM rewards_catalog rc
      WHERE rc.active = true AND rc.quantity_available > rc.quantity_redeemed
      ORDER BY rc.points_cost ASC
      LIMIT $1 OFFSET $2
    `, [Number(limit), Number(offset)]);
    
    // Cache for 10 minutes
    await cacheService.set(cacheKey, rewards.rows, 600);
    
    res.json(rewards.rows);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/loyalty/redeem
 * @desc Redeem a reward
 */
router.post('/loyalty/redeem', authMiddleware, async (req, res) => {
  try {
    const { reward_id } = req.body;
    const user = req.user.address.toLowerCase();
    
    // Check reward availability
    const reward = await db.query(
      'SELECT * FROM rewards_catalog WHERE id = $1 AND active = true',
      [reward_id]
    );
    
    if (reward.rows.length === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    
    const rewardData = reward.rows[0];
    
    if (rewardData.quantity_available <= rewardData.quantity_redeemed) {
      return res.status(400).json({ error: 'Reward out of stock' });
    }
    
    // Check user points
    const userPoints = await db.query(
      'SELECT points_balance FROM user_points WHERE user_address = $1',
      [user]
    );
    
    if (userPoints.rows.length === 0 || userPoints.rows[0].points_balance < rewardData.points_cost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    // Check if already redeemed
    const alreadyRedeemed = await db.query(
      'SELECT 1 FROM redeemed_rewards WHERE user_address = $1 AND reward_id = $2',
      [user, reward_id]
    );
    
    if (alreadyRedeemed.rows.length > 0) {
      return res.status(400).json({ error: 'Reward already redeemed' });
    }
    
    // Begin transaction
    await db.query('BEGIN');
    
    try {
      // Deduct points
      await db.query(
        'UPDATE user_points SET points_balance = points_balance - $1 WHERE user_address = $2',
        [rewardData.points_cost, user]
      );
      
      // Update reward quantity
      await db.query(
        'UPDATE rewards_catalog SET quantity_redeemed = quantity_redeemed + 1 WHERE id = $1',
        [reward_id]
      );
      
      // Record redemption
      await db.query(
        'INSERT INTO redeemed_rewards (user_address, reward_id, status) VALUES ($1, $2, $3)',
        [user, reward_id, 'PENDING']
      );
      
      // Record transaction
      await db.query(
        'INSERT INTO point_transactions (user_address, points_amount, transaction_type, reason, reference_id) VALUES ($1, $2, $3, $4, $5)',
        [user, rewardData.points_cost, 'SPEND', 'Reward redeemed', `reward_${reward_id}`]
      );
      
      await db.query('COMMIT');
      
      // Distribute reward based on type
      await distributeReward(user, rewardData);
      
      // Invalidate caches
      await cacheService.invalidateUserCache(user);
      
      res.json({ success: true });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Community Content API

/**
 * @route GET /api/community/posts
 * @desc Get community posts
 */
router.get('/community/posts', async (req, res) => {
  try {
    const { collection, type, limit = 20, offset = 0, sort = 'recent' } = req.query;
    
    const cacheKey = `posts:${collection}:${type}:${limit}:${offset}:${sort}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;
    
    if (collection) {
      whereClause += ` AND cp.collection_address = $${++paramCount}`;
      params.push(collection.toLowerCase());
    }
    
    if (type) {
      whereClause += ` AND cp.post_type = $${++paramCount}`;
      params.push(type);
    }
    
    let orderClause = 'ORDER BY cp.created_at DESC';
    if (sort === 'trending') {
      orderClause = 'ORDER BY (cp.likes_count + cp.comments_count * 2 + cp.shares_count * 3) DESC';
    } else if (sort === 'popular') {
      orderClause = 'ORDER BY cp.likes_count DESC';
    }
    
    const posts = await db.query(`
      SELECT 
        cp.*,
        up.avatar_url as author_avatar,
        up.reputation_score as author_reputation,
        up.verified as author_verified,
        COUNT(DISTINCT pl.id) as likes_count,
        COUNT(DISTINCT pc.id) as comments_count
      FROM community_posts cp
      JOIN user_profiles up ON cp.author_address = up.address
      LEFT JOIN post_likes pl ON cp.id = pl.post_id
      LEFT JOIN post_comments pc ON cp.id = pc.post_id
      ${whereClause}
      GROUP BY cp.id, up.avatar_url, up.reputation_score, up.verified
      ${orderClause}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `, [...params, Number(limit), Number(offset)]);
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, posts.rows, 300);
    
    res.json(posts.rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/community/posts
 * @desc Create a new community post
 */
router.post('/community/posts', authMiddleware, async (req, res) => {
  try {
    const { title, content, post_type, collection_address, nft_token_id, image_url, tags } = req.body;
    const author = req.user.address.toLowerCase();
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const post = await db.query(`
      INSERT INTO community_posts (
        author_address, title, content, post_type, collection_address, 
        nft_token_id, image_url, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      author, title, content, post_type, 
      collection_address ? collection_address.toLowerCase() : null,
      nft_token_id, image_url, tags || []
    ]);
    
    // Update user post count
    await db.query(
      'UPDATE user_profiles SET posts_count = posts_count + 1 WHERE address = $1',
      [author]
    );
    
    // Add to activity feed
    await db.query(
      'INSERT INTO activity_feed (user_address, activity_type, activity_data) VALUES ($1, $2, $3)',
      [author, 'POST_CREATE', JSON.stringify({ post_id: post.rows[0].id })]
    );
    
    // Invalidate caches
    await cacheService.invalidateUserCache(author);
    
    res.json(post.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions

async function checkTierUpgrade(address: string): Promise<void> {
  const userPoints = await db.query(
    'SELECT points_balance, tier FROM user_points WHERE user_address = $1',
    [address]
  );
  
  if (userPoints.rows.length === 0) return;
  
  const { points_balance, tier } = userPoints.rows[0];
  
  // Define tier thresholds
  const tierThresholds = [0, 1000, 5000, 15000, 50000];
  const tierNames = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const tierDiscounts = [0, 5, 15, 25, 50];
  
  let newTier = 0;
  for (let i = tierThresholds.length - 1; i >= 0; i--) {
    if (points_balance >= tierThresholds[i]) {
      newTier = i;
      break;
    }
  }
  
  if (newTier > tier) {
    await db.query(
      'UPDATE user_points SET tier = $1, tier_level = $2, discount_percentage = $3 WHERE user_address = $4',
      [tierNames[newTier], newTier, tierDiscounts[newTier], address]
    );
  }
}

async function getPointsBalance(address: string): Promise<number> {
  const result = await db.query(
    'SELECT points_balance FROM user_points WHERE user_address = $1',
    [address]
  );
  
  return result.rows.length > 0 ? result.rows[0].points_balance : 0;
}

function isAuthorized(userAddress: string, action: string): boolean {
  // Simplified authorization - in production, this would check against a role-based system
  const authorizedAddresses = [
    '0x1234567890123456789012345678901234567890', // Example authorized address
    // Add more authorized addresses as needed
  ];
  
  return authorizedAddresses.includes(userAddress.toLowerCase());
}

async function distributeReward(user: string, reward: any): Promise<void> {
  // Implement reward distribution based on reward type
  switch (reward.reward_type) {
    case 'TOKEN_AIRDROP':
      // Transfer tokens to user
      break;
    case 'NFT_AIRDROP':
      // Mint NFT to user
      break;
    case 'DISCOUNT_CODE':
      // Generate and provide discount code
      break;
    case 'PREMIUM_FEATURES':
      // Grant premium features access
      break;
    default:
      console.log(`Unknown reward type: ${reward.reward_type}`);
  }
}

export default router;
