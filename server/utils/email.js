import nodemailer from 'nodemailer';

let etherealTransporter = null;

async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  // Development: use Ethereal (fake SMTP) - emails visible at https://ethereal.email
  if (process.env.NODE_ENV !== 'production') {
    if (!etherealTransporter) {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      console.log('[Email] Using Ethereal. View test emails at https://ethereal.email');
    }
    return etherealTransporter;
  }

  return null;
}

export async function sendInviteEmail({ to, clinicName, roleName, inviteLink, expiresIn = '7 days' }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@zuricare.org';
  const appName = 'ZuriCare';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px; }
    .header { color: #006666; font-size: 1.25rem; font-weight: 600; margin-bottom: 24px; }
    .card { background: #f4f7fa; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #006666 0%, #008080 100%); color: white !important; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .muted { color: #5c6b7a; font-size: 0.875rem; margin-top: 24px; }
    .link { word-break: break-all; color: #006666; }
  </style>
</head>
<body>
  <div class="header">${appName} – Staff invitation</div>
  <p>You have been invited to join <strong>${clinicName}</strong> as <strong>${roleName.replace(/_/g, ' ')}</strong>.</p>
  <div class="card">
    <p>Click the button below to accept the invitation and set up your account. This link expires in ${expiresIn}.</p>
    <a href="${inviteLink}" class="btn">Accept invitation</a>
  </div>
  <p class="muted">If the button doesn't work, copy and paste this link into your browser:</p>
  <p class="link">${inviteLink}</p>
  <p class="muted">If you didn't expect this invitation, you can safely ignore this email.</p>
</body>
</html>
  `.trim();

  const transporter = await getTransporter();

  if (!transporter) {
    console.log('[Email] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env for production.');
    console.log('[Email] Invite link for', to, ':', inviteLink);
    return { sent: false, messageId: null };
  }

  const info = await transporter.sendMail({
    from: `"${appName}" <${from}>`,
    to,
    subject: `You're invited to join ${clinicName} on ${appName}`,
    html,
    text: `You have been invited to join ${clinicName} as ${roleName.replace(/_/g, ' ')}.\n\nAccept invitation: ${inviteLink}\n\nThis link expires in ${expiresIn}.`,
  });

  return { sent: true, messageId: info.messageId };
}
