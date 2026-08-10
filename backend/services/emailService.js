import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadEmailTemplate = (templateName, replacements) => {
  try {
    const filePath = path.join(__dirname, '..', 'templates', templateName);
    let html = fs.readFileSync(filePath, 'utf8');
    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return html;
  } catch (err) {
    logger.error(`❌ Failed to load email template ${templateName}: ${err.message}`);
    return '';
  }
};

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
  const htmlContent = loadEmailTemplate('otp.html', {
    OTP: otp,
    YEAR: new Date().getFullYear().toString()
  });

  await transporter.sendMail({
    from: `"AramFTC" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for AramFTC Login',
    text: `Dear User,\n\nUse the following One-Time Password (OTP) to log in to your Candidate Portal: ${otp}.\n\nThis code is valid for 10 minutes.\n\nBest regards,\nAram Fintech Concept`,
    html: htmlContent,
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
    const htmlContent = loadEmailTemplate('welcome_candidate.html', {
      NAME: name || 'Candidate',
      YEAR: new Date().getFullYear().toString()
    });

    await greetingTransporter.sendMail({
      from: `"AramFTC Welcome Service" <${fromUser}>`,
      to: email,
      subject: 'Welcome to Aram Fintech Concept!',
      text: `Dear ${name || 'Candidate'},\n\nWelcome to Aram Fintech Concept!\n\nThank you for trusting us. We are committed to guiding you, assisting you, and helping you build a successful career and a secure life.\n\nHere are the core features of Aram services available to support you:\n• Job Search: Match with verified blue-collar and professional employers.\n• Home Loans: Get pre-approved easily with competitive interest rates.\n• Vehicle Financing: Get flexible 2/4-wheeler loan options.\n• Insurance: Protect your family, health, and assets with tailored plans.\n• Investments: Grow your savings securely with personalized strategies.\n\n"Let's build a bright future for the candidates"\n\nBest regards,\nAram Fintech Concept Team`,
      html: htmlContent,
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
    const htmlContent = loadEmailTemplate('welcome_employer.html', {
      NAME: name || 'Employer',
      YEAR: new Date().getFullYear().toString()
    });

    await greetingTransporter.sendMail({
      from: `"AramFTC Corporate Services" <${fromUser}>`,
      to: email,
      subject: 'Welcome to the Aram Corporate Network!',
      text: `Dear ${name || 'Employer'},\n\nWelcome to Aram Fintech Concept!\n\nThank you for choosing us as your recruitment partner. We highly appreciate your trust and look forward to working closely with your organization.\n\nWe are dedicated to helping you grow your business. Together, we will work to build a stronger workforce by matching you with qualified, pre-verified candidates to fulfill your staffing demands efficiently.\n\nLog in to your Employer Dashboard anytime to manage your hiring requirements, view matched candidates, and download profiles.\n\nBest regards,\nAram Fintech Concept Team`,
      html: htmlContent,
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
    const htmlContent = loadEmailTemplate('birthday.html', {
      NAME: name || 'Candidate',
      YEAR: new Date().getFullYear().toString()
    });

    await greetingTransporter.sendMail({
      from: `"AramFTC Greeting Service" <${fromUser}>`,
      to: email,
      subject: 'Happy Birthday from Aram Fintech Concept! 🎉',
      text: `Dear ${name || 'Candidate'},\n\nWishing you a very happy birthday and a wonderful, successful year ahead! We are incredibly glad to have you in the Aram family.\n\nBest regards,\nAram Fintech Concept Team`,
      html: htmlContent,
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
      let candidates = [];
      try {
        candidates = await prisma.candidate.findMany({
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
      } catch (findErr) {
        logger.warn(`Birthday query fallback (database schema sync required): ${findErr.message}`);
        candidates = await prisma.candidate.findMany({
          where: {
            dob: { not: null },
            status: { notIn: ['BLACKLISTED', 'INACTIVE'] },
            emailId: { not: null },
          },
          select: {
            id: true,
            fullName: true,
            emailId: true,
            dob: true,
          }
        });
      }

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


