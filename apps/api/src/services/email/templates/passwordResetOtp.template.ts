const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[character] || character));

export const renderPasswordResetOtpTemplate = ({ otp, displayName }: { otp: string; displayName?: string }) => {
  const greeting = displayName ? `Hello ${escapeHtml(displayName)},` : 'Hello,';
  return `<!doctype html><html><body style="margin:0;background:#f8f5f0;font-family:Arial,sans-serif;color:#1f2937"><table role="presentation" width="100%"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:18px;border:1px solid #eadfd4"><tr><td style="padding:32px"><h1 style="margin:0 0 20px;color:#8b1538">PlacementX</h1><p>${greeting}</p><p>Use this verification code to reset your password:</p><p style="font-size:34px;font-weight:800;letter-spacing:10px;text-align:center;color:#8b1538;margin:28px 0">${otp}</p><p>This code expires in <strong>5 minutes</strong>. Never share it with anyone, including placement-cell staff.</p><p>If you did not request a password reset, ignore this email. Your password will remain unchanged.</p></td></tr></table></td></tr></table></body></html>`;
};
