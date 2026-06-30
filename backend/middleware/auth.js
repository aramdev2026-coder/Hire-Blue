import jwt from 'jsonwebtoken';

// ─── Startup guard: JWT_SECRET must be set ───────────────────────────
const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET === 'YOUR_FALLBACK_SECURE_LONG_JWT_STRING_HEX') {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET is not set or is using the placeholder value. Set a strong secret in .env');
    process.exit(1);
  } else {
    console.warn('⚠️  WARNING: JWT_SECRET is not set. Using an insecure development fallback. DO NOT deploy like this.');
  }
}

// Use env secret or a dev-only fallback (never in production — guarded above)
const EFFECTIVE_SECRET = SECRET || '__DEV_ONLY_INSECURE_FALLBACK__';

export function authenticateAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, EFFECTIVE_SECRET);
    if (!['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN'].includes(payload.role)) {
      return res.status(403).json({ error: 'Invalid admin token' });
    }
    req.admin = { id: payload.id, role: payload.role, email: payload.email, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export { EFFECTIVE_SECRET as SECRET };
