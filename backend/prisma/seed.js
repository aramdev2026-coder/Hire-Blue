// ─────────────────────────────────────────────────────────────
// 🌱 Blue-Collar Central — Database Seed Script
// Seeds all test data with properly hashed passwords and
// resets the candidate ID sequence to start from 1000.
//
// Run with: npm run seed   (or: npx prisma db seed)
// ─────────────────────────────────────────────────────────────

import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  ADMINS,
  EMPLOYERS,
  JOBS,
  CANDIDATES,
  CANDIDATE_PROFILE_DEFAULTS,
  LANGUAGES,
  FEMALE_NAME_PATTERNS,
  TEST_PASSWORD,
} from './seedDummyData.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

// ─── Utilities ───────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dobForAge(age) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  d.setMonth(5);
  d.setDate(15);
  return d;
}

function isFemale(name) {
  return FEMALE_NAME_PATTERNS.some(p => name.includes(p));
}

// ─── 1. Seed Admins ──────────────────────────────────────────
async function seedAdmins(hashedPassword) {
  const byEmail = {};
  let superAdminId = null;

  for (const a of ADMINS) {
    const createdById = a.role === 'SUPER_ADMIN' ? null : superAdminId;

    const admin = await prisma.admin.upsert({
      where: { email: a.email },
      update: {
        name: a.name,
        phone: a.phone,
        role: a.role,
        region: a.region,
        isActive: true,
        password: hashedPassword,
        ...(a.role !== 'SUPER_ADMIN' && superAdminId ? { createdById: superAdminId } : {}),
      },
      create: {
        email: a.email,
        password: hashedPassword,
        name: a.name,
        phone: a.phone,
        role: a.role,
        region: a.region,
        isActive: true,
        createdById,
      },
    });

    byEmail[a.email] = admin;
    if (a.role === 'SUPER_ADMIN') superAdminId = admin.id;
  }

  return byEmail;
}

// ─── 2. Seed Employers (with hashed passwords) ──────────────
async function seedEmployers(superAdminId, hashedPassword) {
  const byKey = {};

  for (const e of EMPLOYERS) {
    const employer = await prisma.employer.upsert({
      where: { email: e.email },
      update: {
        companyName: e.companyName,
        phoneNumber: e.phoneNumber,
        password: hashedPassword, // 🛡️ Hashed, not plaintext
        status: e.status,
        ...(e.status === 'ACTIVE'
          ? { approvedById: superAdminId, approvedAt: daysAgo(14) }
          : { approvedById: null, approvedAt: null }),
      },
      create: {
        companyName: e.companyName,
        email: e.email,
        phoneNumber: e.phoneNumber,
        password: hashedPassword, // 🛡️ Hashed, not plaintext
        status: e.status,
        ...(e.status === 'ACTIVE'
          ? { approvedById: superAdminId, approvedAt: daysAgo(14) }
          : {}),
      },
    });
    byKey[e.key] = employer;
  }

  return byKey;
}

// ─── 3. Seed Jobs ────────────────────────────────────────────
async function seedJobs(employersByKey) {
  const jobsByKey = {};

  for (const j of JOBS) {
    const employer = employersByKey[j.employerKey];
    if (!employer) continue;

    const existing = await prisma.jobRequirement.findFirst({
      where: { employerId: employer.id, roleTitle: j.roleTitle },
    });

    const job = existing
      ? await prisma.jobRequirement.update({
          where: { id: existing.id },
          data: {
            salaryRange: j.salaryRange,
            location: j.location,
            maritalStatus: j.maritalStatus,
            educationLevel: j.educationLevel,
            expRequired: j.expRequired,
            vacanciesCount: j.vacanciesCount,
            isActive: true,
          },
        })
      : await prisma.jobRequirement.create({
          data: {
            employerId: employer.id,
            roleTitle: j.roleTitle,
            salaryRange: j.salaryRange,
            location: j.location,
            maritalStatus: j.maritalStatus,
            educationLevel: j.educationLevel,
            expRequired: j.expRequired,
            vacanciesCount: j.vacanciesCount,
            isActive: true,
          },
        });

    jobsByKey[`${j.employerKey}:${j.roleTitle}`] = job;
  }

  return jobsByKey;
}

