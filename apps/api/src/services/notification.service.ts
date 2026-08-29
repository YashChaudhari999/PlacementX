// ─── Notification Service (Production) ──────────────────
// Enterprise-grade notification engine with push integration,
// queue processing, user preferences, and rich filtering.

import { PrismaClient, Prisma } from '@prisma/client';
import { getIO } from '../socket';
import { queueImmediateNotification, queueBulkNotification, queueScheduledNotification } from './notification-queue.service';
import { sendPushToUser } from './push-notification.service';

const prisma = new PrismaClient();

// ─── Input Types ────────────────────────────────────────

export interface CreateNotificationInput {
  title: string;
  message: string;
  type?: string;
  category?: string;
  priority?: string;
  image?: string;
  receiverId: string;
  receiverRole?: string;
  senderId?: string;
  senderRole?: string;
  metadata?: any;
  actionUrl?: string;
  deepLinkRoute?: string;
  deepLinkParams?: Record<string, any>;
}

export interface BroadcastNotificationInput {
  title: string;
  message: string;
  type?: string;
  category?: string;
  priority?: string;
  image?: string;
  receiverIds: string[];
  senderId?: string;
  senderRole?: string;
  metadata?: any;
  actionUrl?: string;
  deepLinkRoute?: string;
  deepLinkParams?: Record<string, any>;
}

export interface NotificationFilters {
  category?: string;
  type?: string;
  isRead?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  limit?: number;
  cursor?: string;    // cursor-based pagination (notification ID)
  offset?: number;    // legacy offset support
}

// ─── Create Single Notification ─────────────────────────

/**
 * Create a notification, store in DB, queue push delivery, emit socket event.
 * Respects user notification preferences.
 */
export const createNotification = async (input: CreateNotificationInput) => {
  const category = input.category || input.type || 'system';
  
  // Check user preferences
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: input.receiverId },
  });

  if (prefs) {
    const categoryKey = getCategoryPrefKey(category);
    if (categoryKey && !(prefs as any)[categoryKey]) {
      return null; // User has disabled this notification category
    }
  }

  // Create notification in database
  const notification = await prisma.notification.create({
    data: {
      title: input.title,
      message: input.message,
      type: input.type || 'system',
      category,
      priority: input.priority || 'MEDIUM',
      image: input.image,
      receiverId: input.receiverId,
      receiverRole: input.receiverRole || 'STUDENT',
      senderId: input.senderId,
      senderRole: input.senderRole,
      metadata: input.metadata || {},
      actionUrl: input.actionUrl,
      deepLinkRoute: input.deepLinkRoute,
      deepLinkParams: input.deepLinkParams || {},
    },
  });

  // Queue push notification (async, non-blocking)
  const shouldPush = !prefs || prefs.pushEnabled;
  if (shouldPush) {
    queueImmediateNotification({
      type: 'immediate',
      notificationId: notification.id,
      userId: input.receiverId,
      title: input.title,
      body: input.message,
      data: {
        notificationId: notification.id,
        type: notification.type,
        category: notification.category,
        deepLinkRoute: input.deepLinkRoute,
        deepLinkParams: input.deepLinkParams,
      },
      priority: notification.priority,
    }).catch(err => console.error('Queue error:', err));
  } else {
    // Still emit socket event even if push is disabled
    emitNotificationSocket(input.receiverId, notification);
  }

  return notification;
};

// ─── Create Bulk Notifications ──────────────────────────

/**
 * Create notifications for multiple users efficiently.
 * Uses queue for push delivery to handle large volumes.
 */
