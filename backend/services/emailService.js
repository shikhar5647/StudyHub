// backend/services/emailService.js
const nodemailer = require('nodemailer');

function createTransporter() {
  // Support both Gmail and generic SMTP
  if (process.env.EMAIL_HOST) {
    // Generic SMTP (e.g. Mailgun, Brevo, SendGrid SMTP relay)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for others
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: Gmail (requires App Password)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });
}

/**
 * Send a verification email after signup.
 * @param {string} to      - Recipient email
 * @param {string} token   - Raw verification token
 */
async function sendVerificationEmail(to, token) {
  const transporter = createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"StudyHub" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
    to,
    subject: '✅ Verify your StudyHub email',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#4f46e5;">Welcome to StudyHub!</h2>
        <p>Please verify your email address by clicking the button below. This link expires in <strong>24 hours</strong>.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:13px;">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;">StudyHub · Learn without limits</p>
      </div>
    `,
  });
}

/**
 * Send a password reset email.
 * @param {string} to      - Recipient email
 * @param {string} token   - Raw reset token
 */
async function sendPasswordResetEmail(to, token) {
  const transporter = createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"StudyHub" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
    to,
    subject: '🔑 Reset your StudyHub password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#4f46e5;">Password Reset Request</h2>
        <p>We received a request to reset the password for your StudyHub account. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:13px;">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;">StudyHub · Learn without limits</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
