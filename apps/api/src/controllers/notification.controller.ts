import { Request, Response } from 'express';
import { 
  getUserNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  createBulkNotifications
} from '../services/notification.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all notifications for the logged-in user
export const getMyNotifications = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const notifications = await getUserNotifications(userId, limit, offset);
    return res.status(200).json(notifications);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

export const getMyUnreadCount = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);
    return res.status(200).json({ count });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
};

export const markNotificationRead = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await markAsRead(id, userId);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error marking as read', error: error.message });
  }
};

export const markAllNotificationsRead = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    await markAllAsRead(userId);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error marking all as read', error: error.message });
  }
};

export const deleteMyNotification = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await deleteNotification(id, userId);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

// Admin endpoint to broadcast notifications
export const broadcastNotification = async (req: any, res: any) => {
  try {
    const { title, message, link, type = 'system', priority = 'NORMAL', targetAudience = 'ALL', targetId } = req.body;
    
    let receiverIds: string[] = [];

    if (targetAudience === 'ALL') {
      const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } });
      receiverIds = students.map(s => s.id);
    } else if (targetAudience === 'DEPARTMENT' && targetId) {
      const students = await prisma.studentProfile.findMany({ 
        where: { branch: targetId },
        select: { userId: true }
      });
      receiverIds = students.map(s => s.userId);
    } else if (targetAudience === 'STUDENT' && targetId) {
      receiverIds = [targetId];
    } else if (targetAudience === 'MENTOR') {
      const mentors = await prisma.user.findMany({ where: { role: 'PLACEMENT_COORDINATOR' }, select: { id: true } });
      receiverIds = mentors.map(m => m.id);
    }

    if (receiverIds.length === 0) {
      return res.status(404).json({ message: 'No users found for target audience.' });
    }

    const result = await createBulkNotifications({
      title,
      message,
      type,
      priority,
      actionUrl: link,
      receiverIds,
      senderId: req.user.id,
      senderRole: req.user.role,
    });

    return res.status(201).json({ message: `Broadcasted to ${result.count} users` });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error broadcasting notification', error: error.message });
  }
};
