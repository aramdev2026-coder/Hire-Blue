import { STATES_AND_DISTRICTS, ALL_DISTRICTS, TN_DISTRICTS } from './locationData.js';

// ─── Field Length Limits ─────────────────────────────────────────────
const MAX_LENGTHS = {
  fullName: 100,
  email: 254,       // RFC 5321
  phone: 15,
  address: 500,
  district: 50,
  state: 50,
  salary: 50,
  companyName: 200,
  password: 128,
  note: 2000,
  institution: 200,
  course: 200,
  roleTitle: 100,
  salaryRange: 100,
  region: 50,
};

export { MAX_LENGTHS };

// ─── Core validators ─────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

export function isValidEmail(email) {
  const val = String(email || '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(val) || val.length > MAX_LENGTHS.email) return false;

  const [localPart, domainPart] = val.split('@');
  if (localPart.length > 5 && !/[aeiouy]/.test(localPart)) return false;
  if (/([a-zA-Z0-9])\1{4,}/.test(localPart)) return false;

  const domainTypos = [
    'gamil.com', 'gamil.co', 'gmaill.com', 'gmaile.com', 'gmile.com', 'gmail.con', 'gmail.col',
    'yaho.com', 'yhoo.com', 'yahoo.co', 'hotmal.com', 'hotmale.com', 'outlok.com', 'outloock.com',
    'gamil.in', 'gamil.net', 'gamil.org', 'yaho.in', 'yahoo.con', 'hotmail.con'
  ];
  if (domainTypos.includes(domainPart)) return false;
  return true;
}

export function isValidPhone(phone, { required = false } = {}) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return !required;
  return PHONE_RE.test(digits);
}

export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-10);
}

export function isValidDistrict(district) {
  if (!district) return true;
  return ALL_DISTRICTS.includes(district);
}

// ─── String sanitizer — strips HTML to prevent stored XSS ───────────
export function sanitizeString(value, maxLength = 500) {
  if (!value || typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>/g, '')   // Strip HTML tags
    .replace(/[<>]/g, '')      // Remove stray angle brackets
    .trim()
    .slice(0, maxLength);
}

// ─── Length enforcer ─────────────────────────────────────────────────
function checkLength(value, field, label) {
  const max = MAX_LENGTHS[field] || 500;
  if (value && typeof value === 'string' && value.length > max) {
    return `${label || field} must be at most ${max} characters`;
  }
  return null;
}

// ─── Admin account validation ────────────────────────────────────────
export function validateAdminAccountInput({ name, email, phone, password, region }, { editing = false, requireRegion = false } = {}) {
  const errors = [];
  if (!name?.trim()) errors.push('Name is required');
  else {
    const lenErr = checkLength(name, 'fullName', 'Name');
    if (lenErr) errors.push(lenErr);
  }
  if (!email?.trim()) errors.push('Email is required');
  else if (!isValidEmail(email)) errors.push('Invalid email address');
  if (phone?.trim() && !isValidPhone(phone)) errors.push('Phone must be a valid 10-digit Indian mobile number');
  if (!editing && !password?.trim()) errors.push('Password is required');
  else if (password?.trim()) {
    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (password.length > MAX_LENGTHS.password) errors.push(`Password must be at most ${MAX_LENGTHS.password} characters`);
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/\d/.test(password)) errors.push('Password must contain at least one digit');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character');
  }
  if (requireRegion && region && !isValidDistrict(region)) errors.push('Invalid district selected');
  if (requireRegion && !region?.trim()) errors.push('District is required');
  return errors;
}

// ─── Candidate input validation ──────────────────────────────────────
export function validateCandidateInput(body) {
  const errors = [];
  if (!body.fullName?.trim()) errors.push('Full name is required');
  else {
    const lenErr = checkLength(body.fullName, 'fullName', 'Full name');
    if (lenErr) errors.push(lenErr);
  }
  if (!isValidPhone(body.phoneNumber1, { required: true })) {
    errors.push('Primary phone must be a valid 10-digit Indian mobile number');
  }
  ['phoneNumber2', 'familyPhonePrimary', 'familyPhoneBackup'].forEach((field) => {
    if (body[field] && !isValidPhone(body[field])) {
      errors.push(`${field} must be a valid 10-digit mobile number`);
    }
  });
  ['emailId', 'secondaryEmailId'].forEach((field) => {
    if (body[field]?.trim() && !isValidEmail(body[field])) errors.push(`Invalid ${field}`);
  });
  if (body.presentDistrict && !isValidDistrict(body.presentDistrict)) {
    errors.push('Invalid present district');
  }
  if (body.permanentDistrict && !isValidDistrict(body.permanentDistrict)) {
    errors.push('Invalid permanent district');
  }
  if (Array.isArray(body.preferredDistricts)) {
    const invalid = body.preferredDistricts.filter((d) => d !== 'All Locations' && !ALL_DISTRICTS.includes(d));
    if (invalid.length) errors.push('Invalid preferred district(s)');
  }

  // Address length checks
  ['presentAddress', 'permanentAddress'].forEach((field) => {
    const lenErr = checkLength(body[field], 'address', field);
    if (lenErr) errors.push(lenErr);
  });

  return errors;
}

// ─── Employer input validation ───────────────────────────────────────
export function validateEmployerInput({ companyName, email, phoneNumber, password }) {
  const errors = [];
  if (!companyName?.trim()) errors.push('Company name is required');
  else {
    const lenErr = checkLength(companyName, 'companyName', 'Company name');
    if (lenErr) errors.push(lenErr);
  }
  if (!email?.trim()) errors.push('Email is required');
  else if (!isValidEmail(email)) errors.push('Invalid email address');
  if (!phoneNumber?.trim()) errors.push('Phone number is required');
  else if (!isValidPhone(phoneNumber, { required: true })) {
    errors.push('Phone must be a valid 10-digit Indian mobile number');
  }
  if (!password?.trim()) errors.push('Password is required');
  else if (password.length < 8) errors.push('Password must be at least 8 characters');
  else if (password.length > MAX_LENGTHS.password) errors.push(`Password must be at most ${MAX_LENGTHS.password} characters`);
  return errors;
}
