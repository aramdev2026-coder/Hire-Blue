import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { validateEmployerInput, sanitizeString } from '../utils/validation.js';
import { authenticateEmployer, enforceEmployerOwnership } from '../middleware/security.js';

export default function createEmployerRoutes(prisma) {
  const router = express.Router();

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === 'production' ? 10 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  });

  // ─────────────────────────────────────────────────────────────────
  // EMPLOYER REGISTRATION
  // ─────────────────────────────────────────────────────────────────
  router.post('/signup', authLimiter, asyncHandler(async (req, res) => {
    const { companyName, email, phoneNumber, password } = req.body;

    const validationErrors = validateEmployerInput({ companyName, email, phoneNumber, password });
    if (validationErrors.length) {
      throw new AppError(validationErrors[0], 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = String(phoneNumber).replace(/\D/g, '').slice(-10);

    const existing = await prisma.employer.findFirst({
      where: { OR: [{ email: normalizedEmail }, { phoneNumber: normalizedPhone }] }
    });
    if (existing) throw new AppError('Email or Phone already registered.', 400);

    const hashedPassword = await hashPassword(password);

    await prisma.employer.create({
      data: {
        companyName: sanitizeString(companyName, 200),
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        password: hashedPassword,
        status: 'ACTIVE',
      }
    });

    res.status(201).json({ success: true, message: 'Account created successfully. You can log in now.' });
  }));

  // ─────────────────────────────────────────────────────────────────
  // EMPLOYER LOGIN
  // ─────────────────────────────────────────────────────────────────
  router.post('/login', authLimiter, asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier?.trim() || !password?.trim()) {
      throw new AppError('Email/phone and password are required.', 400);
    }

    const employer = await prisma.employer.findFirst({
      where: { OR: [{ email: identifier.trim().toLowerCase() }, { phoneNumber: identifier.trim() }] }
    });

    if (!employer) throw new AppError('Invalid credentials.', 401);

    const passwordValid = await verifyPassword(password, employer.password);
    if (!passwordValid) throw new AppError('Invalid credentials.', 401);

    if (employer.status === 'SUSPENDED') {
      throw new AppError('Your account has been blocked.', 403);
    }

    const token = jwt.sign({ id: employer.id, role: 'EMPLOYER' }, env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, token, employerId: employer.id, companyName: employer.companyName });
  }));

  // ─────────────────────────────────────────────────────────────────
  // CONCURRENT DEMAND COMPILATION PLACEMENT
  // ─────────────────────────────────────────────────────────────────
  router.post('/jobs', authenticateEmployer, asyncHandler(async (req, res) => {
    const { jobs } = req.body;

    if (!Array.isArray(jobs) || jobs.length === 0) {
      throw new AppError('At least one job is required.', 400);
    }
    if (jobs.length > 50) {
      throw new AppError('Maximum 50 jobs per request.', 400);
    }

    const jobData = jobs.map(job => ({
      employerId: req.employer.id,
      roleTitle: sanitizeString(job.roleTitle, 100),
      salaryRange: sanitizeString(job.salaryRange, 100),
      location: Array.isArray(job.location) ? job.location.map(l => sanitizeString(l, 50)) : (job.location ? [sanitizeString(job.location, 50)] : []),
      maritalStatus: sanitizeString(job.maritalStatus, 50),
      educationLevel: sanitizeString(job.educationLevel, 100),
      expRequired: typeof job.expRequired === 'number' ? job.expRequired : (parseInt(job.expRequired, 10) || 0)
    }));

    await prisma.jobRequirement.createMany({ data: jobData });
    res.status(201).json({ success: true });
  }));

  // ─────────────────────────────────────────────────────────────────
  // BLIND SELECTION AUTOMATED MATCHING ENGINE
  // ─────────────────────────────────────────────────────────────────
  router.get('/orders/:employerId', authenticateEmployer, enforceEmployerOwnership, asyncHandler(async (req, res) => {
    const jobs = await prisma.jobRequirement.findMany({
      where: { employerId: req.employer.id, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    const enrichedJobs = await Promise.all(jobs.map(async (job) => {
      const matches = await prisma.candidate.findMany({
        where: {
          status: { not: 'PENDING_WIZARD' },
          jobRoles: { has: job.roleTitle },
          OR: [
            { preferredDistricts: { hasSome: (job.location || []).length > 0 ? job.location : [] } },
            { preferredDistricts: { has: 'All Locations' } },
            { preferredDistricts: { isEmpty: true } }
          ]
        },
        include: { education: true, experience: true }
      });

      const anonymizedMatches = matches.map(c => {
        let totalExp = 0;
        c.experience.forEach(exp => {
          if(exp.fromYear && exp.toYear) totalExp += (parseInt(exp.toYear, 10) - parseInt(exp.fromYear, 10));
        });

        const topEdu = c.education.length > 0 ? c.education[0].course : 'Not Specified';

        return {
          id: c.id,
          candidateIdNumber: `HB-${String(c.id).padStart(4, '0')}`,
          experienceYears: totalExp > 0 ? `${totalExp} Years` : 'Fresher',
          topEducation: topEdu,
          location: c.presentDistrict || 'Unknown',
          gender: c.sex || 'Not Specified',
        };
      });

      return { ...job, matchedCandidates: anonymizedMatches };
    }));

    res.status(200).json({ success: true, jobs: enrichedJobs });
  }));

  // ─────────────────────────────────────────────────────────────────
  // REQUISITION CLOSURE (SOFT DELETE)
  // ─────────────────────────────────────────────────────────────────
  router.delete('/orders/:orderId', authenticateEmployer, asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    
    const order = await prisma.jobRequirement.findFirst({
      where: { id: orderId, employerId: req.employer.id }
    });
    if (!order) throw new AppError('Order not found.', 404);

    await prisma.jobRequirement.update({ where: { id: orderId }, data: { isActive: false } });
    res.status(200).json({ success: true });
  }));

  return router;
}
