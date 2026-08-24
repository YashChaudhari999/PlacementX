// ─── Redis Configuration ────────────────────────────────
// Provides Redis connection for BullMQ notification queues.
// Falls back to in-memory processing if Redis is unavailable.
// Suppresses all connection error spam when Redis is not running.

import { Redis } from 'ioredis';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

/**
 * Initialize Redis connection for BullMQ queues.
 * Uses REDIS_URL from environment or defaults to localhost.
 * Probes the connection first — if Redis is unreachable, returns null
 * immediately with a single clean warning line (no stack traces).
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
    
    // Create client with lazyConnect so we control when it connects
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        if (times > 2) {
          return null; // Give up after 2 retries
        }
        return Math.min(times * 300, 1000);
      },
    });

    // Suppress all error event output — we handle failures via the connect() promise
    client.on('error', () => {
      // Silently swallow — prevents AggregateError stack traces in console
    });

    client.on('connect', () => {
      isRedisAvailable = true;
      console.log('✅ Redis connected successfully.');
    });

    client.on('close', () => {
      isRedisAvailable = false;
    });

    // Try to connect — the promise will reject if Redis is unreachable
    client.connect()
      .then(() => {
        redisClient = client;
        isRedisAvailable = true;
      })
      .catch(() => {
        isRedisAvailable = false;
        redisClient = null;
        console.warn('⚠️ Redis unavailable — notifications will process synchronously.');
        // Fully disconnect to prevent any further reconnect attempts
        try { client.disconnect(false); } catch {}
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
