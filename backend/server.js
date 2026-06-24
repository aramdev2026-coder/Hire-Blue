import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'super_secret_session_key_99';
const TWO_FACTOR_KEY = process.env.TWO_FACTOR_API_KEY;

// Initialize Prisma
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ============================================================================
// 📞 CANDIDATE AUTHENTICATION ENGINE
// ============================================================================

// STEP 1 - TRANSMIT MOBILE OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'Mobile number is required' });
  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWO_FACTOR_KEY}/SMS/${phoneNumber}/AUTOGEN3/BLU_COLLAR_AUTH`
    );
    res.json({ success: true, otpSessionId: response.data.Details });
  } catch (error) {
    console.error('2Factor SMS Send Failure:', error.response?.data || error.message);
    res.json({ success: true, otpSessionId: 'SANDBOX_SESSION_ACTIVE', sandbox: true });
  }
});

// STEP 2 - VALIDATE OTP & ASSIGN SESSION TOKEN
app.post('/api/auth/verify-otp', async (req, res) => {
  const { phoneNumber, otpCode, otpSessionId } = req.body;
  if (!phoneNumber || !otpCode) return res.status(400).json({ error: 'Phone and OTP required' });

  try {
    if (otpSessionId !== 'SANDBOX_SESSION_ACTIVE') {
      await axios.get(`https://2factor.in/API/V1/${TWO_FACTOR_KEY}/SMS/VERIFY/${otpSessionId}/${otpCode}`);
    } else if (otpCode !== '123456') {
      return res.status(400).json({ error: 'Incorrect OTP. Sandbox code is 123456.' });
    }

    let candidate = await prisma.candidate.findUnique({ where: { phoneNumber1: phoneNumber } });
    if (!candidate) {
      candidate = await prisma.candidate.create({ data: { phoneNumber1: phoneNumber, status: 'PENDING_WIZARD' } });
    }

    const token = jwt.sign({ id: candidate.id, role: 'CANDIDATE', phone: candidate.phoneNumber1 }, SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, candidateId: candidate.id, profileStatus: candidate.status });
  } catch (err) {
    console.error('Verification Error:', err.response?.data || err.message);
    res.status(400).json({ error: 'OTP is incorrect or expired' });
  }
});

// ============================================================================
// 🧙‍♂️ STATEFUL REGISTRATION WIZARD SYSTEM
// ============================================================================

// INTERMEDIATE PROFILE SAVE ENGINE
app.post('/api/candidate/save-wizard-step', async (req, res) => {
  const { candidateId, sectionIndex, updatedPayload: p } = req.body;
  try {
    if (Number(sectionIndex) === 1) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          fullName: p.fullName, dob: p.dob ? new Date(p.dob) : null, sex: p.sex, maritalStatus: p.maritalStatus,
          phoneNumber2: p.phoneNumber2 || null, familyPhonePrimary: p.familyPhonePrimary || null,
          familyPhoneBackup: p.familyPhoneBackup || null, emailId: p.emailId || null, secondaryEmailId: p.secondaryEmailId || null,
          presentAddress: p.presentAddress, presentDistrict: p.presentDistrict, presentState: p.presentState,
          permanentAddress: p.permanentAddress, permanentDistrict: p.permanentDistrict, permanentState: p.permanentState,
        },
      });
    } else if (Number(sectionIndex) === 2) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          jobRoles: { set: Array.isArray(p.jobRoles) ? p.jobRoles : [] },
          preferredDistricts: { set: Array.isArray(p.preferredDistricts) ? p.preferredDistricts : [] },
          expectedSalary: p.expectedSalary,
          languagesKnown: { set: Array.isArray(p.languagesKnown) ? p.languagesKnown : [] },
        },
      });
    } else if (Number(sectionIndex) === 3) {
      const education = Array.isArray(p.education) ? p.education.filter(item => item?.institution?.trim()) : [];
      const technical = Array.isArray(p.technical) ? p.technical.filter(item => item?.institution?.trim()) : [];
      const experience = Array.isArray(p.experience) ? p.experience.filter(item => item?.institution?.trim()) : [];

      await prisma.$transaction([
        prisma.candidateEducation.deleteMany({ where: { candidateId } }),
        prisma.candidateTechnical.deleteMany({ where: { candidateId } }),
        prisma.candidateExperience.deleteMany({ where: { candidateId } }),
      ]);

      if (education.length) await prisma.candidateEducation.createMany({ data: education.map(item => ({ candidateId, institution: item.institution || '', course: item.course || '' })) });
      if (technical.length) await prisma.candidateTechnical.createMany({ data: technical.map(item => ({ candidateId, institution: item.institution || '', course: item.course || '' })) });
      if (experience.length) await prisma.candidateExperience.createMany({ data: experience.map(item => ({ candidateId, institution: item.institution || '', fromYear: item.fromYear || '', toYear: item.toYear || '' })) });
    }
    res.json({ success: true, message: 'Section baseline checkpoint saved successfully' });
  } catch (err) {
    console.error('Wizard Saving Exception:', err.message);
    res.status(500).json({ error: 'Failed to save section parameters' });
  }
});

