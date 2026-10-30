import type { NextFunction, Request, Response } from 'express';
import { emitDataChanged } from '../socket';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Emits one cache-sync signal after a successful API mutation. Register this
 * before the routes so all current and future write endpoints participate in
 * realtime synchronisation automatically.
 */
export const emitRealtimeChanges = (req: Request, res: Response, next: NextFunction): void => {
  if (!MUTATING_METHODS.has(req.method)) {
    next();
    return;
  }

  res.once('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 400) return;

    const path = req.originalUrl.split('?')[0];
    const resource = path.split('/').filter(Boolean)[1] || 'unknown';
    emitDataChanged({ method: req.method, resource, path });
  });

  next();
};
