import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',  // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let smtpHealthy = false;
let smtpError = null;

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    logger.error(`❌ Email transporter error: ${error.message || error}`);
    smtpHealthy = false;
    smtpError = error.message || String(error);
  } else {
    logger.info('📧 Email server is ready to send messages');
    smtpHealthy = true;
    smtpError = null;
  }
});

export const getSmtpStatus = () => ({ healthy: smtpHealthy, error: smtpError });

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

// ─── Greeting / Welcome Transporter (Gmail) ───────────────────────────
const greetingTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GREETING_EMAIL_USER || process.env.EMAIL_USER,
    pass: process.env.GREETING_EMAIL_PASS || process.env.EMAIL_PASS,
  },
});

export const sendWelcomeCandidateEmail = async (email, name) => {
  if (!email || email.endsWith('@aramftc.com')) return;
  const fromUser = process.env.GREETING_EMAIL_USER || process.env.EMAIL_USER;
  try {
    await greetingTransporter.sendMail({
      from: `"AramFTC Welcome Service" <${fromUser}>`,
      to: email,
      subject: 'Welcome to Aram Fintech Concept!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: auto; background-color: #f8fafc; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">ARAM FINTECH CONCEPT</h1>
              <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9; font-weight: 700; color: #facc15; text-transform: uppercase; letter-spacing: 1px;">Job to Secure Life</p>
            </div>

            <!-- Body -->
            <div style="padding: 32px 24px; border-bottom: 1px solid #f1f5f9; line-height: 1.6;">
              <p style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0 0 16px;">Dear ${name || 'Candidate'},</p>
              <p style="color: #334155; font-size: 14px; margin: 0 0 16px;">
                Thanks for trusting Aram and starting to trail along with us. We will guide you, assist you, and travel with you on your professional journey.
              </p>
              <p style="color: #334155; font-size: 14px; margin: 0 0 24px;">
                Let's build a bright future for the candidates! Our team is dedicated to helping you secure the right opportunity for a secure life.
              </p>
              
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center; color: #065f46; font-weight: bold; font-size: 14px;">
                "Lets build a bright future for the candidates"
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px; background-color: #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 6px;">Welcome to the Aram family.</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Aram Fintech Concept. All rights reserved.</p>
            </div>

          </div>
        </div>
      `,
    });
    logger.info(`📧 Welcome candidate email sent to ${email}`);
  } catch (err) {
    logger.error(`❌ Failed to send welcome candidate email to ${email}: ${err.message}`);
  }
};

export const sendWelcomeEmployerEmail = async (email, name) => {
  if (!email || email.endsWith('@aramftc.com')) return;
  const fromUser = process.env.GREETING_EMAIL_USER || process.env.EMAIL_USER;
  try {
    await greetingTransporter.sendMail({
      from: `"AramFTC Corporate Services" <${fromUser}>`,
      to: email,
      subject: 'Welcome to the Aram Corporate Network!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: auto; background-color: #f8fafc; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">ARAM FINTECH CONCEPT</h1>
              <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9; font-weight: 700; color: #facc15; text-transform: uppercase; letter-spacing: 1px;">Corporate Client Onboarding</p>
            </div>

            <!-- Body -->
            <div style="padding: 32px 24px; border-bottom: 1px solid #f1f5f9; line-height: 1.6;">
              <p style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0 0 16px;">Dear ${name || 'Employer'},</p>
              <p style="color: #334155; font-size: 14px; margin: 0 0 16px;">
                Thank you for choosing Aram Fintech Concept as your recruitment partner. We highly appreciate your trust and look forward to working closely with your organization.
              </p>
              <p style="color: #334155; font-size: 14px; margin: 0 0 24px;">
                Our platform connects you with pre-verified, qualified candidates to fulfill your staffing demands efficiently and build a stronger workforce.
              </p>
              
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center; color: #1e40af; font-weight: bold; font-size: 14px;">
                Connecting Enterprise with Quality Talent
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px; background-color: #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 6px;">Thank you for partnering with Aram Fintech Concept.</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Aram Fintech Concept. All rights reserved.</p>
            </div>

          </div>
        </div>
      `,
    });
    logger.info(`📧 Welcome employer email sent to ${email}`);
  } catch (err) {
    logger.error(`❌ Failed to send welcome employer email to ${email}: ${err.message}`);
  }
};

