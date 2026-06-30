import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || '__DEV_ONLY_INSECURE_FALLBACK__';

// ─────────────────────────────────────────────────────────────────────
// 🛡️ Input Sanitization — prevent NoSQL/prototype-pollution attacks
// ─────────────────────────────────────────────────────────────────────

const DANGEROUS_KEYS = new Set(['$', '__proto__', 'constructor', 'prototype']);

function sanitizeValue(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    // Strip HTML tags to prevent stored XSS
    return value.replace(/<[^>]*>/g, '').trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object') {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      // Skip keys that start with $ or are prototype pollution vectors
      if (DANGEROUS_KEYS.has(key) || key.startsWith('$')) continue;
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }

  return value;
}

/**
 * Middleware: sanitize request body to prevent injection attacks.
 * Strips HTML tags, removes keys starting with $ and prototype pollution vectors.
 */
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}

// ─────────────────────────────────────────────────────────────────────
// 🔐 Candidate Authentication — verifies JWT and extracts candidate info
// ─────────────────────────────────────────────────────────────────────

/**
 * Middleware: authenticates a candidate from their Bearer JWT.
 * Sets req.candidate = { id, phone, role }
 * Optionally enforces that the candidate can only access their own data.
 */
export function authenticateCandidate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, SECRET);

    if (payload.role !== 'CANDIDATE') {
      return res.status(403).json({ error: 'Invalid candidate token' });
    }

    req.candidate = {
      id: payload.id,   // Now an integer (auto-incremented)
      phone: payload.phone,
      role: payload.role,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware: ensures the candidate can only access their own resources.
 * Checks req.params.candidateId or req.body.candidateId against req.candidate.id
 */
export function enforceCandidateOwnership(req, res, next) {
  const paramId = req.params.candidateId ? parseInt(req.params.candidateId, 10) : null;
  const bodyId = req.body?.candidateId ? parseInt(req.body.candidateId, 10) : null;
  const candidateId = paramId || bodyId;

  if (candidateId && candidateId !== req.candidate.id) {
    return res.status(403).json({ error: 'You can only access your own data' });
  }
  next();
}

// ─────────────────────────────────────────────────────────────────────
// 🏢 Employer Authentication — verifies JWT and extracts employer info
// ─────────────────────────────────────────────────────────────────────

/**
 * Middleware: authenticates an employer from their Bearer JWT.
 * Sets req.employer = { id, role }
 */
export function authenticateEmployer(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, SECRET);

    if (payload.role !== 'EMPLOYER') {
      return res.status(403).json({ error: 'Invalid employer token' });
    }

    req.employer = {
      id: payload.id,
      role: payload.role,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware: ensures the employer can only access their own resources.
 * Checks req.params.employerId or req.body.employerId against req.employer.id
 */
export function enforceEmployerOwnership(req, res, next) {
  const paramId = req.params.employerId;
  const bodyId = req.body?.employerId;
  const employerId = paramId || bodyId;

  if (employerId && employerId !== req.employer.id) {
    return res.status(403).json({ error: 'You can only access your own data' });
  }
  next();
}
