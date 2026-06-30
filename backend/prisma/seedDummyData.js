// ─────────────────────────────────────────────────────────────
// Dummy data definitions for prisma/seed.js
// All test data for the Blue-Collar Central Platform
// ─────────────────────────────────────────────────────────────

export const TN_DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tiruppur', 'Erode', 'Vellore',
  'Thanjavur', 'Dindigul', 'Krishnagiri', 'Dharmapuri',
];

export const JOB_ROLES = [
  'Electrician', 'Driver', 'Office Assistant', 'Accountant', 'Supervisor',
  'Data Entry', 'Delivery Staff', 'Quality Controller', 'M/c Operator',
  'Plumber', 'Welding Technician', 'Security Guard', 'Housekeeping',
];

export const SALARY_RANGES = [
  '₹10,000 – ₹15,000', '₹15,000 – ₹20,000', '₹20,000 – ₹25,000', '₹25,000 – ₹30,000',
];

export const LANGUAGES = ['Tamil', 'English', 'Hindi', 'Telugu', 'Kannada'];

export const TEST_PASSWORD = 'Test@123';

// ─── Admin Users ─────────────────────────────────────────────
export const ADMINS = [
  {
    email: 'admin@bluecollar.in',
    name: 'Super Admin',
    phone: '9000000001',
    role: 'SUPER_ADMIN',
    region: null,
  },
  {
    email: 'admin.ops@bluecollar.in',
    name: 'Operations Admin',
    phone: '9000000002',
    role: 'ADMIN',
    region: null,
  },
  {
    email: 'subadmin.chennai@bluecollar.in',
    name: 'Ravi Kumar (Chennai)',
    phone: '9000000003',
    role: 'SUB_ADMIN',
    region: 'Chennai',
  },
  {
    email: 'subadmin.coimbatore@bluecollar.in',
    name: 'Priya Selvam (Coimbatore)',
    phone: '9000000004',
    role: 'SUB_ADMIN',
    region: 'Coimbatore',
  },
  {
    email: 'subadmin.madurai@bluecollar.in',
    name: 'Karthik Raja (Madurai)',
    phone: '9000000005',
    role: 'SUB_ADMIN',
    region: 'Madurai',
  },
];

// ─── Employers ───────────────────────────────────────────────
export const EMPLOYERS = [
  {
    key: 'apex',
    companyName: 'Apex Garments Pvt Ltd',
    email: 'hr@apexgarments.in',
    phoneNumber: '9444000001',
    status: 'ACTIVE',
  },
  {
    key: 'sunrise',
    companyName: 'Sunrise Logistics',
    email: 'jobs@sunriselogistics.in',
    phoneNumber: '9444000002',
    status: 'ACTIVE',
  },
  {
    key: 'metro',
    companyName: 'Metro Foods Processing',
    email: 'recruit@metrofoods.in',
    phoneNumber: '9444000003',
    status: 'PENDING_VERIFICATION',
  },
  {
    key: 'green',
    companyName: 'GreenBuild Constructions',
    email: 'careers@greenbuild.in',
    phoneNumber: '9444000004',
    status: 'PENDING_VERIFICATION',
  },
  {
    key: 'old',
    companyName: 'OldTown Textiles',
    email: 'contact@oldtowntextiles.in',
    phoneNumber: '9444000005',
    status: 'REJECTED',
  },
];

// ─── Job Requirements ────────────────────────────────────────
export const JOBS = [
  {
    employerKey: 'apex',
    roleTitle: 'Electrician',
    salaryRange: '₹15,000 – ₹20,000',
    location: ['Chennai', 'Tiruvallur'],
    maritalStatus: 'No Preference',
    educationLevel: '10th Pass',
    expRequired: 2,
    vacanciesCount: 3,
  },
  {
    employerKey: 'apex',
    roleTitle: 'Quality Controller',
    salaryRange: '₹20,000 – ₹25,000',
    location: ['Chennai'],
    maritalStatus: 'No Preference',
    educationLevel: '12th Pass',
    expRequired: 1,
    vacanciesCount: 2,
  },
  {
    employerKey: 'apex',
    roleTitle: 'Supervisor',
    salaryRange: '₹25,000 – ₹30,000',
    location: ['Chennai'],
    maritalStatus: 'No Preference',
    educationLevel: 'Diploma',
    expRequired: 3,
    vacanciesCount: 1,
  },
  {
    employerKey: 'sunrise',
    roleTitle: 'Driver',
    salaryRange: '₹15,000 – ₹20,000',
    location: ['Coimbatore', 'Erode'],
    maritalStatus: 'No Preference',
    educationLevel: '8th Pass',
    expRequired: 3,
    vacanciesCount: 5,
  },
  {
    employerKey: 'sunrise',
    roleTitle: 'Delivery Staff',
    salaryRange: '₹10,000 – ₹15,000',
    location: ['Coimbatore'],
    maritalStatus: 'No Preference',
    educationLevel: 'Any',
    expRequired: 0,
    vacanciesCount: 8,
  },
  {
    employerKey: 'metro',
    roleTitle: 'Supervisor',
    salaryRange: '₹25,000 – ₹30,000',
    location: ['Madurai'],
    maritalStatus: 'Married',
    educationLevel: 'Diploma',
    expRequired: 5,
    vacanciesCount: 1,
  },
  {
    employerKey: 'green',
    roleTitle: 'M/c Operator',
    salaryRange: '₹15,000 – ₹20,000',
    location: ['Salem'],
    maritalStatus: 'No Preference',
    educationLevel: 'ITI',
    expRequired: 1,
    vacanciesCount: 4,
  },
  {
    employerKey: 'green',
    roleTitle: 'Plumber',
    salaryRange: '₹15,000 – ₹20,000',
    location: ['Salem', 'Krishnagiri'],
    maritalStatus: 'No Preference',
    educationLevel: 'ITI',
    expRequired: 2,
    vacanciesCount: 3,
  },
];

