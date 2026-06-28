export const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri', 'Madurai',
  'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni',
  'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
  'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || '').trim().toLowerCase());
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
  return TN_DISTRICTS.includes(district);
}

export function validateAdminAccountInput({ name, email, phone, password, region }, { editing = false, requireRegion = false } = {}) {
  const errors = [];
  if (!name?.trim()) errors.push('Name is required');
  if (!email?.trim()) errors.push('Email is required');
  else if (!isValidEmail(email)) errors.push('Invalid email address');
  if (phone?.trim() && !isValidPhone(phone)) errors.push('Phone must be a valid 10-digit Indian mobile number');
  if (!editing && !password?.trim()) errors.push('Password is required');
  else if (password?.trim() && password.length < 6) errors.push('Password must be at least 6 characters');
  if (requireRegion && region && !isValidDistrict(region)) errors.push('Invalid district selected');
  if (requireRegion && !region?.trim()) errors.push('District is required');
  return errors;
}

export function validateCandidateInput(body) {
  const errors = [];
  if (!body.fullName?.trim()) errors.push('Full name is required');
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
    const invalid = body.preferredDistricts.filter((d) => d !== 'All Locations' && !TN_DISTRICTS.includes(d));
    if (invalid.length) errors.push('Invalid preferred district(s)');
  }
  return errors;
}
