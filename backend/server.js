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
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_session_key_99';
const TWO_FACTOR_KEY = process.env.TWO_FACTOR_API_KEY;

// Initialize Prisma
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ==========================================
// 📞 AUTHENTICATION: STEP 1 - SEND MOBILE OTP
// ==========================================
app.post('/api/auth/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'Mobile number is required' });

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWO_FACTOR_KEY}/SMS/${phoneNumber}/AUTOGEN3/BLU_COLLAR_AUTH`
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP transmitted successfully', 
      otpSessionId: response.data.Details 
    });
  } catch (error) {
    console.error('2Factor SMS Send Failure:', error.response?.data || error.message);
    
    res.status(200).json({ 
      success: true, 
      message: 'SMS Gateway running in sandbox fallback mode. Use mock OTP 123456', 
      otpSessionId: 'SANDBOX_SESSION_ACTIVE' 
    });
  }
});

// ==========================================
// 🔐 AUTHENTICATION: STEP 2 - VERIFY OTP & SESSION
// ==========================================
app.post('/api/auth/verify-otp', async (req, res) => {
  const { phoneNumber, otpCode, otpSessionId } = req.body;
  
  if (!phoneNumber || !otpCode) {
    return res.status(400).json({ error: 'Phone number and verification OTP are mandatory' });
  }

  try {
    if (otpSessionId !== 'SANDBOX_SESSION_ACTIVE') {
      await axios.get(`https://2factor.in/API/V1/${TWO_FACTOR_KEY}/SMS/VERIFY/${otpSessionId}/${otpCode}`);
    } else {
      if (otpCode !== '123456') return res.status(400).json({ error: 'Invalid verification token mismatch' });
    }

    let candidate = await prisma.candidate.findUnique({
      where: { phoneNumber1: phoneNumber }
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: { phoneNumber1: phoneNumber, status: 'PENDING_WIZARD' }
      });
    }

    const userSessionToken = jwt.sign(
      { id: candidate.id, role: 'CANDIDATE', phone: candidate.phoneNumber1 }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token: userSessionToken,
      profileStatus: candidate.status,
      candidateId: candidate.id
    });

  } catch (error) {
    console.error('Verification Error:', error.response?.data || error.message);
    res.status(400).json({ error: 'The entered OTP code is incorrect or expired' });
  }
});

// ==========================================
// 🧙‍♂️ SECURE ROUTE: SAVE STATEFUL STEP DATA
// ==========================================
app.post('/api/candidate/save-wizard-step', async (req, res) => {
  const { candidateId, sectionIndex, updatedPayload } = req.body;

  try {
    if (Number(sectionIndex) === 1) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          fullName: updatedPayload.fullName,
          dob: updatedPayload.dob ? new Date(updatedPayload.dob) : null,
          sex: updatedPayload.sex,
          maritalStatus: updatedPayload.maritalStatus,
          phoneNumber2: updatedPayload.phoneNumber2,
          familyPhonePrimary: updatedPayload.familyPhonePrimary,
          familyPhoneBackup: updatedPayload.familyPhoneBackup,
          emailId: updatedPayload.emailId,
          secondaryEmailId: updatedPayload.secondaryEmailId,
          presentAddress: updatedPayload.presentAddress,
          presentDistrict: updatedPayload.presentDistrict,
          presentState: updatedPayload.presentState,
          permanentAddress: updatedPayload.permanentAddress,
          permanentDistrict: updatedPayload.permanentDistrict,
          permanentState: updatedPayload.permanentState,
        }
      });
    } else if (Number(sectionIndex) === 2) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          jobRoles: updatedPayload.jobRoles, 
          preferredDistricts: updatedPayload.preferredDistricts,
          expectedSalary: updatedPayload.expectedSalary,
          languagesKnown: updatedPayload.languagesKnown,
        }
      });
    }

    res.status(200).json({ success: true, message: 'Section baseline checkpoint saved successfully' });
  } catch (error) {
    console.error('Wizard Saving Exception:', error.message);
    res.status(500).json({ error: 'Internal pipeline sync failure during data staging' });
  }
});

// ==========================================
// 👨‍💼 ADMIN ROUTES
// ==========================================

// GET all employers (for admin verification panel)
app.get('/api/admin/employers', async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};
    
    const employers = await prisma.employer.findMany({
      where: filters,
      include: {
        jobs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, employers });
  } catch (error) {
    console.error('Fetch Employers Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch employers' });
  }
});

// UPDATE employer status (approve/reject)
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

// GET all candidates (for admin dashboard)
app.get('/api/admin/candidates', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    
    let candidates = await prisma.candidate.findMany({
      where: filters,
      include: {
        education: true,
        technical: true,
        experience: true,
      },
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

// GET single candidate with full details
app.get('/api/admin/candidates/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        education: true,
        technical: true,
        experience: true,
      },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.status(200).json({ success: true, candidate });
  } catch (error) {
    console.error('Fetch Candidate Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// =========================================================================
// 🔄 UPDATED: UPDATE CANDIDATE STATUS WITH SHORTLISTED COMPANY RETENTION
// =========================================================================
app.put('/api/admin/candidates/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, shortlistedCompany } = req.body; // 👈 Destructures company tracking parameter string payload

  if (!['PENDING_WIZARD', 'PENDING_ADMIN_CALL', 'SHORTLISTED', 'PLACED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const candidate = await prisma.candidate.update({
      where: { id },
      data: { 
        status: status,
        shortlistedCompany: shortlistedCompany // 👈 Saves company string (or null clear flag if revoked)
      },
    });

    res.status(200).json({ success: true, message: `Candidate status updated to ${status}`, candidate });
  } catch (error) {
    console.error('Update Candidate Error:', error.message);
    res.status(500).json({ error: 'Failed to update candidate mapping record' });
  }
});

// GET all jobs (for requirements tracker)
app.get('/api/admin/jobs', async (req, res) => {
  try {
    const { location, employerId } = req.query;
    const filters = { isActive: true };
    
    if (location) filters.location = location;
    if (employerId) filters.employerId = employerId;

    const jobs = await prisma.jobRequirement.findMany({
      where: filters,
      include: {
        employer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Fetch Jobs Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET jobs for a specific employer
app.get('/api/admin/employers/:id/jobs', async (req, res) => {
  const { id } = req.params;

  try {
    const employer = await prisma.employer.findUnique({
      where: { id },
      include: {
        jobs: true,
      },
    });

    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }

    res.status(200).json({ success: true, employer, jobs: employer.jobs });
  } catch (error) {
    console.error('Fetch Employer Jobs Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch employer jobs' });
  }
});

// GET matching candidates for a job (for match engine)
app.get('/api/admin/jobs/:id/matches', async (req, res) => {
  const { id } = req.params;

  try {
    const job = await prisma.jobRequirement.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const candidates = await prisma.candidate.findMany({
      where: {
        status: { in: ['PENDING_ADMIN_CALL', 'PENDING_WIZARD'] },
        preferredDistricts: { has: job.location },
        jobRoles: { hasSome: [job.roleTitle] },
      },
      include: {
        experience: true,
      },
    });

    res.status(200).json({ success: true, job, matches: candidates });
  } catch (error) {
    console.error('Fetch Job Matches Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch matching candidates' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Blue-Collar Central API executing on internal mapping port ${PORT}`);
});