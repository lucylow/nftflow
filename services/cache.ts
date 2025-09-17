import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!, {
      // Connection options
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
    });

    // Handle connection events
    this.redis.on('connect', () => {
      console.log('Redis connected');
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  // Generic get method with automatic JSON parsing
  async get(key: string): Promise<any> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  // Generic set method with automatic JSON stringification
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, stringValue);
      } else {
        await this.redis.set(key, stringValue);
      }
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
    }
  }

  // Delete a key
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
    }
  }

  // Delete multiple keys
  async delMultiple(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Error deleting cache keys:`, error);
    }
  }

  // Method to cache marketplace listings with tag-based invalidation
  async cacheListings(key: string, listings: any[], ttl: number = 15): Promise<void> {
    await this.set(key, listings, ttl);
    
    // Add to tag set for bulk invalidation
    await this.redis.sadd('cache-tag:listings', key);
  }

  // Invalidate all listings cache when a new listing is added
  async invalidateListings(): Promise<void> {
    try {
      const keys = await this.redis.smembers('cache-tag:listings');
      if (keys.length > 0) {
        await this.delMultiple(keys);
        await this.redis.del('cache-tag:listings');
      }
    } catch (error) {
      console.error('Error invalidating listings cache:', error);
    }
  }

  // Cache user data with invalidation
  async cacheUserData(address: string, data: any, ttl: number = 60): Promise<void> {
    const key = `user:${address}`;
    await this.set(key, data, ttl);
    await this.redis.sadd('cache-tag:user', key);
  }

  // Invalidate user cache
  async invalidateUserCache(address: string): Promise<void> {
    const keys = await this.redis.keys(`user:${address}*`);
    if (keys.length > 0) {
      await this.delMultiple(keys);
    }
  }

  // Cache rental data
  async cacheRentalData(key: string, data: any, ttl: number = 15): Promise<void> {
    await this.set(key, data, ttl);
    await this.redis.sadd('cache-tag:rentals', key);
  }

  // Invalidate rental cache
  async invalidateRentalCache(): Promise<void> {
    try {
      const keys = await this.redis.smembers('cache-tag:rentals');
      if (keys.length > 0) {
        await this.delMultiple(keys);
        await this.redis.del('cache-tag:rentals');
      }
    } catch (error) {
      console.error('Error invalidating rental cache:', error);
    }
  }

  // Rate limiting helper
  async checkRateLimit(key: string, limit: number, windowMs: number): Promise<{
    allowed: boolean;
    remaining: number;
    reset: number;
  }> {
    try {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Remove old timestamps
      await this.redis.zremrangebyscore(key, 0, windowStart);
      
      // Count requests in current window
      const count = await this.redis.zcard(key);
      
      if (count < limit) {
        // Add current timestamp
        await this.redis.zadd(key, now, now.toString());
        // Set expiration
        await this.redis.expire(key, Math.ceil(windowMs / 1000));
        
        return {
          allowed: true,
          remaining: limit - count - 1,
          reset: now + windowMs
        };
      }
      
      // Get oldest timestamp to calculate reset time
      const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = oldest.length > 0 ? parseInt(oldest[1]) + windowMs : now + windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        reset: resetTime
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Allow request on error to avoid blocking users
      return {
        allowed: true,
        remaining: limit - 1,
        reset: Date.now() + windowMs
      };
    }
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession(sessionId: string): Promise<any> {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Nonce management for EIP-712
  async getNonce(address: string): Promise<number> {
    const nonce = await this.redis.get(`nonce:${address}`);
    return nonce ? parseInt(nonce) : 0;
  }

  async incrementNonce(address: string): Promise<number> {
    return await this.redis.incr(`nonce:${address}`);
  }

  async setNonce(address: string, nonce: number): Promise<void> {
    await this.redis.set(`nonce:${address}`, nonce.toString());
  }

  // Queue management for background jobs
  async pushToQueue(queueName: string, data: any): Promise<void> {
    await this.redis.rpush(queueName, JSON.stringify(data));
  }

  async popFromQueue(queueName: string): Promise<any> {
    const data = await this.redis.lpop(queueName);
    return data ? JSON.parse(data) : null;
  }

  async getQueueLength(queueName: string): Promise<number> {
    return await this.redis.llen(queueName);
  }

  // Distributed locks
  async acquireLock(key: string, ttl: number = 10): Promise<boolean> {
    const result = await this.redis.set(key, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Cache warming
  async warmCache(): Promise<void> {
    try {
      console.log('Starting cache warming...');
      
      // Warm marketplace listings cache
      await this.redis.set('cache-warming:listings', 'true', 300);
      
      // Warm user statistics
      await this.redis.set('cache-warming:stats', 'true', 300);
      
      console.log('Cache warming completed');
    } catch (error) {
      console.error('Error during cache warming:', error);
    }
  }

  // Cache statistics
  async getCacheStats(): Promise<{
    memory: any;
    keyspace: any;
    info: any;
  }> {
    try {
      const memory = await this.redis.memory('usage');
      const keyspace = await this.redis.info('keyspace');
      const info = await this.redis.info();
      
      return { memory, keyspace, info };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { memory: null, keyspace: null, info: null };
    }
  }

  // Clear all cache (use with caution)
  async clearAll(): Promise<void> {
    try {
      await this.redis.flushall();
      console.log('All cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  // Close connection
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Export singleton instance
export const cacheService = new CacheService();
