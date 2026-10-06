import nodemailer, { type Transporter } from 'nodemailer';
import { renderPasswordResetTemplate } from './templates/passwordReset.template';

export interface SendPasswordResetOptions {
  to: string;
  resetLink: string;
  displayName?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initTransporter();
  }

  public initTransporter() {
    const host = process.env.SMTP_HOST?.trim();
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER?.trim();
    const pass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS)?.trim();

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.isConfigured = true;
    } else {
      this.isConfigured = false;
    }
  }

  public async sendPasswordResetEmail({
    to,
    resetLink,
    displayName,
  }: SendPasswordResetOptions): Promise<boolean> {
    // Re-verify transporter configuration in case env vars were loaded dynamically
    if (!this.isConfigured || !this.transporter) {
      this.initTransporter();
    }

    const fromName = process.env.EMAIL_FROM_NAME || 'PlacementX';
    // Brevo requires EMAIL_FROM to be a verified sender in your Brevo account.
    // If EMAIL_FROM is no-reply@placementx.com and not verified, Brevo will reject it.
    // Fall back to SMTP_USER or process.env.EMAIL_FROM if set.
    const fromAddress = (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim()) || 'yash.chaudhari171@nmims.in';
    const fromHeader = `"${fromName}" <${fromAddress}>`;

    const html = renderPasswordResetTemplate({
      email: to,
      resetLink,
      displayName,
    });

    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: fromHeader,
          to,
          subject: 'Reset Your PlacementX Password',
          html,
        });
        console.log(`[EmailService] Password reset email successfully sent to ${to}. MessageId: ${info.messageId}`);
        return true;
      } catch (error: any) {
        console.error('[EmailService] Failed to send email via SMTP transporter:', error.message || error);
        console.log(`[EmailService Dev Fallback] Password Reset Link for ${to}:\n${resetLink}`);
        return false;
      }
    } else {
      console.warn(
        `[EmailService] SMTP credentials not configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD). ` +
        `Password reset link for ${to}:\n${resetLink}`
      );
      return true;
    }
  }
}

export const emailService = new EmailService();