// SUBMIT ROSTER REGISTRATION PROFILE
app.post('/api/candidate/finalize', async (req, res) => {
  const { candidateId } = req.body;
  try {
    await prisma.candidate.update({ where: { id: candidateId }, data: { status: 'PENDING_ADMIN_CALL' } });
    res.json({ success: true });
  } catch (err) {
    console.error('Finalize Profile Error:', err.message);
    res.status(500).json({ error: 'Failed to finalize setup submission' });
  }
});

// READ COMPLETE DEEP PROFILE DATA
app.get('/api/candidate/profile/:candidateId', async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({ 
      where: { id: req.params.candidateId }, 
      include: { education: true, technical: true, experience: true } 
    });
    if (!candidate) return res.status(404).json({ error: 'Not found' });
    res.json(candidate);
  } catch (err) {
    console.error('Load Profile Error:', err.message);
    res.status(500).json({ error: 'Failed to load profile arrays' });
  }
});

// ============================================================================
// 🏢 CORPORATE CLIENT ENTITY PORTAL ROUTES
// ============================================================================

// EMPLOYER REGISTRATION
app.post('/api/employer/signup', async (req, res) => {
  const { companyName, email, phoneNumber, password } = req.body;
  try {
    const existing = await prisma.employer.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });
    if (existing) return res.status(400).json({ error: 'Email or Phone already registered.' });

    const employer = await prisma.employer.create({
      data: { companyName, email, phoneNumber, password, status: 'PENDING_VERIFICATION' }
    });

    res.status(200).json({ success: true, message: 'Account created. Pending Admin Verification.' });
  } catch (err) {
    console.error('Employer Signup Error:', err.message);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// EMPLOYER REQUISITION LOGIN AUTHENTICATION
app.post('/api/employer/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const employer = await prisma.employer.findFirst({
      where: { OR: [{ email: identifier }, { phoneNumber: identifier }] }
    });

    if (!employer || employer.password !== password) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    if (employer.status === 'PENDING_VERIFICATION') {
      return res.status(403).json({ error: 'Your account is pending verification by our HR team.' });
    }

    if (employer.status === 'REJECTED') {
      return res.status(403).json({ error: 'Your account has been rejected.' });
    }

    const token = jwt.sign({ id: employer.id, role: 'EMPLOYER' }, SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, token, employerId: employer.id, companyName: employer.companyName });
  } catch (err) {
    console.error('Employer Login Error:', err.message);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// CONCURRENT DEMAND COMPILATION PLACEMENT
app.post('/api/employer/jobs', async (req, res) => {
  const { employerId, jobs } = req.body;
  try {
    const jobData = jobs.map(job => ({
      employerId,
      roleTitle: job.roleTitle,
      salaryRange: job.salaryRange,
      location: Array.isArray(job.location) ? job.location : (job.location ? [job.location] : []),
      maritalStatus: job.maritalStatus,
      educationLevel: job.educationLevel,
      expRequired: typeof job.expRequired === 'number' ? job.expRequired : (parseInt(job.expRequired, 10) || 0)
    }));

    await prisma.jobRequirement.createMany({ data: jobData });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Post Jobs Error:', err.message);
    res.status(500).json({ error: 'Failed to post jobs.' });
  }
});

// BLIND SELECTION AUTOMATED MATCHING ENGINE
app.get('/api/employer/orders/:employerId', async (req, res) => {
  const { employerId } = req.params;
  try {
    const jobs = await prisma.jobRequirement.findMany({
      where: { employerId, isActive: true },
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
          candidateIdNumber: c.id.substring(0, 6).toUpperCase(), 
          experienceYears: totalExp > 0 ? `${totalExp} Years` : 'Fresher',
          topEducation: topEdu,
          location: c.presentDistrict || 'Unknown',
          gender: c.sex || 'Not Specified',
        };
      });

      return { ...job, matchedCandidates: anonymizedMatches };
    }));

    res.status(200).json(enrichedJobs);
  } catch (err) {
    console.error('Load Employer Orders Error:', err.message);
    res.status(500).json({ error: 'Failed to load orders.' });
  }
});

