import express from 'express';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';
import {
  enrichCandidateWithSourceLabel,
} from '../utils/serializers.js';
import { sanitizeString, validateCandidateInput, normalizePhone } from '../utils/validation.js';
import { hashPassword } from '../utils/password.js';
import {
  updateCandidateStatus,
  assignCandidates,
  buildCandidateFilters,
  findDuplicatePhones,
} from '../services/candidateService.js';
import { createFullCandidate } from '../services/createCandidate.js';

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

  router.post('/employers', async (req, res) => {
    try {
      const { companyName, phoneNumber, email, password, status = 'ACTIVE' } = req.body;

      if (!companyName?.trim()) {
        return res.status(400).json({ error: 'Company Name is required' });
      }
      if (!phoneNumber?.trim()) {
        return res.status(400).json({ error: 'Phone Number is required' });
      }

      const normalizedPhone = String(phoneNumber).replace(/\D/g, '').slice(-10);
      if (normalizedPhone.length !== 10) {
        return res.status(400).json({ error: 'Phone number must be a valid 10-digit number' });
      }

      // Generate a unique placeholder email if optional email is not specified
      const normalizedEmail = email?.trim()
        ? email.trim().toLowerCase()
        : `employer-${normalizedPhone}@aramftc.com`;

      // Check duplicates
      const existing = await prisma.employer.findFirst({
        where: { OR: [{ email: normalizedEmail }, { phoneNumber: normalizedPhone }] }
      });
      if (existing) {
        return res.status(409).json({ error: 'Email or Phone Number is already registered.' });
      }

      const pwd = password?.trim() || 'Aram@12345';
      const hashedPassword = await hashPassword(pwd);

      const created = await prisma.employer.create({
        data: {
          companyName: sanitizeString(companyName, 200),
          email: normalizedEmail,
          phoneNumber: normalizedPhone,
          password: hashedPassword,
          status: status || 'ACTIVE',
          approvedById: status === 'ACTIVE' ? req.admin.id : null,
          approvedAt: status === 'ACTIVE' ? new Date() : null,
        }
      });

      res.status(201).json({ success: true, employer: created });
    } catch (err) {
      console.error('Create employer:', err.message);
      res.status(500).json({ error: 'Failed to create employer account: ' + err.message });
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

      // Calculate status counts on matching district/role/search (ignoring status filter)
      const countFilters = buildCandidateFilters({ ...req.query, status: undefined });
      const countsRaw = await prisma.candidate.groupBy({
        by: ['status'],
        _count: { id: true },
        where: countFilters,
      });
      const statusCounts = Object.fromEntries(
        countsRaw.map(item => [item.status, item._count.id])
      );

      const adminMap = await getAdminMap();
      res.json({
        success: true,
        candidates: candidates.map((c) => enrichCandidateWithSourceLabel(c, adminMap)),
        statusCounts,
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

      const source = req.admin.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
      const candidate = await createFullCandidate(
        prisma,
        {
          ...body,
          source,
          createdById: req.admin.id,
          assignedToId: body.assignedToId || null,
          status: 'NEW',
        },
        { changedById: req.admin.id },
      );

      const adminMap = await getAdminMap();
      res.status(201).json({ success: true, candidate: enrichCandidateWithSourceLabel(candidate, adminMap) });
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
            prisma.candidate.count({ where: { assignedToId: sa.id, status: { notIn: ['PLACED', 'INACTIVE', 'BLACKLISTED', 'PENDING_WIZARD'] } } }),
            prisma.candidate.count({ where: { createdById: sa.id, status: { not: 'PENDING_WIZARD' } } }),
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
      if (req.params.id === 'all') {
        const jobs = await prisma.jobRequirement.findMany({
          include: { employer: { select: { companyName: true } } },
        });
        const roles = [...new Set(jobs.map(j => j.roleTitle).filter(Boolean))];
        const locations = [...new Set(jobs.flatMap(j => j.location || []).filter(Boolean))];

        const candidates = await prisma.candidate.findMany({
          where: {
            status: { in: ['PENDING_ADMIN_CALL', 'VERIFIED', 'NEW'] },
            jobRoles: { hasSome: roles },
            OR: [
              { preferredDistricts: { hasSome: locations } },
              { preferredDistricts: { has: 'All Locations' } },
              { preferredDistricts: { isEmpty: true } },
            ],
          },
          include: { experience: true },
        });

        return res.json({
          success: true,
          job: { id: 'all', roleTitle: 'All Roles', employer: { companyName: 'All Companies' } },
          matches: candidates
        });
      }

      const job = await prisma.jobRequirement.findUnique({
        where: { id: req.params.id },
        include: { employer: { select: { companyName: true } } },
      });
      if (!job) return res.status(404).json({ error: 'Job not found' });

      const candidates = await prisma.candidate.findMany({
        where: {
          status: { in: ['PENDING_ADMIN_CALL', 'VERIFIED', 'NEW'] },
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
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
      });
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
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
        const auditLogMsg = `[Profile Edit] ${diffs.join(', ')} by admin`;
        await prisma.communicationLog.create({
          data: {
            candidateId,
            authorId: req.admin.id,
            note: auditLogMsg,
          },
        });
      }

      const adminMap = await getAdminMap();
      res.json({ success: true, candidate: enrichCandidateWithSourceLabel(updated, adminMap) });
    } catch (err) {
      console.error('Admin edit candidate:', err.message);
      res.status(500).json({ error: 'Failed to update candidate' });
    }
  });

  router.post('/jobs', async (req, res) => {
    try {
      const { employerId, roleTitle, salaryRange, location, maritalStatus, educationLevel, expRequired } = req.body;

      if (!employerId) {
        return res.status(400).json({ error: 'Employer ID is required' });
      }
      if (!roleTitle?.trim()) {
        return res.status(400).json({ error: 'Role Title is required' });
      }

      // Verify employer exists
      const employer = await prisma.employer.findUnique({ where: { id: employerId } });
      if (!employer) {
        return res.status(404).json({ error: 'Employer not found' });
      }

      const job = await prisma.jobRequirement.create({
        data: {
          employerId,
          roleTitle: sanitizeString(roleTitle, 200),
          salaryRange: sanitizeString(salaryRange, 100),
          location: Array.isArray(location) ? location.map(l => sanitizeString(l, 100)) : [],
          maritalStatus: sanitizeString(maritalStatus, 50),
          educationLevel: sanitizeString(educationLevel, 200),
          expRequired: typeof expRequired === 'number' ? expRequired : 0,
          isActive: true
        }
      });

      res.status(201).json({ success: true, job });
    } catch (err) {
      console.error('Create job requirement by admin:', err.message);
      res.status(500).json({ error: 'Failed to create job requirement: ' + err.message });
    }
  });

  return router;
}
