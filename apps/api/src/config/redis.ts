// ─── Redis Configuration ────────────────────────────────
// Provides Redis connection for BullMQ notification queues.
// Falls back to in-memory processing if Redis is unavailable.

import { Redis } from 'ioredis';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

/**
 * Initialize Redis connection for BullMQ queues.
 * Uses REDIS_URL from environment or defaults to localhost.
 */
export const initRedis = (): Redis | null => {
  try {
    let redisUrl = process.env.REDIS_URL;
    
    if (redisUrl === 'disabled') {
      console.warn('⚠️ Redis is explicitly disabled via env. Running without queues.');
      return null;
    }

    if (!redisUrl) {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = process.env.REDIS_PORT || '6379';
      const password = process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : '';
      redisUrl = `redis://${password}${host}:${port}`;
    }
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.warn('⚠️ Redis connection failed after 3 retries. Notifications will process synchronously.');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisClient?.on('connect', () => {
      isRedisAvailable = true;
      console.log('✅ Redis connected successfully.');
    });

    redisClient?.on('error', (err) => {
      isRedisAvailable = false;
      console.error('❌ Redis error:', err.message);
    });

    redisClient?.on('close', () => {
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    console.warn('⚠️ Redis initialization failed. Running without queues.');
    return null;
  }
};

/**
 * Get the active Redis client instance.
 */
export const getRedisClient = (): Redis | null => redisClient;

/**
 * Check if Redis is currently available.
 */
export const isRedisConnected = (): boolean => isRedisAvailable;

/**
 * Gracefully close Redis connection.
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isRedisAvailable = false;
    console.log('Redis connection closed.');
  }
};
