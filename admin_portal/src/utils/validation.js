const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

export function isValidEmail(email) {
  const val = String(email || '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const domainTypos = [
    'gamil.com', 'gamil.co', 'gmaill.com', 'gmaile.com', 'gmile.com', 'gmail.con', 'gmail.col',
    'yaho.com', 'yhoo.com', 'yahoo.co', 'hotmal.com', 'hotmale.com', 'outlok.com', 'outloock.com',
    'gamil.in', 'gamil.net', 'gamil.org', 'yaho.in', 'yahoo.con', 'hotmail.con'
  ];
  if (!emailRegex.test(val)) return false;
  const [localPart, domainPart] = val.split('@');
  if (localPart.length > 5 && !/[aeiouy]/.test(localPart)) return false;
  if (/([a-zA-Z0-9])\1{4,}/.test(localPart)) return false;
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

export function validateAdminAccount({ name, email, phone, password, region }, { editing = false } = {}) {
  const errors = {};
  if (!name?.trim()) errors.name = 'Name is required';
  if (!email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  if (phone?.trim() && !isValidPhone(phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number';
  }
  if (!editing && !password?.trim()) errors.password = 'Password is required';
  else if (password?.trim() && password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
}

export function validateSubAdminAccount(form, { editing = false } = {}) {
  const errors = validateAdminAccount(form, { editing });
  if (!editing && !form.region?.trim()) errors.region = 'District is required';
  return errors;
}

function composeAddress(street1, street2) {
  return [street1?.trim(), street2?.trim()].filter(Boolean).join(', ');
}

export function validateCandidateForm(form) {
  const errors = {};

  if (!form.fullName?.trim()) errors.fullName = 'Full name is required';
  if (!isValidPhone(form.phoneNumber1, { required: true })) {
    errors.phoneNumber1 = 'Enter a valid 10-digit mobile number';
  }
  if (!form.phoneNumber2) {
    errors.phoneNumber2 = 'Alternate mobile number is required';
  } else if (!isValidPhone(form.phoneNumber2)) {
    errors.phoneNumber2 = 'Enter a valid 10-digit mobile number';
  } else if (form.phoneNumber2 === form.phoneNumber1) {
    errors.phoneNumber2 = 'Alternate mobile number must be different from primary mobile';
  }
  if (form.familyPhonePrimary && !isValidPhone(form.familyPhonePrimary)) {
    errors.familyPhonePrimary = 'Enter a valid 10-digit mobile number';
  }
  if (form.familyPhoneBackup && !isValidPhone(form.familyPhoneBackup)) {
    errors.familyPhoneBackup = 'Enter a valid 10-digit mobile number';
  }
  if (!form.emailId?.trim()) {
    errors.emailId = 'Email address is required';
  } else if (!isValidEmail(form.emailId)) {
    errors.emailId = 'Enter a valid email address';
  }
  if (form.secondaryEmailId?.trim() && !isValidEmail(form.secondaryEmailId)) {
    errors.secondaryEmailId = 'Enter a valid email address';
  }
  if (!form.dob) {
    errors.dob = 'Date of birth is required';
  } else {
    const birthDate = new Date(form.dob);
    const dobYear = birthDate.getFullYear();
    if (dobYear < 1900) {
      errors.dob = 'Year cannot be before 1900';
    } else {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        errors.dob = 'Candidate must be at least 18 years old';
      }
    }
  }
  if (!form.sex) errors.sex = 'Please select gender';
  if (!form.maritalStatus) errors.maritalStatus = 'Please select marital status';
  if (!form.presentStreet1?.trim()) errors.presentStreet1 = 'Street address is required';
  if (!form.presentCity) errors.presentCity = 'District is required';
  if (!form.sameAddress) {
    if (!form.permanentStreet1?.trim()) errors.permanentStreet1 = 'Street address is required';
    if (!form.permanentCity) errors.permanentCity = 'District is required';
  }
  if (!form.jobRoles?.length) errors.jobRoles = 'Select at least one job role';
  if (!form.preferredDistricts?.length) errors.preferredDistricts = 'Select at least one district';
  if (!form.expectedSalary) errors.expectedSalary = 'Salary expectation is required';
  if (!form.languagesKnown?.length) errors.languagesKnown = 'Select at least one language';

  return errors;
}

export function buildCandidatePayload(form) {
  const presentAddress = composeAddress(form.presentStreet1, form.presentStreet2);
  const permanentAddress = form.sameAddress
    ? presentAddress
    : composeAddress(form.permanentStreet1, form.permanentStreet2);

  const education = (form.education || []).filter((r) => r.institution?.trim());
  const technical = (form.technical || []).filter((r) => r.institution?.trim());
  const experience = (form.experience || [])
    .filter((r) => r.institution?.trim())
    .map((r) => ({
      institution: r.role?.trim() ? `${r.institution.trim()} (${r.role.trim()})` : r.institution.trim(),
      fromYear: r.fromYear || '',
      toYear: r.toYear || '',
    }));

  return {
    fullName: form.fullName.trim(),
    phoneNumber1: normalizePhone(form.phoneNumber1),
    phoneNumber2: normalizePhone(form.phoneNumber2) || null,
    dob: form.dob,
    sex: form.sex,
    maritalStatus: form.maritalStatus,
    familyPhonePrimary: normalizePhone(form.familyPhonePrimary) || null,
    familyPhoneBackup: normalizePhone(form.familyPhoneBackup) || null,
    emailId: form.emailId?.trim() || null,
    secondaryEmailId: form.secondaryEmailId?.trim() || null,
    presentAddress,
    presentDistrict: form.presentCity,
    presentState: form.presentState || 'Tamil Nadu',
    permanentAddress,
    permanentDistrict: form.sameAddress ? form.presentCity : form.permanentCity,
    permanentState: form.sameAddress ? form.presentState : form.permanentState,
    jobRoles: form.jobRoles,
    preferredDistricts: form.preferredDistricts,
    expectedSalary: form.expectedSalary,
    languagesKnown: form.languagesKnown,
    education,
    technical,
    experience,
  };
}

export { composeAddress };
