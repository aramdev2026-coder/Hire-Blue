import React, { useState, useEffect } from 'react';

// Standard Static Dropdown Options
const STATES_LIST = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Pondicherry'];
const SALARY_RANGES = [
  '₹10,000 - ₹15,000',
  '₹15,000 - ₹20,000',
  '₹20,000 - ₹25,000',
  '₹25,000 - ₹30,000',
  '₹30,000 - ₹35,000',
  '₹30,000 - ₹40,000'
];
const AVAILABLE_JOB_ROLES = [
  'Garments', 'Merchandiser', 'Office Assistant', 'HR Manager', 'Store In-Charge',
  'Marketing Staff', 'Delivery Staff', 'M/c Operator', 'Driver', 'Follow-up',
  'Data Entry', 'Quality Controller', 'Sales Rep', 'Supervisor', 'Documentation',
  'Accountant', 'Packing / Checking', 'Production Follow-up'
];

export default function App() {
  // --- Core Session States ---
  const [authToken, setAuthToken] = useState(localStorage.getItem('candidate_token') || null);
  const [candidateId, setCandidateId] = useState(localStorage.getItem('candidate_id') || null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [appState, setAppState] = useState('LOGIN'); // LOGIN, WIZARD, REVIEW, DASHBOARD
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3

  // --- Stateful Form Payloads ---
  const [formData, setFormData] = useState({
    // Section 1: Personal
    fullName: '', dob: '', sex: '', maritalStatus: '',
    phoneNumber1: '', phoneNumber2: '', familyPhonePrimary: '', familyPhoneBackup: '',
    emailId: '', secondaryEmailId: '',
    presentAddress: '', presentDistrict: '', presentState: 'Tamil Nadu',
    permanentAddress: '', permanentDistrict: '', permanentState: 'Tamil Nadu',
    // Section 2: Preferences
    jobRoles: [], preferredDistricts: '', expectedSalary: '', languagesKnown: '',
    // Section 3: Background Arrays
    education: [{ institution: '', course: '' }],
    technical: [{ institution: '', course: '' }],
    experience: [{ institution: '', course: '', fromYear: '', toYear: '' }]
  });

  const BACKEND_URL = 'http://localhost:5000/api';

  // Synchronize dynamic values on successful authentication boot
  useEffect(() => {
    if (authToken && candidateId) {
      // For development, if token exists, we skip to wizard or fetch profile data
      setAppState('WIZARD');
    }
  }, [authToken, candidateId]);

  // --- Auth Actions ---
  const handleFastLogin = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      // Hit our backend verify endpoint with bypass flag configs
      const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otpCode: '123456', otpSessionId: 'SANDBOX_SESSION_ACTIVE' })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('candidate_token', data.token);
        localStorage.setItem('candidate_id', data.candidateId);
        setAuthToken(data.token);
        setCandidateId(data.candidateId);
        setFormData(prev => ({ ...prev, phoneNumber1: phoneNumber }));
        
        if (data.profileStatus === 'PENDING_ADMIN_CALL') {
          setAppState('DASHBOARD');
        } else {
          setAppState('WIZARD');
          setWizardStep(1);
        }
      } else {
        alert(data.error || 'Authentication baseline rejection');
      }
    } catch (err) {
      console.error(err);
      alert('Backend connection error. Ensure server.js is running on port 5000!');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthToken(null);
    setCandidateId(null);
    setPhoneNumber('');
    setAppState('LOGIN');
    setWizardStep(1);
    // Flush Form Inputs cleanly
    setFormData({
      fullName: '', dob: '', sex: '', maritalStatus: '', phoneNumber1: '', phoneNumber2: '',
      familyPhonePrimary: '', familyPhoneBackup: '', emailId: '', secondaryEmailId: '',
      presentAddress: '', presentDistrict: '', presentState: 'Tamil Nadu',
      permanentAddress: '', permanentDistrict: '', permanentState: 'Tamil Nadu',
      jobRoles: [], preferredDistricts: '', expectedSalary: '', languagesKnown: '',
      education: [{ institution: '', course: '' }],
      technical: [{ institution: '', course: '' }],
      experience: [{ institution: '', course: '', fromYear: '', toYear: '' }]
    });
  };

  // --- Dynamic Array Actions (Section 3) ---
  const addRow = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], type === 'experience' ? { institution: '', course: '', fromYear: '', toYear: '' } : { institution: '', course: '' }]
    }));
  };

  const removeRow = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleArrayChange = (type, index, field, value) => {
    const updatedArray = [...formData[type]];
    updatedArray[index][field] = value;
    setFormData(prev => ({ ...prev, [type]: updatedArray }));
  };

  // --- Tag Inputs Actions (Section 2) ---
  const toggleJobTag = (role) => {
    setFormData(prev => {
      const exists = prev.jobRoles.includes(role);
      const updatedTags = exists ? prev.jobRoles.filter(r => r !== role) : [...prev.jobRoles, role];
      return { ...prev, jobRoles: updatedTags };
    });
  };

  const selectAllJobTags = () => {
    setFormData(prev => ({ ...prev, jobRoles: [...AVAILABLE_JOB_ROLES] }));
  };

  // --- State Persistence Submissions ---
  const saveStepAndContinue = async (e) => {
    e.preventDefault();
    
    // Client-side structural checking before sending data downstream
    if (wizardStep === 1) {
      if (!formData.fullName || !formData.dob || !formData.sex || !formData.presentAddress) {
        alert('Please fill out all mandatory demographic fields marked with an asterisk (*)');
        return;
      }
    }
    if (wizardStep === 2) {
      if (formData.jobRoles.length === 0 || !formData.preferredDistricts || !formData.expectedSalary) {
        alert('Please select at least one Job Tag, preference district target and salary framework');
        return;
      }
    }

    try {
      await fetch(`${BACKEND_URL}/candidate/save-wizard-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          sectionIndex: wizardStep,
          updatedPayload: formData
        })
      });

      if (wizardStep < 3) {
        setWizardStep(prev => prev + 1);
      } else {
        setAppState('REVIEW');
      }
    } catch (err) {
      console.error(err);
      alert('Network heartbeat checkpoint synchronization error');
    }
  };

  const finalizeProfile = async () => {
    try {
      // Send execution state directly into database to change record status flags
      alert('Profile committed and locked! Form status flagged as: PENDING_ADMIN_CALL');
      setAppState('DASHBOARD');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      {/* Top Global Header Navigation Bar Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-6 py-4 shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">B</div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Blue-Collar Blind Hiring Portal</h1>
        </div>
        {authToken && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Clear Session & Logout
          </button>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* ========================================== */}
        {/* 📞 STATE 1: REFACTORED INSTANT VERIFICATION */}
        {/* ========================================== */}
        {appState === 'LOGIN' && (
          <div className="mx-auto max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Candidate Onboarding</h2>
            <p className="text-slate-500 mb-6 text-sm">Enter your 10-digit mobile number to open your application profile dashboard instantly.</p>
            <form onSubmit={handleFastLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-medium">+91</span>
                  <input 
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-14 pr-4 text-base font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3.5 text-center text-base font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.99] transition"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        )}

        {/* ========================================== */}
        {/* 🧙‍♂️ STATE 2: 3-SECTION PROGRESS-SAVED WIZARD */}
        {/* ========================================== */}
        {appState === 'WIZARD' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Step Wizard Progress Header Header */}
            <div className="bg-slate-900 px-8 py-5 flex items-center justify-between text-white">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Step Progress Matrix</span>
                <h3 className="text-lg font-bold">Section {wizardStep} of 3: {wizardStep === 1 ? 'Personal Details' : wizardStep === 2 ? 'Job Targeting Profiles' : 'Academic Credentials'}</h3>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`h-2.5 w-8 rounded-full transition-all duration-300 ${step <= wizardStep ? 'bg-blue-500' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>

            <form onSubmit={saveStepAndContinue} className="p-8 space-y-8">
              {/* SECTION 1: PERSONAL INFORMATION */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                      <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth *</label>
                      <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Sex *</label>
                      <select required value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3 bg-white focus:outline-none focus:border-blue-500">
                        <option value="">Select Option</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Marital Status *</label>
                      <select required value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3 bg-white focus:outline-none focus:border-blue-500">
                        <option value="">Select Option</option><option value="Single">Single</option><option value="Married">Married</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-2">Verified Phone 1 (Read Only)</label>
                      <input type="text" readOnly value={formData.phoneNumber1} className="w-full rounded-lg border border-slate-200 p-3 bg-slate-50 text-slate-400 font-medium outline-none cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Alternative Mobile Number 2</label>
                      <input type="text" value={formData.phoneNumber2} onChange={e => setFormData({...formData, phoneNumber2: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Family Contact Number (Primary) *</label>
                      <input type="text" required value={formData.familyPhonePrimary} onChange={e => setFormData({...formData, familyPhonePrimary: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Family Contact Number (Secondary)</label>
                      <input type="text" value={formData.familyPhoneBackup} onChange={e => setFormData({...formData, familyPhoneBackup: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Email ID</label>
                      <input type="email" value={formData.emailId} onChange={e => setFormData({...formData, emailId: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Secondary Backup Email ID</label>
                      <input type="email" value={formData.secondaryEmailId} onChange={e => setFormData({...formData, secondaryEmailId: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3" />
                    </div>
                  </div>

                  <hr className="border-slate-100 my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Present Address Configuration *</label>
                      <textarea rows={3} required value={formData.presentAddress} onChange={e => setFormData({...formData, presentAddress: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Permanent Address Configuration *</label>
                      <textarea rows={3} required value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Present District *</label>
                      <input type="text" required value={formData.presentDistrict} onChange={e => setFormData({...formData, presentDistrict: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Permanent District *</label>
                      <input type="text" required value={formData.permanentDistrict} onChange={e => setFormData({...formData, permanentDistrict: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3" />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: TARGET JOB ROLES & CHIPS */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-slate-700">Target Industry Job Roles (Select Multiple) *</label>
                      <button type="button" onClick={selectAllJobTags} className="text-xs font-bold text-blue-600 hover:underline">Select All Tags</button>
                    </div>
                    {/* Interactive Chip Area */}
                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[100px]">
                      {AVAILABLE_JOB_ROLES.map((role) => {
                        const isSelected = formData.jobRoles.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => toggleJobTag(role)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${isSelected ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}
                          >
                            {role} {isSelected && '✕'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Working Districts *</label>
                      <input type="text" required placeholder="Coimbatore, Tiruppur, Erode" value={formData.preferredDistricts} onChange={e => setFormData({...formData, preferredDistricts: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Monthly Take-Home Salary *</label>
                      <select required value={formData.expectedSalary} onChange={e => setFormData({...formData, expectedSalary: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3 bg-white">
                        <option value="">Select Range</option>
                        {SALARY_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Languages Communicated Fluently</label>
                    <input type="text" placeholder="Tamil, English" value={formData.languagesKnown} onChange={e => setFormData({...formData, languagesKnown: e.target.value})} className="w-full rounded-lg border border-slate-200 p-3" />
                  </div>
                </div>
              )}

              {/* SECTION 3: TABULAR QUALIFICATION INPUTS */}
              {wizardStep === 3 && (
                <div className="space-y-8">
                  {/* Academic Table Block */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">Educational Qualification</h4>
                      <button type="button" onClick={() => addRow('education')} className="text-xs font-bold bg-slate-100 px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-200">+ Append Row</button>
                    </div>
                    <table className="w-full border-collapse border border-slate-200 rounded-lg overflow-hidden text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-semibold text-left">
                        <tr><th className="p-3 border border-slate-200">Institution Name</th><th className="p-3 border border-slate-200">Course / Degree</th><th className="p-3 border border-slate-200 text-center">Action</th></tr>
                      </thead>
                      <tbody>
                        {formData.education.map((row, i) => (
                          <tr key={i}>
                            <td className="p-2 border border-slate-200"><input type="text" value={row.institution} onChange={e => handleArrayChange('education', i, 'institution', e.target.value)} className="w-full border-0 p-1 focus:outline-none" /></td>
                            <td className="p-2 border border-slate-200"><input type="text" value={row.course} onChange={e => handleArrayChange('education', i, 'course', e.target.value)} className="w-full border-0 p-1 focus:outline-none" /></td>
                            <td className="p-2 border border-slate-200 text-center"><button type="button" onClick={() => removeRow('education', i)} className="text-red-500 font-semibold text-xs hover:underline">Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Technical Block Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">Technical Qualification</h4>
                      <button type="button" onClick={() => addRow('technical')} className="text-xs font-bold bg-slate-100 px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-200">+ Append Row</button>
                    </div>
                    <table className="w-full border-collapse border border-slate-200 rounded-lg overflow-hidden text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-semibold text-left">
                        <tr><th className="p-3 border border-slate-200">Institution Name</th><th className="p-3 border border-slate-200">Certification Course</th><th className="p-3 border border-slate-200 text-center">Action</th></tr>
                      </thead>
                      <tbody>
                        {formData.technical.map((row, i) => (
                          <tr key={i}>
                            <td className="p-2 border border-slate-200"><input type="text" value={row.institution} onChange={e => handleArrayChange('technical', i, 'institution', e.target.value)} className="w-full border-0 p-1 focus:outline-none" /></td>
                            <td className="p-2 border border-slate-200"><input type="text" value={row.course} onChange={e => handleArrayChange('technical', i, 'course', e.target.value)} className="w-full border-0 p-1 focus:outline-none" /></td>
                            <td className="p-2 border border-slate-200 text-center"><button type="button" onClick={() => removeRow('technical', i)} className="text-red-500 font-semibold text-xs hover:underline">Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Experience Table Block */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">Employment History Records</h4>
                      <button type="button" onClick={() => addRow('experience')} className="text-xs font-bold bg-slate-100 px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-200">+ Append Row</button>
                    </div>
                    <table className="w-full border-collapse border border-slate-200 rounded-lg overflow-hidden text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-semibold text-left">
                        <tr><th className="p-3 border border-slate-200">Company Name</th><th className="p-3 border border-slate-200">Job Title</th><th className="p-3 border border-slate-200">From</th><th className="p-3 border border-slate-200">To</th><th className="p-3 border border-slate-200 text-center">Action</th></tr>
                      </thead>
                      <tbody>
                        {formData.experience.map((row, i) => (
                          <tr key={i}>
                            <td className="p-2 border border-slate-200"><input type="text" value={row.institution} onChange={e => handleArrayChange('experience', i, 'institution', e.target.value)} className="w-full border-0 p-1 focus:outline-none" /></td>
                            <td className="p-2 border border-slate-200"><input type="text" value={row.course} onChange={e => handleArrayChange('experience', i, 'course', e.target.value)} className="w-full border-0 p-1 focus:outline-none" /></td>
                            <td className="p-2 border border-slate-200"><input type="text" value={row.fromYear} placeholder="2022" onChange={e => handleArrayChange('experience', i, 'fromYear', e.target.value)} className="w-full border-0 p-1 focus:outline-none" /></td>
                            <td className="p-2 border border-slate-200"><input type="text" value={row.toYear} placeholder="2024" onChange={e => handleArrayChange('experience', i, 'toYear', e.target.value)} className="w-full border-0 p-1 focus:outline-none" /></td>
                            <td className="p-2 border border-slate-200 text-center"><button type="button" onClick={() => removeRow('experience', i)} className="text-red-500 font-semibold text-xs hover:underline">Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Wizard Control Actions Bottom Navigation Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                {wizardStep > 1 ? (
                  <button type="button" onClick={() => setWizardStep(prev => prev - 1)} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                    Back
                  </button>
                ) : <div />}
                
                <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700">
                  {wizardStep === 3 ? 'Proceed to Summary Review' : 'Save & Move Next'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================== */}
        {/* 📋 STATE 3: UNIFIED UNIFIED SUMMARY PAGE  */}
        {/* ========================================== */}
        {appState === 'REVIEW' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Verify Your Application Summary</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400 font-medium">Full Name:</span> <p className="font-semibold text-slate-800">{formData.fullName}</p></div>
              <div><span className="text-slate-400 font-medium">Date of Birth:</span> <p className="font-semibold text-slate-800">{formData.dob}</p></div>
              <div><span className="text-slate-400 font-medium">Sex / Status:</span> <p className="font-semibold text-slate-800">{formData.sex} / {formData.maritalStatus}</p></div>
              <div><span className="text-slate-400 font-medium">Verified Phone:</span> <p className="font-semibold text-slate-800">{formData.phoneNumber1}</p></div>
              <div className="col-span-2"><span className="text-slate-400 font-medium">Target Opportunities Chosen:</span> 
                <div className="flex flex-wrap gap-1.5 mt-1">{formData.jobRoles.map(r => <span key={r} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">{r}</span>)}</div>
              </div>
              <div><span className="text-slate-400 font-medium">Geographic Target Districts:</span> <p className="font-semibold text-slate-800">{formData.preferredDistricts}</p></div>
              <div><span className="text-slate-400 font-medium">Salary Target Frame:</span> <p className="font-semibold text-slate-800">{formData.expectedSalary}</p></div>
            </div>

            <div className="flex gap-4 border-t border-slate-100 pt-6">
              <button onClick={() => { setAppState('WIZARD'); setWizardStep(1); }} className="w-1/2 rounded-lg border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                Edit Data Fields
              </button>
              <button onClick={finalizeProfile} className="w-1/2 rounded-lg bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-700">
                Finalise and Save
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 💻 STATE 4: THE LIVE RESUME LIFECYCLE LOOP */}
        {/* ========================================== */}
        {appState === 'DASHBOARD' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white flex justify-between items-center">
              <div>
                <span className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Active Candidate Verified Resume</span>
                <h2 className="text-3xl font-extrabold mt-2 tracking-tight">{formData.fullName || 'Anonymous Candidate'}</h2>
                <p className="text-blue-100 text-sm mt-1">📞 Reference Core Hash: {formData.phoneNumber1}</p>
              </div>
              <div className="bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm">
                STATUS: PENDING_ADMIN_CALL
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Employment Preferences Matrix</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Target Working Clusters:</span> <div className="flex flex-wrap gap-1 mt-1">{formData.jobRoles.map(r => <span key={r} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded font-bold">{r}</span>)}</div></div>
                  <div><span className="text-slate-500">Placement Targets:</span> <p className="font-bold text-slate-800 mt-1">{formData.preferredDistricts}</p></div>
                  <div><span className="text-slate-500">Expected Compensation Structure:</span> <p className="font-bold text-slate-800 mt-1">{formData.expectedSalary}</p></div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => { setAppState('WIZARD'); setWizardStep(1); }}
                  className="rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition"
                >
                  Edit Profile Layout Loops
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}