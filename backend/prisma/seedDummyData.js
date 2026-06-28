// Dummy data definitions for prisma/seed.js
export const TN_DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tiruppur', 'Erode', 'Vellore',
];

export const JOB_ROLES = [
  'Electrician', 'Driver', 'Office Assistant', 'Accountant', 'Supervisor',
  'Data Entry', 'Delivery Staff', 'Quality Controller', 'M/c Operator',
];

export const SALARY_RANGES = [
  '₹10,000 – ₹15,000', '₹15,000 – ₹20,000', '₹20,000 – ₹25,000', '₹25,000 – ₹30,000',
];

export const LANGUAGES = ['Tamil', 'English', 'Hindi'];

export const TEST_PASSWORD = 'Test@123';

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
];

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
];

// phoneNumber1 must be unique — use 98xxxxxxxx range
export const CANDIDATES = [
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
    phone: '9876500005',
    fullName: 'Rajesh M',
    district: 'Madurai',
    roles: ['Supervisor'],
    salary: '₹25,000 – ₹30,000',
    status: 'CONTACT_ATTEMPTED',
    source: 'USER_PORTAL',
    assignedSubAdminEmail: 'subadmin.chennai@bluecollar.in',
  },
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
    phone: '9876500012',
    fullName: 'Anitha G',
    district: 'Chennai',
    roles: ['Delivery Staff'],
    salary: '₹10,000 – ₹15,000',
    status: 'UNREACHABLE',
    source: 'SUB_ADMIN',
    assignedSubAdminEmail: 'subadmin.chennai@bluecollar.in',
  },
];

export const CANDIDATE_PROFILE_DEFAULTS = {
  sex: 'Male',
  maritalStatus: 'Single',
  presentState: 'Tamil Nadu',
  permanentState: 'Tamil Nadu',
};
