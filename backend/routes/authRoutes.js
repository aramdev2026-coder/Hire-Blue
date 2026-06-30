import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyPassword } from '../utils/password.js';
import { serializeAdminUser } from '../utils/serializers.js';

export default function createAuthRoutes(prisma) {
  const router = express.Router();

  // Rate limiting for login — 5 attempts per 15 min per IP
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === 'production' ? 5 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  });

  router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const admin = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });

    // 🛡️ Generic error message — don't reveal whether email exists
    if (!admin || !admin.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const valid = await verifyPassword(password, admin.password);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role, email: admin.email, name: admin.name },
      env.JWT_SECRET,
      { expiresIn: '8h' },
    );

    res.json({
      success: true,
      token,
      user: serializeAdminUser(admin),
    });
  }));

  router.get('/me', asyncHandler(async (req, res) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }
    
    try {
      const payload = jwt.verify(header.slice(7), env.JWT_SECRET);
      const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
      if (!admin || !admin.isActive) {
        throw new AppError('Invalid session', 401);
      }
      res.json({ success: true, user: serializeAdminUser(admin) });
    } catch (err) {
      // Re-throw if it's already an AppError (from invalid session), otherwise wrap token errors
      if (err.isOperational) throw err;
      throw new AppError('Invalid or expired token', 401);
    }
  }));

  return router;
}
