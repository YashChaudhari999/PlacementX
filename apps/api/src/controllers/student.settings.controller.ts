import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  updatePreferencesSchema, 
  updatePrivacySchema, 
  updateCalendarSchema, 
  updateRegionalSchema, 
  updateNotificationSchema, 
  helpSupportSchema 
} from '../validators/settings.validator';

const prisma = new PrismaClient();

// Ensure student preference row exists
const ensurePreferencesExist = async (studentId: string) => {
  let prefs = await prisma.studentPreference.findUnique({
    where: { studentId }
  });
  if (!prefs) {
    prefs = await prisma.studentPreference.create({
      data: { studentId }
    });
  }
  return prefs;
};

// GET all settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Fetch user and profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationPreferences: true,
        studentProfile: {
          include: {
            preferences: true
          }
        }
      }
    });

    if (!user || !user.studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const studentId = user.studentProfile.id;
    const preferences = await ensurePreferencesExist(studentId);

    res.json({
      account: {
        email: user.email,
        mustChangePassword: user.mustChangePassword
      },
      profile: {
        id: studentId,
        firstName: user.studentProfile.firstName,
        lastName: user.studentProfile.lastName,
        branch: user.studentProfile.branch,
        profileStatus: user.studentProfile.profileStatus,
        isProfileComplete: user.studentProfile.isProfileComplete,
      },
      preferences: preferences,
      notifications: user.notificationPreferences
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Server error fetching settings' });
  }
};

// PUT update profile preferences
export const updateProfilePreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const validatedData = updatePreferencesSchema.parse(req.body);

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const prefs = await prisma.studentPreference.upsert({
      where: { studentId: profile.id },
      update: validatedData,
      create: {
        studentId: profile.id,
        ...validatedData
      }
    });

    res.json(prefs);
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    res.status(400).json({ error: error.message || 'Validation error' });
  }
};

// PUT update privacy
export const updatePrivacy = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const validatedData = updatePrivacySchema.parse(req.body);

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const prefs = await prisma.studentPreference.upsert({
      where: { studentId: profile.id },
      update: validatedData,
      create: {
        studentId: profile.id,
        ...validatedData
      }
    });

    res.json(prefs);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Validation error' });
  }
};

// PUT update calendar
export const updateCalendar = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const validatedData = updateCalendarSchema.parse(req.body);

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const prefs = await prisma.studentPreference.upsert({
      where: { studentId: profile.id },
      update: validatedData,
      create: {
        studentId: profile.id,
        ...validatedData
      }
    });

    res.json(prefs);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Validation error' });
  }
};

// PUT update regional
export const updateRegional = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const validatedData = updateRegionalSchema.parse(req.body);

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const prefs = await prisma.studentPreference.upsert({
      where: { studentId: profile.id },
      update: validatedData,
      create: {
        studentId: profile.id,
        ...validatedData
      }
    });

    res.json(prefs);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Validation error' });
  }
};

// PUT update notifications
export const updateNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const validatedData = updateNotificationSchema.parse(req.body);

    const notifs = await prisma.notificationPreference.upsert({
      where: { userId },
      update: validatedData,
      create: {
        userId,
        ...validatedData
      }
    });

    res.json(notifs);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Validation error' });
  }
};

// POST support request
export const submitSupportRequest = async (req: Request, res: Response) => {
  try {
    const validatedData = helpSupportSchema.parse(req.body);
    
    // In a real app, this might create a support ticket in a Ticket model
    // or send an email to the admin. For now, we simulate a successful creation.
    const ticketId = 'PX-' + Math.floor(10000 + Math.random() * 90000);
    
    // Simulating delay for creating ticket
    await new Promise(resolve => setTimeout(resolve, 800));

    res.status(201).json({ 
      message: `Support Request ${ticketId} created successfully.`,
      ticketId 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Validation error' });
  }
};

// POST deactivation request
export const requestDeactivation = async (req: Request, res: Response) => {
  try {
    // Similarly, simulate the deactivation workflow
    const ticketId = 'DEACT-' + Math.floor(1000 + Math.random() * 9000);
    
    res.status(201).json({
      message: `Deactivation request ${ticketId} submitted. Admin review pending.`,
      ticketId
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET devices
export const getDevices = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const devices = await prisma.deviceToken.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching devices' });
  }
};

// DELETE device
export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const device = await prisma.deviceToken.findUnique({ where: { id } });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    if (device.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.deviceToken.delete({ where: { id } });
    res.json({ message: 'Device removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error removing device' });
  }
};

// POST data export
export const exportData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Fetch user data securely (omitting passwords, etc)
    const data = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        role: true,
        createdAt: true,
        studentProfile: {
          include: {
            preferences: true,
            documents: true,
            applications: true
          }
        },
        notificationPreferences: true,
        deviceTokens: true
      }
    });

    res.json({
      message: 'Data export generated successfully',
      data
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error generating data export' });
  }
};
