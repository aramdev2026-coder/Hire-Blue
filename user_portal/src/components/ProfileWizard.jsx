import React, { useState, useEffect } from 'react';
import { User, Briefcase, GraduationCap, Trash2, Plus } from 'lucide-react';
import LegalModal from './LegalModal';

const ALL_JOB_ROLES = [
  "Agricultural Laborer",
  "Aircraft Mechanic",
  "Assembly Line Worker",
  "Assembly Technician",
  "Auto Body Repair Technician",
  "Auto Mechanic",
  "Automotive Painter",
  "Baker",
  "Blaster",
  "Boiler Operator",
  "Butcher",
  "CNC Machine Operator",
  "Carpenter",
  "Concrete Finisher",
  "Crane Operator",
  "Delivery Executive",
  "Diesel Mechanic",
  "Dispatcher",
  "Drilling Machine Operator",
  "Drywall Installer",
  "Dyeing Machine Operator",
  "Electrician",
  "Elevator Mechanic",
  "Embroidery Machine Operator",
  "Event Crew",
  "Fabric Cutter",
  "Facility Manager",
  "Farm Equipment Operator",
  "Fire and Safety Officer",
  "Fitter",
  "Fleet Maintenance Supervisor",
  "Forklift Operator",
  "Foundry Worker",
  "General Laborer",
  "Groundskeeper",
  "HVAC Technician",
  "Heavy Equipment Operator",
  "Heavy Truck Driver",
  "Housekeeper",
  "Industrial Electrician",
  "Industrial Painter",
  "Injection Molding Operator",
  "Inventory Clerk",
  "Ironworker",
  "Irrigation Technician",
  "Janitor",
  "Kitchen Helper",
  "Light Vehicle Driver",
  "Line Cook",
  "Loader / Unloader",
  "Logistics Coordinator",
  "Machinist",
  "Maintenance Technician",
  "Mason",
  "Material Handler",
  "Miner",
  "Packaging Operator",
  "Painter",
  "Picker and Packer",
  "Plumber",
  "Production Supervisor",
  "Quality Control Inspector",
  "Roofer",
  "Scaffolder",
  "Security Guard",
  "Sewing Machine Operator",
  "Site Supervisor",
  "Surveyor Assistant",
  "Tailor",
  "Tire Technician",
  "Tool and Die Maker",
  "Turner",
  "Waiter",
  "Warehouse Associate",
  "Weaver",
  "Welder"
];

const HIGH_DEMAND_ROLES = [
  'Merchandiser',
  'Office Assistant',
  'HR Manager',
  'Store In-Charge',
  'Marketing Staff',
  'Delivery Staff',
  'M/c Operator',
  'Driver',
  'Follow-up',
  'Data Entry',
  'Quality Controller',
  'Sales Rep',
  'Supervisor',
  'Documentation',
  'Accountant',
  'Packing / Checking',
  'Production Follow-up'
];

const SALARY_STEPS = [
  10000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 32000, 35000, 40000, 45000, 50000,
  60000, 70000, 80000, 90000, 100000, 120000, 150000, 180000, 200000, 220000, 250000, 275000, 300000, 330000, 350000, 375000, 400000, 425000, 450000, 475000, 500000
];

const parseSalaryRange = (salaryStr) => {
  const defaultMin = 15000;
  const defaultMax = 25000;
  if (!salaryStr) return { minVal: defaultMin, maxVal: defaultMax };

  const numbers = salaryStr.match(/\d[\d,.]*/g);
  if (!numbers || numbers.length === 0) return { minVal: defaultMin, maxVal: defaultMax };

  const minParsed = parseInt(numbers[0].replace(/,/g, ''), 10) || defaultMin;
  const maxParsed = numbers[1] ? (parseInt(numbers[1].replace(/,/g, ''), 10) || defaultMax) : minParsed;

  return { minVal: minParsed, maxVal: maxParsed };
};

const findClosestIdx = (val) => {
  let closestIdx = 0;
  let minDiff = Math.abs(SALARY_STEPS[0] - val);
  for (let i = 1; i < SALARY_STEPS.length; i++) {
    const diff = Math.abs(SALARY_STEPS[i] - val);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  }
  return closestIdx;
};
const LANGUAGES = ['Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia', 'Assamese', 'Urdu', 'Sanskrit', 'Konkani', 'Kashmiri'];
import { STATES_AND_DISTRICTS, TN_COLLEGES } from '../utils/locationData';
const TN_DISTRICTS = STATES_AND_DISTRICTS["Tamil Nadu"];
const COURSE_DEGREES = [
  "SSLC (10th)",
  "HSC (12th)",
  "ITI",
  "Diploma",
  "B.A.",
  "B.Sc.",
  "B.Com.",
  "B.B.A.",
  "B.C.A.",
  "B.E. / B.Tech.",
  "M.A.",
  "M.Sc.",
  "M.Com.",
  "M.B.A.",
  "M.C.A.",
  "Other"
];

const normalizeEducationItem = (item) => {
  if (!item) return { institution: '', customInstitution: '', course: '', customCourse: '' };
  const isStandardCol = TN_COLLEGES.includes(item.institution);
  const isStandardCourse = COURSE_DEGREES.includes(item.course);
  return {
    institution: isStandardCol ? item.institution : (item.institution ? "Other" : ""),
    customInstitution: isStandardCol ? "" : (item.institution || ""),
    course: isStandardCourse ? item.course : (item.course ? "Other" : ""),
    customCourse: isStandardCourse ? "" : (item.course || "")
  };
};

const STEP_NAMES = ['Personal Details', 'Job Preferences', 'Education & Experience'];

function Lbl({ children, req }) {
  return (
    <label className="field-label">
      {children}{req && <span className="required-star"> *</span>}
    </label>
  );
}
function Err({ msg }) {
  return msg ? <p className="field-error">{msg}</p> : null;
}
function Field({ label, req, error, children, span2 }) {
  return (
    <div className={`field${span2 ? ' span-full' : ''}`}>
      <Lbl req={req}>{label}</Lbl>
      {children}
      <Err msg={error} />
    </div>
  );
}

