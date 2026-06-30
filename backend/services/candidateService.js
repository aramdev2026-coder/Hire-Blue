const VALID_STATUSES = [
  'NEW', 'PENDING_WIZARD', 'PENDING_ADMIN_CALL', 'CONTACT_ATTEMPTED', 'UNREACHABLE',
  'INTERESTED', 'NOT_INTERESTED', 'DOCUMENTS_PENDING', 'VERIFIED', 'SHORTLISTED',
  'INTERVIEW_SCHEDULED', 'SELECTED', 'PLACED', 'REJECTED_BY_EMPLOYER',
  'ON_HOLD', 'BLACKLISTED', 'INACTIVE',
];

const SUB_ADMIN_FORBIDDEN = new Set(['PLACED', 'REJECTED_BY_EMPLOYER']);

export { VALID_STATUSES, SUB_ADMIN_FORBIDDEN };

export async function updateCandidateStatus(prisma, { candidateId, status, shortlistedJobId, changedById, note, forbiddenStatuses = [] }) {
  if (!VALID_STATUSES.includes(status)) {
    throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
  }
  if (forbiddenStatuses.includes(status)) {
    throw Object.assign(new Error(`Status ${status} is not allowed for your role`), { statusCode: 403 });
  }
  if (status === 'BLACKLISTED' && !note?.trim()) {
    throw Object.assign(new Error('A note is required when blacklisting a candidate'), { statusCode: 400 });
  }

  // candidateId is now an integer
  const id = typeof candidateId === 'string' ? parseInt(candidateId, 10) : candidateId;
  if (isNaN(id)) {
    throw Object.assign(new Error('Invalid candidate ID'), { statusCode: 400 });
  }

  const existing = await prisma.candidate.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Candidate not found'), { statusCode: 404 });
  }

  const data = { status };
  if (shortlistedJobId !== undefined) data.shortlistedJobId = shortlistedJobId;

  const [candidate] = await prisma.$transaction([
    prisma.candidate.update({ where: { id }, data }),
    prisma.statusHistory.create({
      data: {
        candidateId: id,
        fromStatus: existing.status,
        toStatus: status,
        changedById,
      },
    }),
    ...(status === 'BLACKLISTED' && note
      ? [prisma.communicationLog.create({
          data: { candidateId: id, authorId: changedById, note: note.trim() },
        })]
      : []),
  ]);

  return candidate;
}

export async function assignCandidates(prisma, { candidateIds, subAdminId, subAdminIds, strategy, assignedById }) {
  const targetIds = strategy === 'ROUND_ROBIN' && subAdminIds?.length
    ? subAdminIds
    : subAdminId ? [subAdminId] : [];

  if (!targetIds.length || !candidateIds?.length) {
    throw Object.assign(new Error('candidateIds and subAdminId/subAdminIds are required'), { statusCode: 400 });
  }

  const subAdmins = await prisma.admin.findMany({
    where: { id: { in: targetIds }, role: 'SUB_ADMIN', isActive: true },
  });
  if (subAdmins.length !== targetIds.length) {
    throw Object.assign(new Error('One or more target sub-admins are invalid or inactive'), { statusCode: 400 });
  }

  const ops = [];
  candidateIds.forEach((rawId, index) => {
    const candidateId = typeof rawId === 'string' ? parseInt(rawId, 10) : rawId;
    const assignToId = strategy === 'ROUND_ROBIN'
      ? targetIds[index % targetIds.length]
      : targetIds[0];
    ops.push(
      prisma.candidate.update({ where: { id: candidateId }, data: { assignedToId: assignToId } }),
      prisma.assignmentLog.create({
        data: { candidateId, assignedToId: assignToId, assignedById },
      }),
    );
  });

  await prisma.$transaction(ops);
  return { assigned: candidateIds.length };
}

export function buildCandidateFilters(query) {
  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.source) filters.source = query.source;
  if (query.district) filters.presentDistrict = query.district;
  if (query.role) filters.jobRoles = { has: query.role };
  return filters;
}

export async function findDuplicatePhones(prisma) {
  const candidates = await prisma.candidate.findMany({
    select: { id: true, phoneNumber1: true, fullName: true, status: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const byPhone = {};
  for (const c of candidates) {
    if (!byPhone[c.phoneNumber1]) byPhone[c.phoneNumber1] = [];
    byPhone[c.phoneNumber1].push(c);
  }

  return Object.entries(byPhone)
    .filter(([, group]) => group.length > 1)
    .map(([phone, group]) => ({ phoneNumber1: phone, candidates: group }));
}
