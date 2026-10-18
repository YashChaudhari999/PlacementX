import crypto from 'crypto';

const prismaMock: any = {
  user: { findUnique: jest.fn(), update: jest.fn() },
  passwordResetChallenge: {
    findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(),
  },
};
prismaMock.$transaction = jest.fn(async (value: any) => typeof value === 'function' ? value(prismaMock) : Promise.all(value));

const sendOtp = jest.fn();
const getUser = jest.fn();
const getUserByEmail = jest.fn();
const updateUser = jest.fn();
const revokeRefreshTokens = jest.fn();

jest.mock('../src/utils/prisma', () => ({ __esModule: true, default: prismaMock }));
jest.mock('../src/services/email/email.service', () => ({ emailService: { sendPasswordResetOtp: sendOtp } }));
jest.mock('../src/config/firebase-admin', () => ({
  firebaseAdmin: { auth: () => ({ getUser, getUserByEmail, updateUser, revokeRefreshTokens }) },
}));

import { passwordResetService, PasswordResetError } from '../src/services/passwordReset.service';

const hmac = (purpose: string, value: string) =>
  crypto.createHmac('sha256', process.env.PASSWORD_RESET_SECRET!).update(`${purpose}:${value}`).digest('hex');

describe('password reset security state machine', () => {
  beforeAll(() => { process.env.PASSWORD_RESET_SECRET = 'a-secure-password-reset-secret-used-only-in-tests'; });
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.passwordResetChallenge.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.passwordResetChallenge.update.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});
  });

  it('does not create or email a challenge for an unknown account', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(passwordResetService.request('UNKNOWN@EXAMPLE.COM')).resolves.toBe(false);
    expect(prismaMock.passwordResetChallenge.create).not.toHaveBeenCalled();
    expect(sendOtp).not.toHaveBeenCalled();
  });

  it('stores an OTP HMAC instead of the plaintext code', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'user@example.com' });
    prismaMock.passwordResetChallenge.findFirst.mockResolvedValue(null);
    prismaMock.passwordResetChallenge.create.mockImplementation(async ({ data }: any) => ({ id: 'c1', ...data }));
    sendOtp.mockResolvedValue(true);
    await expect(passwordResetService.request('User@Example.com')).resolves.toBe(true);
    const otp = sendOtp.mock.calls[0][0].otp;
    const stored = prismaMock.passwordResetChallenge.create.mock.calls[0][0].data;
    expect(otp).toMatch(/^\d{6}$/);
    expect(stored.otpHash).toBe(hmac('otp', otp));
    expect(stored.otpHash).not.toContain(otp);
    expect(stored.email).toBe('user@example.com');
  });

  it('does not report success when OTP delivery fails', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'user@example.com' });
    prismaMock.passwordResetChallenge.findFirst.mockResolvedValue(null);
    prismaMock.passwordResetChallenge.create.mockResolvedValue({ id: 'c1' });
    sendOtp.mockResolvedValue(false);
    await expect(passwordResetService.request('user@example.com')).rejects.toMatchObject({
      code: 'EMAIL_DELIVERY_FAILED',
    });
  });

  it('rejects expired OTPs and marks the challenge expired', async () => {
    prismaMock.passwordResetChallenge.findFirst.mockResolvedValue({ id: 'c1', status: 'ACTIVE', otpExpiresAt: new Date(Date.now() - 1), failedAttempts: 0 });
    await expect(passwordResetService.verify('user@example.com', '123456')).rejects.toMatchObject({ code: 'EXPIRED_CODE' });
    expect(prismaMock.passwordResetChallenge.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'EXPIRED' } }));
  });

  it('locks a challenge after the fifth incorrect OTP', async () => {
    prismaMock.passwordResetChallenge.findFirst.mockResolvedValue({ id: 'c1', status: 'ACTIVE', otpHash: hmac('otp', '123456'), otpExpiresAt: new Date(Date.now() + 60_000), failedAttempts: 4 });
    await expect(passwordResetService.verify('user@example.com', '654321')).rejects.toMatchObject({ code: 'ATTEMPTS_EXHAUSTED' });
    expect(prismaMock.passwordResetChallenge.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { failedAttempts: 5, status: 'LOCKED' } }));
  });

  it('issues a hashed grant only for the correct OTP', async () => {
    prismaMock.passwordResetChallenge.findFirst.mockResolvedValue({ id: 'c1', status: 'ACTIVE', otpHash: hmac('otp', '123456'), otpExpiresAt: new Date(Date.now() + 60_000), failedAttempts: 0 });
    const grant = await passwordResetService.verify('user@example.com', '123456');
    expect(grant).toHaveLength(43);
    const update = prismaMock.passwordResetChallenge.updateMany.mock.calls[0][0].data;
    expect(update.status).toBe('VERIFIED');
    expect(update.resetGrantHash).toBe(hmac('grant', grant));
    expect(update.resetGrantHash).not.toBe(grant);
  });

  it('prevents concurrent or replayed grant consumption', async () => {
    const grant = 'g'.repeat(43);
    prismaMock.passwordResetChallenge.findUnique.mockResolvedValue({
      id: 'c1', userId: 'u1', status: 'VERIFIED', resetGrantExpiresAt: new Date(Date.now() + 60_000),
      user: { id: 'u1', email: 'user@example.com', firebaseUid: 'firebase-1' },
    });
    prismaMock.passwordResetChallenge.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(passwordResetService.confirm(grant, 'a sufficiently long password')).rejects.toBeInstanceOf(PasswordResetError);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('updates Firebase and revokes refresh tokens after reserving a grant', async () => {
    const grant = 'g'.repeat(43);
    prismaMock.passwordResetChallenge.findUnique.mockResolvedValue({
      id: 'c1', userId: 'u1', status: 'VERIFIED', resetGrantExpiresAt: new Date(Date.now() + 60_000),
      user: { id: 'u1', email: 'user@example.com', firebaseUid: 'firebase-1' },
    });
    getUser.mockResolvedValue({ uid: 'firebase-1' });
    updateUser.mockResolvedValue({});
    revokeRefreshTokens.mockResolvedValue(undefined);
    await passwordResetService.confirm(grant, 'a sufficiently long password');
    expect(updateUser).toHaveBeenCalledWith('firebase-1', { password: 'a sufficiently long password' });
    expect(revokeRefreshTokens).toHaveBeenCalledWith('firebase-1');
  });
});
