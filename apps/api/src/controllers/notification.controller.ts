import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNotifications = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50
    });

    return res.status(200).json(notifications);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const markAsRead = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // If id is 'all', mark all as read
    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
    } else {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const registerDeviceToken = async (req: any, res: any) => {
  try {
    const { token } = req.body;
    const userId = req.user?.id || req.headers['x-user-id'];

    if (!userId || !token) {
      return res.status(400).json({ message: 'User ID and Token are required' });
    }

    // Upsert the token for this user
    await prisma.deviceToken.upsert({
      where: { token },
      update: { userId }, // update if the same token is somehow associated with another user (e.g., shared device)
      create: {
        userId,
        token
      }
    });

    return res.status(200).json({ success: true, message: 'Device token registered successfully' });
  } catch (error: any) {
    console.error('Register device token error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
