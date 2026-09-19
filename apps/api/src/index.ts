import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import driveRoutes from './routes/drive.routes';
import notificationRoutes from './routes/notification.routes';
import studentRoutes from './routes/student.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';
import hrRoutes from './routes/hr.routes';
import publicRoutes from './routes/public.routes';
import settingsRoutes from './routes/settings.routes';
import { initFirebaseAdmin } from './config/firebase-admin';
import { initRedis, closeRedis, getRedisClient, isRedisConnected } from './config/redis';
import { initQueues, initWorkers, closeQueues } from './services/notification-queue.service';
import { initReportQueue, initReportWorker, closeReportQueue } from './services/reports/report-queue.service';
import { errorHandler } from './middlewares/error.middleware';
import { apiRateLimit, securityHeaders } from './middlewares/security.middleware';
import prisma from './utils/prisma';

dotenv.config();

initFirebaseAdmin();

import { createServer } from 'http';
import { initSocket } from './socket';

const app = express();
app.disable('x-powered-by');
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

initSocket(httpServer);

// ─── Initialize Notification Queue Infrastructure ───────
// Redis + BullMQ for reliable notification delivery.
// Falls back to synchronous processing if Redis is unavailable.
// Runs in background so server startup isn't blocked.
(async () => {
  const redis = initRedis();
  if (redis) {
    // Give Redis a moment to connect (lazyConnect)
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Only init queues if Redis actually connected
    const { isRedisConnected } = await import('./config/redis');
    if (isRedisConnected()) {
      initQueues();
      initWorkers();
      initReportQueue();
      initReportWorker();
    }
  }
})();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:8081')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(securityHeaders);
app.use(apiRateLimit);
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/drives', driveRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
import reportRoutes from './routes/reports.routes';
app.use('/api/admin/reports', reportRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);
app.get('/health/live', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.get('/health', async (_req, res) => {
  let database = false;
  let redis = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch {}
  try {
    const client = getRedisClient();
    redis = Boolean(client && isRedisConnected() && await client.ping() === 'PONG');
  } catch {}

  const redisRequired = process.env.REDIS_REQUIRED === 'true';
  const ready = database && (!redisRequired || redis);
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    checks: { database, redis, redisRequired },
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ─── Graceful Shutdown ──────────────────────────────────
let shuttingDown = false;
const gracefulShutdown = async () => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('Shutting down gracefully...');
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  await closeQueues();
  await closeReportQueue();
  await closeRedis();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
