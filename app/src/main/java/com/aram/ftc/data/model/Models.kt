package com.aram.ftc.data.model

// ==========================================
// 1. AUTH & OTP REQUEST DATA STRUCTURES
// ==========================================

data class OtpRequest(
    val email: String
)

data class OtpResponse(
    val success: Boolean,
    val message: String
)

data class OtpVerifyRequest(
    val email: String,
    val otpCode: String
)

data class OtpVerifyResponse(
    val success: Boolean,
    val token: String,
    val candidateId: Int,
    val profileStatus: String
)

// ==========================================
// 2. CANDIDATE PROFILE DATA MODELS
// ==========================================

data class SaveWizardRequest(
    val candidateId: Int,
    val sectionIndex: Int,
    val updatedPayload: CandidatePayload
)

data class CandidatePayload(
    val fullName: String? = null,
    val dob: String? = null,
    val sex: String? = null,
    val maritalStatus: String? = null,
    val phoneNumber1: String? = null,
    val phoneNumber2: String? = null,
    val familyPhonePrimary: String? = null,
    val familyPhoneBackup: String? = null,
    val emailId: String? = null,
    val secondaryEmailId: String? = null,
    val presentAddress: String? = null,
    val presentDistrict: String? = null,
    val presentState: String? = null,
    val permanentAddress: String? = null,
    val permanentDistrict: String? = null,
    val permanentState: String? = null,
    val jobRoles: List<String> = emptyList(),
    val preferredDistricts: List<String> = emptyList(),
    val expectedSalary: String? = null,
    val languagesKnown: List<String> = emptyList(),
    val education: List<EducationItem> = emptyList(),
    val technical: List<TechnicalItem> = emptyList(),
    val experience: List<ExperienceItem> = emptyList()
)

data class EducationItem(
    val institution: String,
    val course: String
)

data class TechnicalItem(
    val institution: String,
    val course: String
)

data class ExperienceItem(
    val institution: String,
    val role: String,
    val fromYear: String,
    val toYear: String
)

data class CandidateProfileResponse(
    val success: Boolean,
    val candidate: CandidatePayload
)

data class FinalizeResponse(
    val success: Boolean
)

data class FinalizeWizardRequest(
    val candidateId: Int,
    val shouldSendWelcomeEmail: Boolean = false
)

data class UpdateEmployerProfileRequest(
    val companyName: String? = null,
    val phoneNumber: String? = null,
    val password: String? = null
)

// ==========================================
// 3. EMPLOYER DATA MODELS
// ==========================================

data class EmployerSignupRequest(
    val companyName: String,
    val email: String,
    val phoneNumber: String,
    val password: String
)

data class EmployerLoginRequest(
    val identifier: String, // Can be email or phone
    val password: String
)

data class EmployerLoginResponse(
    val success: Boolean,
    val token: String,
    val employerId: String,
    val companyName: String,
    val email: String? = null,
    val phoneNumber: String? = null
)

data class EmployerProfileResponse(
    val success: Boolean,
    val employer: EmployerDetails
)

data class EmployerDetails(
    val id: String,
    val companyName: String,
    val email: String,
    val phoneNumber: String
)

data class JobPostRequest(
    val jobs: List<JobRequirementPayload>
)

data class JobRequirementPayload(
    val id: String? = null,
    val roleTitle: String,
    val salaryRange: String,
    val location: List<String>,
    val maritalStatus: String = "No Preference",
    val educationLevel: String,
    val expRequired: Int = 0,
    val vacanciesCount: Int = 1,
    val minAge: Int = 18,
    val maxAge: Int = 99
)

data class JobsResponse(
    val success: Boolean,
    val jobs: List<JobWithMatches>
)

data class JobWithMatches(
    val id: String,
    val roleTitle: String,
    val salaryRange: String,
    val location: List<String>,
    val vacanciesCount: Int,
    val isActive: Boolean,
    val matchedCandidates: List<AnonymizedCandidate>
)

data class AnonymizedCandidate(
    val id: Int,
    val candidateIdNumber: String,
    val fullName: String,
    val experienceYears: String,
    val topEducation: String,
    val location: String,
    val gender: String
)
