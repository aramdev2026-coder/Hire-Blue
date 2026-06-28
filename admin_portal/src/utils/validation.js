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
  if (form.phoneNumber2 && !isValidPhone(form.phoneNumber2)) {
    errors.phoneNumber2 = 'Enter a valid 10-digit mobile number';
  }
  if (form.familyPhonePrimary && !isValidPhone(form.familyPhonePrimary)) {
    errors.familyPhonePrimary = 'Enter a valid 10-digit mobile number';
  }
  if (form.familyPhoneBackup && !isValidPhone(form.familyPhoneBackup)) {
    errors.familyPhoneBackup = 'Enter a valid 10-digit mobile number';
  }
  if (form.emailId?.trim() && !isValidEmail(form.emailId)) {
    errors.emailId = 'Enter a valid email address';
  }
  if (form.secondaryEmailId?.trim() && !isValidEmail(form.secondaryEmailId)) {
    errors.secondaryEmailId = 'Enter a valid email address';
  }
  if (!form.dob) errors.dob = 'Date of birth is required';
  else if (new Date(form.dob).getFullYear() < 1900) errors.dob = 'Year cannot be before 1900';
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
