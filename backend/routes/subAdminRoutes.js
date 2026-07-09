import express from 'express';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';
import { serializeCandidateForSubAdmin } from '../utils/serializers.js';
import { updateCandidateStatus, SUB_ADMIN_FORBIDDEN } from '../services/candidateService.js';
import { createFullCandidate } from '../services/createCandidate.js';
import { validateCandidateInput, normalizePhone, sanitizeString } from '../utils/validation.js';

export default function createSubAdminRoutes(prisma) {
  const router = express.Router();
  router.use(authenticateAdmin, requireRole(['SUB_ADMIN']));

  router.get('/candidates', async (req, res) => {
    try {
      const { status, search } = req.query;
      const filters = { assignedToId: req.admin.id };

      if (status) {
        filters.status = status;
      } else {
        filters.status = { not: 'PENDING_WIZARD' };
      }

      let candidates = await prisma.candidate.findMany({
        where: filters,
        include: { education: true, technical: true, experience: true },
        orderBy: { updatedAt: 'desc' },
      });

      if (search) {
        const q = search.toLowerCase();
        candidates = candidates.filter((c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.phoneNumber1?.includes(search) ||
          String(c.id).includes(search),
        );
      }

      // Calculate status counts on sub-admin queue (excluding status filter)
      const countFilters = { assignedToId: req.admin.id };
      const countsRaw = await prisma.candidate.groupBy({
        by: ['status'],
        _count: { id: true },
        where: countFilters,
      });
      const statusCounts = Object.fromEntries(
        countsRaw.map(item => [item.status, item._count.id])
      );

      res.json({
        success: true,
        candidates: candidates.map(serializeCandidateForSubAdmin),
        statusCounts,
      });
    } catch (err) {
      console.error('Sub-admin fetch candidates:', err.message);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  });

  router.post('/candidates', async (req, res) => {
    const body = {
      ...req.body,
      phoneNumber1: normalizePhone(req.body.phoneNumber1),
      phoneNumber2: req.body.phoneNumber2 ? normalizePhone(req.body.phoneNumber2) : null,
      familyPhonePrimary: req.body.familyPhonePrimary ? normalizePhone(req.body.familyPhonePrimary) : null,
      familyPhoneBackup: req.body.familyPhoneBackup ? normalizePhone(req.body.familyPhoneBackup) : null,
    };

    const validationErrors = validateCandidateInput(body);
    if (validationErrors.length) {
      return res.status(400).json({ error: validationErrors[0], errors: validationErrors });
    }

    if (!body.fullName || !body.phoneNumber1) {
      return res.status(400).json({ error: 'fullName and phoneNumber1 are required' });
    }

    try {
      const existing = await prisma.candidate.findUnique({ where: { phoneNumber1: body.phoneNumber1 } });
      if (existing) {
        return res.status(409).json({ error: 'A candidate with this phone number already exists' });
      }

      // Sanitize string inputs
      body.fullName = sanitizeString(body.fullName, 100);
      body.presentAddress = body.presentAddress ? sanitizeString(body.presentAddress, 500) : null;
      body.permanentAddress = body.permanentAddress ? sanitizeString(body.permanentAddress, 500) : null;

      const candidate = await createFullCandidate(
        prisma,
        {
          ...body,
          source: 'SUB_ADMIN',
          createdById: req.admin.id,
          assignedToId: req.admin.id,
          status: 'NEW',
        },
        { changedById: req.admin.id },
      );

      res.status(201).json({ success: true, candidate: serializeCandidateForSubAdmin(candidate) });
    } catch (err) {
      console.error('Sub-admin create candidate:', err.message);
      res.status(500).json({ error: 'Failed to create candidate' });
    }
  });

  router.put('/candidates/:id/status', async (req, res) => {
    const candidateId = parseInt(req.params.id, 10);
    if (isNaN(candidateId)) return res.status(400).json({ error: 'Invalid candidate ID' });

    const { status, note } = req.body;

    try {
      const candidate = await prisma.candidate.findFirst({
        where: { id: candidateId, assignedToId: req.admin.id },
      });
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found or not assigned to you' });
      }

      const updated = await updateCandidateStatus(prisma, {
        candidateId,
        status,
        changedById: req.admin.id,
        note,
        forbiddenStatuses: [...SUB_ADMIN_FORBIDDEN],
      });

      res.json({ success: true, candidate: serializeCandidateForSubAdmin(updated) });
    } catch (err) {
      const code = err.statusCode || 500;
      if (code >= 500) console.error('Sub-admin status update:', err.message);
      res.status(code).json({ error: err.message || 'Failed to update status' });
    }
  });

  router.post('/candidates/:id/notes', async (req, res) => {
    const candidateId = parseInt(req.params.id, 10);
    if (isNaN(candidateId)) return res.status(400).json({ error: 'Invalid candidate ID' });

    const { note, callbackScheduledFor } = req.body;

    if (!note?.trim()) {
      return res.status(400).json({ error: 'note is required' });
    }

    // Limit note length
    if (note.length > 2000) {
      return res.status(400).json({ error: 'Note must be at most 2000 characters' });
    }

    try {
      const candidate = await prisma.candidate.findFirst({
        where: { id: candidateId, assignedToId: req.admin.id },
      });
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found or not assigned to you' });
      }

      const log = await prisma.communicationLog.create({
        data: {
          candidateId,
          authorId: req.admin.id,
          note: sanitizeString(note.trim(), 2000),
          callbackAt: callbackScheduledFor ? new Date(callbackScheduledFor) : null,
        },
        include: { author: { select: { id: true, name: true } } },
      });

      res.status(201).json({ success: true, log: serializeCandidateForSubAdmin(log) });
    } catch (err) {
      console.error('Sub-admin add note:', err.message);
      res.status(500).json({ error: 'Failed to add note' });
    }
  });

  router.get('/candidates/:id/notes', async (req, res) => {
    const candidateId = parseInt(req.params.id, 10);
    if (isNaN(candidateId)) return res.status(400).json({ error: 'Invalid candidate ID' });

    try {
      const candidate = await prisma.candidate.findFirst({
        where: { id: candidateId, assignedToId: req.admin.id },
      });
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found or not assigned to you' });
      }

      const logs = await prisma.communicationLog.findMany({
        where: { candidateId },
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, logs: logs.map(serializeCandidateForSubAdmin) });
    } catch (err) {
      console.error('Sub-admin fetch notes:', err.message);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  });

  router.get('/me/stats', async (req, res) => {
    try {
      const adminId = req.admin.id;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [addedThisWeek, verified, placed] = await Promise.all([
        prisma.candidate.count({
          where: { createdById: adminId, createdAt: { gte: weekAgo } },
        }),
        prisma.candidate.count({
          where: { createdById: adminId, status: 'VERIFIED' },
        }),
        prisma.candidate.count({
          where: { createdById: adminId, status: 'PLACED' },
        }),
      ]);

      res.json({ success: true, stats: { addedThisWeek, verified, placed } });
    } catch (err) {
      console.error('Sub-admin stats:', err.message);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  router.put('/candidates/:id', async (req, res) => {
    const candidateId = parseInt(req.params.id, 10);
    if (isNaN(candidateId)) return res.status(400).json({ error: 'Invalid candidate ID' });

    const body = {
      ...req.body,
      phoneNumber1: normalizePhone(req.body.phoneNumber1),
      phoneNumber2: req.body.phoneNumber2 ? normalizePhone(req.body.phoneNumber2) : null,
      familyPhonePrimary: req.body.familyPhonePrimary ? normalizePhone(req.body.familyPhonePrimary) : null,
      familyPhoneBackup: req.body.familyPhoneBackup ? normalizePhone(req.body.familyPhoneBackup) : null,
    };

    const validationErrors = validateCandidateInput(body);
    if (validationErrors.length) {
      return res.status(400).json({ error: validationErrors[0], errors: validationErrors });
    }

    try {
      const candidate = await prisma.candidate.findFirst({
        where: { id: candidateId, assignedToId: req.admin.id },
      });
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found or not assigned to you' });
      }

      // Check duplicates for phoneNumber1
      if (body.phoneNumber1 !== candidate.phoneNumber1) {
        const existing = await prisma.candidate.findUnique({ where: { phoneNumber1: body.phoneNumber1 } });
        if (existing) {
          return res.status(409).json({ error: 'A candidate with this phone number already exists' });
        }
      }

      // Track changes for Audit Log
      const diffs = [];
      const trackFields = [
        { key: 'fullName', label: 'Full Name' },
        { key: 'phoneNumber1', label: 'Phone' },
        { key: 'presentDistrict', label: 'Present District' },
        { key: 'permanentDistrict', label: 'Permanent District' },
        { key: 'expectedSalary', label: 'Expected Salary' },
      ];

      trackFields.forEach(({ key, label }) => {
        if (body[key] !== undefined && body[key] !== candidate[key]) {
          diffs.push(`${label} updated from "${candidate[key] || ''}" to "${body[key] || ''}"`);
        }
      });

      // Update candidate fields and associations
      const updated = await prisma.$transaction(async (tx) => {
        // Delete existing associated rows
        await tx.candidateEducation.deleteMany({ where: { candidateId } });
        await tx.candidateTechnical.deleteMany({ where: { candidateId } });
        await tx.candidateExperience.deleteMany({ where: { candidateId } });

        // Re-create new associated rows
        if (body.education?.length) {
          await tx.candidateEducation.createMany({
            data: body.education.map((item) => ({
              candidateId,
              institution: item.institution || '',
              course: item.course || '',
            })),
          });
        }
        if (body.technical?.length) {
          await tx.candidateTechnical.createMany({
            data: body.technical.map((item) => ({
              candidateId,
              institution: item.institution || '',
              course: item.course || '',
            })),
          });
        }
        if (body.experience?.length) {
          await tx.candidateExperience.createMany({
            data: body.experience.map((item) => ({
              candidateId,
              institution: item.institution || '',
              fromYear: String(item.fromYear || ''),
              toYear: String(item.toYear || ''),
            })),
          });
        }

        return tx.candidate.update({
          where: { id: candidateId },
          data: {
            fullName: sanitizeString(body.fullName, 100),
            phoneNumber1: body.phoneNumber1,
            phoneNumber2: body.phoneNumber2,
            dob: body.dob ? new Date(body.dob) : null,
            sex: body.sex,
            maritalStatus: body.maritalStatus,
            familyPhonePrimary: body.familyPhonePrimary,
            familyPhoneBackup: body.familyPhoneBackup,
            emailId: body.emailId,
            secondaryEmailId: body.secondaryEmailId,
            presentAddress: body.presentAddress ? sanitizeString(body.presentAddress, 500) : null,
            presentDistrict: body.presentDistrict,
            presentState: body.presentState,
            permanentAddress: body.permanentAddress ? sanitizeString(body.permanentAddress, 500) : null,
            permanentDistrict: body.permanentDistrict,
            permanentState: body.permanentState,
            preferredDistricts: body.preferredDistricts || [],
            expectedSalary: body.expectedSalary,
            jobRoles: body.jobRoles || [],
            languagesKnown: body.languagesKnown || [],
          },
        });
      });

      // Insert audit note in CommunicationLog if anything changed
      if (diffs.length > 0) {
        const auditLogMsg = `[Profile Edit] ${diffs.join(', ')} by sub-admin`;
        await prisma.communicationLog.create({
          data: {
            candidateId,
            authorId: req.admin.id,
            note: auditLogMsg,
          },
        });
      }

      res.json({ success: true, candidate: serializeCandidateForSubAdmin(updated) });
    } catch (err) {
      console.error('Sub-admin edit candidate:', err.message);
      res.status(500).json({ error: 'Failed to update candidate' });
    }
  });

  return router;
}
