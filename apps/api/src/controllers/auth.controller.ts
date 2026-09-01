import prisma from '../utils/prisma';
import { Request, Response } from 'express';
// Trigger restart to load new .env variables (with correct rtdb url)
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { firebaseAdmin } from '../config/firebase-admin';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'COORDINATOR', 'SUPER_ADMIN']),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'COORDINATOR', 'SUPER_ADMIN']),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

const firebaseLoginSchema = z.object({
  idToken: z.string(),
  role: z.enum(['STUDENT', 'COORDINATOR', 'SUPER_ADMIN']),
});

export const register = async (req: Request, res: Response) => {
  return res.status(400).json({ error: 'Legacy register endpoint is deprecated. Please use Firebase Authentication.' });
};

export const login = async (req: Request, res: Response) => {
  return res.status(400).json({ error: 'Legacy login endpoint is deprecated. Please use Firebase Authentication.' });
};

export const changePassword = async (req: any, res: any) => {
  return res.status(400).json({ message: 'Legacy change password endpoint is deprecated. Please use Firebase Authentication.' });
};

export const firebaseLogin = async (req: Request, res: Response) => {
  try {
    const { idToken, role } = firebaseLoginSchema.parse(req.body);

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      return res.status(401).json({ error: 'Invalid Firebase token: no email found' });
    }

    const userRecord = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        adminProfile: true,
        coordinatorProfile: true,
      }
    });

    if (!userRecord) {
      console.log(`Firebase login failed: user not found in Prisma DB for email ${email}`);
      return res.status(401).json({ error: 'User not registered in the system' });
    }

    // Check if the requested role matches the database role
    // For admins, allow them to login as SUPER_ADMIN or COORDINATOR if they have that role
    if (role === 'STUDENT' && userRecord.role !== 'STUDENT') {
       return res.status(401).json({ error: 'Role mismatch: user is not a student' });
    }
    
    let user: any = {
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      firstName: 'Admin',
      lastName: '',
    };

    if (userRecord.role === 'STUDENT' && userRecord.studentProfile) {
      user.firstName = userRecord.studentProfile.firstName || '';
      user.lastName = userRecord.studentProfile.lastName || '';
      user.isProfileComplete = userRecord.studentProfile.isProfileComplete;
      user.profileStatus = userRecord.studentProfile.profileStatus;
    } else if (userRecord.role === 'SUPER_ADMIN' && userRecord.adminProfile) {
      user.firstName = userRecord.adminProfile.firstName || 'Admin';
      user.lastName = userRecord.adminProfile.lastName || '';
    } else if (userRecord.role === 'COORDINATOR' && userRecord.coordinatorProfile) {
      user.firstName = userRecord.coordinatorProfile.firstName || 'Admin';
      user.lastName = userRecord.coordinatorProfile.lastName || '';
    }

    console.log('Firebase login successful for user:', email);

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Firebase login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    // @ts-ignore
    const role = req.user.role;
    
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        adminProfile: true,
        coordinatorProfile: true,
      }
    });

    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    let isProfileComplete = true;
    let firstName = 'Admin';
    let lastName = '';

    if (role === 'STUDENT' && userRecord.studentProfile) {
       isProfileComplete = userRecord.studentProfile.isProfileComplete;
       firstName = userRecord.studentProfile.firstName || '';
       lastName = userRecord.studentProfile.lastName || '';
    } else if (role === 'SUPER_ADMIN' && userRecord.adminProfile) {
       firstName = userRecord.adminProfile.firstName || 'Admin';
       lastName = userRecord.adminProfile.lastName || '';
    } else if (role === 'COORDINATOR' && userRecord.coordinatorProfile) {
       firstName = userRecord.coordinatorProfile.firstName || 'Admin';
       lastName = userRecord.coordinatorProfile.lastName || '';
    }

    const userResponse = {
       id: userId,
       email: userRecord.email,
       role: role,
       firstName,
       lastName,
       isProfileComplete,
    };

    res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
