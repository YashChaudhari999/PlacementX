import { Request, Response } from 'express';
// Trigger restart to load new .env variables (with correct rtdb url)
import jwt from 'jsonwebtoken';
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

    const db = firebaseAdmin.database();
    let user: any = null;
    let userId: string = '';

    if (role === 'STUDENT') {
      const snapshot = await db.ref('students').orderByChild('contactDetails/email').equalTo(email).once('value');
      if (snapshot.exists()) {
        const data = snapshot.val();
        userId = Object.keys(data)[0];
        const studentData = data[userId];
        user = {
          id: userId,
          email: studentData.contactDetails?.email,
          role: 'STUDENT',
          firstName: studentData.personalInfo?.firstName,
          lastName: studentData.personalInfo?.lastName,
        };
      }
    } else if (role === 'SUPER_ADMIN' || role === 'COORDINATOR') {
      const snapshot = await db.ref('admins').orderByChild('profile/email').equalTo(email).once('value');
      if (snapshot.exists()) {
         const data = snapshot.val();
         userId = Object.keys(data)[0];
         const adminData = data[userId];
         if (adminData.role === role.toLowerCase() || adminData.role === 'superadmin') {
             user = {
               id: userId,
               email: adminData.profile?.email,
               role: role, 
               firstName: adminData.profile?.name?.split(' ')[0] || 'Admin',
               lastName: adminData.profile?.name?.split(' ').slice(1).join(' ') || '',
             };
         }
      } else if (email === 'admin@nmims.edu') {
         // Auto-provisioning disabled for security. Admin must be provisioned securely.
         console.log('Login rejected: Auto-provisioning admin is disabled.');
         return res.status(403).json({ error: 'Auto-provisioning is disabled. Contact system administrator.' });
      }
    }

    if (!user) {
      console.log(`Firebase login failed: user not found in Realtime DB for role ${role}`, email);
      return res.status(401).json({ error: 'User not registered in the system or role mismatch' });
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
    
    const db = firebaseAdmin.database();
    let userResponse: any = null;

    if (role === 'STUDENT') {
       const snapshot = await db.ref(`students/${userId}`).once('value');
       if (snapshot.exists()) {
           const data = snapshot.val();
           userResponse = {
              id: userId,
              email: data.contactDetails?.email,
              role: 'STUDENT',
              firstName: data.personalInfo?.firstName,
              lastName: data.personalInfo?.lastName,
              isProfileComplete: data.profileCompletion === 100,
           };
       }
    } else {
       const snapshot = await db.ref(`admins/${userId}`).once('value');
       if (snapshot.exists()) {
           const data = snapshot.val();
           userResponse = {
              id: userId,
              email: data.profile?.email,
              role: role,
              firstName: data.profile?.name?.split(' ')[0] || 'Admin',
              lastName: data.profile?.name?.split(' ').slice(1).join(' ') || '',
              isProfileComplete: true,
           };
       }
    }

    if (!userResponse) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
