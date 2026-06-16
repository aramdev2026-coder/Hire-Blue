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

// ── SEND OTP ─────────────────────────────────────────────────────────────────
app.post('/api/auth/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'Mobile number is required' });
  try {
    const r = await axios.get(
      `https://2factor.in/API/V1/${TF_KEY}/SMS/${phoneNumber}/AUTOGEN3/BLU_COLLAR_AUTH`
    );
    res.json({ success: true, otpSessionId: r.data.Details });
  } catch {
    res.json({ success: true, otpSessionId: 'SANDBOX_SESSION_ACTIVE', sandbox: true });
  }
});

// ── VERIFY OTP ───────────────────────────────────────────────────────────────
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
      candidate = await prisma.candidate.create({
        data: { phoneNumber1: phoneNumber, status: 'PENDING_WIZARD' },
      });
    }

    const token = jwt.sign(
      { id: candidate.id, phone: candidate.phoneNumber1 },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, candidateId: candidate.id, profileStatus: candidate.status });
  } catch (err) {
    console.error('OTP error:', err.response?.data || err.message);
    res.status(400).json({ error: 'OTP is incorrect or expired' });
  }
});

// ── SAVE WIZARD STEP ─────────────────────────────────────────────────────────
app.post('/api/candidate/save-wizard-step', async (req, res) => {
  const { candidateId, sectionIndex, updatedPayload: p } = req.body;
  if (!candidateId) return res.status(400).json({ error: 'candidateId required' });

  try {
    if (Number(sectionIndex) === 1) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          fullName:           p.fullName,
          dob:                p.dob ? new Date(p.dob) : null,
          sex:                p.sex,
          maritalStatus:      p.maritalStatus,
          phoneNumber2:       p.phoneNumber2       || null,
          familyPhonePrimary: p.familyPhonePrimary || null,
          familyPhoneBackup:  p.familyPhoneBackup  || null,
          emailId:            p.emailId            || null,
          secondaryEmailId:   p.secondaryEmailId   || null,
          presentAddress:     p.presentAddress,
          presentDistrict:    p.presentDistrict,
          presentState:       p.presentState,
          permanentAddress:   p.permanentAddress,
          permanentDistrict:  p.permanentDistrict,
          permanentState:     p.permanentState,
        },
      });
    } else if (Number(sectionIndex) === 2) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          jobRoles:           { set: Array.isArray(p.jobRoles)           ? p.jobRoles           : [] },
          preferredDistricts: { set: Array.isArray(p.preferredDistricts) ? p.preferredDistricts : [] },
          expectedSalary:     p.expectedSalary,
          languagesKnown:     { set: Array.isArray(p.languagesKnown)     ? p.languagesKnown     : [] },
        },
      });
    } else if (Number(sectionIndex) === 3) {
      const education = Array.isArray(p.education)
        ? p.education.filter(item => item?.institution?.trim() || item?.course?.trim())
        : [];
      const technical = Array.isArray(p.technical)
        ? p.technical.filter(item => item?.institution?.trim() || item?.course?.trim())
        : [];
      const experience = Array.isArray(p.experience)
        ? p.experience.filter(item => item?.institution?.trim())
        : [];

      await prisma.$transaction([
        prisma.candidateEducation.deleteMany({ where: { candidateId } }),
        prisma.candidateTechnical.deleteMany({ where: { candidateId } }),
        prisma.candidateExperience.deleteMany({ where: { candidateId } }),
      ]);

      if (education.length) {
        await prisma.candidateEducation.createMany({
          data: education.map(item => ({
            candidateId,
            institution: item.institution || '',
            course: item.course || '',
          })),
        });
      }
      if (technical.length) {
        await prisma.candidateTechnical.createMany({
          data: technical.map(item => ({
            candidateId,
            institution: item.institution || '',
            course: item.course || '',
          })),
        });
      }
      if (experience.length) {
        await prisma.candidateExperience.createMany({
          data: experience.map(item => ({
            candidateId,
            institution: item.institution || '',
            fromYear: item.fromYear || '',
            toYear: item.toYear || '',
          })),
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Save error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.error || 'Failed to save section' });
  }
});

// ── FINALIZE ─────────────────────────────────────────────────────────────────
app.post('/api/candidate/finalize', async (req, res) => {
  const { candidateId } = req.body;
  if (!candidateId) return res.status(400).json({ error: 'candidateId required' });
  try {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'PENDING_ADMIN_CALL' },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Finalize error:', err.message);
    res.status(500).json({ error: 'Failed to finalize' });
  }
});

// ── GET PROFILE ───────────────────────────────────────────────────────────────
app.get('/api/candidate/profile/:candidateId', async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({ where: { id: req.params.candidateId } });
    if (!candidate) return res.status(404).json({ error: 'Not found' });
    res.json(candidate);
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));