export interface PasswordResetTemplateParams {
  email: string;
  resetLink: string;
  displayName?: string;
  logoUrl?: string;
}

export function renderPasswordResetTemplate({
  email,
  resetLink,
  displayName,
  logoUrl,
}: PasswordResetTemplateParams): string {
  const sanitizedEmail = escapeHtml(email);
  const sanitizedResetLink = escapeHtml(resetLink);
  const greeting = displayName ? `Hi ${escapeHtml(displayName)},` : 'Hi there,';
  const logo = logoUrl || process.env.EMAIL_LOGO_URL || '';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Password Reset Request - PlacementX</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      min-width: 100%;
      background-color: #F1F1F3;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #1A1A2E;
    }
    table {
      border-spacing: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F1F1F3;
      padding-bottom: 40px;
    }
    .main-card {
      background-color: #FFFFFF;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-spacing: 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #7B1C2E;
      background-image: linear-gradient(135deg, #7B1C2E 0%, #5A1020 100%);
      padding: 36px 24px;
      text-align: center;
    }
    .header-logo {
      max-height: 48px;
      margin-bottom: 12px;
    }
    .header-title {
      color: #FFFFFF;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 1.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .header-subtitle {
      color: #FFC107;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      margin-top: 6px;
      text-transform: uppercase;
    }
    .content {
      padding: 40px 32px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #1A1A2E;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #555555;
      margin-bottom: 20px;
    }
    .email-box {
      background-color: #F8F9FA;
      border-left: 4px solid #7B1C2E;
      padding: 14px 18px;
      font-size: 15px;
      font-weight: 700;
      color: #1A1A2E;
      margin-bottom: 28px;
      word-break: break-all;
      border-radius: 0 8px 8px 0;
    }
    .btn-wrapper {
      text-align: center;
      margin-top: 28px;
      margin-bottom: 32px;
    }
    .btn {
      background-color: #7B1C2E;
      color: #FFC107 !important;
      display: inline-block;
      padding: 16px 36px;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
      border-radius: 8px;
      letter-spacing: 1px;
      text-transform: uppercase;
      box-shadow: 0 4px 10px rgba(123, 28, 46, 0.25);
    }
    .divider {
      border-top: 1px solid #EAEAEA;
      margin: 28px 0;
    }
    .notice {
      font-size: 13px;
      line-height: 1.6;
      color: #666666;
    }
    .link-fallback {
      font-size: 12px;
      line-height: 1.5;
      color: #777777;
      word-break: break-all;
      margin-top: 14px;
    }
    .link-fallback a {
      color: #7B1C2E;
      text-decoration: underline;
    }
    .footer {
      text-align: center;
      padding: 24px 16px;
      font-size: 12px;
      color: #888888;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 10px;">
          <table role="presentation" class="main-card" width="100%" cellPadding="0" cellSpacing="0" border="0">
            <!-- HEADER -->
            <tr>
              <td class="header">
                ${logo ? `<img src="${escapeHtml(logo)}" alt="PlacementX Logo" class="header-logo" /><br />` : ''}
                <div class="header-title">PlacementX</div>
                <div class="header-subtitle">CAMPUS PLACEMENT MANAGEMENT SYSTEM</div>
              </td>
            </tr>
            <!-- CONTENT -->
            <tr>
              <td class="content">
                <h2 class="title">Password Reset Request</h2>
                <p class="text">${greeting}</p>
                <p class="text">
                  We received a request to reset the password for your PlacementX account associated with:
                </p>
                <div class="email-box">
                  ${sanitizedEmail}
                </div>
                <p class="text">
                  Tap the button below to set a new password.
                </p>
                <div class="btn-wrapper">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${sanitizedResetLink}" style="height:50px;v-text-anchor:middle;width:240px;" arcsize="16%" stroke="f" fillcolor="#7B1C2E">
                    <w:anchorlock/>
                    <center style="color:#FFC107;font-family:sans-serif;font-size:15px;font-weight:bold;">RESET MY PASSWORD</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${sanitizedResetLink}" target="_blank" class="btn">RESET MY PASSWORD</a>
                  <!--<![endif]-->
                </div>

                <div class="divider"></div>

                <p class="notice">
                  <strong>Didn't request this?</strong><br />
                  If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>

                <p class="link-fallback">
                  If the button doesn't work, copy and paste this link into your browser:<br />
                  <a href="${sanitizedResetLink}" target="_blank">${sanitizedResetLink}</a>
                </p>

                <div class="divider"></div>

                <p class="notice">
                  For security, you will be signed out of your PlacementX session after resetting your password. Please log in again with your new credentials.
                </p>
              </td>
            </tr>
          </table>

          <!-- FOOTER -->
          <table role="presentation" width="100%" style="max-width: 600px; margin: 0 auto;" cellPadding="0" cellSpacing="0" border="0">
            <tr>
              <td class="footer">
                This email was sent by PlacementX.<br />
                Please do not reply to this email.<br /><br />
                <strong>PlacementX · Campus Placement Management System</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
