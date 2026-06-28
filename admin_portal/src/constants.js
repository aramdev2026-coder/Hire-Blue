export const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri', 'Madurai',
  'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni',
  'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
  'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar',
];

export const JOB_ROLES = [
  'Garments', 'Merchandiser', 'Office Assistant', 'HR Manager', 'Store In-Charge',
  'Marketing Staff', 'Delivery Staff', 'M/c Operator', 'Driver', 'Follow-up', 'Data Entry',
  'Quality Controller', 'Sales Rep', 'Supervisor', 'Documentation', 'Accountant',
  'Packing / Checking', 'Production Follow-up',
];

export const SALARY_RANGES = [
  '₹10,000 – ₹15,000', '₹15,000 – ₹20,000', '₹20,000 – ₹25,000',
  '₹25,000 – ₹30,000', '₹30,000 – ₹35,000', '₹35,000 – ₹40,000',
];

export const LANGUAGES = ['Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu', 'Kannada'];

export const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say'];

export const MARITAL_OPTIONS = ['Single', 'Married', 'Widowed', 'Divorced'];

export const ALL_CANDIDATE_STATUSES = [
  'NEW', 'PENDING_WIZARD', 'PENDING_ADMIN_CALL', 'CONTACT_ATTEMPTED', 'UNREACHABLE',
  'INTERESTED', 'NOT_INTERESTED', 'DOCUMENTS_PENDING', 'VERIFIED', 'SHORTLISTED',
  'INTERVIEW_SCHEDULED', 'SELECTED', 'PLACED', 'REJECTED_BY_EMPLOYER', 'ON_HOLD', 'BLACKLISTED', 'INACTIVE',
];

export const SOURCE_COLORS = {
  'Self-registered': 'bg-sky-50 text-sky-700 border-sky-200',
  'Admin': 'bg-violet-50 text-violet-700 border-violet-200',
  'Super Admin': 'bg-amber-50 text-amber-700 border-amber-200',
};

export function sourceBadgeClass(sourceLabel) {
  if (sourceLabel?.startsWith('Sub Admin')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  return SOURCE_COLORS[sourceLabel] || 'bg-slate-50 text-slate-600 border-slate-200';
}

export function formatStatus(status) {
  return status?.replace(/_/g, ' ') || '';
}

export function emptyCandidateForm() {
  return {
    fullName: '',
    phoneNumber1: '',
    phoneNumber2: '',
    dob: '',
    sex: '',
    maritalStatus: '',
    familyPhonePrimary: '',
    familyPhoneBackup: '',
    emailId: '',
    secondaryEmailId: '',
    presentStreet1: '',
    presentStreet2: '',
    presentCity: '',
    presentState: 'Tamil Nadu',
    sameAddress: true,
    permanentStreet1: '',
    permanentStreet2: '',
    permanentCity: '',
    permanentState: 'Tamil Nadu',
    jobRoles: [],
    preferredDistricts: [],
    expectedSalary: '',
    languagesKnown: [],
    education: [{ institution: '', course: '' }],
    technical: [{ institution: '', course: '' }],
    experience: [{ institution: '', role: '', fromYear: '', toYear: '' }],
  };
}
