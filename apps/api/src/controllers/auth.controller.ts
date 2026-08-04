import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { z } from 'zod';
import { firebaseAdmin } from '../config/firebaseAdmin';

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

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    // Create appropriate profile based on role
    if (role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: { userId: user.id, firstName, lastName },
      });
    } else if (role === 'COORDINATOR') {
      await prisma.coordinatorProfile.create({
        data: { userId: user.id, firstName, lastName },
      });
    } else if (role === 'SUPER_ADMIN') {
      await prisma.adminProfile.create({
        data: { userId: user.id, firstName, lastName },
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, email: user.email, role: user.role, firstName, lastName },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password, role } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        coordinatorProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      console.log('Login failed: user not found', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role !== role) {
      console.log('Login failed: wrong role', role, 'expected', user.role);
      return res.status(403).json({ error: `Not authorized as ${role}` });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Login failed: invalid password for user', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('Login successful for user:', email);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    let profile = null;
    if (role === 'STUDENT') profile = user.studentProfile;
    if (role === 'COORDINATOR') profile = user.coordinatorProfile;
    if (role === 'SUPER_ADMIN') profile = user.adminProfile;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const firebaseLoginSchema = z.object({
  idToken: z.string(),
  role: z.enum(['STUDENT', 'COORDINATOR', 'SUPER_ADMIN']),
});

export const firebaseLogin = async (req: Request, res: Response) => {
  try {
    const { idToken, role } = firebaseLoginSchema.parse(req.body);

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      return res.status(401).json({ error: 'Invalid Firebase token: no email found' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        coordinatorProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      console.log('Firebase login failed: user not found', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.role !== role) {
      console.log('Firebase login failed: wrong role', role, 'expected', user.role);
      return res.status(403).json({ error: `Not authorized as ${role}` });
    }

    console.log('Firebase login successful for user:', email);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    let profile = null;
    if (role === 'STUDENT') profile = user.studentProfile;
    if (role === 'COORDINATOR') profile = user.coordinatorProfile;
    if (role === 'SUPER_ADMIN') profile = user.adminProfile;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Firebase login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const changePassword = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    const { currentPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate current password (simple string comparison since we don't have bcrypt setup in this demo yet)
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword }
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        coordinatorProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profile = null;
    if (user.role === 'STUDENT') profile = user.studentProfile;
    if (user.role === 'COORDINATOR') profile = user.coordinatorProfile;
    if (user.role === 'SUPER_ADMIN') profile = user.adminProfile;

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        isProfileComplete: user.role === 'STUDENT' ? user.studentProfile?.isProfileComplete : true,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