export const sendBirthdayEmail = async (email, name) => {
  if (!email || email.endsWith('@aramftc.com')) return;
  const fromUser = process.env.GREETING_EMAIL_USER || process.env.EMAIL_USER;
  try {
    await greetingTransporter.sendMail({
      from: `"AramFTC Greeting Service" <${fromUser}>`,
      to: email,
      subject: 'Happy Birthday from Aram Fintech Concept! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: auto; background-color: #f8fafc; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">HAPPY BIRTHDAY! 🎉</h1>
              <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Aram Fintech Concept</p>
            </div>

            <!-- Body -->
            <div style="padding: 32px 24px; border-bottom: 1px solid #f1f5f9; line-height: 1.6;">
              <p style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0 0 16px;">Dear ${name || 'Candidate'},</p>
              <p style="color: #334155; font-size: 14px; margin: 0 0 16px;">
                Wishing you a very happy birthday and a wonderful, successful year ahead! We are incredibly glad to have you in the Aram family.
              </p>
              <p style="color: #334155; font-size: 14px; margin: 0 0 24px;">
                We look forward to travelling along with you, guiding you, and helping you build a very bright and prosperous future.
              </p>
              
              <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; text-align: center; color: #92400e; font-weight: bold; font-size: 14px;">
                Wishing you Joy, Health, and Success! 🎂
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px; background-color: #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 6px;">Thank you for being part of our journey.</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Aram Fintech Concept. All rights reserved.</p>
            </div>

          </div>
        </div>
      `,
    });
    logger.info(`📧 Birthday email sent to ${email}`);
  } catch (err) {
    logger.error(`❌ Failed to send birthday email to ${email}: ${err.message}`);
  }
};

export const startBirthdayScheduler = (prisma) => {
  const logFilePath = path.join(process.cwd(), 'birthday_sent_log.json');

  // Helper to read log
  function readLog() {
    try {
      if (fs.existsSync(logFilePath)) {
        const data = fs.readFileSync(logFilePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (err) {
      logger.error(`Error reading birthday log file: ${err.message}`);
    }
    return { date: '', sentIds: [] };
  }

  // Helper to write log
  function writeLog(log) {
    try {
      fs.writeFileSync(logFilePath, JSON.stringify(log, null, 2), 'utf8');
    } catch (err) {
      logger.error(`Error writing birthday log file: ${err.message}`);
    }
  }

  async function checkBirthdays() {
    try {
      const today = new Date();
      const currentDateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

      // Load log from file
      let log = readLog();
      if (log.date !== currentDateString) {
        // Day changed, reset the log for a new day
        log = { date: currentDateString, sentIds: [] };
        writeLog(log);
      }

      const currentYear = today.getFullYear();
      logger.info('🎂 Birthday Scheduler: Checking candidate birthdays...');
      const candidates = await prisma.candidate.findMany({
        where: {
          dob: { not: null },
          status: { notIn: ['BLACKLISTED', 'INACTIVE'] },
          emailId: { not: null },
          OR: [
            { lastBirthdayWishYear: null },
            { lastBirthdayWishYear: { not: currentYear } }
          ]
        },
        select: {
          id: true,
          fullName: true,
          emailId: true,
          dob: true,
        }
      });

      const todayMonth = today.getMonth();
      const todayDate = today.getDate();

      const birthdayCandidates = candidates.filter(c => {
        if (!c.dob || !c.emailId || c.emailId.endsWith('@aramftc.com')) return false;
        // Skip if already sent today
        if (log.sentIds.includes(c.id)) return false;

        const birth = new Date(c.dob);
        return birth.getMonth() === todayMonth && birth.getDate() === todayDate;
      });

      if (birthdayCandidates.length === 0) {
        logger.info('🎂 Birthday Scheduler: No new candidate birthdays found to wish today.');
        return;
      }

      for (const candidate of birthdayCandidates) {
        logger.info(`🎉 Sending birthday email to ${candidate.fullName} (${candidate.emailId})`);
        await sendBirthdayEmail(candidate.emailId, candidate.fullName);
        
        // Update database log
        try {
          await prisma.candidate.update({
            where: { id: candidate.id },
            data: { lastBirthdayWishYear: currentYear }
          });
        } catch (dbErr) {
          logger.error(`Failed to update lastBirthdayWishYear for candidate ${candidate.id}: ${dbErr.message}`);
        }
        
        // Save to sent log immediately
        log.sentIds.push(candidate.id);
        writeLog(log);
      }
    } catch (err) {
      logger.error(`Birthday scheduler error: ${err.message}`);
    }
  }

  // Run on startup
  checkBirthdays();

  // Run check every hour
  setInterval(checkBirthdays, 60 * 60 * 1000);
};