// ─── 4. Reset Candidate ID Sequence ─────────────────────────
async function resetCandidateSequence() {
  // Reset the PostgreSQL sequence so the next candidate ID starts at 1000
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"Candidate"', 'id'), 999, true);
  `);
  console.log('🔢 Candidate ID sequence reset → next ID will be 1000');
}

// ─── 5. Seed Candidates ─────────────────────────────────────
async function seedCandidates(adminsByEmail, jobsByKey) {
  let count = 0;

  // Clear existing candidates to get clean IDs starting from 1000
  // Order matters due to foreign keys: delete children first
  await prisma.communicationLog.deleteMany({});
  await prisma.statusHistory.deleteMany({});
  await prisma.assignmentLog.deleteMany({});
  await prisma.candidateEducation.deleteMany({});
  await prisma.candidateTechnical.deleteMany({});
  await prisma.candidateExperience.deleteMany({});
  await prisma.candidate.deleteMany({});

  // Reset the sequence so IDs start fresh from 1000
  await resetCandidateSequence();

  for (const c of CANDIDATES) {
    const assignedTo = c.assignedSubAdminEmail
      ? adminsByEmail[c.assignedSubAdminEmail]?.id
      : null;

    let shortlistedJobId = null;
    if (c.shortlistedJobEmployerKey && c.shortlistedJobRole) {
      shortlistedJobId = jobsByKey[`${c.shortlistedJobEmployerKey}:${c.shortlistedJobRole}`]?.id ?? null;
    }

    const createdById = c.source === 'SUB_ADMIN'
      ? (assignedTo ?? adminsByEmail['subadmin.chennai@bluecollar.in']?.id)
      : c.source === 'ADMIN'
        ? adminsByEmail['admin.ops@bluecollar.in']?.id
        : null;

    const address = `${Math.floor(Math.random() * 200) + 1}, Main Street, ${c.district}`;
    const sex = isFemale(c.fullName) ? 'Female' : CANDIDATE_PROFILE_DEFAULTS.sex;

    const candidate = await prisma.candidate.create({
      data: {
        phoneNumber1: c.phone,
        phoneNumber2: null,
        fullName: c.fullName,
        presentDistrict: c.district,
        permanentDistrict: c.district,
        presentAddress: address,
        permanentAddress: address,
        presentState: CANDIDATE_PROFILE_DEFAULTS.presentState,
        permanentState: CANDIDATE_PROFILE_DEFAULTS.permanentState,
        jobRoles: c.roles,
        preferredDistricts: [c.district],
        expectedSalary: c.salary,
        languagesKnown: LANGUAGES.slice(0, 2 + (count % 3)),
        status: c.status,
        source: c.source,
        assignedToId: assignedTo,
        createdById,
        shortlistedJobId,
        sex,
        maritalStatus: count % 3 === 0 ? 'Married' : CANDIDATE_PROFILE_DEFAULTS.maritalStatus,
        dob: dobForAge(22 + (count % 12)),
        emailId: `${c.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        createdAt: daysAgo(30 - count),
      },
    });

    // Education (for non-wizard/new candidates)
    if (!['PENDING_WIZARD', 'NEW'].includes(c.status)) {
      await prisma.candidateEducation.create({
        data: {
          candidateId: candidate.id,
          institution: `${c.district} Govt Higher Secondary School`,
          course: '12th Standard',
        },
      });
    }

    // Experience (for verified/advanced status candidates)
    if (['VERIFIED', 'SHORTLISTED', 'PLACED', 'INTERVIEW_SCHEDULED', 'SELECTED'].includes(c.status)) {
      await prisma.candidateExperience.create({
        data: {
          candidateId: candidate.id,
          institution: `${c.district} Industrial Works`,
          fromYear: '2019',
          toYear: '2023',
        },
      });
    }

    count += 1;
  }

  return count;
}

