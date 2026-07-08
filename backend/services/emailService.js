import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',  // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    logger.error(`❌ Email transporter error: ${error.message || error}`);
  } else {
    logger.info('📧 Email server is ready to send messages');
  }
});

export const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"AramFTC" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for AramFTC Login',
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 480px;
        margin: auto;
        padding: 32px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #ffffff;
      ">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #059669; margin: 0;">AramFTC</h2>
          <p style="color: #64748b; margin: 4px 0 0;">Blue Collar Hiring Platform</p>
        </div>

        <p style="color: #334155; font-size: 16px;">
          Hello,
        </p>
        <p style="color: #334155; font-size: 16px;">
          Your One-Time Password for login is:
        </p>

        <div style="
          background: #f0fdf4;
          border: 2px solid #bbf7d0;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          margin: 24px 0;
        ">
          <h1 style="
            letter-spacing: 16px;
            color: #059669;
            font-size: 40px;
            margin: 0;
            font-family: monospace;
          ">${otp}</h1>
        </div>

        <p style="color: #64748b; font-size: 14px;">
          ⏱ This OTP is valid for <strong>10 minutes only</strong>.
        </p>
        <p style="color: #64748b; font-size: 14px;">
          🔒 You have <strong>5 attempts</strong> before the OTP is invalidated.
        </p>
        <p style="color: #64748b; font-size: 14px;">
          If you did not request this OTP, please ignore this email.
          Your account is safe.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          © AramFTC — This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  });
};
