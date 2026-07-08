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
      <div style="font-family: Arial, sans-serif; max-width: 540px; margin: auto; background-color: #f8fafc; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; -webkit-text-stroke: 0.8px #000;">ARAM FINTECH CONCEPT</h1>
            <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9; font-weight: 700; color: #facc15; text-transform: uppercase; letter-spacing: 1px; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; -webkit-text-stroke: 0.8px #000;">Job to Secure Life</p>
          </div>

          <!-- Welcome & OTP Code block -->
          <div style="padding: 32px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
            <p style="color: #475569; font-size: 15px; margin: 0 0 16px; text-align: left;">Dear User,</p>
            <p style="color: #475569; font-size: 15px; margin: 0 0 24px; text-align: left; line-height: 1.5;">
              Use the following One-Time Password (OTP) to log in to your Candidate Portal. This code is confidential and should not be shared.
            </p>
            
            <div style="background-color: #eff6ff; border: 1px dashed #bfdbfe; border-radius: 12px; padding: 18px 12px; display: inline-block; margin-bottom: 20px; min-width: 240px; text-align: center;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 6px; color: #1e3a8a; display: inline-block; padding-left: 6px; text-align: center; margin: 0 auto;">${otp}</span>
            </div>

            <div style="font-size: 13px; color: #64748b; margin-top: 8px; line-height: 1.5;">
              Valid for <strong>10 minutes only</strong>
            </div>
          </div>

          <!-- Aram Services Segment -->
          <div style="padding: 28px 24px; background-color: #fcfdfe;">
            <h3 style="margin: 0 0 16px; font-size: 14px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800;">Aram Ecosystem Services</h3>
            
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
              <tr>
                <td width="50%" style="padding: 0 8px 12px 0; vertical-align: top;">
                  <div style="border: 1px solid #e2e8f0; border-left: 3px solid #3b82f6; border-radius: 8px; padding: 12px; background: #ffffff; min-height: 54px;">
                    <div style="margin: 0 0 4px; font-size: 13px; font-weight: bold; color: #0f172a;">Job Search</div>
                    <div style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">Find matching job opportunities.</div>
                  </div>
                </td>
                <td width="50%" style="padding: 0 0 12px 8px; vertical-align: top;">
                  <div style="border: 1px solid #e2e8f0; border-left: 3px solid #10b981; border-radius: 8px; padding: 12px; background: #ffffff; min-height: 54px;">
                    <div style="margin: 0 0 4px; font-size: 13px; font-weight: bold; color: #0f172a;">Employee Selection</div>
                    <div style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">Hire verified candidates efficiently.</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding: 0 8px 12px 0; vertical-align: top;">
                  <div style="border: 1px solid #e2e8f0; border-left: 3px solid #f59e0b; border-radius: 8px; padding: 12px; background: #ffffff; min-height: 54px;">
                    <div style="margin: 0 0 4px; font-size: 13px; font-weight: bold; color: #0f172a;">Home Loan</div>
                    <div style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">Get competitive rates pre-approved.</div>
                  </div>
                </td>
                <td width="50%" style="padding: 0 0 12px 8px; vertical-align: top;">
                  <div style="border: 1px solid #e2e8f0; border-left: 3px solid #f43f5e; border-radius: 8px; padding: 12px; background: #ffffff; min-height: 54px;">
                    <div style="margin: 0 0 4px; font-size: 13px; font-weight: bold; color: #0f172a;">2/4 Wheeler Loan</div>
                    <div style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">Flexible vehicle financing options.</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding: 0 8px 0 0; vertical-align: top;">
                  <div style="border: 1px solid #e2e8f0; border-left: 3px solid #8b5cf6; border-radius: 8px; padding: 12px; background: #ffffff; min-height: 54px;">
                    <div style="margin: 0 0 4px; font-size: 13px; font-weight: bold; color: #0f172a;">Insurance</div>
                    <div style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">Protect family, health, and assets.</div>
                  </div>
                </td>
                <td width="50%" style="padding: 0 0 0 8px; vertical-align: top;">
                  <div style="border: 1px solid #e2e8f0; border-left: 3px solid #06b6d4; border-radius: 8px; padding: 12px; background: #ffffff; min-height: 54px;">
                    <div style="margin: 0 0 4px; font-size: 13px; font-weight: bold; color: #0f172a;">Investments</div>
                    <div style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">Grow your wealth with tailored strategies.</div>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Footer -->
          <div style="padding: 24px; background-color: #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            <p style="margin: 0 0 6px;">If you did not request this OTP, please ignore this email. Your account is completely safe.</p>
            <p style="margin: 0;">© ${new Date().getFullYear()} Aram Fintech Concept. All rights reserved.</p>
          </div>

        </div>
      </div>
    `,
  });
};
