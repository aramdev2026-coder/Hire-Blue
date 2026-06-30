import express from 'express';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';
import {
  enrichCandidateWithSourceLabel,
} from '../utils/serializers.js';
import { sanitizeString } from '../utils/validation.js';
import {
  updateCandidateStatus,
  assignCandidates,
  buildCandidateFilters,
  findDuplicatePhones,
} from '../services/candidateService.js';

export default function createAdminRoutes(prisma) {
  const router = express.Router();
  router.use(authenticateAdmin, requireRole(['ADMIN', 'SUPER_ADMIN']));

  async function getAdminMap() {
    const admins = await prisma.admin.findMany({ select: { id: true, name: true, role: true } });
    return Object.fromEntries(admins.map((a) => [a.id, a]));
  }

  router.get('/employers', async (req, res) => {
    try {
      const { status } = req.query;
      const filters = status ? { status } : {};
      const employers = await prisma.employer.findMany({
        where: filters,
        include: { jobs: true, approvedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, employers });
    } catch (err) {
      console.error('Fetch employers:', err.message);
      res.status(500).json({ error: 'Failed to fetch employers' });
    }
  });

  router.put('/employers/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['PENDING_VERIFICATION', 'ACTIVE', 'REJECTED', 'SUSPENDED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    try {
      const data = { status };
      if (status === 'ACTIVE') {
        data.approvedById = req.admin.id;
        data.approvedAt = new Date();
      }
      const employer = await prisma.employer.update({ where: { id }, data });
      res.json({ success: true, employer });
    } catch (err) {
      console.error('Update employer:', err.message);
      res.status(500).json({ error: 'Failed to update employer' });
    }
  });

  router.get('/candidates', async (req, res) => {
    try {
      const filters = buildCandidateFilters(req.query);
      let candidates = await prisma.candidate.findMany({
        where: filters,
        include: {
          education: true,
          technical: true,
          experience: true,
          createdBy: { select: { id: true, name: true, role: true } },
          assignedTo: { select: { id: true, name: true } },
          shortlistedJob: { include: { employer: { select: { id: true, companyName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const { search } = req.query;
      if (search) {
        const q = search.toLowerCase();
        candidates = candidates.filter((c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.phoneNumber1?.includes(search) ||
          String(c.id).includes(search),
        );
      }

      const adminMap = await getAdminMap();
      res.json({
        success: true,
        candidates: candidates.map((c) => enrichCandidateWithSourceLabel(c, adminMap)),
      });
    } catch (err) {
      console.error('Fetch candidates:', err.message);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  });

  router.get('/candidates/duplicates', async (req, res) => {
    try {
      const duplicates = await findDuplicatePhones(prisma);
      res.json({ success: true, duplicates });
    } catch (err) {
      console.error('Duplicate detection:', err.message);
      res.status(500).json({ error: 'Failed to detect duplicates' });
    }
  });

  router.post('/candidates/assign', async (req, res) => {
    const { candidateIds, subAdminId, subAdminIds, strategy } = req.body;

    // Validate candidateIds are integers
    if (!Array.isArray(candidateIds) || candidateIds.some(id => typeof id !== 'number' || !Number.isInteger(id))) {
      return res.status(400).json({ error: 'candidateIds must be an array of integers' });
    }

    try {
      const result = await assignCandidates(prisma, {
        candidateIds,
        subAdminId,
        subAdminIds,
        strategy,
        assignedById: req.admin.id,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      const code = err.statusCode || 500;
      if (code >= 500) console.error('Assign candidates:', err.message);
      res.status(code).json({ error: err.message || 'Failed to assign candidates' });
    }
  });

  router.get('/candidates/:id', async (req, res) => {
    try {
      const candidateId = parseInt(req.params.id, 10);
      if (isNaN(candidateId)) return res.status(400).json({ error: 'Invalid candidate ID' });

      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          education: true,
          technical: true,
          experience: true,
          createdBy: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
          shortlistedJob: { include: { employer: true } },
        },
      });
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
      const adminMap = await getAdminMap();
      res.json({ success: true, candidate: enrichCandidateWithSourceLabel(candidate, adminMap) });
    } catch (err) {
      console.error('Fetch candidate:', err.message);
      res.status(500).json({ error: 'Failed to fetch candidate' });
    }
  });

  router.post('/candidates', async (req, res) => {
    const {
      fullName, phoneNumber1, phoneNumber2, presentDistrict, jobRoles,
      expectedSalary, preferredDistricts, languagesKnown,
    } = req.body;

    if (!fullName || !phoneNumber1) {
      return res.status(400).json({ error: 'fullName and phoneNumber1 are required' });
    }

    try {
      const existing = await prisma.candidate.findUnique({ where: { phoneNumber1 } });
      if (existing) {
        return res.status(409).json({ error: 'A candidate with this phone number already exists' });
      }

      const source = req.admin.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
      const candidate = await prisma.candidate.create({
        data: {
          fullName: sanitizeString(fullName, 100),
          phoneNumber1,
          phoneNumber2: phoneNumber2 || null,
          presentDistrict: presentDistrict ? sanitizeString(presentDistrict, 50) : null,
          jobRoles: Array.isArray(jobRoles) ? jobRoles : [],
          preferredDistricts: Array.isArray(preferredDistricts) ? preferredDistricts : [],
          expectedSalary: expectedSalary ? sanitizeString(expectedSalary, 50) : null,
          languagesKnown: Array.isArray(languagesKnown) ? languagesKnown : [],
          status: 'NEW',
          source,
          createdById: req.admin.id,
        },
      });

      await prisma.statusHistory.create({
        data: {
          candidateId: candidate.id,
          fromStatus: null,
          toStatus: 'NEW',
          changedById: req.admin.id,
        },
      });

      res.status(201).json({ success: true, candidate });
    } catch (err) {
      console.error('Admin create candidate:', err.message);
      res.status(500).json({ error: 'Failed to create candidate' });
    }
  });

  router.put('/candidates/:id/status', async (req, res) => {
    const candidateId = parseInt(req.params.id, 10);
    if (isNaN(candidateId)) return res.status(400).json({ error: 'Invalid candidate ID' });

    const { status, shortlistedJobId, note } = req.body;

    try {
      const updated = await updateCandidateStatus(prisma, {
        candidateId,
        status,
        shortlistedJobId,
        changedById: req.admin.id,
        note,
      });
      res.json({ success: true, candidate: updated });
    } catch (err) {
      const code = err.statusCode || 500;
      if (code >= 500) console.error('Admin status update:', err.message);
      res.status(code).json({ error: err.message || 'Failed to update status' });
    }
  });

  router.get('/sub-admins', async (req, res) => {
    try {
      const subAdmins = await prisma.admin.findMany({
        where: { role: 'SUB_ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          region: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      });

      const enriched = await Promise.all(
        subAdmins.map(async (sa) => {
          const [assignedCount, addedCount, placedCount] = await Promise.all([
            prisma.candidate.count({ where: { assignedToId: sa.id, status: { notIn: ['PLACED', 'INACTIVE', 'BLACKLISTED'] } } }),
            prisma.candidate.count({ where: { createdById: sa.id } }),
            prisma.candidate.count({ where: { createdById: sa.id, status: 'PLACED' } }),
          ]);
          return { ...sa, assignedCount, addedCount, placedCount };
        }),
      );

      res.json({ success: true, subAdmins: enriched });
    } catch (err) {
      console.error('List sub-admins:', err.message);
      res.status(500).json({ error: 'Failed to fetch sub-admins' });
    }
  });

  router.get('/jobs', async (req, res) => {
    try {
      const { location, employerId, district, role } = req.query;
      const filters = { isActive: true };
      if (location || district) filters.location = { has: location || district };
      if (employerId) filters.employerId = employerId;
      if (role) filters.roleTitle = role;

      const jobs = await prisma.jobRequirement.findMany({
        where: filters,
        include: { employer: { select: { id: true, companyName: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const jobsWithEmployerName = jobs.map((j) => ({
        ...j,
        employerName: j.employer?.companyName,
      }));

      res.json({ success: true, jobs: jobsWithEmployerName });
    } catch (err) {
      console.error('Fetch jobs:', err.message);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  router.get('/employers/:id/jobs', async (req, res) => {
    try {
      const employer = await prisma.employer.findUnique({
        where: { id: req.params.id },
        include: { jobs: true },
      });
      if (!employer) return res.status(404).json({ error: 'Employer not found' });
      res.json({ success: true, employer, jobs: employer.jobs });
    } catch (err) {
      console.error('Fetch employer jobs:', err.message);
      res.status(500).json({ error: 'Failed to fetch employer jobs' });
    }
  });

  router.get('/jobs/:id/matches', async (req, res) => {
    try {
      const job = await prisma.jobRequirement.findUnique({
        where: { id: req.params.id },
        include: { employer: { select: { companyName: true } } },
      });
      if (!job) return res.status(404).json({ error: 'Job not found' });

      const candidates = await prisma.candidate.findMany({
        where: {
          status: { in: ['PENDING_ADMIN_CALL', 'PENDING_WIZARD', 'VERIFIED', 'NEW'] },
          jobRoles: { hasSome: [job.roleTitle] },
          OR: [
            { preferredDistricts: { hasSome: job.location?.length ? job.location : [] } },
            { preferredDistricts: { has: 'All Locations' } },
            { preferredDistricts: { isEmpty: true } },
          ],
        },
        include: { experience: true },
      });

      res.json({ success: true, job, matches: candidates });
    } catch (err) {
      console.error('Fetch job matches:', err.message);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  });

  router.get('/notifications', async (req, res) => {
    try {
      const [pendingEmployers, subAdmins, agingCandidates] = await Promise.all([
        prisma.employer.count({ where: { status: 'PENDING_VERIFICATION' } }),
        prisma.admin.findMany({
          where: { role: 'SUB_ADMIN', isActive: true },
          select: { id: true, name: true },
        }),
        prisma.candidate.count({
          where: {
            status: { notIn: ['PLACED', 'INACTIVE', 'BLACKLISTED', 'REJECTED_BY_EMPLOYER'] },
            updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

      const emptyQueues = [];
      for (const sa of subAdmins) {
        const count = await prisma.candidate.count({
          where: {
            assignedToId: sa.id,
            status: { notIn: ['PLACED', 'INACTIVE', 'BLACKLISTED'] },
          },
        });
        if (count === 0) emptyQueues.push(sa);
      }

      res.json({
        success: true,
        notifications: {
          pendingEmployerApprovals: pendingEmployers,
          emptySubAdminQueues: emptyQueues,
          agingCandidates,
        },
      });
    } catch (err) {
      console.error('Notifications:', err.message);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  return router;
}
