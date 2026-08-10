import dotenv from 'dotenv';
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  JWT_SECRET: process.env.JWT_SECRET || '__DEV_ONLY_INSECURE_FALLBACK__',
  TWO_FACTOR_API_KEY: process.env.TWO_FACTOR_API_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174',
};

// 🛡️ Strict environment validation in production
if (env.NODE_ENV === 'production') {
  const missing = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === '__DEV_ONLY_INSECURE_FALLBACK__') missing.push('JWT_SECRET');
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');

  if (missing.length > 0) {
    console.error(`❌ FATAL: Missing or invalid required environment variables in production: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export default env;