export const createBulkNotifications = async (input: BroadcastNotificationInput & { campaignId?: string }) => {
  if (!input.receiverIds.length) return { success: true, count: 0 };

  const category = input.category || input.type || 'system';

  const notificationsData = input.receiverIds.map(id => ({
    title: input.title,
    message: input.message,
    type: input.type || 'system',
    category,
    priority: input.priority || 'MEDIUM',
    image: input.image,
    receiverId: id,
    receiverRole: 'STUDENT',
    senderId: input.senderId,
    senderRole: input.senderRole,
    metadata: input.metadata || {},
    actionUrl: input.actionUrl,
    deepLinkRoute: input.deepLinkRoute,
    deepLinkParams: input.deepLinkParams || {},
    campaignId: input.campaignId,
  }));

  // Create all notifications in a single batch
  await prisma.notification.createMany({ data: notificationsData });

  // Queue bulk push notification
  queueBulkNotification({
    type: 'bulk',
    userIds: input.receiverIds,
    title: input.title,
    message: input.message,
    notificationType: input.type || 'system',
    category,
    priority: input.priority || 'MEDIUM',
    image: input.image,
    deepLinkRoute: input.deepLinkRoute,
    deepLinkParams: input.deepLinkParams,
    metadata: input.metadata,
    senderId: input.senderId,
    senderRole: input.senderRole,
  }).catch(err => console.error('Bulk queue error:', err));

  // Emit socket events to online users
  try {
    const io = getIO();
    input.receiverIds.forEach(id => {
      io.to(`user:${id}`).emit('notification:update');
    });
  } catch (e) {
    console.error('Socket error:', e);
  }

  return { success: true, count: input.receiverIds.length };
};

// ─── Schedule Notification ──────────────────────────────

/**
 * Schedule a notification for future delivery.
 * Uses BullMQ delayed jobs.
 */
export const scheduleNotification = async (
  input: CreateNotificationInput & { campaignId?: string },
  scheduledAt: Date,
) => {
  const delayMs = scheduledAt.getTime() - Date.now();
  if (delayMs <= 0) {
    // Scheduled time is in the past — send immediately
    return createNotification(input);
  }

  const jobId = await queueScheduledNotification(
    {
      type: 'scheduled',
      userId: input.receiverId,
      title: input.title,
      message: input.message,
      notificationType: input.type || 'system',
      category: input.category || input.type || 'system',
      priority: input.priority || 'MEDIUM',
      deepLinkRoute: input.deepLinkRoute,
      deepLinkParams: input.deepLinkParams,
      metadata: input.metadata,
      image: input.image,
      senderId: input.senderId,
      senderRole: input.senderRole,
      campaignId: input.campaignId,
    },
    delayMs,
  );

  return { scheduled: true, jobId, scheduledAt: scheduledAt.toISOString() };
};

// ─── Schedule Bulk Notifications ────────────────────────

/**
 * Schedule notifications for multiple users for future delivery.
 * Uses BullMQ delayed jobs.
 */
export const scheduleBulkNotifications = async (
  input: BroadcastNotificationInput & { campaignId?: string },
  scheduledAt: Date,
) => {
  const delayMs = scheduledAt.getTime() - Date.now();
  if (delayMs <= 0) {
    // Scheduled time is in the past — send immediately
    return createBulkNotifications(input);
  }

  const { queueScheduledBulkNotification } = await import('./notification-queue.service');

  const jobId = await queueScheduledBulkNotification(
    {
      type: 'scheduled-bulk',
      userIds: input.receiverIds,
      title: input.title,
      message: input.message,
      notificationType: input.type || 'system',
      category: input.category || input.type || 'system',
      priority: input.priority || 'MEDIUM',
      deepLinkRoute: input.deepLinkRoute,
      deepLinkParams: input.deepLinkParams,
      metadata: input.metadata,
      image: input.image,
      senderId: input.senderId,
      senderRole: input.senderRole,
      campaignId: input.campaignId,
    },
    delayMs,
  );

  return { scheduled: true, jobId, scheduledAt: scheduledAt.toISOString() };
};

// ─── Get User Notifications (Paginated + Filtered) ──────

/**
 * Fetch notifications with cursor-based pagination, filtering, and search.
 */
