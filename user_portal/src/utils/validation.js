const PHONE_RE = /^[6-9]\d{9}$/;

export function isValidEmail(email) {
  const val = String(email || '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(val)) return false;

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

export function composeAddress(street1, street2) {
  return [street1?.trim(), street2?.trim()].filter(Boolean).join(', ');
}
