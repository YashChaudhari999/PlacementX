// ─── Notification Controller (Production) ───────────────
// Handles all notification REST API endpoints with proper
// validation, error handling, and response formatting.

import { Request, Response } from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  createBulkNotifications,
  createNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  registerDeviceToken,
  removeDeviceToken,
  scheduleNotification,
} from '../services/notification.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── GET /notifications ─────────────────────────────────
// Paginated, filterable, searchable notification list.

export const getMyNotifications = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { limit, cursor, offset, category, type, isRead, search, startDate, endDate } = req.query;

    const result = await getUserNotifications(
      userId,
      {
        category: category as string,
        type: type as string,
        isRead: isRead !== undefined ? isRead === 'true' : undefined,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
      },
      {
        limit: limit ? parseInt(limit as string) : 20,
        cursor: cursor as string,
        offset: offset ? parseInt(offset as string) : undefined,
      },
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// ─── GET /notifications/unread-count ────────────────────

export const getMyUnreadCount = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);
    return res.status(200).json({ count });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
};

// ─── PATCH /notifications/:id/read ──────────────────────

export const markNotificationRead = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    await markAsRead(id, userId);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error marking as read', error: error.message });
  }
};

// ─── PATCH /notifications/read-all ──────────────────────

export const markAllNotificationsRead = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    await markAllAsRead(userId);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error marking all as read', error: error.message });
  }
};

// ─── PATCH /notifications/:id/archive ───────────────────

export const archiveMyNotification = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    await archiveNotification(id, userId);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error archiving notification', error: error.message });
  }
};

// ─── DELETE /notifications/:id ──────────────────────────

export const deleteMyNotification = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    await deleteNotification(id, userId);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

// ─── GET /notifications/preferences ─────────────────────

export const getPreferences = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const prefs = await getNotificationPreferences(userId);
    return res.status(200).json(prefs);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching preferences', error: error.message });
  }
};

// ─── PUT /notifications/preferences ─────────────────────

export const updatePreferences = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { placement, interviews, meetings, messages, assignments, marketing, promotions, system, pushEnabled, emailEnabled } = req.body;

    const updated = await updateNotificationPreferences(userId, {
      placement,
      interviews,
      meetings,
      messages,
      assignments,
      marketing,
      promotions,
      system,
      pushEnabled,
      emailEnabled,
    });

    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
};

// ─── POST /notifications/register-device ────────────────

export const registerDevice = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { token, platform, deviceName } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Device token is required' });
    }

    const device = await registerDeviceToken(userId, token, platform || 'android', deviceName);
    return res.status(201).json({ success: true, device });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error registering device', error: error.message });
  }
};

// ─── DELETE /notifications/remove-device ────────────────

export const removeDevice = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Device token is required' });
    }

    await removeDeviceToken(token, userId);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error removing device', error: error.message });
  }
};

// ─── POST /notifications (Admin: Create/Broadcast) ──────

export const broadcastNotification = async (req: any, res: any) => {
  try {
    const {
      title,
      message,
      link,
      type = 'system',
      category = 'system',
      priority = 'MEDIUM',
      targetAudience = 'ALL',
      targetId,
      image,
      deepLinkRoute,
      deepLinkParams,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    let receiverIds: string[] = [];

    if (targetAudience === 'ALL') {
      const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } });
      receiverIds = students.map(s => s.id);
    } else if (targetAudience === 'DEPARTMENT' && targetId) {
      const students = await prisma.studentProfile.findMany({
        where: { branch: targetId },
        select: { userId: true },
      });
      receiverIds = students.map(s => s.userId);
    } else if (targetAudience === 'STUDENT' && targetId) {
      receiverIds = [targetId];
    } else if (targetAudience === 'MENTOR') {
      const mentors = await prisma.user.findMany({ where: { role: 'PLACEMENT_COORDINATOR' }, select: { id: true } });
      receiverIds = mentors.map(m => m.id);
    } else if (targetAudience === 'ADMIN') {
      const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' }, select: { id: true } });
      receiverIds = admins.map(a => a.id);
    }

    if (receiverIds.length === 0) {
      return res.status(404).json({ message: 'No users found for target audience.' });
    }

    // For single user, use createNotification for richer processing
    if (receiverIds.length === 1) {
      const notification = await createNotification({
        title,
        message,
        type,
        category,
        priority,
        image,
        actionUrl: link,
        deepLinkRoute,
        deepLinkParams,
        receiverId: receiverIds[0],
        senderId: req.user.id,
        senderRole: req.user.role,
      });
      return res.status(201).json({ message: 'Notification sent', notification });
    }

    // For multiple users, use bulk
    const result = await createBulkNotifications({
      title,
      message,
      type,
      category,
      priority,
      image,
      actionUrl: link,
      deepLinkRoute,
      deepLinkParams,
      receiverIds,
      senderId: req.user.id,
      senderRole: req.user.role,
    });

    return res.status(201).json({ message: `Broadcasted to ${result.count} users` });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error broadcasting notification', error: error.message });
  }
};

// ─── POST /notifications/schedule (Admin) ───────────────

export const scheduleNotificationController = async (req: any, res: any) => {
  try {
    const { title, message, type, category, priority, receiverId, scheduledAt, deepLinkRoute, deepLinkParams, image } = req.body;

    if (!title || !message || !receiverId || !scheduledAt) {
      return res.status(400).json({ message: 'title, message, receiverId, and scheduledAt are required' });
    }

    const result = await scheduleNotification(
      {
        title,
        message,
        type,
        category,
        priority,
        receiverId,
        deepLinkRoute,
        deepLinkParams,
        image,
        senderId: req.user.id,
        senderRole: req.user.role,
      },
      new Date(scheduledAt),
    );

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error scheduling notification', error: error.message });
  }
};
