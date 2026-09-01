import prisma from '../utils/prisma';
// ─── Notification Queue Service ─────────────────────────
// BullMQ-based queue for reliable, scheduled, and bulk
// notification processing with retry and dead letter support.

import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { sendPushToUser, sendPushToUsers } from './push-notification.service';
import { getIO } from '../socket';


// ─── Queue Names ────────────────────────────────────────

const QUEUE_NAMES = {
  IMMEDIATE: 'notification-immediate',
  SCHEDULED: 'notification-scheduled',
  BULK: 'notification-bulk',
} as const;

// ─── Job Types ──────────────────────────────────────────

interface ImmediateNotificationJob {
  type: 'immediate';
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  data: Record<string, any>;
  priority: string;
}

interface ScheduledNotificationJob {
  type: 'scheduled';
  userId: string;
  title: string;
  message: string;
  notificationType: string;
  category: string;
  priority: string;
  deepLinkRoute?: string;
  deepLinkParams?: Record<string, any>;
  metadata?: Record<string, any>;
  image?: string;
  senderId?: string;
  senderRole?: string;
  campaignId?: string;
}

interface BulkNotificationJob {
  type: 'bulk';
  userIds: string[];
  title: string;
  message: string;
  notificationType: string;
  category: string;
  priority: string;
  deepLinkRoute?: string;
  deepLinkParams?: Record<string, any>;
  metadata?: Record<string, any>;
  image?: string;
  senderId?: string;
  senderRole?: string;
}

interface ScheduledBulkJob {
  type: 'scheduled-bulk';
  userIds: string[];
  title: string;
  message: string;
  notificationType: string;
  category: string;
  priority: string;
  deepLinkRoute?: string;
  deepLinkParams?: Record<string, any>;
  metadata?: Record<string, any>;
  image?: string;
  senderId?: string;
  senderRole?: string;
  campaignId?: string;
}

type NotificationJob = ImmediateNotificationJob | ScheduledNotificationJob | BulkNotificationJob | ScheduledBulkJob;

// ─── Queue Instances ────────────────────────────────────

let immediateQueue: Queue | null = null;
let scheduledQueue: Queue | null = null;
let bulkQueue: Queue | null = null;

// ─── Initialize Queues ──────────────────────────────────

export const initQueues = (): void => {
  const redis = getRedisClient();
  if (!redis) {
    console.warn('⚠️ Redis not available. Notification queues disabled — processing synchronously.');
    return;
  }

  const connection = { connection: redis };
  const defaultJobOptions = {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 1000 },
    removeOnComplete: { count: 1000 }, // Keep last 1000 completed jobs
    removeOnFail: { count: 5000 },     // Keep last 5000 failed jobs for debugging
  };

  immediateQueue = new Queue(QUEUE_NAMES.IMMEDIATE, {
    ...connection,
    defaultJobOptions,
  });

  scheduledQueue = new Queue(QUEUE_NAMES.SCHEDULED, {
    ...connection,
    defaultJobOptions,
  });

  bulkQueue = new Queue(QUEUE_NAMES.BULK, {
    ...connection,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 5, // More retries for bulk operations
    },
  });

  console.log('✅ Notification queues initialized.');
};

// ─── Queue Workers ──────────────────────────────────────

export const initWorkers = (): void => {
  const redis = getRedisClient();
  if (!redis) return;

  // Immediate notification worker
  new Worker(QUEUE_NAMES.IMMEDIATE, async (job: Job<ImmediateNotificationJob>) => {
    await processImmediateNotification(job.data);
  }, { connection: redis, concurrency: 10 });

  // Scheduled notification worker
  new Worker(QUEUE_NAMES.SCHEDULED, async (job: Job<ScheduledNotificationJob | ScheduledBulkJob>) => {
    if (job.data.type === 'scheduled') {
      await processScheduledNotification(job.data as ScheduledNotificationJob);
    } else if (job.data.type === 'scheduled-bulk') {
      await processScheduledBulkNotification(job.data as ScheduledBulkJob);
    }
  }, { connection: redis, concurrency: 5 });

  // Bulk notification worker
  new Worker(QUEUE_NAMES.BULK, async (job: Job<BulkNotificationJob>) => {
    await processBulkNotification(job.data);
  }, { connection: redis, concurrency: 3 });

  console.log('✅ Notification workers started.');
};

