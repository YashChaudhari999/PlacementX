// ─── Redis Configuration ────────────────────────────────
// Provides Redis connection for BullMQ notification queues.
// Falls back to in-memory processing if Redis is unavailable.
// Suppresses all connection error spam when Redis is not running.

import { Redis } from 'ioredis';

let redisClient: Redis | null = null;
let isRedisAvailable = false;
let reconnectAttempts = 0;

/**
 * Initialize Redis connection for BullMQ queues.
 * Uses REDIS_URL from environment or defaults to localhost.
 * Probes the connection first — if Redis is unreachable, returns null
 * immediately with a single clean warning line (no stack traces).
 */
export const initRedis = (): Redis | null => {
  if (redisClient) return redisClient;
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
    
    // BullMQ requires unlimited request retries; commandTimeout keeps health
    // probes and direct commands bounded while reconnects continue safely.
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      connectTimeout: 5_000,
      commandTimeout: 2_000,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        reconnectAttempts = times;
        if (times === 1 || times % 10 === 0) {
          console.warn(`Redis reconnect attempt ${times}.`);
        }
        return Math.min(250 * 2 ** Math.min(times - 1, 5), 5_000);
      },
    });

    client.on('error', () => {
      isRedisAvailable = false;
    });

    client.on('ready', () => {
      const recovered = reconnectAttempts > 0;
      reconnectAttempts = 0;
      isRedisAvailable = true;
      console.log(recovered ? '✅ Redis connection recovered.' : '✅ Redis connected successfully.');
    });

    client.on('close', () => {
      if (isRedisAvailable) console.warn('Redis connection lost; reconnecting.');
      isRedisAvailable = false;
    });

    // Try to connect — the promise will reject if Redis is unreachable
    void client.connect().catch(() => {
      isRedisAvailable = false;
      console.warn('Redis connection attempt failed; retrying in the background.');
    });

    // Return the client immediately — callers should check isRedisConnected()
    // before using it. The async init in index.ts waits before checking.
    redisClient = client;
    return client;
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
    try {
      await redisClient.quit();
    } catch {
      try { redisClient.disconnect(false); } catch {}
    }
    redisClient = null;
    isRedisAvailable = false;
    console.log('Redis connection closed.');
  }
};
