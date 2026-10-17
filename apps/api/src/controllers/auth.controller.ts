import prisma from '../utils/prisma';
import { Request, Response } from 'express';
// Trigger restart to load new .env variables (with correct rtdb url)
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { firebaseAdmin } from '../config/firebase-admin';
import crypto from 'crypto';
import { jwtConfig } from '../config/environment';
import { passwordResetService, PasswordResetError } from '../services/passwordReset.service';

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
  idToken: z.string().min(100).max(10_000),
  role: z.enum(['STUDENT', 'COORDINATOR', 'SUPER_ADMIN']).optional(),
}).strict();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(12).max(128),
}).strict();

export const register = async (req: Request, res: Response) => {
  return res.status(400).json({ error: 'Legacy register endpoint is deprecated. Please use Firebase Authentication.' });
};

export const login = async (req: Request, res: Response) => {
  return res.status(400).json({ error: 'Legacy login endpoint is deprecated. Please use Firebase Authentication.' });
};

export const changePassword = async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    passwordResetService.validatePassword(newPassword);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });

    const apiKey = process.env.FIREBASE_WEB_API_KEY?.trim() || process.env.FIREBASE_API_KEY?.trim();
    if (!apiKey) throw new Error('FIREBASE_WEB_API_KEY is required for current-password verification');
    const verification = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: currentPassword, returnSecureToken: false }),
    });
    if (!verification.ok) {
      return res.status(400).json({ error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect' } });
    }

    const firebaseUser = user.firebaseUid
      ? await firebaseAdmin.auth().getUser(user.firebaseUid)
      : await firebaseAdmin.auth().getUserByEmail(user.email);
    await firebaseAdmin.auth().updateUser(firebaseUser.uid, { password: newPassword });
    await firebaseAdmin.auth().revokeRefreshTokens(firebaseUser.uid);
    await prisma.user.update({ where: { id: user.id }, data: { mustChangePassword: false } });
    return res.status(200).json({ success: true, message: 'Password updated. Sign in again with your new password.' });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof PasswordResetError) {
      return res.status(400).json({ error: { code: 'INVALID_PASSWORD', message: 'Password must be between 12 and 128 characters' } });
    }
    console.error('[ChangePassword] Password update failed');
    return res.status(500).json({ error: { code: 'PASSWORD_CHANGE_FAILED', message: 'Unable to update password' } });
  }
};

export const firebaseLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = firebaseLoginSchema.parse(req.body);

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const email = decodedToken.email?.trim().toLowerCase();

    if (!email) {
      return res.status(401).json({ error: 'A valid email address is required' });
    }

    let userRecord = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        studentProfile: true,
        adminProfile: true,
        coordinatorProfile: true,
      }
    });

    if (!userRecord) {
      const emailAccount = await prisma.user.findUnique({ where: { email } });
      if (!emailAccount || (emailAccount.firebaseUid && emailAccount.firebaseUid !== decodedToken.uid)) {
        return res.status(401).json({ error: 'User not registered in the system' });
      }
      userRecord = await prisma.user.update({
        where: { id: emailAccount.id },
        data: { firebaseUid: decodedToken.uid },
        include: { studentProfile: true, adminProfile: true, coordinatorProfile: true },
      });
    }

    if (!userRecord) {
      console.log(`Firebase login failed: user not found in Prisma DB for email ${email}`);
      return res.status(401).json({ error: 'User not registered in the system' });
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

    const accessTokenTtl = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'];
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: accessTokenTtl,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        jwtid: crypto.randomUUID(),
      }
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
    return res.status(500).json({ message: 'Internal server error' });
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
