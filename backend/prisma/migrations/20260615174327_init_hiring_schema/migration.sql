-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('PENDING_WIZARD', 'PENDING_ADMIN_CALL', 'SHORTLISTED', 'PLACED');

-- CreateEnum
CREATE TYPE "EmployerStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'REJECTED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "phoneNumber1" TEXT NOT NULL,
    "phoneNumber2" TEXT,
    "fullName" TEXT,
    "dob" TIMESTAMP(3),
    "sex" TEXT,
    "maritalStatus" TEXT,
    "familyPhonePrimary" TEXT,
    "familyPhoneBackup" TEXT,
    "emailId" TEXT,
    "secondaryEmailId" TEXT,
    "presentAddress" TEXT,
    "presentDistrict" TEXT,
    "presentState" TEXT,
    "permanentAddress" TEXT,
    "permanentDistrict" TEXT,
    "permanentState" TEXT,
    "jobRoles" TEXT[],
    "preferredDistricts" TEXT[],
    "expectedSalary" TEXT,
    "languagesKnown" TEXT[],
    "status" "CandidateStatus" NOT NULL DEFAULT 'PENDING_WIZARD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateEducation" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "course" TEXT NOT NULL,

    CONSTRAINT "CandidateEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateTechnical" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "course" TEXT NOT NULL,

    CONSTRAINT "CandidateTechnical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateExperience" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "fromYear" TEXT NOT NULL,
    "toYear" TEXT NOT NULL,

    CONSTRAINT "CandidateExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employer" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "EmployerStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequirement" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "salaryRange" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL DEFAULT 'No Preference',
    "educationLevel" TEXT NOT NULL,
    "expRequired" TEXT NOT NULL,
    "vacanciesCount" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_phoneNumber1_key" ON "Candidate"("phoneNumber1");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_email_key" ON "Employer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_phoneNumber_key" ON "Employer"("phoneNumber");

-- AddForeignKey
ALTER TABLE "CandidateEducation" ADD CONSTRAINT "CandidateEducation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateTechnical" ADD CONSTRAINT "CandidateTechnical_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateExperience" ADD CONSTRAINT "CandidateExperience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequirement" ADD CONSTRAINT "JobRequirement_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
