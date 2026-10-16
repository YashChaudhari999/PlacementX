import express from 'express';
import request from 'supertest';

const ping = jest.fn();
const getRedisClient = jest.fn(() => ({ ping }));
const isRedisConnected = jest.fn(() => true);

jest.mock('../src/config/redis', () => ({
  getRedisClient: () => getRedisClient(),
  isRedisConnected: () => isRedisConnected(),
}));

import healthRoutes from '../src/routes/health.routes';

const app = express();
app.use('/health', healthRoutes);

describe('public health endpoints', () => {
  beforeEach(() => {
    ping.mockReset().mockResolvedValue('PONG');
    getRedisClient.mockClear();
    isRedisConnected.mockReset().mockReturnValue(true);
  });

  it('returns liveness without checking Redis or authentication', async () => {
    isRedisConnected.mockReturnValue(false);
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(getRedisClient).not.toHaveBeenCalled();
    expect(ping).not.toHaveBeenCalled();
  });

  it('returns ready when the existing Redis client responds', async () => {
    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ready' });
    expect(getRedisClient).toHaveBeenCalledTimes(1);
    expect(ping).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['is disconnected', () => isRedisConnected.mockReturnValue(false)],
    ['is unavailable', () => getRedisClient.mockReturnValueOnce(null as never)],
    ['times out', () => ping.mockRejectedValueOnce(new Error('Command timed out'))],
  ])('returns a minimal 503 when Redis %s', async (_case, arrange) => {
    arrange();
    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'not_ready' });
    expect(response.text).not.toMatch(/redis:\/\/|password|hostname|Command timed out/i);
  });
});
