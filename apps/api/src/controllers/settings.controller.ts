import { Request, Response } from 'express';
import * as settingsService from '../services/settings.service';
import prisma from '../utils/prisma';
import { getRedisClient, isRedisConnected } from '../config/redis';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getSettings();
    return res.status(200).json(settings);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateSettings = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedSettings = await settingsService.updateSettings(updates, userId);
    return res.status(200).json({ message: 'Settings updated successfully', settings: updatedSettings });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await settingsService.getAuditLogs(limit);
    return res.status(200).json(logs);
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    const health = {
      database: 'down',
      redis: 'down',
      timestamp: new Date().toISOString()
    };

    // Check DB
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.database = 'up';
    } catch (e) {}

    const client = getRedisClient();
    if (client && isRedisConnected()) {
      await client.ping();
      health.redis = 'up';
    }

    return res.status(200).json(health);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