// ─── 6. Seed Audit Trail Samples ─────────────────────────────
async function seedAuditTrail(adminsByEmail, superAdminId) {
  // Find some candidates to create audit trail for
  const candidates = await prisma.candidate.findMany({
    take: 5,
    orderBy: { id: 'asc' },
  });

  if (candidates.length === 0) return;

  const subAdminChennai = adminsByEmail['subadmin.chennai@bluecollar.in'];
  const subAdminCoimbatore = adminsByEmail['subadmin.coimbatore@bluecollar.in'];
  const opsAdmin = adminsByEmail['admin.ops@bluecollar.in'];

  // Assignment logs — simulate candidates being assigned to sub-admins
  for (const c of candidates.filter(c => c.assignedToId)) {
    const existing = await prisma.assignmentLog.findFirst({
      where: { candidateId: c.id },
    });
    if (!existing) {
      await prisma.assignmentLog.create({
        data: {
          candidateId: c.id,
          assignedToId: c.assignedToId,
          assignedById: superAdminId,
          assignedAt: daysAgo(Math.floor(Math.random() * 15) + 1),
        },
      });
    }
  }

  // Status history entries — simulate the status progression
  const firstCandidate = candidates[0];
  const statusProgression = ['NEW', 'PENDING_ADMIN_CALL', 'CONTACT_ATTEMPTED'];
  for (let i = 0; i < statusProgression.length; i++) {
    const fromStatus = i === 0 ? null : statusProgression[i - 1];
    await prisma.statusHistory.create({
      data: {
        candidateId: firstCandidate.id,
        fromStatus,
        toStatus: statusProgression[i],
        changedById: i === 0 ? superAdminId : (subAdminChennai?.id || superAdminId),
        changedAt: daysAgo(20 - i * 3),
      },
    });
  }

  // Communication logs — sample notes
  if (subAdminChennai && firstCandidate) {
    const noteExists = await prisma.communicationLog.findFirst({
      where: { candidateId: firstCandidate.id },
    });
    if (!noteExists) {
      await prisma.communicationLog.createMany({
        data: [
          {
            candidateId: firstCandidate.id,
            authorId: subAdminChennai.id,
            note: 'Called candidate — interested in Electrician role, follow up tomorrow.',
            callbackAt: daysAgo(-1),
            createdAt: daysAgo(5),
          },
          {
            candidateId: firstCandidate.id,
            authorId: subAdminChennai.id,
            note: 'Follow-up call completed. Candidate confirmed availability. Documents pending.',
            createdAt: daysAgo(3),
          },
        ],
      });
    }
  }

  // Blacklist note for the blacklisted candidate
  const blacklisted = await prisma.candidate.findFirst({ where: { status: 'BLACKLISTED' } });
  if (blacklisted && opsAdmin) {
    const noteExists = await prisma.communicationLog.findFirst({
      where: { candidateId: blacklisted.id },
    });
    if (!noteExists) {
      await prisma.communicationLog.create({
        data: {
          candidateId: blacklisted.id,
          authorId: opsAdmin.id,
          note: 'Provided fraudulent identity documents during verification. Blacklisted.',
          createdAt: daysAgo(2),
        },
      });
      await prisma.statusHistory.create({
        data: {
          candidateId: blacklisted.id,
          fromStatus: 'DOCUMENTS_PENDING',
          toStatus: 'BLACKLISTED',
          changedById: opsAdmin.id,
          changedAt: daysAgo(2),
        },
      });
    }
  }
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('🌱 ═══════════════════════════════════════════════');
  console.log('   Blue-Collar Central — Database Seed');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  // Hash passwords once (expensive operation)
  console.log('🔐 Hashing passwords (bcrypt, 12 rounds)...');
  const hashedAdmin = await bcrypt.hash('Admin@123', BCRYPT_ROUNDS);
  const hashedTest = await bcrypt.hash(TEST_PASSWORD, BCRYPT_ROUNDS);

  // Seed admins
  const adminsByEmail = await seedAdmins(hashedAdmin);
  const superAdmin = adminsByEmail['admin@bluecollar.in'];
  console.log(`✅ Admins: ${Object.keys(adminsByEmail).length} (Super Admin + Admins + Sub-Admins)`);

  // Seed employers (with hashed passwords)
  const employersByKey = await seedEmployers(superAdmin.id, hashedTest);
  console.log(`✅ Employers: ${Object.keys(employersByKey).length} (2 active, 2 pending, 1 rejected)`);

  // Seed jobs
  const jobsByKey = await seedJobs(employersByKey);
  console.log(`✅ Job orders: ${Object.keys(jobsByKey).length}`);

  // Seed candidates (IDs starting from 1000)
  const candidateCount = await seedCandidates(adminsByEmail, jobsByKey);
  console.log(`✅ Candidates: ${candidateCount} (IDs: 1000 – ${999 + candidateCount})`);

  // Seed audit trail
  await seedAuditTrail(adminsByEmail, superAdmin.id);
  console.log('✅ Audit trail: assignment logs, status history, communication notes');

  // Print credential summary
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│                    LOGIN CREDENTIALS                    │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ ADMIN PORTAL (password: Admin@123)                     │');
  console.log('│  Super Admin : admin@bluecollar.in                     │');
  console.log('│  Admin       : admin.ops@bluecollar.in                 │');
  console.log('│  Sub Admin   : subadmin.chennai@bluecollar.in          │');
  console.log('│  Sub Admin   : subadmin.coimbatore@bluecollar.in       │');
  console.log('│  Sub Admin   : subadmin.madurai@bluecollar.in          │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ EMPLOYER PORTAL (password: Test@123)                   │');
  console.log('│  hr@apexgarments.in          — ACTIVE                  │');
  console.log('│  jobs@sunriselogistics.in    — ACTIVE                  │');
  console.log('│  recruit@metrofoods.in       — PENDING                 │');
  console.log('│  careers@greenbuild.in       — PENDING                 │');
  console.log('│  contact@oldtowntextiles.in  — REJECTED                │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ CANDIDATE PORTAL (OTP: sandbox 123456 in dev)          │');
  console.log('│  Phone: 9876500001 – 9876500020                        │');
  console.log('│  Candidate IDs: 1000 – 1019                            │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
