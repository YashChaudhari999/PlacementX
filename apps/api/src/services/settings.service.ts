import prisma from '../utils/prisma';
import { getRedisClient, isRedisConnected } from '../config/redis';

// Default configuration fallback
const DEFAULT_SETTINGS: Record<string, any> = {
  // General
  institutionName: 'NMIMS Placement Cell',
  supportEmail: 'placements@nmims.edu',
  academicYear: '2025-2026',
  
  // Placement Rules
  maxApplicationsPerStudent: 4,
  allowMultipleOffers: false,
  
  // Student Rules
  requireProfileVerification: true,
  minimumCGPA: 6.0,
  maxBacklogsAllowed: 0,
  
  // Notifications
  emailNotificationsEnabled: true,
  pushNotificationsEnabled: true,
  
  // System
  maintenanceMode: false,
};

export const getSettings = async () => {
  try {
    const redisClient = getRedisClient();
    const cachedSettings = (redisClient && isRedisConnected()) ? await redisClient.get('system_settings') : null;
    if (cachedSettings) {
      return JSON.parse(cachedSettings);
    }

    const settings = await prisma.systemSetting.findMany();
    
    const settingsMap: Record<string, any> = {};
    settings.forEach((setting: any) => {
      settingsMap[setting.key] = setting.value;
    });

    // Merge with defaults for missing keys
    const finalSettings = { ...DEFAULT_SETTINGS, ...settingsMap };

    if (redisClient && isRedisConnected()) {
      await redisClient.set('system_settings', JSON.stringify(finalSettings), 'EX', 3600); // Cache for 1 hour
    }

    return finalSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const getSetting = async (key: string) => {
  const settings = await getSettings();
  return settings[key] !== undefined ? settings[key] : DEFAULT_SETTINGS[key];
};

export const updateSettings = async (updates: Record<string, any>, userId: string) => {
  const currentSettings = await getSettings();
  
  for (const [key, value] of Object.entries(updates)) {
    const oldValue = currentSettings[key];
    
    // Determine category based on prefix/grouping or just default to GENERAL
    let category = 'GENERAL';
    if (key.includes('maxApplications') || key.includes('Offers')) category = 'PLACEMENT';
    if (key.includes('Notification')) category = 'COMMUNICATION';
    if (key.includes('CGPA') || key.includes('Backlog') || key.includes('Verification')) category = 'STUDENT';
    if (key.includes('maintenance')) category = 'SYSTEM';

    await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        updatedBy: userId,
      },
      create: {
        key,
        value,
        category,
        updatedBy: userId,
      }
    });

    // Create Audit Log
    if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
      await prisma.settingAuditLog.create({
        data: {
          settingKey: key,
          oldValue: oldValue ? oldValue : null,
          newValue: value,
          changedBy: userId,
        }
      });
    }
  }

  // Invalidate cache
  const redisClient = getRedisClient();
  if (redisClient && isRedisConnected()) {
    await redisClient.del('system_settings');
  }

  return await getSettings();
};

export const getAuditLogs = async (limit: number = 50) => {
  return prisma.settingAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      setting: {
        select: { category: true }
      }
    }
  });
};