export const getUserNotifications = async (
  userId: string,
  filters: NotificationFilters = {},
  pagination: PaginationParams = {},
) => {
  const limit = Math.min(pagination.limit || 20, 50);
  
  // Build where clause
  const where: Prisma.NotificationWhereInput = {
    receiverId: userId,
    isDeleted: false,
    isArchived: false,
  };

  if (filters.category && filters.category !== 'all') {
    where.category = filters.category;
  }
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.isRead !== undefined) {
    where.isRead = filters.isRead;
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { message: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      (where.createdAt as any).gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      (where.createdAt as any).lte = new Date(filters.endDate);
    }
  }

  // Cursor-based pagination
  const findOptions: Prisma.NotificationFindManyArgs = {
    where,
    orderBy: { createdAt: 'desc' },
    take: limit + 1, // Fetch one extra to determine hasMore
  };

  if (pagination.cursor) {
    findOptions.cursor = { id: pagination.cursor };
    findOptions.skip = 1; // Skip the cursor item itself
  } else if (pagination.offset) {
    findOptions.skip = pagination.offset;
  }

  const notifications = await prisma.notification.findMany(findOptions);

  const hasMore = notifications.length > limit;
  const data = hasMore ? notifications.slice(0, limit) : notifications;
  const nextCursor = hasMore ? data[data.length - 1]?.id : null;

  return {
    data,
    pagination: {
      hasMore,
      nextCursor,
      total: await prisma.notification.count({ where }),
    },
  };
};

// ─── Unread Count ───────────────────────────────────────

export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: { receiverId: userId, isRead: false, isDeleted: false },
  });
};

// ─── Mark as Read ───────────────────────────────────────

export const markAsRead = async (id: string, userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { id, receiverId: userId, isDeleted: false },
    data: { isRead: true, readAt: new Date() },
  });

  // Emit updated count
  emitUnreadCount(userId);

  return result;
};

// ─── Mark All as Read ───────────────────────────────────

export const markAllAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { receiverId: userId, isRead: false, isDeleted: false },
    data: { isRead: true, readAt: new Date() },
  });

  emitUnreadCount(userId);

  return result;
};

// ─── Archive Notification ───────────────────────────────

export const archiveNotification = async (id: string, userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { id, receiverId: userId, isDeleted: false },
    data: { isArchived: true },
  });

  emitUnreadCount(userId);

  return result;
};

// ─── Soft Delete Notification ───────────────────────────

export const deleteNotification = async (id: string, userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { id, receiverId: userId },
    data: { isDeleted: true },
  });

  emitUnreadCount(userId);

  return result;
};

// ─── Notification Preferences ───────────────────────────

export const getNotificationPreferences = async (userId: string) => {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  // Return defaults if no preferences saved yet
  if (!prefs) {
    prefs = {
      id: '',
      userId,
      placement: true,
      interviews: true,
      meetings: true,
      messages: true,
      assignments: true,
      marketing: true,
      promotions: true,
      system: true,
      pushEnabled: true,
      emailEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return prefs;
};

export const updateNotificationPreferences = async (
  userId: string,
  data: Partial<{
    placement: boolean;
    interviews: boolean;
    meetings: boolean;
    messages: boolean;
    assignments: boolean;
    marketing: boolean;
    promotions: boolean;
    system: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
  }>,
) => {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
};

// ─── Device Token Management ────────────────────────────

export const registerDeviceToken = async (
  userId: string,
  token: string,
  platform: string = 'android',
  deviceName?: string,
) => {
  // Upsert: if token exists, update it. If not, create.
  return prisma.deviceToken.upsert({
    where: { token },
    create: { userId, token, platform, deviceName },
    update: { userId, platform, deviceName, updatedAt: new Date() },
  });
};

export const removeDeviceToken = async (token: string, userId: string) => {
  return prisma.deviceToken.deleteMany({
    where: { token, userId },
  });
};

export const removeAllDeviceTokens = async (userId: string) => {
  return prisma.deviceToken.deleteMany({
    where: { userId },
  });
};

// ─── Socket Helpers ─────────────────────────────────────

/**
 * Emit a notification to the user's socket room.
 */
const emitNotificationSocket = async (userId: string, notification: any) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:new', notification);
    
    const unreadCount = await prisma.notification.count({
      where: { receiverId: userId, isRead: false, isDeleted: false },
    });
    io.to(`user:${userId}`).emit('notification:count-update', { count: unreadCount });
  } catch (e) {
    console.error('Socket emit error:', e);
  }
};

/**
 * Emit updated unread count to the user.
 */
const emitUnreadCount = async (userId: string) => {
  try {
    const io = getIO();
    const count = await prisma.notification.count({
      where: { receiverId: userId, isRead: false, isDeleted: false },
    });
    io.to(`user:${userId}`).emit('notification:count-update', { count });
  } catch (e) {
    console.error('Socket emit error:', e);
  }
};

// ─── Utility ────────────────────────────────────────────

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
