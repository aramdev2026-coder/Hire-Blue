import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sanitizeString } from '../utils/validation.js';
import { authenticateCandidate, enforceCandidateOwnership } from '../middleware/security.js';
import { sendOTPEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

export default function createCandidateRoutes(prisma) {
  const router = express.Router();

  // Helper — generate 6 digit OTP
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Helper — delete expired OTPs for an email (cleanup)
  const cleanupOldOTPs = async (prismaInstance, email) => {
    await prismaInstance.otpToken.deleteMany({
      where: { email }
    });
  };

  // OTP rate limiter — 5 OTP requests per 10 min per IP
  const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: env.NODE_ENV === 'production' ? 5 : 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many OTP requests. Please try again later.' },
  });

  // Strict rate limiter for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === 'production' ? 10 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  });

  // ─────────────────────────────────────────────────────────────────
  // STEP 1 - TRANSMIT EMAIL OTP
  // ─────────────────────────────────────────────────────────────────
  router.post('/send-otp', otpLimiter, asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new AppError('Email address is required', 400);

    const emailLower = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      throw new AppError('Invalid email format', 400);
    }

    // Clean up old OTPs
    await cleanupOldOTPs(prisma, emailLower);

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save to database
    await prisma.otpToken.create({
      data: {
        email: emailLower,
        otp,
        expiresAt,
        attempts: 0,
      }
    });

    // Log the OTP code immediately in dev environment for quick access
    if (env.NODE_ENV !== 'production') {
      console.log('\n=========================================');
      console.log(`🔑 DEV OTP CODE FOR ${emailLower}: ${otp}`);
      console.log('=========================================\n');
    }

    // Fire email sending in the background (does not block client response)
    sendOTPEmail(emailLower, otp).catch((err) => {
      logger.error(`❌ Failed to send OTP email in background: ${err.message || err}`);
    });

    res.json({ success: true, message: 'OTP sent to your email.' });
  }));

  // ─────────────────────────────────────────────────────────────────
  // STEP 2 - VALIDATE OTP & ASSIGN SESSION TOKEN
  // ─────────────────────────────────────────────────────────────────
  router.post('/verify-otp', authLimiter, asyncHandler(async (req, res) => {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) throw new AppError('Email and OTP required', 400);

    const emailLower = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) throw new AppError('Invalid email format', 400);

    // Find the latest OTP token record
    const record = await prisma.otpToken.findFirst({
      where: { email: emailLower },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      throw new AppError('OTP not found. Please request a new one.', 400);
    }

    // Too many attempts
    if (record.attempts >= 5) {
      await cleanupOldOTPs(prisma, emailLower);
      throw new AppError('Too many failed attempts. Please request a new OTP.', 400);
    }

    // Expired
    if (new Date() > record.expiresAt) {
      await cleanupOldOTPs(prisma, emailLower);
      throw new AppError('OTP expired. Please request a new one.', 400);
    }

    // Incorrect code
    if (record.otp !== String(otpCode)) {
      await prisma.otpToken.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 }
      });
      const remaining = 5 - (record.attempts + 1);
      throw new AppError(`Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, 400);
    }

    // OTP is valid - clean it up
    await cleanupOldOTPs(prisma, emailLower);

    let candidate = await prisma.candidate.findUnique({
      where: { emailId: emailLower }
    });

    if (!candidate) {
      try {
        candidate = await prisma.candidate.create({
          data: { 
            emailId: emailLower, 
            phoneNumber1: 'EMAIL_AUTO_' + Math.random().toString(36).substring(2, 15),
            status: 'PENDING_WIZARD', 
            source: 'USER_PORTAL' 
          }
        });
      } catch (createErr) {
        if (createErr?.code === 'P2002') {
          throw new AppError('This candidate already exists.', 409);
        }
        throw createErr;
      }
    }

    const token = jwt.sign(
      { id: candidate.id, role: 'CANDIDATE', phone: candidate.phoneNumber1, email: candidate.emailId },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, token, candidateId: candidate.id, profileStatus: candidate.status });
  }));

  // ─────────────────────────────────────────────────────────────────
  // STEP 3 - RESEND OTP
  // ─────────────────────────────────────────────────────────────────
  router.post('/resend-otp', otpLimiter, asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new AppError('Email address is required', 400);

    const emailLower = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      throw new AppError('Invalid email format', 400);
    }

    // Rate limit — don't allow resend more than once per 60 seconds
    const recentOtp = await prisma.otpToken.findFirst({
      where: { email: emailLower },
      orderBy: { createdAt: 'desc' }
    });

    if (recentOtp) {
      const secondsSinceCreated = (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;
      if (secondsSinceCreated < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceCreated);
        throw new AppError(`Please wait ${waitSeconds} seconds before requesting a new OTP.`, 429);
      }
    }

    // Clean up old OTPs
    await cleanupOldOTPs(prisma, emailLower);

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpToken.create({
      data: { email: emailLower, otp, expiresAt, attempts: 0 }
    });

    // Log the OTP code immediately in dev environment for quick access
    if (env.NODE_ENV !== 'production') {
      console.log('\n=========================================');
      console.log(`🔑 DEV RESEND OTP CODE FOR ${emailLower}: ${otp}`);
      console.log('=========================================\n');
    }

    // Fire email sending in the background (does not block client response)
    sendOTPEmail(emailLower, otp).catch((err) => {
      logger.error(`❌ Failed to resend OTP email in background: ${err.message || err}`);
    });

    res.json({ success: true, message: 'New OTP sent to your email.' });
  }));

  // ─────────────────────────────────────────────────────────────────
  // INTERMEDIATE PROFILE SAVE ENGINE
  // ─────────────────────────────────────────────────────────────────
  router.post('/save-wizard-step', authenticateCandidate, enforceCandidateOwnership, asyncHandler(async (req, res) => {
    const { candidateId, sectionIndex, updatedPayload: p } = req.body;
    const effectiveId = candidateId || req.candidate.id;

    if (parseInt(effectiveId, 10) !== req.candidate.id) {
      throw new AppError('You can only update your own profile', 403);
    }

    if (Number(sectionIndex) === 1) {
      // 🛡️ Check if another candidate has the same phoneNumber1 to prevent database conflict
      if (p.phoneNumber1) {
        const existing = await prisma.candidate.findFirst({
          where: {
            phoneNumber1: p.phoneNumber1,
            NOT: { id: req.candidate.id }
          }
        });
        if (existing) {
          throw new AppError('This primary mobile number is already registered to another account', 409);
        }
      }

      await prisma.candidate.update({
        where: { id: req.candidate.id },
        data: {
          fullName: sanitizeString(p.fullName, 100),
          dob: p.dob ? new Date(p.dob) : null,
          sex: sanitizeString(p.sex, 20),
          maritalStatus: sanitizeString(p.maritalStatus, 20),
          phoneNumber1: p.phoneNumber1 || undefined, // Save the updated primary phone number
          phoneNumber2: p.phoneNumber2 || null,
          familyPhonePrimary: p.familyPhonePrimary || null,
          familyPhoneBackup: p.familyPhoneBackup || null,
          emailId: p.emailId || null,
          secondaryEmailId: p.secondaryEmailId || null,
          presentAddress: sanitizeString(p.presentAddress, 500),
          presentDistrict: sanitizeString(p.presentDistrict, 50),
          presentState: sanitizeString(p.presentState, 50),
          permanentAddress: sanitizeString(p.permanentAddress, 500),
          permanentDistrict: sanitizeString(p.permanentDistrict, 50),
          permanentState: sanitizeString(p.permanentState, 50),
        },
      });
    } else if (Number(sectionIndex) === 2) {
      await prisma.candidate.update({
        where: { id: req.candidate.id },
        data: {
          jobRoles: { set: Array.isArray(p.jobRoles) ? p.jobRoles.map(r => sanitizeString(r, 100)) : [] },
          preferredDistricts: { set: Array.isArray(p.preferredDistricts) ? p.preferredDistricts.map(d => sanitizeString(d, 50)) : [] },
          expectedSalary: sanitizeString(p.expectedSalary, 50),
          languagesKnown: { set: Array.isArray(p.languagesKnown) ? p.languagesKnown.map(l => sanitizeString(l, 50)) : [] },
        },
      });
    } else if (Number(sectionIndex) === 3) {
      const education = Array.isArray(p.education) ? p.education.filter(item => item?.institution?.trim()) : [];
      const technical = Array.isArray(p.technical) ? p.technical.filter(item => item?.institution?.trim()) : [];
      const experience = Array.isArray(p.experience) ? p.experience.filter(item => item?.institution?.trim()) : [];

      await prisma.$transaction([
        prisma.candidateEducation.deleteMany({ where: { candidateId: req.candidate.id } }),
        prisma.candidateTechnical.deleteMany({ where: { candidateId: req.candidate.id } }),
        prisma.candidateExperience.deleteMany({ where: { candidateId: req.candidate.id } }),
      ]);

      if (education.length) await prisma.candidateEducation.createMany({ data: education.map(item => ({ candidateId: req.candidate.id, institution: sanitizeString(item.institution, 200) || '', course: sanitizeString(item.course, 200) || '' })) });
      if (technical.length) await prisma.candidateTechnical.createMany({ data: technical.map(item => ({ candidateId: req.candidate.id, institution: sanitizeString(item.institution, 200) || '', course: sanitizeString(item.course, 200) || '' })) });
      if (experience.length) await prisma.candidateExperience.createMany({ data: experience.map(item => ({ candidateId: req.candidate.id, institution: sanitizeString(item.institution, 200) || '', fromYear: sanitizeString(item.fromYear, 10) || '', toYear: sanitizeString(item.toYear, 10) || '' })) });
    }
    res.json({ success: true, message: 'Section baseline checkpoint saved successfully' });
  }));

  // ─────────────────────────────────────────────────────────────────
  // SUBMIT ROSTER REGISTRATION PROFILE
  // ─────────────────────────────────────────────────────────────────
  router.post('/finalize', authenticateCandidate, asyncHandler(async (req, res) => {
    await prisma.candidate.update({ where: { id: req.candidate.id }, data: { status: 'PENDING_ADMIN_CALL' } });
    res.json({ success: true });
  }));

  // ─────────────────────────────────────────────────────────────────
  // READ COMPLETE DEEP PROFILE DATA
  // ─────────────────────────────────────────────────────────────────
  router.get('/profile/:candidateId', authenticateCandidate, enforceCandidateOwnership, asyncHandler(async (req, res) => {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.candidate.id },
      include: { education: true, technical: true, experience: true }
    });
    if (!candidate) throw new AppError('Candidate not found', 404);
    res.json({ success: true, candidate });
  }));

  return router;
}
