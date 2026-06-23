import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

dotenv.config();

const app     = express();
const PORT    = process.env.PORT || 5000;
const SECRET  = process.env.JWT_SECRET || 'super_secret_session_key_99';
const TF_KEY  = process.env.TWO_FACTOR_API_KEY;
const prisma  = new PrismaClient();

app.use(cors());
app.use(express.json());

// ============================================================================
// 🧑‍🔧 CANDIDATE ROUTES (Existing)
// ============================================================================

app.post('/api/auth/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'Mobile number is required' });
  try {
    const r = await axios.get(`https://2factor.in/API/V1/${TF_KEY}/SMS/${phoneNumber}/AUTOGEN3/BLU_COLLAR_AUTH`);
    res.json({ success: true, otpSessionId: r.data.Details });
  } catch {
    res.json({ success: true, otpSessionId: 'SANDBOX_SESSION_ACTIVE', sandbox: true });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { phoneNumber, otpCode, otpSessionId } = req.body;
  if (!phoneNumber || !otpCode) return res.status(400).json({ error: 'Phone and OTP required' });

  try {
    if (otpSessionId !== 'SANDBOX_SESSION_ACTIVE') {
      await axios.get(`https://2factor.in/API/V1/${TF_KEY}/SMS/VERIFY/${otpSessionId}/${otpCode}`);
    } else if (otpCode !== '123456') {
      return res.status(400).json({ error: 'Incorrect OTP. Sandbox code is 123456.' });
    }

    let candidate = await prisma.candidate.findUnique({ where: { phoneNumber1: phoneNumber } });
    if (!candidate) {
      candidate = await prisma.candidate.create({ data: { phoneNumber1: phoneNumber, status: 'PENDING_WIZARD' } });
    }

    const token = jwt.sign({ id: candidate.id, role: 'CANDIDATE' }, SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, candidateId: candidate.id, profileStatus: candidate.status });
  } catch (err) {
    res.status(400).json({ error: 'OTP is incorrect or expired' });
  }
});

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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save section' });
  }
});

app.post('/api/candidate/finalize', async (req, res) => {
  const { candidateId } = req.body;
  try {
    await prisma.candidate.update({ where: { id: candidateId }, data: { status: 'PENDING_ADMIN_CALL' } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to finalize' });
  }
});

app.get('/api/candidate/profile/:candidateId', async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({ where: { id: req.params.candidateId }, include: { education: true, technical: true, experience: true } });
    if (!candidate) return res.status(404).json({ error: 'Not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});


// ============================================================================
// 🏢 EMPLOYER ROUTES (New)
// ============================================================================

// Employer Signup
app.post('/api/employer/signup', async (req, res) => {
  const { companyName, email, phoneNumber, password } = req.body;
  try {
    const existing = await prisma.employer.findFirst({ where: { OR: [{ email }, { phoneNumber }] } });
    if (existing) return res.status(400).json({ error: 'Email or Phone already registered.' });

    // Note: In production, hash the password using bcrypt. Plaintext used here for prototype brevity.
    const employer = await prisma.employer.create({
      data: { companyName, email, phoneNumber, password, status: 'PENDING_VERIFICATION' }
    });

    res.status(200).json({ success: true, message: 'Account created. Pending Admin Verification.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Employer Login
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
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Post Job Requirements
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
      expRequired: typeof job.expRequired === 'number' ? job.expRequired : 0
    }));

    await prisma.jobRequirement.createMany({ data: jobData });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post jobs.' });
  }
});

// Get Employer Jobs & Matched Anonymized Candidates
app.get('/api/employer/orders/:employerId', async (req, res) => {
  const { employerId } = req.params;
  try {
    const jobs = await prisma.jobRequirement.findMany({
      where: { employerId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // BLIND MATCHING ENGINE: Fetch anonymized candidates for each job
    const enrichedJobs = await Promise.all(jobs.map(async (job) => {
      // job.location is now String[] — match if candidate's preferredDistricts
      // overlap with ANY of the job's target districts.
      const locationFilter = (job.location || []).length > 0
        ? { preferredDistricts: { hasSome: job.location } }
        : {}; // no location filter if employer selected none

      const matches = await prisma.candidate.findMany({
        where: {
          status: { not: 'PENDING_WIZARD' },
          jobRoles: { has: job.roleTitle },
          ...locationFilter
        },
        include: { education: true, experience: true }
      });

      // Map to strictly anonymized data profiles
      const anonymizedMatches = matches.map(c => {
        // Calculate total experience roughly
        let totalExp = 0;
        c.experience.forEach(exp => {
          if(exp.fromYear && exp.toYear) totalExp += (parseInt(exp.toYear) - parseInt(exp.fromYear));
        });

        const topEdu = c.education.length > 0 ? c.education[0].course : 'Not Specified';

        return {
          id: c.id,
          candidateIdNumber: c.id.substring(0, 6).toUpperCase(), // e.g. "Candidate #A4F9B2"
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
    res.status(500).json({ error: 'Failed to load orders.' });
  }
});

// Mark job requirement as inactive (soft-delete)
app.delete('/api/employer/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    await prisma.jobRequirement.update({ where: { id: orderId }, data: { isActive: false } });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order.' });
  }
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));