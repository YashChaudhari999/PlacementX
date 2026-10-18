import crypto from 'crypto';
import prisma from '../utils/prisma';
import { firebaseAdmin } from '../config/firebase-admin';
import { emailService } from './email/email.service';

const OTP_TTL_MS = 5 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const RESET_GRANT_TTL_MS = 10 * 60_000;
const MAX_ATTEMPTS = 5;

export class PasswordResetError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

const secret = () => {
  const value = process.env.PASSWORD_RESET_SECRET?.trim() || process.env.JWT_SECRET?.trim();
  if (!value || value.length < 32) throw new Error('PASSWORD_RESET_SECRET must be configured');
  return value;
};

const digest = (purpose: 'otp' | 'grant', value: string) =>
  crypto.createHmac('sha256', secret()).update(`${purpose}:${value}`).digest('hex');

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const displayNameFor = (user: any) =>
  user.studentProfile?.firstName || user.adminProfile?.firstName || user.coordinatorProfile?.firstName;

export const passwordResetService = {
  normalizeEmail: (email: string) => email.trim().toLowerCase(),

  async request(emailInput: string, resend = false) {
    const email = this.normalizeEmail(emailInput);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: { select: { firstName: true } },
        adminProfile: { select: { firstName: true } },
        coordinatorProfile: { select: { firstName: true } },
      },
    });
    if (!user) return false;

    const now = new Date();
    const active = await prisma.passwordResetChallenge.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    if (active && active.resendEligibleAt > now) {
      if (resend) throw new PasswordResetError('RESEND_COOLDOWN', 'Please wait before requesting another code', 429);
      return true;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const challenge = await prisma.passwordResetChallenge.create({
      data: {
        userId: user.id,
        email,
        otpHash: digest('otp', otp),
        otpExpiresAt: new Date(now.getTime() + OTP_TTL_MS),
        resendEligibleAt: new Date(now.getTime() + RESEND_COOLDOWN_MS),
      },
    });

    const delivered = await emailService.sendPasswordResetOtp({
      to: email,
      otp,
      displayName: displayNameFor(user),
    });

    await prisma.$transaction(async tx => {
      if (!delivered) {
        await tx.passwordResetChallenge.update({ where: { id: challenge.id }, data: { status: 'EMAIL_FAILED' } });
        return;
      }
      await tx.passwordResetChallenge.updateMany({
        where: { userId: user.id, status: 'ACTIVE', id: { not: challenge.id } },
        data: { status: 'REPLACED' },
      });
    });
    if (!delivered) {
      throw new PasswordResetError('EMAIL_DELIVERY_FAILED', 'Unable to send verification code. Try again.', 502);
    }
    return true;
  },

  async verify(emailInput: string, otp: string) {
    const email = this.normalizeEmail(emailInput);
    const challenge = await prisma.passwordResetChallenge.findFirst({
      where: { email, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge) throw new PasswordResetError('INVALID_CODE', 'The verification code is invalid');

    const now = new Date();
    if (challenge.otpExpiresAt <= now) {
      await prisma.passwordResetChallenge.updateMany({ where: { id: challenge.id, status: 'ACTIVE' }, data: { status: 'EXPIRED' } });
      throw new PasswordResetError('EXPIRED_CODE', 'The verification code has expired');
    }
    if (challenge.failedAttempts >= MAX_ATTEMPTS) {
      throw new PasswordResetError('ATTEMPTS_EXHAUSTED', 'Too many incorrect attempts. Request a new code', 429);
    }

    if (!safeEqual(challenge.otpHash, digest('otp', otp))) {
      const attempts = challenge.failedAttempts + 1;
      await prisma.passwordResetChallenge.updateMany({
        where: { id: challenge.id, status: 'ACTIVE', failedAttempts: challenge.failedAttempts },
        data: { failedAttempts: attempts, ...(attempts >= MAX_ATTEMPTS && { status: 'LOCKED' }) },
      });
      throw new PasswordResetError(
        attempts >= MAX_ATTEMPTS ? 'ATTEMPTS_EXHAUSTED' : 'INVALID_CODE',
        attempts >= MAX_ATTEMPTS ? 'Too many incorrect attempts. Request a new code' : 'The verification code is invalid',
        attempts >= MAX_ATTEMPTS ? 429 : 400,
      );
    }

    const grant = crypto.randomBytes(32).toString('base64url');
    const updated = await prisma.passwordResetChallenge.updateMany({
      where: { id: challenge.id, status: 'ACTIVE', failedAttempts: challenge.failedAttempts },
      data: {
        status: 'VERIFIED',
        verifiedAt: now,
        resetGrantHash: digest('grant', grant),
        resetGrantExpiresAt: new Date(now.getTime() + RESET_GRANT_TTL_MS),
      },
    });
    if (updated.count !== 1) throw new PasswordResetError('INVALID_CODE', 'The verification code is no longer valid');
    return grant;
  },

  validatePassword(password: string) {
    if (password.length < 12) throw new PasswordResetError('WEAK_PASSWORD', 'Password must be at least 12 characters');
    if (password.length > 128) throw new PasswordResetError('WEAK_PASSWORD', 'Password must be 128 characters or fewer');
  },

  async confirm(grant: string, newPassword: string) {
    this.validatePassword(newPassword);
    const grantHash = digest('grant', grant);
    const now = new Date();
    const challenge = await prisma.passwordResetChallenge.findUnique({
      where: { resetGrantHash: grantHash },
      include: { user: true },
    });
    if (!challenge || challenge.status !== 'VERIFIED' || !challenge.resetGrantExpiresAt || challenge.resetGrantExpiresAt <= now) {
      throw new PasswordResetError('INVALID_GRANT', 'This password reset session is invalid or expired');
    }

    const reserved = await prisma.passwordResetChallenge.updateMany({
      where: { id: challenge.id, status: 'VERIFIED', resetGrantHash: grantHash },
      data: { status: 'CONSUMING' },
    });
    if (reserved.count !== 1) throw new PasswordResetError('INVALID_GRANT', 'This password reset session has already been used');

    try {
      const firebaseUser = challenge.user.firebaseUid
        ? await firebaseAdmin.auth().getUser(challenge.user.firebaseUid)
        : await firebaseAdmin.auth().getUserByEmail(challenge.user.email);
      await firebaseAdmin.auth().updateUser(firebaseUser.uid, { password: newPassword });
      await firebaseAdmin.auth().revokeRefreshTokens(firebaseUser.uid);
      await prisma.$transaction([
        prisma.passwordResetChallenge.update({
          where: { id: challenge.id },
          data: { status: 'CONSUMED', consumedAt: new Date(), resetGrantHash: null },
        }),
        prisma.passwordResetChallenge.updateMany({
          where: { userId: challenge.userId, status: 'ACTIVE' },
          data: { status: 'INVALIDATED' },
        }),
        prisma.user.update({ where: { id: challenge.userId }, data: { mustChangePassword: false } }),
      ]);
    } catch (error) {
      await prisma.passwordResetChallenge.updateMany({
        where: { id: challenge.id, status: 'CONSUMING' },
        data: { status: 'VERIFIED' },
      });
      throw error;
    }
  },
};
