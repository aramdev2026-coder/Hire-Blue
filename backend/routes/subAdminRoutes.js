import express from 'express';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';
import { serializeCandidateForSubAdmin } from '../utils/serializers.js';
import { updateCandidateStatus, SUB_ADMIN_FORBIDDEN } from '../services/candidateService.js';
import { createFullCandidate } from '../services/createCandidate.js';
import { validateCandidateInput, normalizePhone } from '../utils/validation.js';

export default function createSubAdminRoutes(prisma) {
  const router = express.Router();
  router.use(authenticateAdmin, requireRole(['SUB_ADMIN']));

  router.get('/candidates', async (req, res) => {
    try {
      const { status, search } = req.query;
      const filters = { assignedToId: req.admin.id };

      if (status) filters.status = status;

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
          c.id?.includes(search),
        );
      }

      res.json({
        success: true,
        candidates: candidates.map(serializeCandidateForSubAdmin),
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
    const { id } = req.params;
    const { status, note } = req.body;

    try {
      const candidate = await prisma.candidate.findFirst({
        where: { id, assignedToId: req.admin.id },
      });
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found or not assigned to you' });
      }

      const updated = await updateCandidateStatus(prisma, {
        candidateId: id,
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
    const { id } = req.params;
    const { note, callbackScheduledFor } = req.body;

    if (!note?.trim()) {
      return res.status(400).json({ error: 'note is required' });
    }

    try {
      const candidate = await prisma.candidate.findFirst({
        where: { id, assignedToId: req.admin.id },
      });
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found or not assigned to you' });
      }

      const log = await prisma.communicationLog.create({
        data: {
          candidateId: id,
          authorId: req.admin.id,
          note: note.trim(),
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
    const { id } = req.params;
    try {
      const candidate = await prisma.candidate.findFirst({
        where: { id, assignedToId: req.admin.id },
      });
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found or not assigned to you' });
      }

      const logs = await prisma.communicationLog.findMany({
        where: { candidateId: id },
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

  return router;
}
