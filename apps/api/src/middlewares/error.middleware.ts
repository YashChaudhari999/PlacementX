import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Mongoose/Prisma duplicate key error
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new AppError(message, 401);
  }

  const statusCode = error.statusCode || 500;
  const success = false;
  const message = error.message || 'Server Error';

  return res.status(statusCode).json({
    success,
    error: {
      code: statusCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
