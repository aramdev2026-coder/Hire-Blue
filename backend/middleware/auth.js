import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'super_secret_session_key_99';

export function authenticateAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, SECRET);
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

export { SECRET };
