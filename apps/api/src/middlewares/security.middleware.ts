import { NextFunction, Request, Response } from 'express';

export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  next();
};

type RateLimitOptions = {
  windowMs: number;
  max: number;
  message: string;
};

type Bucket = { count: number; resetAt: number };

export const createRateLimit = ({ windowMs, max, message }: RateLimitOptions) => {
  const buckets = new Map<string, Bucket>();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, windowMs);
  cleanup.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    bucket.count += 1;
    buckets.set(key, bucket);

    res.setHeader('RateLimit-Limit', max.toString());
    res.setHeader('RateLimit-Remaining', Math.max(0, max - bucket.count).toString());
    res.setHeader('RateLimit-Reset', Math.ceil(bucket.resetAt / 1000).toString());

    if (bucket.count > max) {
      res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000).toString());
      return res.status(429).json({ message });
    }

    next();
  };
};

export const apiRateLimit = createRateLimit({
  windowMs: 60_000,
  max: 300,
  message: 'Too many requests. Please try again shortly.',
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  message: 'Too many authentication attempts. Please try again later.',
});
