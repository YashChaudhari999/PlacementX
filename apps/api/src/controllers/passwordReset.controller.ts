import type { Request, Response } from 'express';
import { z } from 'zod';
import { passwordResetService, PasswordResetError } from '../services/passwordReset.service';

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email() }).strict();
const verifySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().regex(/^\d{6}$/),
}).strict();
const confirmSchema = z.object({
  resetGrant: z.string().min(32).max(256),
  newPassword: z.string().min(12).max(128),
}).strict();

const publicMessage = 'If an account exists with this email, a verification code has been sent.';

const handleError = (error: unknown, res: Response) => {
  if (error instanceof PasswordResetError) {
    return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  }
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Invalid password reset request' } });
  }
  console.error('[PasswordReset] Request failed without exposing sensitive input');
  return res.status(500).json({ error: { code: 'RESET_FAILED', message: 'Unable to process the password reset request' } });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = emailSchema.parse(req.body);
    const accountExists = await passwordResetService.request(email);
    if (!accountExists) {
      return res.status(404).json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'No registered account found for this email.' } });
    }
    return res.status(200).json({ success: true, message: publicMessage, resendAfterSeconds: 60 });
  } catch (error) {
    return handleError(error, res);
  }
};

export const resendPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = emailSchema.parse(req.body);
    const accountExists = await passwordResetService.request(email, true);
    if (!accountExists) {
      return res.status(404).json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'No registered account found for this email.' } });
    }
    return res.status(200).json({ success: true, message: publicMessage, resendAfterSeconds: 60 });
  } catch (error) {
    return handleError(error, res);
  }
};

export const verifyPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email, otp } = verifySchema.parse(req.body);
    const resetGrant = await passwordResetService.verify(email, otp);
    return res.status(200).json({ success: true, resetGrant, expiresInSeconds: 600 });
  } catch (error) {
    return handleError(error, res);
  }
};

export const confirmPasswordReset = async (req: Request, res: Response) => {
  try {
    const { resetGrant, newPassword } = confirmSchema.parse(req.body);
    await passwordResetService.confirm(resetGrant, newPassword);
    return res.status(200).json({ success: true, message: 'Password updated. Sign in with your new password.' });
  } catch (error) {
    return handleError(error, res);
  }
};
