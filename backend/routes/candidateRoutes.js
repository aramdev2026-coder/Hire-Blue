import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sanitizeString } from '../utils/validation.js';
import { authenticateCandidate, enforceCandidateOwnership } from '../middleware/security.js';

export default function createCandidateRoutes(prisma) {
  const router = express.Router();

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
  // STEP 1 - TRANSMIT MOBILE OTP
  // ─────────────────────────────────────────────────────────────────
  router.post('/send-otp', otpLimiter, asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) throw new AppError('Mobile number is required', 400);

    const digits = String(phoneNumber).replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(digits)) {
      throw new AppError('Invalid phone number format', 400);
    }

    const hasApiKey = env.TWO_FACTOR_API_KEY && env.TWO_FACTOR_API_KEY !== 'YOUR_2FACTOR_API_KEY_HERE';

    if (!hasApiKey) {
      // Fallback to sandbox if API key is not configured
      return res.json({ success: true, otpSessionId: 'SANDBOX_SESSION_ACTIVE', sandbox: true });
    }

    try {
      const response = await axios.get(
        `https://2factor.in/API/V1/${env.TWO_FACTOR_API_KEY}/SMS/${digits}/AUTOGEN3/BLU_COLLAR_AUTH`
      );
      res.json({ success: true, otpSessionId: response.data.Details });
    } catch (error) {
      if (env.NODE_ENV !== 'production') {
        res.json({ success: true, otpSessionId: 'SANDBOX_SESSION_ACTIVE', sandbox: true });
      } else {
        throw new AppError('SMS service temporarily unavailable. Please try again.', 503);
      }
    }
  }));

  // ─────────────────────────────────────────────────────────────────
  // STEP 2 - VALIDATE OTP & ASSIGN SESSION TOKEN
  // ─────────────────────────────────────────────────────────────────
  router.post('/verify-otp', authLimiter, asyncHandler(async (req, res) => {
    const { phoneNumber, otpCode, otpSessionId } = req.body;
    if (!phoneNumber || !otpCode) throw new AppError('Phone and OTP required', 400);

    const digits = String(phoneNumber).replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(digits)) throw new AppError('Invalid phone number format', 400);
    if (!/^\d{4,6}$/.test(String(otpCode))) throw new AppError('Invalid OTP format', 400);

    const hasApiKey = env.TWO_FACTOR_API_KEY && env.TWO_FACTOR_API_KEY !== 'YOUR_2FACTOR_API_KEY_HERE';

    try {
      if (otpSessionId !== 'SANDBOX_SESSION_ACTIVE' && hasApiKey) {
        await axios.get(`https://2factor.in/API/V1/${env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${otpSessionId}/${otpCode}`);
      } else {
        if (otpCode !== '123456') {
          throw new AppError('Incorrect OTP. Sandbox code is 123456.', 400);
        }
      }
    } catch (err) {
      throw new AppError('OTP is incorrect or expired', 400);
    }

    let candidate = await prisma.candidate.findUnique({ where: { phoneNumber1: digits } });
    if (!candidate) {
      try {
        candidate = await prisma.candidate.create({
          data: { phoneNumber1: digits, status: 'PENDING_WIZARD', source: 'USER_PORTAL' }
        });
      } catch (createErr) {
        if (createErr?.code === 'P2002') {
          throw new AppError('This candidate already exists.', 409);
        }
        throw createErr;
      }
    }

    const token = jwt.sign(
      { id: candidate.id, role: 'CANDIDATE', phone: candidate.phoneNumber1 },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, token, candidateId: candidate.id, profileStatus: candidate.status });
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
      await prisma.candidate.update({
        where: { id: req.candidate.id },
        data: {
          fullName: sanitizeString(p.fullName, 100),
          dob: p.dob ? new Date(p.dob) : null,
          sex: sanitizeString(p.sex, 20),
          maritalStatus: sanitizeString(p.maritalStatus, 20),
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
