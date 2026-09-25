import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const production = process.env.NODE_ENV === 'production';

const requireValue = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const assertSecret = (name: string, minimumLength = 32) => {
  const value = requireValue(name);
  if (value.length < minimumLength || /^(change|replace|example|secret|test)/i.test(value)) {
    throw new Error(`${name} must be a non-placeholder secret of at least ${minimumLength} characters`);
  }
};

export const validateEnvironment = () => {
  if (production) {
    assertSecret('JWT_SECRET');
  } else {
    const currentSecret = process.env.JWT_SECRET?.trim();
    const isUnsafeDevSecret = !currentSecret
      || currentSecret.length < 32
      || /^(change|replace|example|secret|test)/i.test(currentSecret);

    if (isUnsafeDevSecret) {
      // Development still needs signed tokens, but requiring developers to
      // commit or share a secret is unsafe. This value exists only in memory
      // and is regenerated whenever the API restarts.
      process.env.JWT_SECRET = crypto.randomBytes(48).toString('base64url');
      console.warn('Generated an ephemeral JWT_SECRET for development; sessions reset on API restart.');
    }
  }

  const origins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.includes('*')) {
    throw new Error('CORS_ORIGINS must not contain a wildcard');
  }

  if (production) {
    const databaseUrl = requireValue('DATABASE_URL');
    const directUrl = requireValue('DIRECT_URL');
    requireValue('SUPABASE_SERVICE_ROLE_KEY');
    requireValue('SUPABASE_STORAGE_BUCKET');
    requireValue('CORS_ORIGINS');

    if (origins.some((origin) => /localhost|127\.0\.0\.1/i.test(origin))) {
      throw new Error('Production CORS_ORIGINS must not contain localhost');
    }

    if (![databaseUrl, directUrl].every((url) => /[?&]sslmode=require(?:&|$)/i.test(url))) {
      throw new Error('Production PostgreSQL URLs must include sslmode=require');
    }

    if (process.env.VITE_APP_ENV === 'development') {
      throw new Error('VITE_APP_ENV must not enable development mode in production');
    }
  }
};

export const jwtConfig = {
  issuer: process.env.JWT_ISSUER || 'placementx-api',
  audience: process.env.JWT_AUDIENCE || 'placementx-clients',
};

export const isProduction = () => process.env.NODE_ENV === 'production';
