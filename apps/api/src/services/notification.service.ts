import { PrismaClient, Notification } from '@prisma/client';
import { getIO } from '../socket';

const prisma = new PrismaClient();

export interface CreateNotificationInput {
  title: string;
  message: string;
  type?: string;
  priority?: string;
  receiverId: string;
  receiverRole?: string;
  senderId?: string;
  senderRole?: string;
  metadata?: any;
  actionUrl?: string;
}

export interface BroadcastNotificationInput {
  title: string;
  message: string;
  type?: string;
  priority?: string;
  receiverIds: string[];
  senderId?: string;
  senderRole?: string;
  metadata?: any;
  actionUrl?: string;
}

export const createNotification = async (input: CreateNotificationInput) => {
  const notification = await prisma.notification.create({
    data: {
      title: input.title,
      message: input.message,
      type: input.type || 'system',
      priority: input.priority || 'NORMAL',
      receiverId: input.receiverId,
      receiverRole: input.receiverRole || 'STUDENT',
      senderId: input.senderId,
      senderRole: input.senderRole,
      metadata: input.metadata || {},
      actionUrl: input.actionUrl,
    }
  });

  // Emit to specific user
  try {
    const io = getIO();
    io.to(`user:${input.receiverId}`).emit('notification:new', notification);
  } catch (e) {
    console.error('Socket error:', e);
  }

  return notification;
};

export const createBulkNotifications = async (input: BroadcastNotificationInput) => {
  if (!input.receiverIds.length) return [];

  const notificationsData = input.receiverIds.map(id => ({
    title: input.title,
    message: input.message,
    type: input.type || 'system',
    priority: input.priority || 'NORMAL',
    receiverId: id,
    receiverRole: 'STUDENT', // Defaulting for bulk, adjust as needed
    senderId: input.senderId,
    senderRole: input.senderRole,
    metadata: input.metadata || {},
    actionUrl: input.actionUrl,
  }));

  // Create many using Prisma
  await prisma.notification.createMany({
    data: notificationsData
  });

  try {
    const io = getIO();
    input.receiverIds.forEach(id => {
      io.to(`user:${id}`).emit('notification:update'); // Tells client to re-fetch
    });
  } catch (e) {
    console.error('Socket error:', e);
  }

  return { success: true, count: input.receiverIds.length };
};

export const getUserNotifications = async (userId: string, limit = 50, offset = 0) => {
  return await prisma.notification.findMany({
    where: { receiverId: userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
};

export const getUnreadCount = async (userId: string) => {
  return await prisma.notification.count({
    where: { receiverId: userId, isRead: false },
  });
};

export const markAsRead = async (id: string, userId: string) => {
  return await prisma.notification.updateMany({
    where: { id, receiverId: userId },
    data: { isRead: true, readAt: new Date() }
  });
};

export const markAllAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { receiverId: userId, isRead: false },
    data: { isRead: true, readAt: new Date() }
  });
};

export const deleteNotification = async (id: string, userId: string) => {
  return await prisma.notification.deleteMany({
    where: { id, receiverId: userId },
  });
};
