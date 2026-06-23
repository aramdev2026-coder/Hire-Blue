import React, { useState, useEffect } from 'react';

const JOB_ROLES = ['Garments','Merchandiser','Office Assistant','HR Manager','Store In-Charge',
  'Marketing Staff','Delivery Staff','M/c Operator','Driver','Follow-up','Data Entry',
  'Quality Controller','Sales Rep','Supervisor','Documentation','Accountant',
  'Packing / Checking','Production Follow-up'];
const SALARY_RANGES = ['₹10,000 – ₹15,000','₹15,000 – ₹20,000','₹20,000 – ₹25,000',
  '₹25,000 – ₹30,000','₹30,000 – ₹35,000','₹35,000 – ₹40,000'];
const LANGUAGES = ['Tamil','English','Hindi','Malayalam','Telugu','Kannada'];
const TN_DISTRICTS = ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri',
  'Dindigul','Erode','Kallakurichi','Kancheepuram','Karur','Krishnagiri','Madurai',
  'Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukkottai',
  'Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni',
  'Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur',
  'Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar'];
const STEP_NAMES = ['Personal Details','Job Preferences','Education & Experience'];

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

// Pack the multi-line address inputs into the single stored address string.
const composeAddr = (s1, s2) =>
  [s1, s2].map(x => (x || '').trim()).filter(Boolean).join(', ');

function buildInit(init, phone) {
  const splitAddr = (full) => {
    const raw = full || '';
    if (raw.includes(', ')) {
      const parts = raw.split(', ');
      return { street1: parts[0] || '', street2: parts.slice(1).join(', ') };
    }
    return { street1: raw, street2: '' };
  };
  const present = splitAddr(init?.presentAddress);
  const permanent = splitAddr(init?.permanentAddress);

  return {
    fullName:           init?.fullName           || '',
    dob:                init?.dob ? new Date(init.dob).toISOString().split('T')[0] : '',
    sex:                init?.sex                || '',
    maritalStatus:      init?.maritalStatus      || '',
    phoneNumber1:       phone                    || '',
    phoneNumber2:       init?.phoneNumber2       || '',
    familyPhonePrimary: init?.familyPhonePrimary || '',
    familyPhoneBackup:  init?.familyPhoneBackup  || '',
    emailId:            init?.emailId            || '',
    secondaryEmailId:   init?.secondaryEmailId   || '',
    presentStreet1:     present.street1,
    presentStreet2:     present.street2,
    presentCity:        init?.presentDistrict    || '',
    presentState:       init?.presentState       || 'Tamil Nadu',
    permanentStreet1:   permanent.street1,
    permanentStreet2:   permanent.street2,
    permanentCity:      init?.permanentDistrict  || '',
    permanentState:     init?.permanentState     || 'Tamil Nadu',
    // Keep legacy composed fields in sync for the backend / resume view
    presentAddress:     init?.presentAddress     || '',
    permanentAddress:   init?.permanentAddress   || '',
    jobRoles:           safeArr(init?.jobRoles),
    preferredDistricts: safeArr(init?.preferredDistricts),
    expectedSalary:     init?.expectedSalary     || '',
    languagesKnown:     safeArr(init?.languagesKnown),
    education:  safeArr(init?.education).length  ? init.education  : [{ institution:'',course:'' }],
    technical:  safeArr(init?.technical).length  ? init.technical  : [{ institution:'',course:'' }],
    experience: safeArr(init?.experience).length ? init.experience.map(normalizeExperienceItem) : [{ institution:'',role:'',fromYear:'',toYear:'' }],
  };
}

