import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

type AccessToken = { id: string; role?: string };

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as AccessToken;
    if (!decoded.id) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    // Never trust a role stored in a long-lived token. Re-read the account so
    // deleted users and permission changes take effect immediately.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        coordinatorProfile: { select: { department: true } },
      },
    });
    if (!user) {
      return res.status(401).json({ error: 'Account is no longer active' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.coordinatorProfile?.department || null,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }
    return next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'You are not authorized to access this route',
      });
    }
    next();
  };
};

export const authenticate = protect;