// ─── Candidates (20 across all statuses and sources) ─────────
// phoneNumber1 must be unique — use 98xxxxxxxx range
export const CANDIDATES = [
  // === USER_PORTAL source ===
  {
    phone: '9876500001',
    fullName: 'Arun Kumar',
    district: 'Chennai',
    roles: ['Electrician', 'Supervisor'],
    salary: '₹15,000 – ₹20,000',
    status: 'PENDING_ADMIN_CALL',
    source: 'USER_PORTAL',
    assignedSubAdminEmail: 'subadmin.chennai@bluecollar.in',
  },
  {
    phone: '9876500002',
    fullName: 'Meena Devi',
    district: 'Chennai',
    roles: ['Quality Controller'],
    salary: '₹20,000 – ₹25,000',
    status: 'VERIFIED',
    source: 'USER_PORTAL',
    assignedSubAdminEmail: 'subadmin.chennai@bluecollar.in',
  },
  {
    phone: '9876500005',
    fullName: 'Rajesh M',
    district: 'Madurai',
    roles: ['Supervisor'],
    salary: '₹25,000 – ₹30,000',
    status: 'CONTACT_ATTEMPTED',
    source: 'USER_PORTAL',
    assignedSubAdminEmail: 'subadmin.madurai@bluecollar.in',
  },
  {
    phone: '9876500008',
    fullName: 'Lakshmi P',
    district: 'Tiruppur',
    roles: ['Quality Controller', 'Supervisor'],
    salary: '₹20,000 – ₹25,000',
    status: 'PENDING_WIZARD',
    source: 'USER_PORTAL',
    assignedSubAdminEmail: null,
  },
  {
    phone: '9876500009',
    fullName: 'Vijay Anand',
    district: 'Chennai',
    roles: ['Electrician'],
    salary: '₹20,000 – ₹25,000',
    status: 'INTERVIEW_SCHEDULED',
    source: 'USER_PORTAL',
    assignedSubAdminEmail: 'subadmin.chennai@bluecollar.in',
    shortlistedJobEmployerKey: 'apex',
    shortlistedJobRole: 'Electrician',
  },
  {
    phone: '9876500011',
    fullName: 'Karthik S',
    district: 'Tiruchirappalli',
    roles: ['Accountant'],
    salary: '₹20,000 – ₹25,000',
    status: 'ON_HOLD',
    source: 'USER_PORTAL',
    assignedSubAdminEmail: null,
  },
  {
    phone: '9876500013',
    fullName: 'Deepak R',
    district: 'Thanjavur',
    roles: ['Data Entry', 'Office Assistant'],
    salary: '₹15,000 – ₹20,000',
    status: 'INTERESTED',
    source: 'USER_PORTAL',
    assignedSubAdminEmail: 'subadmin.madurai@bluecollar.in',
  },
  {
    phone: '9876500014',
    fullName: 'Saranya K',
    district: 'Chennai',
    roles: ['Office Assistant'],
    salary: '₹15,000 – ₹20,000',
    status: 'SELECTED',
    source: 'USER_PORTAL',
    assignedSubAdminEmail: 'subadmin.chennai@bluecollar.in',
    shortlistedJobEmployerKey: 'apex',
    shortlistedJobRole: 'Quality Controller',
  },
  // === SUB_ADMIN source ===
  {
    phone: '9876500003',
    fullName: 'Suresh Babu',
    district: 'Coimbatore',
    roles: ['Driver', 'Delivery Staff'],
    salary: '₹15,000 – ₹20,000',
    status: 'SHORTLISTED',
    source: 'SUB_ADMIN',
    assignedSubAdminEmail: 'subadmin.coimbatore@bluecollar.in',
    shortlistedJobEmployerKey: 'sunrise',
    shortlistedJobRole: 'Driver',
  },
  {
    phone: '9876500004',
    fullName: 'Kavitha R',
    district: 'Coimbatore',
    roles: ['Data Entry', 'Office Assistant'],
    salary: '₹15,000 – ₹20,000',
    status: 'PLACED',
    source: 'SUB_ADMIN',
    assignedSubAdminEmail: 'subadmin.coimbatore@bluecollar.in',
  },
  {
    phone: '9876500007',
    fullName: 'Mohan Raj',
    district: 'Erode',
    roles: ['Driver'],
    salary: '₹15,000 – ₹20,000',
    status: 'DOCUMENTS_PENDING',
    source: 'SUB_ADMIN',
    assignedSubAdminEmail: 'subadmin.coimbatore@bluecollar.in',
  },
  {
    phone: '9876500010',
    fullName: 'Priya N',
    district: 'Vellore',
    roles: ['Office Assistant'],
    salary: '₹10,000 – ₹15,000',
    status: 'NEW',
    source: 'SUB_ADMIN',
    assignedSubAdminEmail: 'subadmin.chennai@bluecollar.in',
  },
  {
    phone: '9876500012',
    fullName: 'Anitha G',
    district: 'Chennai',
    roles: ['Delivery Staff'],
    salary: '₹10,000 – ₹15,000',
    status: 'UNREACHABLE',
    source: 'SUB_ADMIN',
    assignedSubAdminEmail: 'subadmin.chennai@bluecollar.in',
  },
  {
    phone: '9876500015',
    fullName: 'Senthil Kumar',
    district: 'Salem',
    roles: ['M/c Operator', 'Plumber'],
    salary: '₹15,000 – ₹20,000',
    status: 'VERIFIED',
    source: 'SUB_ADMIN',
    assignedSubAdminEmail: 'subadmin.coimbatore@bluecollar.in',
  },
  {
    phone: '9876500016',
    fullName: 'Mahalakshmi V',
    district: 'Madurai',
    roles: ['Quality Controller'],
    salary: '₹20,000 – ₹25,000',
    status: 'NOT_INTERESTED',
    source: 'SUB_ADMIN',
    assignedSubAdminEmail: 'subadmin.madurai@bluecollar.in',
  },
  // === ADMIN source ===
  {
    phone: '9876500006',
    fullName: 'Divya S',
    district: 'Salem',
    roles: ['M/c Operator'],
    salary: '₹15,000 – ₹20,000',
    status: 'INTERESTED',
    source: 'ADMIN',
    assignedSubAdminEmail: null,
  },
  {
    phone: '9876500017',
    fullName: 'Gopal Krishnan',
    district: 'Dindigul',
    roles: ['Welding Technician'],
    salary: '₹20,000 – ₹25,000',
    status: 'VERIFIED',
    source: 'ADMIN',
    assignedSubAdminEmail: 'subadmin.madurai@bluecollar.in',
  },
  {
    phone: '9876500018',
    fullName: 'Ramya T',
    district: 'Krishnagiri',
    roles: ['Housekeeping', 'Office Assistant'],
    salary: '₹10,000 – ₹15,000',
    status: 'BLACKLISTED',
    source: 'ADMIN',
    assignedSubAdminEmail: null,
    blacklistNote: 'Provided fraudulent identity documents during verification.',
  },
  // === Edge cases ===
  {
    phone: '9876500019',
    fullName: 'Thangavel M',
    district: 'Dharmapuri',
    roles: ['Security Guard'],
    salary: '₹10,000 – ₹15,000',
    status: 'INACTIVE',
    source: 'USER_PORTAL',
    assignedSubAdminEmail: null,
  },
  {
    phone: '9876500020',
    fullName: 'Revathi S',
    district: 'Coimbatore',
    roles: ['Data Entry'],
    salary: '₹15,000 – ₹20,000',
    status: 'REJECTED_BY_EMPLOYER',
    source: 'SUB_ADMIN',
    assignedSubAdminEmail: 'subadmin.coimbatore@bluecollar.in',
    shortlistedJobEmployerKey: 'sunrise',
    shortlistedJobRole: 'Delivery Staff',
  },
];

export const CANDIDATE_PROFILE_DEFAULTS = {
  sex: 'Male',
  maritalStatus: 'Single',
  presentState: 'Tamil Nadu',
  permanentState: 'Tamil Nadu',
};

// Female name patterns for auto-detecting sex field
export const FEMALE_NAME_PATTERNS = [
  'Meena', 'Kavitha', 'Divya', 'Lakshmi', 'Priya', 'Anitha',
  'Saranya', 'Mahalakshmi', 'Ramya', 'Revathi',
];