// ─── Job Processors ─────────────────────────────────────

/**
 * Process an immediate notification — send push + emit socket.
 */
const processImmediateNotification = async (job: ImmediateNotificationJob): Promise<void> => {
  // Send push notification
  await sendPushToUser({
    userId: job.userId,
    title: job.title,
    body: job.body,
    data: job.data,
    priority: job.priority as 'HIGH' | 'MEDIUM' | 'LOW',
  });

  // Emit real-time socket event
  try {
    const io = getIO();
    const notification = await prisma.notification.findUnique({
      where: { id: job.notificationId },
    });
    if (notification) {
      io.to(`user:${job.userId}`).emit('notification:new', notification);
      
      // Also send updated unread count
      const unreadCount = await prisma.notification.count({
        where: { receiverId: job.userId, isRead: false, isDeleted: false },
      });
      io.to(`user:${job.userId}`).emit('notification:count-update', { count: unreadCount });
    }
  } catch (e) {
    console.error('Socket emit error:', e);
  }
};

/**
 * Process a scheduled notification — create in DB, then send push + emit socket.
 */
const processScheduledNotification = async (job: ScheduledNotificationJob): Promise<void> => {
  // Check if user preferences allow this category
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: job.userId },
  });

  if (prefs) {
    const categoryKey = getCategoryPrefKey(job.category);
    if (categoryKey && !(prefs as any)[categoryKey]) {
      return; // User has disabled this category
    }
    if (!prefs.pushEnabled) {
      // Still create in DB but don't send push
      await createNotificationInDb(job);
      return;
    }
  }

  // Create notification in database
  const notification = await createNotificationInDb(job);

  // Send push
  await sendPushToUser({
    userId: job.userId,
    title: job.title,
    body: job.message,
    data: {
      notificationId: notification.id,
      type: job.notificationType,
      category: job.category,
      deepLinkRoute: job.deepLinkRoute,
      deepLinkParams: job.deepLinkParams,
    },
    priority: job.priority as 'HIGH' | 'MEDIUM' | 'LOW',
  });

  // Socket emit
  try {
    const io = getIO();
    io.to(`user:${job.userId}`).emit('notification:new', notification);
    const unreadCount = await prisma.notification.count({
      where: { receiverId: job.userId, isRead: false, isDeleted: false },
    });
    io.to(`user:${job.userId}`).emit('notification:count-update', { count: unreadCount });
  } catch (e) {
    console.error('Socket emit error:', e);
  }
};

/**
 * Process a bulk notification — create for all users, send push.
 */
const processBulkNotification = async (job: BulkNotificationJob): Promise<void> => {
  const { userIds, ...rest } = job;

  // Create notifications for all users
  const notificationsData = userIds.map(userId => ({
    title: rest.title,
    message: rest.message,
    type: rest.notificationType,
    category: rest.category,
    priority: rest.priority,
    receiverId: userId,
    receiverRole: 'STUDENT',
    senderId: rest.senderId,
    senderRole: rest.senderRole,
    metadata: rest.metadata || {},
    deepLinkRoute: rest.deepLinkRoute,
    deepLinkParams: rest.deepLinkParams || {},
    image: rest.image,
  }));

  await prisma.notification.createMany({ data: notificationsData });

  // Send push to all users
  await sendPushToUsers(
    userIds,
    rest.title,
    rest.message,
    {
      type: rest.notificationType,
      category: rest.category,
      deepLinkRoute: rest.deepLinkRoute,
      deepLinkParams: rest.deepLinkParams,
    },
    rest.priority,
  );

  // Emit socket events
  try {
    const io = getIO();
    userIds.forEach(userId => {
      io.to(`user:${userId}`).emit('notification:update');
    });
  } catch (e) {
    console.error('Socket emit error:', e);
  }
};

/**
 * Process a scheduled bulk notification — calls createBulkNotifications and updates campaign.
 */