function safeArr(v) { return Array.isArray(v) ? v : []; }

function normalizeExperienceItem(item) {
  return {
    institution: item?.institution || '',
    role: item?.role || '',
    fromYear: item?.fromYear != null ? String(item.fromYear) : '',
    toYear: item?.toYear != null ? String(item.toYear) : '',
  };
}

const composeAddr = (s1, s2) =>
  [s1, s2].map(x => (x || '').trim()).filter(Boolean).join(', ');

function buildInit(init, phone) {
  const splitAddr = (full, street1, street2) => {
    const raw = full || '';
    if (raw.includes(', ')) {
      const parts = raw.split(', ');
      return { street1: parts[0] || '', street2: parts.slice(1).join(', ') };
    }
    if (full) {
      return { street1: raw, street2: '' };
    }
    return { street1: street1 || '', street2: street2 || '' };
  };
  const present = splitAddr(init?.presentAddress, init?.presentStreet1, init?.presentStreet2);
  const permanent = splitAddr(init?.permanentAddress, init?.permanentStreet1, init?.permanentStreet2);

  const fallbackPresentAddress = composeAddr(init?.presentStreet1, init?.presentStreet2);
  const fallbackPermanentAddress = composeAddr(init?.permanentStreet1, init?.permanentStreet2);

  return {
    fullName: init?.fullName || '',
    dob: init?.dob ? new Date(init.dob).toISOString().split('T')[0] : '',
    sex: init?.sex || '',
    maritalStatus: init?.maritalStatus || '',
    phoneNumber1: (init?.phoneNumber1 && !init.phoneNumber1.startsWith('EMAIL_AUTO_')) ? init.phoneNumber1 : '',
    phoneNumber2: init?.phoneNumber2 || '',
    familyPhonePrimary: init?.familyPhonePrimary || '',
    familyPhoneBackup: init?.familyPhoneBackup || '',
    emailId: init?.emailId || phone || '',
    secondaryEmailId: init?.secondaryEmailId || '',
    presentStreet1: present.street1,
    presentStreet2: present.street2,
    presentCity: init?.presentCity || init?.presentDistrict || '',
    presentState: init?.presentState || 'Tamil Nadu',
    permanentStreet1: permanent.street1,
    permanentStreet2: permanent.street2,
    permanentCity: init?.permanentCity || init?.permanentDistrict || '',
    permanentState: init?.permanentState || 'Tamil Nadu',
    presentAddress: init?.presentAddress || fallbackPresentAddress,
    permanentAddress: init?.permanentAddress || fallbackPermanentAddress,
    jobRoles: safeArr(init?.jobRoles),
    preferredDistricts: safeArr(init?.preferredDistricts),
    expectedSalary: init?.expectedSalary || '₹15,000 - ₹25,000',
    languagesKnown: safeArr(init?.languagesKnown),
    education: safeArr(init?.education).length ? init.education.map(normalizeEducationItem) : [{ institution: '', customInstitution: '', course: '', customCourse: '' }],
    technical: safeArr(init?.technical).length ? init.technical : [{ institution: '', course: '' }],
    experience: safeArr(init?.experience).length ? init.experience.map(normalizeExperienceItem) : [{ institution: '', role: '', fromYear: '', toYear: '' }],
  };
}

