import express from 'express';
import request from 'supertest';

const requestReset = jest.fn();
const verifyReset = jest.fn();
const confirmReset = jest.fn();

jest.mock('../src/services/passwordReset.service', () => {
  class PasswordResetError extends Error {
    constructor(public code: string, message: string, public status = 400) { super(message); }
  }
  return {
    PasswordResetError,
    passwordResetService: { request: requestReset, verify: verifyReset, confirm: confirmReset },
  };
});

import { PasswordResetError } from '../src/services/passwordReset.service';
import { confirmPasswordReset, requestPasswordReset, verifyPasswordReset } from '../src/controllers/passwordReset.controller';

const app = express();
app.use(express.json());
app.post('/request', requestPasswordReset);
app.post('/verify', verifyPasswordReset);
app.post('/confirm', confirmPasswordReset);

describe('password reset public contract', () => {
  beforeEach(() => jest.clearAllMocks());

  it('continues only for an account registered in the application database', async () => {
    requestReset.mockResolvedValueOnce(true);
    const existing = await request(app).post('/request').send({ email: 'known@example.com' });
    requestReset.mockResolvedValueOnce(false);
    const unknown = await request(app).post('/request').send({ email: 'unknown@example.com' });
    expect(existing.status).toBe(200);
    expect(unknown.status).toBe(404);
    expect(unknown.body.error).toEqual({
      code: 'ACCOUNT_NOT_FOUND',
      message: 'No registered account found for this email.',
    });
  });

  it('rejects malformed OTPs before service verification', async () => {
    const response = await request(app).post('/verify').send({ email: 'user@example.com', otp: '12ab' });
    expect(response.status).toBe(400);
    expect(verifyReset).not.toHaveBeenCalled();
  });

  it.each([
    ['INVALID_CODE', 400],
    ['EXPIRED_CODE', 400],
    ['ATTEMPTS_EXHAUSTED', 429],
  ])('returns safe %s verification errors', async (code, status) => {
    verifyReset.mockRejectedValueOnce(new PasswordResetError(code, 'Safe public message', status));
    const response = await request(app).post('/verify').send({ email: 'user@example.com', otp: '123456' });
    expect(response.status).toBe(status);
    expect(response.body.error).toEqual({ code, message: 'Safe public message' });
  });

  it('returns a reset grant only after backend verification', async () => {
    verifyReset.mockResolvedValueOnce('single-use-grant');
    const response = await request(app).post('/verify').send({ email: 'user@example.com', otp: '123456' });
    expect(response.status).toBe(200);
    expect(response.body.resetGrant).toBe('single-use-grant');
  });

  it('enforces the 12-character password policy at the API boundary', async () => {
    const response = await request(app).post('/confirm').send({ resetGrant: 'x'.repeat(32), newPassword: 'short-pass' });
    expect(response.status).toBe(400);
    expect(confirmReset).not.toHaveBeenCalled();
  });
});
