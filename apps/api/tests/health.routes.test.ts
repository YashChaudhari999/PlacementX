import express from 'express';
import request from 'supertest';

const checkRedisReady = jest.fn(() => Promise.resolve(true));

jest.mock('../src/config/redis', () => ({
  checkRedisReady: () => checkRedisReady(),
}));

import healthRoutes from '../src/routes/health.routes';

const app = express();
app.use('/health', healthRoutes);

describe('public health endpoints', () => {
  beforeEach(() => {
    checkRedisReady.mockReset().mockResolvedValue(true);
  });

  it('returns liveness without checking Redis or authentication', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(checkRedisReady).not.toHaveBeenCalled();
  });

  it('returns ready when the existing Redis client responds', async () => {
    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ready' });
    expect(checkRedisReady).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['is disconnected', () => checkRedisReady.mockResolvedValueOnce(false)],
    ['is unavailable', () => checkRedisReady.mockResolvedValueOnce(false)],
    ['times out', () => checkRedisReady.mockResolvedValueOnce(false)],
  ])('returns a minimal 503 when Redis %s', async (_case, arrange) => {
    arrange();
    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'not_ready' });
    expect(response.text).not.toMatch(/redis:\/\/|password|hostname|Command timed out/i);
  });
});
