// Seeds Super Admin, test admins, employers, jobs, and candidates.
// Run with: npm run seed   (or: npx prisma db seed)
import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  ADMINS,
  EMPLOYERS,
  JOBS,
  CANDIDATES,
  CANDIDATE_PROFILE_DEFAULTS,
  LANGUAGES,
  TEST_PASSWORD,
} from './seedDummyData.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

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

async function seedAdmins(hashed) {
  const byEmail = {};
  let superAdminId = null;

  for (const a of ADMINS) {
    const createdById = a.role === 'SUPER_ADMIN'
      ? null
      : a.role === 'ADMIN'
        ? superAdminId
        : superAdminId;

    const admin = await prisma.admin.upsert({
      where: { email: a.email },
      update: {
        name: a.name,
        phone: a.phone,
        role: a.role,
        region: a.region,
        isActive: true,
        password: hashed,
        ...(a.role !== 'SUPER_ADMIN' && superAdminId ? { createdById: superAdminId } : {}),
      },
      create: {
        email: a.email,
        password: hashed,
        name: a.name,
        phone: a.phone,
        role: a.role,
        region: a.region,
        isActive: true,
        createdById: a.role === 'SUPER_ADMIN' ? null : superAdminId,
      },
    });

    byEmail[a.email] = admin;
    if (a.role === 'SUPER_ADMIN') superAdminId = admin.id;
  }

  return byEmail;
}

async function seedEmployers(superAdminId, hashed) {
  const byKey = {};

  for (const e of EMPLOYERS) {
    const employer = await prisma.employer.upsert({
      where: { email: e.email },
      update: {
        companyName: e.companyName,
        phoneNumber: e.phoneNumber,
        password: hashed,
        status: e.status,
        ...(e.status === 'ACTIVE'
          ? { approvedById: superAdminId, approvedAt: daysAgo(14) }
          : { approvedById: null, approvedAt: null }),
      },
      create: {
        companyName: e.companyName,
        email: e.email,
        phoneNumber: e.phoneNumber,
        password: hashed,
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

async function seedCandidates(adminsByEmail, jobsByKey) {
  let count = 0;

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

    const candidate = await prisma.candidate.upsert({
      where: { phoneNumber1: c.phone },
      update: {
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
        languagesKnown: LANGUAGES.slice(0, 2),
        status: c.status,
        source: c.source,
        assignedToId: assignedTo,
        createdById,
        shortlistedJobId,
        sex: c.fullName.includes('Meena') || c.fullName.includes('Kavitha') || c.fullName.includes('Divya') || c.fullName.includes('Lakshmi') || c.fullName.includes('Priya') || c.fullName.includes('Anitha')
          ? 'Female'
          : CANDIDATE_PROFILE_DEFAULTS.sex,
        maritalStatus: CANDIDATE_PROFILE_DEFAULTS.maritalStatus,
        dob: dobForAge(22 + (count % 12)),
        emailId: `${c.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        updatedAt: daysAgo(count % 10),
      },
      create: {
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
        languagesKnown: LANGUAGES.slice(0, 2),
        status: c.status,
        source: c.source,
        assignedToId: assignedTo,
        createdById,
        shortlistedJobId,
        sex: CANDIDATE_PROFILE_DEFAULTS.sex,
        maritalStatus: CANDIDATE_PROFILE_DEFAULTS.maritalStatus,
        dob: dobForAge(22 + (count % 12)),
        emailId: `${c.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        createdAt: daysAgo(30 - count),
        updatedAt: daysAgo(count % 10),
      },
    });

    // Education / experience (idempotent: wipe and recreate)
    await prisma.candidateEducation.deleteMany({ where: { candidateId: candidate.id } });
    await prisma.candidateTechnical.deleteMany({ where: { candidateId: candidate.id } });
    await prisma.candidateExperience.deleteMany({ where: { candidateId: candidate.id } });

    if (!['PENDING_WIZARD', 'NEW'].includes(c.status)) {
      await prisma.candidateEducation.create({
        data: {
          candidateId: candidate.id,
          institution: `${c.district} Govt Higher Secondary School`,
          course: '12th Standard',
        },
      });
    }

    if (['VERIFIED', 'SHORTLISTED', 'PLACED', 'INTERVIEW_SCHEDULED'].includes(c.status)) {
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

async function seedAuditSamples(adminsByEmail, superAdminId) {
  const subAdmin = adminsByEmail['subadmin.chennai@bluecollar.in'];
  const candidate = await prisma.candidate.findFirst({
    where: { phoneNumber1: '9876500001' },
  });

  if (!candidate || !subAdmin) return;

  const existing = await prisma.assignmentLog.findFirst({
    where: { candidateId: candidate.id, assignedToId: subAdmin.id },
  });

  if (!existing) {
    await prisma.assignmentLog.create({
      data: {
        candidateId: candidate.id,
        assignedToId: subAdmin.id,
        assignedById: superAdminId,
        assignedAt: daysAgo(5),
      },
    });
  }

  const noteExists = await prisma.communicationLog.findFirst({
    where: { candidateId: candidate.id, authorId: subAdmin.id },
  });

  if (!noteExists) {
    await prisma.communicationLog.create({
      data: {
        candidateId: candidate.id,
        authorId: subAdmin.id,
        note: 'Called candidate — interested, follow up tomorrow.',
        callbackAt: daysAgo(-1),
      },
    });
  }
}

async function main() {
  console.log('🌱 Seeding Blue-Collar Central test data...\n');

  const hashedAdmin = await bcrypt.hash('Admin@123', 10);
  const hashedTest = await bcrypt.hash(TEST_PASSWORD, 10);

  const adminsByEmail = await seedAdmins(hashedAdmin);
  const superAdmin = adminsByEmail['admin@bluecollar.in'];
  console.log(`✅ Admins: ${Object.keys(adminsByEmail).length} (incl. Super Admin)`);

  const employersByKey = await seedEmployers(superAdmin.id, hashedTest);
  console.log(`✅ Employers: ${Object.keys(employersByKey).length} (2 active, 2 pending, 1 rejected)`);

  const jobsByKey = await seedJobs(employersByKey);
  console.log(`✅ Job orders: ${Object.keys(jobsByKey).length}`);

  const candidateCount = await seedCandidates(adminsByEmail, jobsByKey);
  console.log(`✅ Candidates: ${candidateCount} (mixed statuses & sources)`);

  await seedAuditSamples(adminsByEmail, superAdmin.id);
  console.log('✅ Sample assignment log & communication note');

  console.log('\n── Login credentials ──────────────────────────────');
  console.log('Super Admin : admin@bluecollar.in        / Admin@123');
  console.log('Admin       : admin.ops@bluecollar.in    / Admin@123');
  console.log('Sub Admin   : subadmin.chennai@bluecollar.in / Admin@123');
  console.log('Sub Admin   : subadmin.coimbatore@bluecollar.in / Admin@123');
  console.log('');
  console.log('Employers (user portal): password Test@123');
  console.log('  hr@apexgarments.in          — ACTIVE');
  console.log('  jobs@sunriselogistics.in    — ACTIVE');
  console.log('  recruit@metrofoods.in       — PENDING_VERIFICATION');
  console.log('  careers@greenbuild.in       — PENDING_VERIFICATION');
  console.log('  contact@oldtowntextiles.in  — REJECTED');
  console.log('──────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
