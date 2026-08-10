import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import pkg from '@prisma/client';

import env from './config/env.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import { sanitizeBody } from './middleware/security.js';

import createAuthRoutes from './routes/authRoutes.js';
import createSubAdminRoutes from './routes/subAdminRoutes.js';
import createAdminRoutes from './routes/adminRoutes.js';
import createSuperAdminRoutes from './routes/superAdminRoutes.js';
import createCandidateRoutes from './routes/candidateRoutes.js';
import createEmployerRoutes from './routes/employerRoutes.js';
import { startBirthdayScheduler } from './services/emailService.js';

const { PrismaClient } = pkg;
const app = express();
app.set('trust proxy', 1);
const prisma = new PrismaClient();

// ============================================================================
// 🛡️ GLOBAL MIDDLEWARE (Security, Logging, Performance)
// ============================================================================

// HTTP request logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Performance: GZIP compression
app.use(compression());

// HTTP security headers
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
const defaultOrigins = [
  'https://aramftc.com',
  'https://www.aramftc.com',
  'https://aramadmin.netlify.app',
  'https://aramftcadmin.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];

let allowedOrigins = [...defaultOrigins];

if (env.CORS_ORIGINS) {
  const envOrigins = env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
  allowedOrigins = Array.from(new Set([...allowedOrigins, ...envOrigins]));
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-platform', 'x-app-version', 'Accept'],
}));

// Body parser with payload limit
app.use(express.json({ limit: '1mb' }));

// Input sanitization
app.use(sanitizeBody);

// Health check endpoint (bypasses rate limiters for uptime monitors)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

// ============================================================================
// 🛣️ ROUTES
// ============================================================================

app.use('/api/admin/auth', authLimiter, createAuthRoutes(prisma));
app.use('/api/sub-admin', createSubAdminRoutes(prisma));
app.use('/api/admin', createAdminRoutes(prisma));
app.use('/api/super-admin', createSuperAdminRoutes(prisma));

app.use('/api/auth', createCandidateRoutes(prisma)); // Handles /send-otp and /verify-otp
app.use('/api/candidate', createCandidateRoutes(prisma)); // Handles /save-wizard-step, /finalize, /profile
app.use('/api/employer', createEmployerRoutes(prisma));

// ============================================================================
// ❌ GLOBAL ERROR HANDLER
// ============================================================================
app.use(errorHandler);

// ============================================================================
// 🧹 BACKGROUND CRON JOBS
// ============================================================================

// Clean up expired OTPs every hour
setInterval(async () => {
  try {
    const deleted = await prisma.otpToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() }  // expired before now
      }
    });
    if (deleted.count > 0) {
      logger.info(`🧹 Cleaned up ${deleted.count} expired OTP token(s)`);
    }
  } catch (err) {
    logger.error('❌ OTP cleanup error:', err);
  }
}, 60 * 60 * 1000); // every 60 minutes

// Automatically run birthday scheduler checks
startBirthdayScheduler(prisma);

// ============================================================================
// 🚀 SERVER START
// ============================================================================
app.listen(env.PORT, () => {
  logger.info(`🚀 Aram FTC API executing on port ${env.PORT} [${env.NODE_ENV.toUpperCase()}]`);
  if (env.NODE_ENV !== 'production') {
    logger.debug(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  }
});