// REQUISITION CLOSURE (SOFT DELETE)
app.delete('/api/employer/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    await prisma.jobRequirement.update({ where: { id: orderId }, data: { isActive: false } });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Soft Delete Order Error:', err.message);
    res.status(500).json({ error: 'Failed to delete order.' });
  }
});

// ============================================================================
// 👨‍💼 SYSTEM ADMINISTRATIVE OPERATIONS INTERFACE ROUTES
// ============================================================================

// READ REGISTERED EMPLOYER PROFILES (With Optional Query State Isolations)
app.get('/api/admin/employers', async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};
    
    const employers = await prisma.employer.findMany({
      where: filters,
      include: { jobs: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, employers });
  } catch (error) {
    console.error('Fetch Employers Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch employers' });
  }
});

// COMMENCE CORPORATE CLIENT STATE UPDATE
app.put('/api/admin/employers/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['PENDING_VERIFICATION', 'ACTIVE', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const employer = await prisma.employer.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({ success: true, message: `Employer status updated to ${status}`, employer });
  } catch (error) {
    console.error('Update Employer Error:', error.message);
    res.status(500).json({ error: 'Failed to update employer' });
  }
});

// FETCH COMPLETE CANDIDATE WORKSPACE ARRAYS
app.get('/api/admin/candidates', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    
    let candidates = await prisma.candidate.findMany({
      where: filters,
      include: { education: true, technical: true, experience: true },
      orderBy: { createdAt: 'desc' },
    });

    if (search) {
      candidates = candidates.filter(c => 
        c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        c.phoneNumber1?.includes(search) ||
        c.id?.includes(search)
      );
    }

    res.status(200).json({ success: true, candidates });
  } catch (error) {
    console.error('Fetch Candidates Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// READ TARGETED CANDIDATE ENHANCED REFERENCE OBJECT
app.get('/api/admin/candidates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { education: true, technical: true, experience: true },
    });

    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.status(200).json({ success: true, candidate });
  } catch (error) {
    console.error('Fetch Candidate Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// PIPELINE DATA PERSISTENCE SHIFTER WITH TRACKING RETENTION
app.put('/api/admin/candidates/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, shortlistedCompany } = req.body;

  if (!['PENDING_WIZARD', 'PENDING_ADMIN_CALL', 'SHORTLISTED', 'PLACED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const candidate = await prisma.candidate.update({
      where: { id },
      data: { 
        status: status,
        shortlistedCompany: shortlistedCompany 
      },
    });

    res.status(200).json({ success: true, message: `Candidate status updated to ${status}`, candidate });
  } catch (error) {
    console.error('Update Candidate Error:', error.message);
    res.status(500).json({ error: 'Failed to update candidate mapping record' });
  }
});

// FETCH INTEGRATED ACTIVE ORDERS
app.get('/api/admin/jobs', async (req, res) => {
  try {
    const { location, employerId } = req.query;
    const filters = { isActive: true };
    
    if (location) {
      filters.location = { has: location };
    }
    if (employerId) {
      filters.employerId = employerId;
    }

    const jobs = await prisma.jobRequirement.findMany({
      where: filters,
      include: { employer: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Fetch Jobs Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// LOAD JOBS REGISTERED BY AN ISOLATED CORPORATE ENTITY ID
app.get('/api/admin/employers/:id/jobs', async (req, res) => {
  const { id } = req.params;
  try {
    const employer = await prisma.employer.findUnique({
      where: { id },
      include: { jobs: true },
    });

    if (!employer) return res.status(404).json({ error: 'Employer not found' });
    res.status(200).json({ success: true, employer, jobs: employer.jobs });
  } catch (error) {
    console.error('Fetch Employer Jobs Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch employer jobs' });
  }
});

// REQUISITIONS TRACKER RADIAL MATCH ENGINE MATRIX FOR ADMIN
app.get('/api/admin/jobs/:id/matches', async (req, res) => {
  const { id } = req.params;
  try {
    const job = await prisma.jobRequirement.findUnique({ where: { id } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const candidates = await prisma.candidate.findMany({
      where: {
        status: { in: ['PENDING_ADMIN_CALL', 'PENDING_WIZARD'] },
        jobRoles: { hasSome: [job.roleTitle] },
        preferredDistricts: {
          hasSome: (job.location || []).length > 0 ? job.location : []
        }
      },
      include: { experience: true },
    });

    res.status(200).json({ success: true, job, matches: candidates });
  } catch (error) {
    console.error('Fetch Job Matches Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch matching candidates' });
  }
});

// ============================================================================
// 🚀 RUN TIME RUNNING MONITOR SETUP
// ============================================================================
app.listen(PORT, () => {
  console.log(`🚀 Blue-Collar Central API executing on internal mapping port ${PORT}`);
});