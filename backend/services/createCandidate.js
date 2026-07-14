import { sendWelcomeCandidateEmail } from './emailService.js';

export async function createFullCandidate(prisma, data, meta) {
  const {
    fullName, phoneNumber1, phoneNumber2, dob, sex, maritalStatus,
    familyPhonePrimary, familyPhoneBackup, emailId, secondaryEmailId,
    presentAddress, presentDistrict, presentState,
    permanentAddress, permanentDistrict, permanentState,
    jobRoles, preferredDistricts, expectedSalary, languagesKnown,
    education = [], technical = [], experience = [],
    source, createdById, assignedToId, status = 'NEW',
  } = data;

  const candidate = await prisma.$transaction(async (tx) => {
    const created = await tx.candidate.create({
      data: {
        fullName,
        phoneNumber1,
        phoneNumber2,
        dob: dob ? new Date(dob) : null,
        sex,
        maritalStatus,
        familyPhonePrimary,
        familyPhoneBackup,
        emailId,
        secondaryEmailId,
        presentAddress,
        presentDistrict,
        presentState,
        permanentAddress,
        permanentDistrict,
        permanentState,
        jobRoles: Array.isArray(jobRoles) ? jobRoles : [],
        preferredDistricts: Array.isArray(preferredDistricts) ? preferredDistricts : [],
        expectedSalary,
        languagesKnown: Array.isArray(languagesKnown) ? languagesKnown : [],
        status,
        source,
        createdById,
        assignedToId,
      },
    });

    if (education.length) {
      await tx.candidateEducation.createMany({
        data: education.map((item) => ({
          candidateId: created.id,
          institution: item.institution || '',
          course: item.course || '',
        })),
      });
    }
    if (technical.length) {
      await tx.candidateTechnical.createMany({
        data: technical.map((item) => ({
          candidateId: created.id,
          institution: item.institution || '',
          course: item.course || '',
        })),
      });
    }
    if (experience.length) {
      await tx.candidateExperience.createMany({
        data: experience.map((item) => ({
          candidateId: created.id,
          institution: item.institution || '',
          fromYear: String(item.fromYear || ''),
          toYear: String(item.toYear || ''),
        })),
      });
    }

    await tx.statusHistory.create({
      data: {
        candidateId: created.id,
        fromStatus: null,
        toStatus: status,
        changedById: meta.changedById,
      },
    });

    return tx.candidate.findUnique({
      where: { id: created.id },
      include: { education: true, technical: true, experience: true },
    });
  });

  if (candidate && candidate.emailId) {
    sendWelcomeCandidateEmail(candidate.emailId, candidate.fullName).catch(err => {
      console.error(`Failed sending welcome candidate email async: ${err.message}`);
    });
  }

  return candidate;
}
