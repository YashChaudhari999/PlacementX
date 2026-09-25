import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import multer from 'multer';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Request failed', {
    method: req.method,
    path: req.originalUrl,
    name: err?.name,
    code: err?.code,
    ...(process.env.NODE_ENV !== 'production' && { message: err?.message, stack: err?.stack }),
  });

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

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File size exceeds the 15MB limit'
      : err.message;
    error = new AppError(message, 400);
  }

  const statusCode = error.statusCode || 500;
  const success = false;
  const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (error.message || 'Server Error');

  return res.status(statusCode).json({
    success,
    error: {
      code: statusCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