const processScheduledBulkNotification = async (job: ScheduledBulkJob): Promise<void> => {
  const { createBulkNotifications } = await import('./notification.service');
  await createBulkNotifications({
    title: job.title,
    message: job.message,
    type: job.notificationType,
    category: job.category,
    priority: job.priority,
    receiverIds: job.userIds,
    deepLinkRoute: job.deepLinkRoute,
    deepLinkParams: job.deepLinkParams,
    metadata: job.metadata,
    image: job.image,
    senderId: job.senderId,
    senderRole: job.senderRole,
    campaignId: job.campaignId,
  });

  if (job.campaignId) {
    await prisma.notificationCampaign.updateMany({
      where: { id: job.campaignId },
      data: { status: 'SENT' },
    });
  }
};

// ─── Queue API ──────────────────────────────────────────

/**
 * Add an immediate notification to the queue (or process synchronously if Redis unavailable).
 */
export const queueImmediateNotification = async (job: ImmediateNotificationJob): Promise<void> => {
  if (immediateQueue && isRedisConnected()) {
    await immediateQueue.add('send', job, {
      priority: job.priority === 'HIGH' ? 1 : job.priority === 'MEDIUM' ? 2 : 3,
    });
  } else {
    // Fallback: process synchronously
    await processImmediateNotification(job);
  }
};

/**
 * Add a scheduled notification to the queue with a delay.
 */
export const queueScheduledNotification = async (
  job: ScheduledNotificationJob,
  delayMs: number,
): Promise<string | null> => {
  if (scheduledQueue && isRedisConnected()) {
    const queuedJob = await scheduledQueue.add('scheduled-send', job, {
      delay: delayMs,
    });
    return queuedJob.id || null;
  } else {
    // Fallback: use setTimeout (not reliable for long delays, but works for dev)
    setTimeout(() => processScheduledNotification(job), delayMs);
    return null;
  }
};

/**
 * Add a scheduled bulk notification to the queue with a delay.
 */
export const queueScheduledBulkNotification = async (
  job: ScheduledBulkJob,
  delayMs: number,
): Promise<string | null> => {
  if (scheduledQueue && isRedisConnected()) {
    const queuedJob = await scheduledQueue.add('scheduled-bulk-send', job, {
      delay: delayMs,
    });
    return queuedJob.id || null;
  } else {
    // Fallback
    setTimeout(() => processScheduledBulkNotification(job), delayMs);
    return null;
  }
};

/**
 * Add a bulk notification to the queue.
 */
export const queueBulkNotification = async (job: BulkNotificationJob): Promise<void> => {
  if (bulkQueue && isRedisConnected()) {
    await bulkQueue.add('bulk-send', job);
  } else {
    // Fallback: process synchronously
    await processBulkNotification(job);
  }
};

// ─── Helpers ────────────────────────────────────────────

/**
 * Create a notification record in the database.
 */
const createNotificationInDb = async (job: ScheduledNotificationJob) => {
  return prisma.notification.create({
    data: {
      title: job.title,
      message: job.message,
      type: job.notificationType,
      category: job.category,
      priority: job.priority,
      receiverId: job.userId,
      receiverRole: 'STUDENT',
      senderId: job.senderId,
      senderRole: job.senderRole,
      metadata: job.metadata || {},
      deepLinkRoute: job.deepLinkRoute,
      deepLinkParams: job.deepLinkParams || {},
      image: job.image,
    },
  });
};

/**
 * Map notification category to preference field name.
 */
const getCategoryPrefKey = (category: string): string | null => {
  const map: Record<string, string> = {
    placement: 'placement',
    interview: 'interviews',
    meeting: 'meetings',
    message: 'messages',
    assignment: 'assignments',
    marketing: 'marketing',
    promotion: 'promotions',
    system: 'system',
  };
  return map[category] || null;
};

/**
 * Gracefully close all queues.
 */
export const closeQueues = async (): Promise<void> => {
  await Promise.all([
    immediateQueue?.close(),
    scheduledQueue?.close(),
    bulkQueue?.close(),
  ]);
  console.log('Notification queues closed.');
};
