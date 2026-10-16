const mockClient = {
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  ping: jest.fn().mockResolvedValue('PONG'),
  quit: jest.fn().mockResolvedValue('OK'),
  disconnect: jest.fn(),
};
const mockRedis = jest.fn((_url?: string, _options?: any) => mockClient);

jest.mock('ioredis', () => ({ Redis: mockRedis }));

import { checkRedisReady, closeRedis, initRedis } from '../src/config/redis';

describe('Redis connection lifecycle', () => {
  const previousRedisUrl = process.env.REDIS_URL;

  afterAll(async () => {
    await closeRedis();
    process.env.REDIS_URL = previousRedisUrl;
  });

  it('uses one reconnecting client for queues and health checks', async () => {
    process.env.REDIS_URL = 'redis://private-redis:6379';

    const first = initRedis();
    const second = initRedis();

    expect(first).toBe(mockClient);
    expect(second).toBe(first);
    expect(mockRedis).toHaveBeenCalledTimes(1);

    const options = mockRedis.mock.calls[0][1];
    expect(options).toEqual(expect.objectContaining({
      lazyConnect: true,
      maxRetriesPerRequest: null,
      connectTimeout: 5_000,
    }));
    expect(options.retryStrategy(1)).toBe(250);
    expect(options.retryStrategy(100)).toBe(5_000);
    expect(mockClient.connect).toHaveBeenCalledTimes(1);

    const readyHandler = mockClient.on.mock.calls.find(([event]) => event === 'ready')?.[1];
    readyHandler();
    await expect(Promise.all([checkRedisReady(), checkRedisReady()])).resolves.toEqual([true, true]);
    expect(mockClient.ping).toHaveBeenCalledTimes(1);
  });
});
