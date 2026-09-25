import express from 'express';
import request from 'supertest';
import { authorize } from '../src/middlewares/auth.middleware';
import { hideDetailedErrors, securityHeaders, validateUntrustedInput } from '../src/middlewares/security.middleware';

describe('untrusted user security boundary', () => {
  const app = express();
  app.use(express.json());
  app.use(securityHeaders);
  app.use(validateUntrustedInput);
  app.post('/admin', authorize('SUPER_ADMIN'), (_req, res) => res.json({ ok: true }));
  app.post('/echo', (req, res) => res.json(req.body));

  it('denies an unauthenticated caller from an admin endpoint', async () => {
    const response = await request(app).post('/admin').send({});
    expect(response.status).toBe(403);
  });

  it('rejects NoSQL operator keys from untrusted JSON', async () => {
    const response = await request(app).post('/echo').send({ filter: { $ne: null } });
    expect(response.status).toBe(400);
  });

  it('sets API hardening headers', async () => {
    const response = await request(app).post('/echo').send({ safe: true });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['content-security-policy']).toContain("default-src 'none'");
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('removes invisible direction-control characters from stored content', async () => {
    const response = await request(app).post('/echo').send({ note: 'safe\u202Etxt' });
    expect(response.status).toBe(200);
    expect(response.body.note).toBe('safetxt');
  });

  it('hides internal error details in production responses', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const productionApp = express();
    productionApp.use(hideDetailedErrors);
    productionApp.get('/failure', (_req, res) => {
      res.status(500).json({ message: 'Database failed', error: 'password=should-not-leak' });
    });

    const response = await request(productionApp).get('/failure');
    process.env.NODE_ENV = previousNodeEnv;

    expect(response.status).toBe(500);
    expect(response.text).not.toContain('Database failed');
    expect(response.text).not.toContain('should-not-leak');
    expect(response.body.error.message).toBe('Internal server error');
  });
});
