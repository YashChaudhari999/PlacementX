import { Router } from 'express';
import { getRedisClient, isRedisConnected } from '../config/redis';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/ready', async (_req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis || !isRedisConnected() || await redis.ping() !== 'PONG') {
      return res.status(503).json({ status: 'not_ready' });
    }
    return res.status(200).json({ status: 'ready' });
  } catch {
    return res.status(503).json({ status: 'not_ready' });
  }
});

export default router;
