const EMPLOYER_STRIP_KEYS = new Set([
  'shortlistedJobId',
  'shortlistedJob',
  'employerId',
  'employer',
  'companyName',
  'employerContact',
  'employerName',
  'corporateEmail',
  'approvedById',
  'approvedBy',
  'approvedAt',
]);

export function stripEmployerFields(data) {
  if (data == null) return data;
  if (Array.isArray(data)) return data.map(stripEmployerFields);
  if (typeof data !== 'object') return data;

  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (EMPLOYER_STRIP_KEYS.has(key)) continue;
    if (key === 'jobs' && Array.isArray(value)) {
      out[key] = value.map((job) => stripEmployerFields(job));
      continue;
    }
    out[key] = stripEmployerFields(value);
  }
  return out;
}

export function serializeCandidateForSubAdmin(candidate) {
  if (!candidate) return candidate;
  const { shortlistedJobId, shortlistedJob, ...safe } = candidate;
  return stripEmployerFields(safe);
}

export function serializeAdminUser(admin) {
  if (!admin) return admin;
  const { password, passwordHash, ...safe } = admin;
  return safe;
}

export function enrichCandidateWithSourceLabel(candidate, adminMap = {}) {
  if (!candidate) return candidate;
  let sourceLabel = 'Self-registered';
  if (candidate.source === 'SUB_ADMIN' && candidate.createdById) {
    sourceLabel = `Sub Admin: ${adminMap[candidate.createdById]?.name || candidate.createdById}`;
  } else if (candidate.source === 'ADMIN') {
    sourceLabel = 'Admin';
  } else if (candidate.source === 'SUPER_ADMIN') {
    sourceLabel = 'Super Admin';
  } else if (candidate.source === 'USER_PORTAL') {
    sourceLabel = 'Self-registered';
  }
  return { ...candidate, sourceLabel };
}
