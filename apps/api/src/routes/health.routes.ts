import { Router } from 'express';
import { checkRedisReady } from '../config/redis';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/ready', async (_req, res) => {
  try {
    if (!await checkRedisReady()) {
      return res.status(503).json({ status: 'not_ready' });
    }
    return res.status(200).json({ status: 'ready' });
  } catch {
    return res.status(503).json({ status: 'not_ready' });
  }
});

export default router;
