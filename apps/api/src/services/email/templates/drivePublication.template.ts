const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export interface DrivePublicationTemplateInput {
  studentName: string;
  driveTitle: string;
  companyName: string;
  jobRole?: string | null;
  location?: string | null;
  employmentType?: string | null;
  minimumCgpa?: number | null;
  fixedSalary?: number | null;
  deadline?: Date | null;
  driveUrl: string;
}

const detail = (label: string, value?: string | number | null) =>
  value === null || value === undefined || value === ''
    ? ''
    : `<tr><td style="padding:7px 12px;color:#64748b;font-size:14px">${escapeHtml(label)}</td><td style="padding:7px 12px;color:#111827;font-size:14px;font-weight:600">${escapeHtml(value)}</td></tr>`;

const formatDeadline = (deadline?: Date | null) =>
  deadline
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }).format(deadline)
    : null;

export const renderDrivePublicationEmail = (input: DrivePublicationTemplateInput) => {
  const deadline = formatDeadline(input.deadline);
  const safeUrl = escapeHtml(input.driveUrl);
  const html = `<!doctype html><html><body style="margin:0;background:#f7f3ed;font-family:Arial,sans-serif;color:#111827">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 14px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #eadfd5">
      <tr><td style="background:#97002e;padding:24px 30px;color:#fff;font-size:25px;font-weight:800">PlacementX</td></tr>
      <tr><td style="padding:30px">
        <p style="font-size:16px;margin:0 0 14px">Hi ${escapeHtml(input.studentName)},</p>
        <h1 style="font-size:24px;line-height:1.3;margin:0 0 12px">A new placement opportunity matches your profile</h1>
        <p style="font-size:15px;line-height:1.6;color:#475569">The placement cell has published a new drive for which you are currently eligible. Review the complete requirements before applying.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;background:#faf7f3;border-radius:12px">
          ${detail('Drive', input.driveTitle)}${detail('Company', input.companyName)}${detail('Position', input.jobRole)}${detail('Location', input.location)}${detail('Employment type', input.employmentType)}${detail('Minimum CGPA', input.minimumCgpa)}${detail('CTC', input.fixedSalary === null || input.fixedSalary === undefined ? null : `${input.fixedSalary} LPA`)}${detail('Application deadline', deadline)}
        </table>
        <p style="margin:26px 0;text-align:center"><a href="${safeUrl}" style="display:inline-block;background:#97002e;color:#fff;text-decoration:none;padding:14px 24px;border-radius:9px;font-weight:700">View Placement Drive</a></p>
        <p style="font-size:13px;line-height:1.5;color:#64748b">If the button does not work, copy this URL into your browser:<br><a href="${safeUrl}" style="color:#97002e;word-break:break-all">${safeUrl}</a></p>
        <p style="font-size:14px;line-height:1.6;color:#475569">Log in to PlacementX and submit your application before the deadline. Eligibility is checked again when you apply.</p>
      </td></tr>
      <tr><td style="padding:18px 30px;background:#f8fafc;color:#64748b;font-size:12px">PlacementX · NMIMS Placement Cell</td></tr>
    </table>
  </td></tr></table></body></html>`;

  const lines = [
    `Hi ${input.studentName},`,
    '',
    'A new placement opportunity matching your profile is available on PlacementX.',
    `Drive: ${input.driveTitle}`,
    `Company: ${input.companyName}`,
    input.jobRole ? `Position: ${input.jobRole}` : null,
    input.location ? `Location: ${input.location}` : null,
    input.employmentType ? `Employment type: ${input.employmentType}` : null,
    input.minimumCgpa !== null && input.minimumCgpa !== undefined
      ? `Minimum CGPA: ${input.minimumCgpa}`
      : null,
    input.fixedSalary !== null && input.fixedSalary !== undefined
      ? `CTC: ${input.fixedSalary} LPA`
      : null,
    deadline ? `Application deadline: ${deadline}` : null,
    '',
    `View Placement Drive: ${input.driveUrl}`,
    '',
    'Review the complete requirements and apply before the deadline.',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  return { html, text: lines };
};
