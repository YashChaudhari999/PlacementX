import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { isProduction } from '../config/environment';

export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  res.setHeader('Cache-Control', 'no-store');
  if (isProduction()) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
};

const forbiddenKey = (key: string) =>
  key === '__proto__' || key === 'prototype' || key === 'constructor' || key.startsWith('$') || key.includes('.');

const inspectInput = (value: unknown, depth = 0): boolean => {
  if (depth > 12) return false;
  if (Array.isArray(value)) return value.length <= 1000 && value.every((item) => inspectInput(item, depth + 1));
  if (!value || typeof value !== 'object') return true;
  return Object.entries(value as Record<string, unknown>).every(
    ([key, child]) => !forbiddenKey(key) && inspectInput(child, depth + 1),
  );
};

const sanitizeText = (value: unknown, depth = 0): unknown => {
  if (depth > 12) return value;
  if (typeof value === 'string') {
    // Remove invisible characters commonly used for log/content spoofing while
    // preserving ordinary whitespace and Unicode user names.
    return value.replace(/[\u0000\u202A-\u202E\u2066-\u2069]/g, '');
  }
  if (Array.isArray(value)) return value.map((item) => sanitizeText(item, depth + 1));
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      (value as Record<string, unknown>)[key] = sanitizeText(child, depth + 1);
    }
  }
  return value;
};

/** Reject prototype-pollution and operator-injection payloads before controllers see them. */
export const validateUntrustedInput = (req: Request, res: Response, next: NextFunction) => {
  if (!inspectInput(req.body) || !inspectInput(req.query)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }
  req.body = sanitizeText(req.body);
  next();
};

/** Prevent legacy controllers from leaking raw exceptions in production. */
export const hideDetailedErrors = (_req: Request, res: Response, next: NextFunction) => {
  if (!isProduction()) return next();
  const sendJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (res.statusCode >= 500 && body && typeof body === 'object') {
      return sendJson({ success: false, error: { code: res.statusCode, message: 'Internal server error' } });
    }
    if (res.statusCode >= 400 && body && typeof body === 'object') {
      const safeBody = { ...(body as Record<string, unknown>) };
      // Many legacy handlers include a safe message plus a raw exception in
      // `error`. Preserve the public message and drop the internal exception.
      if (typeof safeBody.message === 'string' && safeBody.error !== undefined) delete safeBody.error;
      return sendJson(safeBody);
    }
    return sendJson(body);
  }) as Response['json'];
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
    const account = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const identity = `${req.ip || req.socket.remoteAddress || 'unknown'}:${account}:${req.path}`;
    const key = crypto.createHash('sha256').update(identity).digest('hex');
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
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60_000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: 'Too many authentication attempts. Please try again later.',
});
