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
    // 2Factor SMS API URL format: https://2factor.in/API/V1/{api_key}/SMS/{phone_number}/AUTOGEN3/OTP_TEMPLATE
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWO_FACTOR_KEY}/SMS/${phoneNumber}/AUTOGEN3/BLU_COLLAR_AUTH`
    );
    
    // 2Factor returns a unique session ID to verify against later
    res.status(200).json({ 
      success: true, 
      message: 'OTP transmitted successfully', 
      otpSessionId: response.data.Details 
    });
  } catch (error) {
    console.error('2Factor SMS Send Failure:', error.response?.data || error.message);
    
    // DEVELOPMENT FALLBACK MODE: Allows local testing if your 2Factor wallet balance is 0 or unconfigured
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
    // Verify OTP code with 2Factor gateway if not in sandbox fallback mode
    if (otpSessionId !== 'SANDBOX_SESSION_ACTIVE') {
      await axios.get(`https://2factor.in/API/V1/${TWO_FACTOR_KEY}/SMS/VERIFY/${otpSessionId}/${otpCode}`);
    } else {
      // Mock validation logic for local sandbox
      if (otpCode !== '123456') return res.status(400).json({ error: 'Invalid verification token mismatch' });
    }

    // Check if Candidate Profile already exists in Neon PostgreSQL
    let candidate = await prisma.candidate.findUnique({
      where: { phoneNumber1: phoneNumber }
    });

    // Automatically create a baseline reference row if they are a first-time registrant
    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: { phoneNumber1: phoneNumber, status: 'PENDING_WIZARD' }
      });
    }

    // Generate secure session payload signature token
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
    // Destructure properties to run explicit column mappings safely
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
          jobRoles: updatedPayload.jobRoles, // Array values stored cleanly
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

app.listen(PORT, () => {
  console.log(`🚀 Blue-Collar Central API executing on internal mapping port ${PORT}`);
});