export default function ProfileWizard({ backendUrl, candidateId, verifiedPhone, initialData, onFinalizeSubmit }) {
  const draftKey = `wiz_draft_${candidateId}`;
  const stepKey  = `wiz_step_${candidateId}`;

  const [form, setForm] = React.useState(() => {
    try {
      const s = localStorage.getItem(draftKey);
      if (s) {
        const p = JSON.parse(s);
        ['jobRoles','preferredDistricts','languagesKnown','education','technical','experience']
          .forEach(k => { if (!Array.isArray(p[k])) p[k] = []; });
        p.experience = p.experience.map(normalizeExperienceItem);
        p.phoneNumber1 = verifiedPhone || p.phoneNumber1;
        // Migrate older drafts that stored a single address line into street1/street2
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
    } catch {}
    return buildInit(initialData, verifiedPhone);
  });

  const [step, setStep] = React.useState(() => {
    const savedStep = localStorage.getItem(stepKey);
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  
  const [reviewing,   setReviewing]   = React.useState(false);
  const [sameAddr,    setSameAddr]    = React.useState(false);
  const [errors,      setErrors]      = React.useState({});
  const [serverErr,   setServerErr]   = React.useState('');
  const [saving,      setSaving]      = React.useState(false);

  React.useEffect(() => { 
    localStorage.setItem(draftKey, JSON.stringify(form)); 
    localStorage.setItem(stepKey, step.toString());
  }, [form, step, candidateId]);

  // Ensure address fields are decomposed when returning to step 1
  React.useEffect(() => {
    if (step === 1) {
      setForm(p => {
        let newForm = { ...p };
        let changed = false;

        // Decompose present address if street fields are empty but composed address exists
        if (p.presentAddress && (!p.presentStreet1 || p.presentStreet1.trim() === '')) {
          const parts = p.presentAddress.split(', ');
          newForm.presentStreet1 = parts[0] || '';
          newForm.presentStreet2 = parts.slice(1).join(', ') || '';
          if (!newForm.presentCity) {
            newForm.presentCity = p.presentDistrict || '';
          }
          changed = true;
        }

        // Decompose permanent address if street fields are empty but composed address exists
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
      permanentCity:    p.presentCity,
      permanentState:   p.presentState,
    }));
  };

  const toggle = (key, val) => setForm(p => {
    const a = p[key];
    return { ...p, [key]: a.includes(val) ? a.filter(x => x!==val) : [...a, val] };
  });

  const updRow = (tbl, i, f, v) => setForm(p => {
    const r = [...p[tbl]]; r[i] = { ...r[i], [f]: v };
    return { ...p, [tbl]: r };
  });
  const addRow = (tbl) => setForm(p => ({
    ...p, [tbl]: [...p[tbl],
      tbl === 'experience' ? { institution:'',role:'',fromYear:'',toYear:'' } : { institution:'',course:'' }]
  }));
  const delRow = (tbl, i) => setForm(p => ({ ...p, [tbl]: p[tbl].filter((_,j) => j!==i) }));

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.fullName.trim())       e.fullName        = 'Full name is required';
      if (!form.dob)                   e.dob             = 'Date of birth is required';
      else if (new Date(form.dob).getFullYear() < 1900) e.dob = 'Year cannot be before 1900';
      if (!form.sex)                   e.sex             = 'Please select a gender';
      if (!form.maritalStatus)         e.maritalStatus   = 'Please select marital status';
      if (!form.presentStreet1.trim()) e.presentStreet1  = 'Street address is required';
      if (!form.presentCity)           e.presentCity     = 'City / Town is required';
      if (!sameAddr) {
        if (!form.permanentStreet1.trim()) e.permanentStreet1  = 'Street address is required';
        if (!form.permanentCity)           e.permanentCity     = 'City / Town is required';
      }
    }
    if (step === 2) {
      if (!form.jobRoles.length)           e.jobRoles           = 'Select at least one job role';
      if (!form.preferredDistricts.length) e.preferredDistricts = 'Select at least one district';
      if (!form.expectedSalary)            e.expectedSalary     = 'Salary expectation is required';
      if (!form.languagesKnown.length)     e.languagesKnown     = 'Select at least one language';
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
      // Compose multi-line address into the single stored fields the backend expects
      let payload;
      if (step === 1) {
        payload = {
          ...form,
          presentAddress:   composeAddr(form.presentStreet1, form.presentStreet2),
          presentDistrict:  form.presentCity,
          permanentAddress: sameAddr
            ? composeAddr(form.presentStreet1, form.presentStreet2)
            : composeAddr(form.permanentStreet1, form.permanentStreet2),
          permanentDistrict: sameAddr ? form.presentCity : form.permanentCity,
        };
      } else if (step === 2) {
        // Ensure arrays are sent for list fields (handle legacy string values)
        const toArray = v => Array.isArray(v) ? v : (typeof v === 'string' ? v.split(',').map(s=>s.trim()).filter(Boolean) : []);
        payload = {
          ...form,
          jobRoles: toArray(form.jobRoles),
          preferredDistricts: toArray(form.preferredDistricts),
          languagesKnown: toArray(form.languagesKnown),
          expectedSalary: form.expectedSalary || '',
        };
      } else {
        payload = form;
      }
      const res = await fetch(`${backendUrl}/candidate/save-wizard-step`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ candidateId, sectionIndex: step, updatedPayload: payload }),
      });
      if (!res.ok) throw new Error('Could not save.');
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
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ candidateId }),
      });
    } catch {}
    localStorage.removeItem(draftKey);
    localStorage.removeItem(stepKey);
    onFinalizeSubmit(form);
  };

  // ── REVIEW UI (LEFT ALIGNED) ───────────────────────────────────────────────
  if (reviewing) return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-title">Review your profile</div>
        <div className="review-copy">Check everything before submitting.</div>
      </div>
      <div className="panel-body panel-body--compact">
        
        {/* Personal Details */}
        <div className="section-heading">Personal Details</div>
        <div className="responsive-grid section-divider">
          <RV label="Full Name"      val={form.fullName} />
          <RV label="Mobile"         val={`+91 ${form.phoneNumber1}`} />
          <RV label="Date of Birth"  val={form.dob} />
          <RV label="Gender"         val={form.sex} />
          <RV label="Marital Status" val={form.maritalStatus} />
          {form.emailId && <RV label="Email" val={form.emailId} />}
          <div className="span-full">
            <RV label="Present Address" val={composeAddr(form.presentStreet1, form.presentStreet2) + (form.presentCity ? `, ${form.presentCity}` : '') + (form.presentState ? `, ${form.presentState}` : '')} />
          </div>
          <div className="span-full">
            <RV label="Permanent Address" val={composeAddr(form.permanentStreet1, form.permanentStreet2) + (form.permanentCity ? `, ${form.permanentCity}` : '') + (form.permanentState ? `, ${form.permanentState}` : '')} />
          </div>
        </div>

        {/* Job Preferences */}
        <div className="section-heading">Job Preferences</div>
        <div className="section-divider">
          <RV label="Monthly Salary Expectation" val={form.expectedSalary} />
          <TagReview label="Job Roles"   tags={form.jobRoles}           color="#000" />
          <TagReview label="Districts"   tags={form.preferredDistricts} color="#1d4ed8" />
          <TagReview label="Languages"   tags={form.languagesKnown}     color="#059669" />
        </div>

        {/* Tables */}
        {form.education.some(r=>r.institution) && <>
          <div className="section-heading">Education</div>
          <div className="table-wrapper">
            <table className="responsive-table">
              <thead><tr><th className="table-cell--small">#</th><th>Institution</th><th>Course</th></tr></thead>
              <tbody>{form.education.filter(r=>r.institution).map((r,i)=>(
                <tr key={i}><td>{i+1}</td><td>{r.institution}</td><td>{r.course}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </>}
        {form.experience.some(r=>r.institution) && <>
          <div className="section-heading mt-16">Work Experience</div>
          <div className="table-wrapper">
            <table className="responsive-table">
              <thead><tr><th className="table-cell--small">#</th><th>Organisation</th><th>Role</th><th className="table-cell--xsmall">From</th><th className="table-cell--xsmall">To</th></tr></thead>
              <tbody>{form.experience.filter(r=>r.institution).map((r,i)=>(
                <tr key={i}><td>{i+1}</td><td>{r.institution}</td><td>{r.role}</td><td>{r.fromYear}</td><td>{r.toYear}</td></tr>
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

  // ── WIZARD UI ──────────────────────────────────────────────────────────────
  return (
    <div className="wizard-card">
      <div className="wizard-header">
        <div>
          <div className="wizard-step-label">Step {step} of 3</div>
          <div className="wizard-title">{STEP_NAMES[step-1]}</div>
        </div>
        <div className="step-indicator">
          {[1,2,3].map(s => (
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
                  value={form.fullName} onChange={e=>upd('fullName',e.target.value)} autoFocus />
              </Field>
              <Field label="Verified Mobile">
                <input className="input input-readonly" readOnly disabled value={`+91 ${form.phoneNumber1}`} />
              </Field>
              <Field label="Date of Birth" req error={errors.dob}>
                <input className={`input${errors.dob ? ' input-error' : ''}`} type="date"
                  min="1900-01-01" max={new Date().toISOString().split('T')[0]}
                  value={form.dob} onChange={e=>upd('dob',e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()} />
              </Field>
              <Field label="Gender" req error={errors.sex}>
                <select className={`select${errors.sex ? ' select-error' : ''}`} value={form.sex} onChange={e=>upd('sex',e.target.value)}>
                  <option value="">Select</option><option>Male</option><option>Female</option><option>Prefer not to say</option>
                </select>
              </Field>
              <Field label="Marital Status" req error={errors.maritalStatus}>
                <select className={`select${errors.maritalStatus ? ' select-error' : ''}`} value={form.maritalStatus} onChange={e=>upd('maritalStatus',e.target.value)}>
                  <option value="">Select</option><option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
                </select>
              </Field>
              <Field label="Alternate Mobile">
                <input className="input" type="tel" maxLength={10} placeholder="Optional"
                  value={form.phoneNumber2} onChange={e=>upd('phoneNumber2',e.target.value.replace(/\D/g,''))} />
              </Field>
              <Field label="Family Contact">
                <input className="input" type="tel" maxLength={10} placeholder="Optional"
                  value={form.familyPhonePrimary} onChange={e=>upd('familyPhonePrimary',e.target.value.replace(/\D/g,''))} />
              </Field>
              <Field label="Email Address">
                <input className="input" type="email" placeholder="Optional"
                  value={form.emailId} onChange={e=>upd('emailId',e.target.value)} />
              </Field>
              <Field label="Secondary Email">
                <input className="input" type="email" placeholder="Optional"
                  value={form.secondaryEmailId} onChange={e=>upd('secondaryEmailId',e.target.value)} />
              </Field>
            </div>

            <div className="section-heading">Present Address</div>
            <Field label="Street Address 1" req error={errors.presentStreet1}>
              <input className={`input${errors.presentStreet1 ? ' input-error' : ''}`} type="text"
                placeholder="House/Building Number and Street Name"
                value={form.presentStreet1} onChange={e=>upd('presentStreet1',e.target.value)} />
            </Field>
            <Field label="Street Address 2">
              <input className="input" type="text"
                placeholder="Apartment, Suite, Unit, or Floor Number (Optional)"
                value={form.presentStreet2} onChange={e=>upd('presentStreet2',e.target.value)} />
            </Field>
            <div className="responsive-grid">
              <Field label="City / Town" req error={errors.presentCity}>
                <select className={`select${errors.presentCity ? ' select-error' : ''}`}
                  value={form.presentCity} onChange={e=>upd('presentCity',e.target.value)}>
                  <option value="">Select city / town</option>
                  {TN_DISTRICTS.map(d=><option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="State / Province / Region">
                <input className="input input-readonly" readOnly value="Tamil Nadu" disabled />
              </Field>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" checked={sameAddr} onChange={e=>syncAddr(e.target.checked)} className="checkbox-input" />
              <span className="checkbox-copy">
                Permanent address is same as present address
              </span>
            </label>

            {!sameAddr && (<>
              <div className="section-heading">Permanent Address</div>
              <Field label="Street Address 1" req error={errors.permanentStreet1}>
                <input className={`input${errors.permanentStreet1 ? ' input-error' : ''}`} type="text"
                  placeholder="House/Building Number and Street Name"
                  value={form.permanentStreet1} onChange={e=>upd('permanentStreet1',e.target.value)} />
              </Field>
              <Field label="Street Address 2">
                <input className="input" type="text"
                  placeholder="Apartment, Suite, Unit, or Floor Number (Optional)"
                  value={form.permanentStreet2} onChange={e=>upd('permanentStreet2',e.target.value)} />
              </Field>
              <div className="responsive-grid">
                <Field label="City / Town" req error={errors.permanentCity}>
                  <select className={`select${errors.permanentCity ? ' select-error' : ''}`}
                    value={form.permanentCity} onChange={e=>upd('permanentCity',e.target.value)}>
                    <option value="">Select city / town</option>
                    {TN_DISTRICTS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="State / Province / Region">
                  <input className="input input-readonly" readOnly value="Tamil Nadu" disabled />
                </Field>
              </div>
            </>) }
          </>)}

          {step === 2 && (<>
            <div className="field-label-row">
              <Lbl req>Job Roles</Lbl>
              <div className="field-inline-actions">
                <button type="button" className="button button-ghost button-small" onClick={()=>upd('jobRoles',[...JOB_ROLES])}>Select all</button>
                <button type="button" className="button button-ghost button-small" onClick={()=>upd('jobRoles',[])}>Clear</button>
              </div>
            </div>
            <div className={`tag-panel${errors.jobRoles ? ' has-error' : ''}`}>
              {JOB_ROLES.map(r => {
                const on = form.jobRoles.includes(r);
                return <button type="button" key={r} className={`tag-chip${on ? ' selected' : ''}`} onClick={()=>toggle('jobRoles',r)}>{r}</button>;
              })}
            </div>
            <Err msg={errors.jobRoles} />

            <div className="field-label-row">
              <Lbl req>Preferred Districts</Lbl>
              <div className="field-inline-actions">
                <button type="button" className="button button-ghost button-small" onClick={()=>upd('preferredDistricts',[...TN_DISTRICTS])}>All</button>
                <button type="button" className="button button-ghost button-small" onClick={()=>upd('preferredDistricts',[])}>Clear</button>
              </div>
            </div>
            <select className={`select${errors.preferredDistricts ? ' select-error' : ''}`} value=""
              onChange={e=>e.target.value&&toggle('preferredDistricts',e.target.value)}>
              <option value="">Add a district…</option>
              {TN_DISTRICTS.filter(d=>!form.preferredDistricts.includes(d)).map(d=><option key={d}>{d}</option>)}
            </select>
            <div className={`tag-panel${errors.preferredDistricts ? ' has-error' : ''}`}>
              {form.preferredDistricts.length===0
                ? <span className="field-note">No districts added yet</span>
                : form.preferredDistricts.map(d=>(
                  <button type="button" key={d} className="tag-chip selected" onClick={()=>toggle('preferredDistricts',d)}>
                    {d} x
                  </button>
                ))}
            </div>
            <Err msg={errors.preferredDistricts} />

            <div className="mt-12">
              <Field label="Monthly Salary Expectation" req error={errors.expectedSalary}>
                <select className={`select${errors.expectedSalary ? ' select-error' : ''}`}
                  value={form.expectedSalary} onChange={e=>upd('expectedSalary',e.target.value)}>
                  <option value="">Select a range</option>
                  {SALARY_RANGES.map(r=><option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-12">
              <Lbl req>Languages Known</Lbl>
              <div className={`tag-panel${errors.languagesKnown ? ' has-error' : ''}`}>
                {LANGUAGES.map(l => {
                  const on = form.languagesKnown.includes(l);
                  return <button type="button" key={l} className={`tag-chip${on ? ' selected' : ''}`} onClick={()=>toggle('languagesKnown',l)}>{l}</button>;
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
            <div className="table-wrapper">
              <table className="responsive-table table-editable">
                <thead><tr>
                  <th>Institution</th>
                  <th>Course / Degree</th>
                  <th className="table-cell--small"></th>
                </tr></thead>
                <tbody>
                  {form.education.map((r,i)=>(
                    <tr key={i}>
                      <td data-label="Institution"><input className="input input-inline" placeholder="School / College" value={r.institution} onChange={e=>updRow('education',i,'institution',e.target.value)} /></td>
                      <td data-label="Course / Degree"><input className="input input-inline" placeholder="e.g. B.Sc Chemistry" value={r.course} onChange={e=>updRow('education',i,'course',e.target.value)} /></td>
                      <td data-label=" " className="text-center">
                        <button type="button" className="button button-ghost button-small" onClick={()=>delRow('education',i)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="button button-ghost button-small" onClick={()=>addRow('education')}>Add Row</button>

            <div className="section-heading">Technical Qualifications</div>
            <div className="table-wrapper">
              <table className="responsive-table table-editable">
                <thead><tr>
                  <th>Institution</th>
                  <th>Course / Certificate</th>
                  <th className="table-cell--small"></th>
                </tr></thead>
                <tbody>
                  {form.technical.map((r,i)=>(
                    <tr key={i}>
                      <td data-label="Institution"><input className="input input-inline" placeholder="Institute name" value={r.institution} onChange={e=>updRow('technical',i,'institution',e.target.value)} /></td>
                      <td data-label="Course / Certificate"><input className="input input-inline" placeholder="e.g. Tally ERP" value={r.course} onChange={e=>updRow('technical',i,'course',e.target.value)} /></td>
                      <td data-label=" " className="text-center">
                        <button type="button" className="button button-ghost button-small" onClick={()=>delRow('technical',i)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="button button-ghost button-small" onClick={()=>addRow('technical')}>Add Row</button>

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
                  {form.experience.map((r,i)=>(
                    <tr key={i}>
                      <td data-label="Organisation"><input className="input input-inline" placeholder="Company" value={r.institution} onChange={e=>updRow('experience',i,'institution',e.target.value)} /></td>
                      <td data-label="Role"><input className="input input-inline" placeholder="Job Title" value={r.role||''} onChange={e=>updRow('experience',i,'role',e.target.value)} /></td>
                      <td data-label="From"><input className="input input-inline" type="number" min="1900" max="2099" placeholder="YYYY" value={r.fromYear || ''} onChange={e => updRow('experience', i, 'fromYear', e.target.value.replace(/\D/g, '').slice(0,4))} /></td>
                      <td data-label="To"><input className="input input-inline" type="number" min="1900" max="2099" placeholder="YYYY" value={r.toYear || ''} onChange={e => updRow('experience', i, 'toYear', e.target.value.replace(/\D/g, '').slice(0,4))} /></td>
                      <td data-label=" " className="text-center">
                        <button type="button" className="button button-ghost button-small" onClick={()=>delRow('experience',i)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="button button-ghost button-small" onClick={()=>addRow('experience')}>Add Row</button>
          </>)}
        </div>

        <div className="panel-actions">
          {step > 1
            ? <button type="button" className="button button-ghost" onClick={()=>{setStep(s=>s-1);setErrors({});}}>Back</button>
            : <div/>
          }
          <button type="submit" disabled={saving} className="button button-primary">
            {saving ? 'Saving…' : step===3 ? 'Review' : 'Save & Continue'}
          </button>
        </div>
      </form>
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