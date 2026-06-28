import express from 'express';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';
import { hashPassword } from '../utils/password.js';
import { serializeAdminUser } from '../utils/serializers.js';
import { validateAdminAccountInput, normalizePhone, isValidEmail, isValidPhone, isValidDistrict } from '../utils/validation.js';

export default function createSuperAdminRoutes(prisma) {
  const router = express.Router();
  router.use(authenticateAdmin, requireRole(['SUPER_ADMIN']));

  router.get('/admins', async (req, res) => {
    try {
      const admins = await prisma.admin.findMany({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      });

      const enriched = await Promise.all(
        admins.map(async (a) => {
          const [approvals, subAdminCount] = await Promise.all([
            prisma.employer.count({ where: { approvedById: a.id } }),
            prisma.admin.count({ where: { createdById: a.id, role: 'SUB_ADMIN' } }),
          ]);
          return { ...a, employerApprovals: approvals, subAdminsManaged: subAdminCount };
        }),
      );

      res.json({ success: true, admins: enriched });
    } catch (err) {
      console.error('List admins:', err.message);
      res.status(500).json({ error: 'Failed to fetch admins' });
    }
  });

  router.post('/admins', async (req, res) => {
    const { name, email, phone, password } = req.body;
    const validationErrors = validateAdminAccountInput({ name, email, phone, password });
    if (validationErrors.length) {
      return res.status(400).json({ error: validationErrors[0], errors: validationErrors });
    }

    try {
      const existing = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const hashed = await hashPassword(password);
      const admin = await prisma.admin.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() ? normalizePhone(phone) : null,
          password: hashed,
          role: 'ADMIN',
          createdById: req.admin.id,
          isActive: true,
        },
      });

      res.status(201).json({ success: true, admin: serializeAdminUser(admin) });
    } catch (err) {
      console.error('Create admin:', err.message);
      res.status(500).json({ error: 'Failed to create admin' });
    }
  });

  router.put('/admins/:id/deactivate', async (req, res) => {
    try {
      const admin = await prisma.admin.update({
        where: { id: req.params.id, role: 'ADMIN' },
        data: { isActive: false },
      });
      res.json({ success: true, admin: serializeAdminUser(admin) });
    } catch (err) {
      console.error('Deactivate admin:', err.message);
      res.status(500).json({ error: 'Failed to deactivate admin' });
    }
  });

  router.post('/sub-admins', async (req, res) => {
    const { name, email, phone, password, region } = req.body;
    const validationErrors = validateAdminAccountInput(
      { name, email, phone, password, region },
      { requireRegion: true },
    );
    if (validationErrors.length) {
      return res.status(400).json({ error: validationErrors[0], errors: validationErrors });
    }

    try {
      const existing = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const hashed = await hashPassword(password);
      const subAdmin = await prisma.admin.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() ? normalizePhone(phone) : null,
          password: hashed,
          role: 'SUB_ADMIN',
          region: region.trim(),
          createdById: req.admin.id,
          isActive: true,
        },
      });

      res.status(201).json({ success: true, subAdmin: serializeAdminUser(subAdmin) });
    } catch (err) {
      console.error('Create sub-admin:', err.message);
      res.status(500).json({ error: 'Failed to create sub-admin' });
    }
  });

  router.put('/sub-admins/:id', async (req, res) => {
    const { name, email, phone, region } = req.body;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (phone?.trim() && !isValidPhone(phone)) {
      return res.status(400).json({ error: 'Phone must be a valid 10-digit Indian mobile number' });
    }
    if (region && !isValidDistrict(region)) {
      return res.status(400).json({ error: 'Invalid district selected' });
    }

    try {
      const subAdmin = await prisma.admin.update({
        where: { id: req.params.id, role: 'SUB_ADMIN' },
        data: {
          ...(name && { name: name.trim() }),
          ...(email && { email: email.trim().toLowerCase() }),
          ...(phone !== undefined && { phone: phone?.trim() ? normalizePhone(phone) : null }),
          ...(region !== undefined && { region: region?.trim() || null }),
        },
      });
      res.json({ success: true, subAdmin: serializeAdminUser(subAdmin) });
    } catch (err) {
      console.error('Update sub-admin:', err.message);
      res.status(500).json({ error: 'Failed to update sub-admin' });
    }
  });

  router.put('/sub-admins/:id/deactivate', async (req, res) => {
    const { reassignOpenCandidatesTo } = req.body;
    const subAdminId = req.params.id;

    try {
      const openCandidates = await prisma.candidate.findMany({
        where: {
          assignedToId: subAdminId,
          status: { notIn: ['PLACED', 'INACTIVE', 'BLACKLISTED'] },
        },
        select: { id: true },
      });

      if (openCandidates.length > 0) {
        if (!reassignOpenCandidatesTo) {
          return res.status(400).json({
            error: 'reassignOpenCandidatesTo is required when sub-admin has open candidates',
            openCandidateCount: openCandidates.length,
          });
        }

        const replacement = await prisma.admin.findFirst({
          where: { id: reassignOpenCandidatesTo, role: 'SUB_ADMIN', isActive: true },
        });
        if (!replacement) {
          return res.status(400).json({ error: 'Replacement sub-admin is invalid or inactive' });
        }

        const ops = openCandidates.flatMap((c) => [
          prisma.candidate.update({
            where: { id: c.id },
            data: { assignedToId: reassignOpenCandidatesTo },
          }),
          prisma.assignmentLog.create({
            data: {
              candidateId: c.id,
              assignedToId: reassignOpenCandidatesTo,
              assignedById: req.admin.id,
            },
          }),
        ]);
        await prisma.$transaction([
          ...ops,
          prisma.admin.update({ where: { id: subAdminId }, data: { isActive: false } }),
        ]);
      } else {
        await prisma.admin.update({ where: { id: subAdminId }, data: { isActive: false } });
      }

      res.json({ success: true, reassigned: openCandidates.length });
    } catch (err) {
      console.error('Deactivate sub-admin:', err.message);
      res.status(500).json({ error: 'Failed to deactivate sub-admin' });
    }
  });

  // --- Analytics ---

  router.get('/analytics/funnel', async (req, res) => {
    try {
      const statuses = await prisma.candidate.groupBy({
        by: ['status'],
        _count: { id: true },
      });
      res.json({ success: true, funnel: statuses.map((s) => ({ status: s.status, count: s._count.id })) });
    } catch (err) {
      console.error('Analytics funnel:', err.message);
      res.status(500).json({ error: 'Failed to fetch funnel data' });
    }
  });

  router.get('/analytics/source-breakdown', async (req, res) => {
    try {
      const sources = await prisma.candidate.groupBy({
        by: ['source'],
        _count: { id: true },
      });
      res.json({ success: true, breakdown: sources.map((s) => ({ source: s.source, count: s._count.id })) });
    } catch (err) {
      console.error('Analytics source:', err.message);
      res.status(500).json({ error: 'Failed to fetch source breakdown' });
    }
  });

  router.get('/analytics/district-demand', async (req, res) => {
    try {
      const candidates = await prisma.candidate.findMany({
        select: { presentDistrict: true },
        where: { presentDistrict: { not: null } },
      });
      const jobs = await prisma.jobRequirement.findMany({
        where: { isActive: true },
        select: { location: true },
      });

      const supply = {};
      for (const c of candidates) {
        supply[c.presentDistrict] = (supply[c.presentDistrict] || 0) + 1;
      }
      const demand = {};
      for (const j of jobs) {
        for (const loc of j.location || []) {
          demand[loc] = (demand[loc] || 0) + 1;
        }
      }

      const districts = [...new Set([...Object.keys(supply), ...Object.keys(demand)])].sort();
      res.json({
        success: true,
        districts: districts.map((d) => ({ district: d, supply: supply[d] || 0, demand: demand[d] || 0 })),
      });
    } catch (err) {
      console.error('Analytics district:', err.message);
      res.status(500).json({ error: 'Failed to fetch district data' });
    }
  });

  router.get('/analytics/sub-admin-leaderboard', async (req, res) => {
    try {
      const subAdmins = await prisma.admin.findMany({
        where: { role: 'SUB_ADMIN', isActive: true },
        select: { id: true, name: true },
      });

      const leaderboard = await Promise.all(
        subAdmins.map(async (sa) => {
          const [verified, placed] = await Promise.all([
            prisma.candidate.count({ where: { createdById: sa.id, status: 'VERIFIED' } }),
            prisma.candidate.count({ where: { createdById: sa.id, status: 'PLACED' } }),
          ]);
          return { id: sa.id, name: sa.name, verified, placed };
        }),
      );

      leaderboard.sort((a, b) => b.placed - a.placed || b.verified - a.verified);
      res.json({ success: true, leaderboard });
    } catch (err) {
      console.error('Analytics leaderboard:', err.message);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  router.get('/analytics/time-to-placement', async (req, res) => {
    try {
      const placed = await prisma.candidate.findMany({
        where: { status: 'PLACED' },
        select: { source: true, createdAt: true, updatedAt: true },
      });

      const bySource = {};
      for (const c of placed) {
        const days = Math.round((c.updatedAt - c.createdAt) / (1000 * 60 * 60 * 24));
        if (!bySource[c.source]) bySource[c.source] = [];
        bySource[c.source].push(days);
      }

      const result = Object.entries(bySource).map(([source, daysList]) => ({
        source,
        avgDays: daysList.length ? Math.round(daysList.reduce((a, b) => a + b, 0) / daysList.length) : 0,
        count: daysList.length,
      }));

      res.json({ success: true, timeToPlacement: result });
    } catch (err) {
      console.error('Analytics time-to-placement:', err.message);
      res.status(500).json({ error: 'Failed to fetch time-to-placement' });
    }
  });

  router.get('/analytics/aging', async (req, res) => {
    try {
      const thresholdDays = parseInt(req.query.days || '7', 10);
      const cutoff = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

      const candidates = await prisma.candidate.findMany({
        where: {
          status: { notIn: ['PLACED', 'INACTIVE', 'BLACKLISTED', 'REJECTED_BY_EMPLOYER'] },
          updatedAt: { lt: cutoff },
        },
        select: {
          id: true,
          fullName: true,
          status: true,
          updatedAt: true,
          assignedTo: { select: { id: true, name: true } },
        },
      });

      const bySubAdmin = {};
      for (const c of candidates) {
        const key = c.assignedTo?.name || 'Unassigned';
        if (!bySubAdmin[key]) bySubAdmin[key] = [];
        const idleDays = Math.round((Date.now() - c.updatedAt) / (1000 * 60 * 60 * 24));
        bySubAdmin[key].push({ ...c, idleDays });
      }

      res.json({ success: true, aging: bySubAdmin, thresholdDays });
    } catch (err) {
      console.error('Analytics aging:', err.message);
      res.status(500).json({ error: 'Failed to fetch aging data' });
    }
  });

  router.get('/analytics/placement-rate', async (req, res) => {
    try {
      const totals = await prisma.candidate.groupBy({
        by: ['source'],
        _count: { id: true },
      });
      const placed = await prisma.candidate.groupBy({
        by: ['source'],
        where: { status: 'PLACED' },
        _count: { id: true },
      });
      const placedMap = Object.fromEntries(placed.map((p) => [p.source, p._count.id]));

      res.json({
        success: true,
        rates: totals.map((t) => ({
          source: t.source,
          total: t._count.id,
          placed: placedMap[t.source] || 0,
          rate: t._count.id ? ((placedMap[t.source] || 0) / t._count.id * 100).toFixed(1) : 0,
        })),
      });
    } catch (err) {
      console.error('Analytics placement rate:', err.message);
      res.status(500).json({ error: 'Failed to fetch placement rate' });
    }
  });

  router.get('/analytics/employer-trend', async (req, res) => {
    try {
      const employers = await prisma.employer.findMany({
        select: { createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
      });

      const byWeek = {};
      for (const e of employers) {
        const week = e.createdAt.toISOString().slice(0, 10);
        if (!byWeek[week]) byWeek[week] = { new: 0, active: 0 };
        byWeek[week].new += 1;
        if (e.status === 'ACTIVE') byWeek[week].active += 1;
      }

      res.json({
        success: true,
        trend: Object.entries(byWeek).map(([week, data]) => ({ week, ...data })),
      });
    } catch (err) {
      console.error('Analytics employer trend:', err.message);
      res.status(500).json({ error: 'Failed to fetch employer trend' });
    }
  });

  router.get('/analytics/activity-calendar', async (req, res) => {
    try {
      const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const [statusChanges, assignments] = await Promise.all([
        prisma.statusHistory.findMany({
          where: { changedAt: { gte: since } },
          select: { changedAt: true, changedById: true, changedBy: { select: { name: true } } },
        }),
        prisma.assignmentLog.findMany({
          where: { assignedAt: { gte: since } },
          select: { assignedAt: true, assignedById: true, assignedBy: { select: { name: true } } },
        }),
      ]);

      const calendar = {};
      for (const s of statusChanges) {
        const day = s.changedAt.toISOString().slice(0, 10);
        const actor = s.changedBy?.name || s.changedById;
        calendar[`${day}:${actor}`] = (calendar[`${day}:${actor}`] || 0) + 1;
      }
      for (const a of assignments) {
        const day = a.assignedAt.toISOString().slice(0, 10);
        const actor = a.assignedBy?.name || a.assignedById;
        calendar[`${day}:${actor}`] = (calendar[`${day}:${actor}`] || 0) + 1;
      }

      res.json({
        success: true,
        activity: Object.entries(calendar).map(([key, count]) => {
          const [date, actor] = key.split(':');
          return { date, actor, count };
        }),
      });
    } catch (err) {
      console.error('Analytics activity:', err.message);
      res.status(500).json({ error: 'Failed to fetch activity calendar' });
    }
  });

  return router;
}