export default function ProfileWizard({ backendUrl, candidateId, verifiedPhone, initialData, onFinalizeSubmit }) {
  const draftKey = `wiz_draft_${candidateId}`;
  const stepKey = `wiz_step_${candidateId}`;
  const rolesKey = `wiz_custom_roles_${candidateId}`;

  // DYNAMIC ROLES STATE (Loads hardcoded presets + any custom variants added earlier)
  const [wizardRoles, setWizardRoles] = useState(() => {
    try {
      const saved = localStorage.getItem(rolesKey);
      return saved ? JSON.parse(saved) : HIGH_DEMAND_ROLES;
    } catch {
      return HIGH_DEMAND_ROLES;
    }
  });

  const [customRoleInput, setCustomRoleInput] = useState('');
  const [roleQuery, setRoleQuery] = useState('');

  const [form, setForm] = React.useState(() => {
    try {
      const s = localStorage.getItem(draftKey);
      if (s) {
        const p = JSON.parse(s);
        ['jobRoles', 'preferredDistricts', 'languagesKnown', 'education', 'technical', 'experience']
          .forEach(k => { if (!Array.isArray(p[k])) p[k] = []; });
        p.education = p.education.map(normalizeEducationItem);
        p.experience = p.experience.map(normalizeExperienceItem);
        p.emailId = verifiedPhone || p.emailId;
        if (p.phoneNumber1 && p.phoneNumber1.startsWith('EMAIL_AUTO_')) {
          p.phoneNumber1 = '';
        }
        if (p.presentStreet1 === undefined) {
          const parts = (p.presentAddress || '').split(', ');
          p.presentStreet1 = parts[0] || '';
          p.presentStreet2 = parts.slice(1).join(', ');
          p.presentCity = p.presentCity ?? p.presentDistrict ?? '';
          p.presentState = p.presentState || 'Tamil Nadu';
        }
        if (p.permanentStreet1 === undefined) {
          const parts = (p.permanentAddress || '').split(', ');
          p.permanentStreet1 = parts[0] || '';
          p.permanentStreet2 = parts.slice(1).join(', ');
          p.permanentCity = p.permanentCity ?? p.permanentDistrict ?? '';
          p.permanentState = p.permanentState || 'Tamil Nadu';
        }
        return p;
      }
    } catch { }
    return buildInit(initialData, verifiedPhone);
  });

  // Automatically ensure that if the initial data contains values not in standard presets, they display as options
  useEffect(() => {
    if (form.jobRoles && form.jobRoles.length > 0) {
      setWizardRoles(prev => {
        const missing = form.jobRoles.filter(role => !prev.includes(role));
        if (missing.length > 0) {
          const combined = [...prev, ...missing];
          localStorage.setItem(rolesKey, JSON.stringify(combined));
          return combined;
        }
        return prev;
      });
    }
  }, [form.jobRoles]);

  const [step, setStep] = React.useState(() => {
    const savedStep = localStorage.getItem(stepKey);
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  const [reviewing, setReviewing] = React.useState(false);
  const [sameAddr, setSameAddr] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [serverErr, setServerErr] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [acceptedTerms, setAcceptedTerms] = React.useState(true);
  const [preferredState, setPreferredState] = React.useState('Tamil Nadu');
  const [showLegal, setShowLegal] = React.useState(false);
  const [activeColSuggestIdx, setActiveColSuggestIdx] = React.useState(null);

  React.useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(form));
    localStorage.setItem(stepKey, step.toString());
  }, [form, step, candidateId]);

  React.useEffect(() => {
    if (step === 1) {
      setForm(p => {
        let newForm = { ...p };
        let changed = false;

        if (p.presentAddress && (!p.presentStreet1 || p.presentStreet1.trim() === '')) {
          const parts = p.presentAddress.split(', ');
          newForm.presentStreet1 = parts[0] || '';
          newForm.presentStreet2 = parts.slice(1).join(', ') || '';
          if (!newForm.presentCity) {
            newForm.presentCity = p.presentDistrict || '';
          }
          changed = true;
        }

        if (p.permanentAddress && (!p.permanentStreet1 || p.permanentStreet1.trim() === '')) {
          const parts = p.permanentAddress.split(', ');
          newForm.permanentStreet1 = parts[0] || '';
          newForm.permanentStreet2 = parts.slice(1).join(', ') || '';
          if (!newForm.permanentCity) {
            newForm.permanentCity = p.permanentDistrict || '';
          }
          changed = true;
        }

        return changed ? newForm : p;
      });
    }
  }, [step]);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const syncAddr = (checked) => {
    setSameAddr(checked);
    if (checked) setForm(p => ({
      ...p,
      permanentStreet1: p.presentStreet1,
      permanentStreet2: p.presentStreet2,
      permanentCity: p.presentCity,
      permanentState: p.presentState,
    }));
  };

  const toggle = (key, val) => setForm(p => {
    const a = p[key];
    return { ...p, [key]: a.includes(val) ? a.filter(x => x !== val) : [...a, val] };
  });

  const updRow = (tbl, i, f, v) => setForm(p => {
    const r = [...p[tbl]]; r[i] = { ...r[i], [f]: v };
    return { ...p, [tbl]: r };
  });
  const addRow = (tbl) => setForm(p => ({
    ...p, [tbl]: [...p[tbl],
    tbl === 'experience'
      ? { institution: '', role: '', fromYear: '', toYear: '' }
      : { institution: '', customInstitution: '', course: '', customCourse: '' }
    ]
  }));
  const delRow = (tbl, i) => setForm(p => ({ ...p, [tbl]: p[tbl].filter((_, j) => j !== i) }));

  // --- HANDLER FOR CANDIDATE CUSTOM ROLE FIELDS ---
  const handleSelectRole = (role) => {
    const trimmed = role.trim();
    if (!trimmed) return;

    // Append custom role to the available array options state if unique
    if (!ALL_JOB_ROLES.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
      if (!wizardRoles.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
        const nextRoles = [...wizardRoles, trimmed];
        setWizardRoles(nextRoles);
        localStorage.setItem(rolesKey, JSON.stringify(nextRoles));
      }
    }

    // Automatically check / select the role item in the jobRoles payload field
    if (!form.jobRoles.includes(trimmed)) {
      setForm(prev => ({
        ...prev,
        jobRoles: [...prev.jobRoles, trimmed]
      }));
    }

    setRoleQuery('');
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!form.dob) {
        e.dob = 'Date of birth is required';
      } else {
        const birthDate = new Date(form.dob);
        const dobYear = birthDate.getFullYear();
        if (dobYear < 1900) {
          e.dob = 'Year cannot be before 1900';
        } else {
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 18) {
            e.dob = 'You must be at least 18 years old';
          }
        }
      }
      if (!form.sex) e.sex = 'Please select a gender';
      if (!form.maritalStatus) e.maritalStatus = 'Please select marital status';
      if (!form.phoneNumber1) {
        e.phoneNumber1 = 'Primary mobile number is required';
      } else if (!/^[6-9]\d{9}$/.test(form.phoneNumber1)) {
        e.phoneNumber1 = 'Enter a valid 10-digit mobile number';
      }
      if (!form.phoneNumber2) {
        e.phoneNumber2 = 'Alternate mobile number is required';
      } else if (!/^[6-9]\d{9}$/.test(form.phoneNumber2)) {
        e.phoneNumber2 = 'Enter a valid 10-digit mobile number';
      } else if (form.phoneNumber2 === form.phoneNumber1) {
        e.phoneNumber2 = 'Alternate mobile number must be different from primary mobile';
      }
      const emailTrimmed = String(form.emailId || '').trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const domainTypos = [
        'gamil.com', 'gamil.co', 'gmaill.com', 'gmaile.com', 'gmile.com', 'gmail.con', 'gmail.col',
        'yaho.com', 'yhoo.com', 'yahoo.co', 'hotmal.com', 'hotmale.com', 'outlok.com', 'outloock.com',
        'gamil.in', 'gamil.net', 'gamil.org', 'yaho.in', 'yahoo.con', 'hotmail.con'
      ];
      const [localPart, domainPart] = emailTrimmed.split('@');

      if (!emailTrimmed) {
        e.emailId = 'Email address is required';
      } else if (
        !emailRegex.test(emailTrimmed) ||
        (localPart.length > 5 && !/[aeiouy]/.test(localPart)) ||
        /([a-zA-Z0-9])\1{4,}/.test(localPart) ||
        domainTypos.includes(domainPart)
      ) {
        e.emailId = 'Please enter a valid, legitimate email address';
      }

      if (form.secondaryEmailId) {
        const secEmail = String(form.secondaryEmailId).trim().toLowerCase();
        const [secLocal, secDomain] = secEmail.split('@');
        if (
          !emailRegex.test(secEmail) ||
          (secLocal.length > 5 && !/[aeiouy]/.test(secLocal)) ||
          /([a-zA-Z0-9])\1{4,}/.test(secLocal) ||
          domainTypos.includes(secDomain)
        ) {
          e.secondaryEmailId = 'Please enter a valid, legitimate email address';
        }
      }
      if (!form.presentStreet1.trim()) e.presentStreet1 = 'Street address is required';
      if (!form.presentCity) e.presentCity = 'City / Town is required';
      if (!sameAddr) {
        if (!form.permanentStreet1.trim()) e.permanentStreet1 = 'Street address is required';
        if (!form.permanentCity) e.permanentCity = 'City / Town is required';
      }
      if (!acceptedTerms) {
        e.acceptedTerms = 'You must accept the terms and privacy policy to proceed';
      }
    }
    if (step === 2) {
      if (!form.jobRoles.length) e.jobRoles = 'Select at least one job role';
      if (!form.preferredDistricts.length) e.preferredDistricts = 'Select at least one district';
      if (!form.expectedSalary) e.expectedSalary = 'Salary expectation is required';
      if (!form.languagesKnown.length) e.languagesKnown = 'Select at least one language';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setServerErr('');
    if (!validate()) return;
    setSaving(true);
    try {
      let payload;
      if (step === 1) {
        payload = {
          ...form,
          presentAddress: composeAddr(form.presentStreet1, form.presentStreet2),
          presentDistrict: form.presentCity,
          permanentAddress: sameAddr
            ? composeAddr(form.presentStreet1, form.presentStreet2)
            : composeAddr(form.permanentStreet1, form.permanentStreet2),
          permanentDistrict: sameAddr ? form.presentCity : form.permanentCity,
        };
      } else if (step === 2) {
        const toArray = v => Array.isArray(v) ? v : (typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : []);
        payload = {
          ...form,
          jobRoles: toArray(form.jobRoles),
          preferredDistricts: toArray(form.preferredDistricts),
          languagesKnown: toArray(form.languagesKnown),
          expectedSalary: form.expectedSalary || '',
        };
      } else {
        payload = {
          ...form,
          education: (form.education || []).map(r => ({
            institution: r.institution === "Other" ? (r.customInstitution || "Other") : r.institution,
            course: r.course === "Other" ? (r.customCourse || "Other") : r.course
          }))
        };
      }
      const res = await fetch(`${backendUrl}/candidate/save-wizard-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('candidate_token')}`
        },
        body: JSON.stringify({ candidateId, sectionIndex: step, updatedPayload: payload }),
      });
      if (!res.ok) throw new Error('Could not save.');
      if (step === 1) {
        const composedPresentAddress = composeAddr(form.presentStreet1, form.presentStreet2);
        const composedPermanentAddress = sameAddr
          ? composedPresentAddress
          : composeAddr(form.permanentStreet1, form.permanentStreet2);
        setForm(p => ({
          ...p,
          presentAddress: composedPresentAddress,
          presentDistrict: p.presentCity,
          permanentAddress: composedPermanentAddress,
          permanentDistrict: sameAddr ? p.presentCity : p.permanentCity,
        }));
      }
    } catch (err) {
      setServerErr('Could not connect to server. Check your backend.');
      setSaving(false);
      return;
    }
    setSaving(false);
    if (step < 3) { setStep(s => s + 1); setErrors({}); }
    else { setReviewing(true); }
  };

  const handleFinalize = async () => {
    try {
      await fetch(`${backendUrl}/candidate/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('candidate_token')}`
        },
        body: JSON.stringify({ candidateId }),
      });
    } catch { }
    localStorage.removeItem(draftKey);
    localStorage.removeItem(stepKey);
    localStorage.removeItem(rolesKey);
    onFinalizeSubmit({
      ...form,
      education: (form.education || []).map(r => ({
        institution: r.institution === "Other" ? (r.customInstitution || "Other") : r.institution,
        course: r.course === "Other" ? (r.customCourse || "Other") : r.course
      })),
      presentAddress: composeAddr(form.presentStreet1, form.presentStreet2),
      presentDistrict: form.presentCity,
      permanentAddress: sameAddr
        ? composeAddr(form.presentStreet1, form.presentStreet2)
        : composeAddr(form.permanentStreet1, form.permanentStreet2),
      permanentDistrict: sameAddr ? form.presentCity : form.permanentCity,
    });
  };

  if (reviewing) return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-title">Review your profile</div>
        <div className="review-copy">Check everything before submitting.</div>
      </div>
      <div className="panel-body panel-body--compact">

        <div className="section-heading">Personal Details</div>
        <div className="responsive-grid section-divider">
          <RV label="Full Name" val={form.fullName} />
          <RV label="Mobile" val={`+91 ${form.phoneNumber1}`} />
          <RV label="Date of Birth" val={form.dob} />
          <RV label="Gender" val={form.sex} />
          <RV label="Marital Status" val={form.maritalStatus} />
          {form.emailId && <RV label="Email" val={form.emailId} />}
          <div className="span-full">
            <RV label="Present Address" val={composeAddr(form.presentStreet1, form.presentStreet2) + (form.presentCity ? `, ${form.presentCity}` : '') + (form.presentState ? `, ${form.presentState}` : '')} />
          </div>
          <div className="span-full">
            <RV label="Permanent Address" val={composeAddr(form.permanentStreet1, form.permanentStreet2) + (form.permanentCity ? `, ${form.permanentCity}` : '') + (form.permanentState ? `, ${form.permanentState}` : '')} />
          </div>
        </div>

        <div className="section-heading">Job Preferences</div>
        <div className="section-divider">
          <RV label="Monthly Salary Expectation" val={form.expectedSalary} />
          <TagReview label="Job Roles" tags={form.jobRoles} color="#000" />
          <TagReview label="Districts" tags={form.preferredDistricts} color="#1d4ed8" />
          <TagReview label="Languages" tags={form.languagesKnown} color="#059669" />
        </div>

        {form.education.some(r => r.institution) && <>
          <div className="section-heading">Education</div>
          <div className="table-wrapper">
            <table className="responsive-table">
              <thead><tr><th className="table-cell--small">#</th><th>Institution</th><th>Course</th></tr></thead>
              <tbody>{form.education.filter(r => r.institution).map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.institution === "Other" ? (r.customInstitution || "Other") : r.institution}</td>
                  <td>{r.course === "Other" ? (r.customCourse || "Other") : r.course}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>}
        {form.experience.some(r => r.institution) && <>
          <div className="section-heading mt-16">Work Experience</div>
          <div className="table-wrapper">
            <table className="responsive-table">
              <thead><tr><th className="table-cell--small">#</th><th>Organisation</th><th>Role</th><th className="table-cell--xsmall">From</th><th className="table-cell--xsmall">To</th></tr></thead>
              <tbody>{form.experience.filter(r => r.institution).map((r, i) => (
                <tr key={i}><td>{i + 1}</td><td>{r.institution}</td><td>{r.role}</td><td>{r.fromYear}</td><td>{r.toYear}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </>}
      </div>

      <div className="panel-actions">
        <button type="button" className="button button-ghost" onClick={() => { setReviewing(false); setStep(1); }}>
          Back to edit
        </button>
        <button type="button" className="button button-primary" onClick={handleFinalize}>
          Confirm & Submit
        </button>
      </div>
    </div>
  );

  return (
    <div className="wizard-card">
      <div className="wizard-header">
        <div>
          <div className="wizard-step-label">Step {step} of 3</div>
          <div className="wizard-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {step === 1 && <User size={20} />}
            {step === 2 && <Briefcase size={20} />}
            {step === 3 && <GraduationCap size={20} />}
            <span>{STEP_NAMES[step - 1]}</span>
          </div>
        </div>
        <div className="step-indicator">
          {[1, 2, 3].map(s => (
            <span key={s} className={`step-dot ${s <= step ? 'step-dot--active' : ''} ${s === step ? 'step-dot--current' : s < step ? 'step-dot--prev' : 'step-dot--next'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleNext}>
        <div className="panel-body">
          {serverErr && <div className="alert-box error">{serverErr}</div>}

          {step === 1 && (<>
            <div className="responsive-grid">
              <Field label="Full Name" req error={errors.fullName}>
                <input className={`input${errors.fullName ? ' input-error' : ''}`} type="text" placeholder="e.g. Arun Kumar"
                  value={form.fullName} onChange={e => upd('fullName', e.target.value)} autoFocus />
              </Field>
              <Field label="Verified Email">
                <input className="input input-readonly" readOnly disabled value={form.emailId} />
              </Field>
              <Field label="Date of Birth" req error={errors.dob}>
                <input className={`input${errors.dob ? ' input-error' : ''}`} type="date"
                  min="1900-01-01" max={new Date().toISOString().split('T')[0]}
                  value={form.dob} onChange={e => upd('dob', e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()} />
              </Field>
              <Field label="Gender" req error={errors.sex}>
                <select className={`select${errors.sex ? ' select-error' : ''}`} value={form.sex} onChange={e => upd('sex', e.target.value)}>
                  <option value="">Select</option><option>Male</option><option>Female</option><option>Prefer not to say</option>
                </select>
              </Field>
              <Field label="Marital Status" req error={errors.maritalStatus}>
                <select className={`select${errors.maritalStatus ? ' select-error' : ''}`} value={form.maritalStatus} onChange={e => upd('maritalStatus', e.target.value)}>
                  <option value="">Select</option><option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
                </select>
              </Field>
              <Field label="Primary Mobile" req error={errors.phoneNumber1}>
                <input className={`input${errors.phoneNumber1 ? ' input-error' : ''}`} type="tel" maxLength={10} placeholder="e.g. 9876543210"
                  value={form.phoneNumber1} onChange={e => upd('phoneNumber1', e.target.value.replace(/\D/g, ''))} />
              </Field>
              <Field label="Family Contact">
                <input className="input" type="tel" maxLength={10} placeholder="Optional"
                  value={form.familyPhonePrimary} onChange={e => upd('familyPhonePrimary', e.target.value.replace(/\D/g, ''))} />
              </Field>
              <Field label="Alternate Mobile" req error={errors.phoneNumber2}>
                <input className={`input${errors.phoneNumber2 ? ' input-error' : ''}`} type="tel" maxLength={10} placeholder="e.g. 9876543210"
                  value={form.phoneNumber2} onChange={e => upd('phoneNumber2', e.target.value.replace(/\D/g, ''))} />
              </Field>
              <Field label="Secondary Email">
                <input className="input" type="email" placeholder="Optional"
                  value={form.secondaryEmailId} onChange={e => upd('secondaryEmailId', e.target.value)} />
              </Field>
            </div>

            <div className="section-heading">Present Address</div>
            <Field label="Street Address 1" req error={errors.presentStreet1}>
              <input className={`input${errors.presentStreet1 ? ' input-error' : ''}`} type="text"
                placeholder="House/Building Number and Street Name"
                value={form.presentStreet1} onChange={e => upd('presentStreet1', e.target.value)} />
            </Field>
            <Field label="Street Address 2">
              <input className="input" type="text"
                placeholder="Apartment, Suite, Unit, or Floor Number (Optional)"
                value={form.presentStreet2} onChange={e => upd('presentStreet2', e.target.value)} />
            </Field>
            <div className="responsive-grid">
              <Field label="State" req>
                <select className="select" value={form.presentState || 'Tamil Nadu'} onChange={e => {
                  upd('presentState', e.target.value);
                  upd('presentCity', '');
                }}>
                  {Object.keys(STATES_AND_DISTRICTS).map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </Field>
              <Field label="District / City" req error={errors.presentCity}>
                <select className={`select${errors.presentCity ? ' select-error' : ''}`}
                  value={form.presentCity} onChange={e => upd('presentCity', e.target.value)}>
                  <option value="">Select district</option>
                  {(STATES_AND_DISTRICTS[form.presentState || 'Tamil Nadu'] || []).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" checked={sameAddr} onChange={e => syncAddr(e.target.checked)} className="checkbox-input" />
              <span className="checkbox-copy">
                Permanent address is same as present address
              </span>
            </label>

            {!sameAddr && (<>
              <div className="section-heading">Permanent Address</div>
              <Field label="Street Address 1" req error={errors.permanentStreet1}>
                <input className={`input${errors.permanentStreet1 ? ' input-error' : ''}`} type="text"
                  placeholder="House/Building Number and Street Name"
                  value={form.permanentStreet1} onChange={e => upd('permanentStreet1', e.target.value)} />
              </Field>
              <Field label="Street Address 2">
                <input className="input" type="text"
                  placeholder="Apartment, Suite, Unit, or Floor Number (Optional)"
                  value={form.permanentStreet2} onChange={e => upd('permanentStreet2', e.target.value)} />
              </Field>
              <div className="responsive-grid">
                <Field label="State" req>
                  <select className="select" value={form.permanentState || 'Tamil Nadu'} onChange={e => {
                    upd('permanentState', e.target.value);
                    upd('permanentCity', '');
                  }}>
                    {Object.keys(STATES_AND_DISTRICTS).map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </Field>
                <Field label="District / City" req error={errors.permanentCity}>
                  <select className={`select${errors.permanentCity ? ' select-error' : ''}`}
                    value={form.permanentCity} onChange={e => upd('permanentCity', e.target.value)}>
                    <option value="">Select district</option>
                    {(STATES_AND_DISTRICTS[form.permanentState || 'Tamil Nadu'] || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
            </>)}
            <label className="checkbox-label" style={{ marginTop: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', textAlign: 'left' }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="checkbox-input"
                style={{ width: '16px', height: '16px', cursor: 'pointer', margin: '4px 0 0 0', flexShrink: 0 }}
              />
              <span className="checkbox-copy" style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.4' }}>
                I accept the <button type="button" onClick={() => setShowLegal(true)} className="btn-inline" style={{ display: 'inline', border: 'none', background: 'none', padding: 0, textDecoration: 'underline', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>Terms and Conditions</button> and <button type="button" onClick={() => setShowLegal(true)} className="btn-inline" style={{ display: 'inline', border: 'none', background: 'none', padding: 0, textDecoration: 'underline', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>Privacy Policy</button>.
              </span>
            </label>
            {errors.acceptedTerms && (
              <div className="error-copy" style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '4px', textAlign: 'left' }}>
                {errors.acceptedTerms}
              </div>
            )}
          </>)}

          {step === 2 && (<>
            <div className="field-label-row">
              <Lbl req>Job Roles</Lbl>
              <div className="field-inline-actions">
                <button type="button" className="button button-ghost button-small" onClick={() => upd('jobRoles', [])}>Clear All</button>
              </div>
            </div>

            {/* Common/High Demand Roles (Quick Select) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                Common Job Roles (High Demand) - Click to select:
              </span>
              <div className="tag-panel" style={{ minHeight: 'auto', padding: '12px', background: '#f8fafc' }}>
                {HIGH_DEMAND_ROLES.map(r => {
                  const on = form.jobRoles.includes(r);
                  return (
                    <button
                      type="button"
                      key={r}
                      className={`tag-chip${on ? ' selected' : ''}`}
                      onClick={() => toggle('jobRoles', r)}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Autocomplete Search Bar */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                Search & Add Custom Roles:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input"
                  style={{ flex: 1, padding: '8px 14px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  placeholder="Type to search roles (e.g. Electrician, Carpenter, Welder)..."
                  value={roleQuery}
                  onChange={e => setRoleQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (roleQuery.trim()) {
                        handleSelectRole(roleQuery);
                      }
                    }
                  }}
                />
              </div>

              {/* Autocomplete Dropdown List */}
              {roleQuery.trim() && (() => {
                const trimmedQuery = roleQuery.trim().toLowerCase();
                const allSearchableRoles = [...new Set([...ALL_JOB_ROLES, ...wizardRoles])];
                const filteredSuggestions = allSearchableRoles.filter(r =>
                  r.toLowerCase().includes(trimmedQuery)
                ).slice(0, 10);
                const isExactMatch = allSearchableRoles.some(r => r.toLowerCase() === trimmedQuery);

                return (
                  <div className="search-dropdown-menu">
                    {filteredSuggestions.map(r => {
                      const isSelected = form.jobRoles.includes(r);
                      return (
                        <div
                          key={r}
                          className="search-dropdown-item"
                          onMouseDown={(e) => e.preventDefault()}
                          style={{
                            background: isSelected ? '#f8fafc' : '#ffffff'
                          }}
                          onClick={() => handleSelectRole(r)}
                        >
                          <span style={{ color: '#1e293b' }}>{r}</span>
                          {isSelected && (
                            <span style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 600 }}>✓ Selected</span>
                          )}
                        </div>
                      );
                    })}

                    {/* Incremental add custom role row if not exact match */}
                    {!isExactMatch && (
                      <div
                        className="search-dropdown-item custom-add-item"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectRole(roleQuery)}
                      >
                        + Add "{roleQuery.trim()}" as a new role
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Selected Roles List */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                Selected Job Roles ({form.jobRoles.length}):
              </span>
              {form.jobRoles.length === 0 ? (
                <div style={{ padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
                  No roles selected yet. Use the quick select options or search above to add your job preferences.
                </div>
              ) : (
                <div className="tag-panel" style={{ minHeight: 'auto', padding: '12px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                  {form.jobRoles.map(r => (
                    <button
                      type="button"
                      key={r}
                      className="tag-chip selected"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => toggle('jobRoles', r)}
                    >
                      {r}
                      <span style={{ fontSize: '14px', marginLeft: '2px', fontWeight: 'normal' }}>×</span>
                    </button>
                  ))}
                </div>
              )}
              <Err msg={errors.jobRoles} />
            </div>

             <div className="field-label-row mt-16">
               <Lbl req>Preferred Districts</Lbl>
               <div className="field-inline-actions">
                 <button type="button" className="button button-ghost button-small" onClick={() => upd('preferredDistricts', [...new Set([...form.preferredDistricts, ...(STATES_AND_DISTRICTS[preferredState] || [])])])}>Add All for {preferredState}</button>
                 <button type="button" className="button button-ghost button-small" onClick={() => upd('preferredDistricts', [])}>Clear All</button>
               </div>
             </div>
             <div className="responsive-grid" style={{ marginBottom: '10px' }}>
               <Field label="Filter by State">
                 <select className="select" value={preferredState} onChange={e => setPreferredState(e.target.value)}>
                   {Object.keys(STATES_AND_DISTRICTS).map(st => <option key={st} value={st}>{st}</option>)}
                 </select>
               </Field>
               <Field label="Choose District" error={errors.preferredDistricts}>
                 <select className="select" value=""
                   onChange={e => e.target.value && toggle('preferredDistricts', e.target.value)}>
                   <option value="">Select District…</option>
                   {(STATES_AND_DISTRICTS[preferredState] || []).filter(d => !form.preferredDistricts.includes(d)).map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
               </Field>
             </div>
            <div className={`tag-panel${errors.preferredDistricts ? ' has-error' : ''}`}>
              {form.preferredDistricts.length === 0
                ? <span className="field-note">No districts added yet</span>
                : form.preferredDistricts.map(d => (
                  <button type="button" key={d} className="tag-chip selected" onClick={() => toggle('preferredDistricts', d)}>
                    {d} x
                  </button>
                ))}
            </div>
            <Err msg={errors.preferredDistricts} />

            <div className="mt-12">
              <Field label="Monthly Salary Expectation" req error={errors.expectedSalary}>
                {(() => {
                  const { minVal, maxVal } = parseSalaryRange(form.expectedSalary);
                  const minIdx = findClosestIdx(minVal);
                  const maxIdx = findClosestIdx(maxVal);

                  const handleMinSliderChange = (e) => {
                    const newMinIdx = Math.min(parseInt(e.target.value, 10), maxIdx - 1);
                    const formattedSalary = `₹${SALARY_STEPS[newMinIdx].toLocaleString('en-IN')} - ₹${SALARY_STEPS[maxIdx].toLocaleString('en-IN')}`;
                    upd('expectedSalary', formattedSalary);
                  };

                  const handleMaxSliderChange = (e) => {
                    const newMaxIdx = Math.max(parseInt(e.target.value, 10), minIdx + 1);
                    const formattedSalary = `₹${SALARY_STEPS[minIdx].toLocaleString('en-IN')} - ₹${SALARY_STEPS[newMaxIdx].toLocaleString('en-IN')}`;
                    upd('expectedSalary', formattedSalary);
                  };

                  const leftPercent = (minIdx / (SALARY_STEPS.length - 1)) * 100;
                  const rightPercent = (maxIdx / (SALARY_STEPS.length - 1)) * 100;

                  return (
                    <div className="salary-slider-wrapper">
                      <div className="salary-display">
                        {form.expectedSalary || `₹${minVal.toLocaleString('en-IN')} - ₹${maxVal.toLocaleString('en-IN')}`}
                      </div>

                      <div className="range-slider-container">
                        <div className="range-slider-track" />
                        <div
                          className="range-slider-highlight"
                          style={{
                            left: `${leftPercent}%`,
                            width: `${rightPercent - leftPercent}%`
                          }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={SALARY_STEPS.length - 1}
                          value={minIdx}
                          onChange={handleMinSliderChange}
                          className="range-slider-input"
                        />
                        <input
                          type="range"
                          min={0}
                          max={SALARY_STEPS.length - 1}
                          value={maxIdx}
                          onChange={handleMaxSliderChange}
                          className="range-slider-input"
                        />
                      </div>

                      <div className="salary-labels">
                        <span>Min: ₹10,000</span>
                        <span>Max: ₹5,00,000</span>
                      </div>
                    </div>
                  );
                })()}
              </Field>
            </div>

            <div className="mt-12">
              <Lbl req>Languages Known</Lbl>
              <div className={`tag-panel${errors.languagesKnown ? ' has-error' : ''}`}>
                {LANGUAGES.map(l => {
                  const on = form.languagesKnown.includes(l);
                  return <button type="button" key={l} className={`tag-chip${on ? ' selected' : ''}`} onClick={() => toggle('languagesKnown', l)}>{l}</button>;
                })}
              </div>
              <Err msg={errors.languagesKnown} />
            </div>
          </>)}

          {step === 3 && (<>
            <div className="notice-box">
              <p>This section is <strong>optional</strong>. Leave blank and click "Review" to skip.</p>
            </div>

            <div className="section-heading">Educational Qualifications</div>
            <div className="table-wrapper table-wrapper--visible">
              <table className="responsive-table table-editable">
                <thead><tr>
                  <th>Institution</th>
                  <th>Course / Degree</th>
                  <th className="table-cell--small"></th>
                </tr></thead>
                <tbody>
                  {form.education.map((r, i) => (
                    <tr key={i}>
                      <td data-label="Institution" style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="input input-inline"
                          placeholder="Search college..."
                          value={r.institution}
                          onChange={e => {
                            updRow('education', i, 'institution', e.target.value);
                            if (!e.target.value) {
                              updRow('education', i, 'customInstitution', '');
                            }
                          }}
                          onFocus={() => setActiveColSuggestIdx(i)}
                          onBlur={() => setTimeout(() => setActiveColSuggestIdx(null), 250)}
                          autoComplete="off"
                        />
                        {activeColSuggestIdx === i && (() => {
                          const query = (r.institution || '').trim().toLowerCase();
                          const suggestions = query && query !== 'other'
                            ? TN_COLLEGES.filter(c => c.toLowerCase().includes(query)).slice(0, 5)
                            : TN_COLLEGES.slice(0, 5);

                          return (
                            <div className="search-dropdown-menu" style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              zIndex: 100,
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              maxHeight: '220px',
                              overflowY: 'auto'
                            }}>
                              {suggestions.map(s => (
                                <div
                                  key={s}
                                  className="search-dropdown-item"
                                  style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px', textAlign: 'left', color: '#1e293b' }}
                                  onMouseDown={() => {
                                    updRow('education', i, 'institution', s);
                                    updRow('education', i, 'customInstitution', '');
                                  }}
                                >
                                  {s}
                                </div>
                              ))}
                              <div
                                className="search-dropdown-item custom-add-item"
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: '13px',
                                  textAlign: 'left',
                                  color: '#002db3',
                                  fontWeight: 'bold',
                                  background: '#eff6ff'
                                }}
                                onMouseDown={() => {
                                  updRow('education', i, 'institution', 'Other');
                                  updRow('education', i, 'customInstitution', '');
                                }}
                              >
                                Other (Outside Tamil Nadu / Not in List)
                              </div>
                            </div>
                          );
                        })()}
                        {r.institution === 'Other' && (
                          <input
                            className="input input-inline"
                            style={{ marginTop: '8px' }}
                            placeholder="Enter school/college name"
                            value={r.customInstitution || ''}
                            onChange={e => updRow('education', i, 'customInstitution', e.target.value)}
                          />
                        )}
                      </td>
                      <td data-label="Course / Degree">
                        <select
                          className="select select-inline"
                          value={r.course}
                          onChange={e => {
                            const val = e.target.value;
                            updRow('education', i, 'course', val);
                            if (val !== "Other") {
                              updRow('education', i, 'customCourse', '');
                            }
                          }}
                        >
                          <option value="">Select Course / Degree</option>
                          {COURSE_DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                          <option value="Other">Other</option>
                        </select>
                        {r.course === "Other" && (
                          <input
                            className="input input-inline"
                            style={{ marginTop: '8px' }}
                            placeholder="Enter course/degree name"
                            value={r.customCourse || ''}
                            onChange={e => updRow('education', i, 'customCourse', e.target.value)}
                          />
                        )}
                      </td>
                      <td data-label=" " className="text-center">
                        <button type="button" className="button button-ghost button-small" onClick={() => delRow('education', i)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--danger)' }}>
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="button button-ghost button-small" onClick={() => addRow('education')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              <Plus size={16} />
              Add Row
            </button>

            <div className="section-heading">Technical Qualifications</div>
            <div className="table-wrapper">
              <table className="responsive-table table-editable">
                <thead><tr>
                  <th>Institution</th>
                  <th>Course / Certificate</th>
                  <th className="table-cell--small"></th>
                </tr></thead>
                <tbody>
                  {form.technical.map((r, i) => (
                    <tr key={i}>
                      <td data-label="Institution"><input className="input input-inline" placeholder="Institute name" value={r.institution} onChange={e => updRow('technical', i, 'institution', e.target.value)} /></td>
                      <td data-label="Course / Certificate"><input className="input input-inline" placeholder="e.g. Tally ERP" value={r.course} onChange={e => updRow('technical', i, 'course', e.target.value)} /></td>
                      <td data-label=" " className="text-center">
                        <button type="button" className="button button-ghost button-small" onClick={() => delRow('technical', i)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--danger)' }}>
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="button button-ghost button-small" onClick={() => addRow('technical')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              <Plus size={16} />
              Add Row
            </button>

            <div className="section-heading">Work Experience</div>
            <div className="table-wrapper">
              <table className="responsive-table table-editable">
                <thead><tr>
                  <th>Organisation</th>
                  <th>Role</th>
                  <th className="table-cell--xsmall">From</th>
                  <th className="table-cell--xsmall">To</th>
                  <th className="table-cell--small"></th>
                </tr></thead>
                <tbody>
                  {form.experience.map((r, i) => (
                    <tr key={i}>
                      <td data-label="Organisation"><input className="input input-inline" placeholder="Company" value={r.institution} onChange={e => updRow('experience', i, 'institution', e.target.value)} /></td>
                      <td data-label="Role"><input className="input input-inline" placeholder="Job Title" value={r.role || ''} onChange={e => updRow('experience', i, 'role', e.target.value)} /></td>
                      <td data-label="From"><input className="input input-inline" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} placeholder="YYYY" value={r.fromYear || ''} onChange={e => updRow('experience', i, 'fromYear', e.target.value.replace(/\D/g, '').slice(0, 4))} /></td>
                      <td data-label="To"><input className="input input-inline" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} placeholder="YYYY" value={r.toYear || ''} onChange={e => updRow('experience', i, 'toYear', e.target.value.replace(/\D/g, '').slice(0, 4))} /></td>
                      <td data-label=" " className="text-center">
                        <button type="button" className="button button-ghost button-small" onClick={() => delRow('experience', i)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--danger)' }}>
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="button button-ghost button-small" onClick={() => addRow('experience')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              <Plus size={16} />
              Add Row
            </button>
          </>)}
        </div>

        <div className="panel-actions">
          {step > 1
            ? <button type="button" className="button button-ghost" onClick={() => { setStep(s => s - 1); setErrors({}); }}>Back</button>
            : <div />
          }
          <button type="submit" disabled={saving} className="button button-primary">
            {saving ? 'Saving…' : step === 3 ? 'Review' : 'Save & Continue'}
          </button>
        </div>
      </form>
      <LegalModal isOpen={showLegal} onClose={() => setShowLegal(false)} />
    </div>
  );
}

function RV({ label, val }) {
  return (
    <div className="review-field">
      <p className="review-label">{label}</p>
      <p className="review-value">{val || '—'}</p>
    </div>
  );
}
function TagReview({ label, tags, color }) {
  if (!tags?.length) return null;
  const badgeClass = color === '#000'
    ? 'badge badge--muted'
    : color === '#1d4ed8'
      ? 'badge badge--primary'
      : 'badge badge--success';
  return (
    <div className="mt-16">
      <p className="review-label">{label}</p>
      <div className="badge-list">
        {tags.map(t => (
          <span key={t} className={badgeClass}>{t}</span>
        ))}
      </div>
    </div>
  );
}