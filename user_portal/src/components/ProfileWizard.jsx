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

// ── tiny style objects ───────────────────────────────────────────────────────
const inputBase = {
  width:'100%',padding:'10px 12px',border:'1.5px solid #d4d4d8',
  borderRadius:8,fontSize:14,color:'#000',background:'#fff',
  outline:'none',fontFamily:'inherit',transition:'border-color 0.15s',
};
const inputErr  = { ...inputBase, borderColor:'#dc2626', background:'#fff8f8' };
const inputRO   = { ...inputBase, background:'#f4f4f5', color:'#71717a', cursor:'not-allowed' };
const selectBase = { ...inputBase, cursor:'pointer' };
const selectErr  = { ...inputErr,  cursor:'pointer' };
const textareaBase = { ...inputBase, resize:'vertical', minHeight:70, lineHeight:1.5 };
const textareaErr  = { ...inputErr,  resize:'vertical', minHeight:70, lineHeight:1.5 };

function Lbl({ children, req }) {
  return (
    <label style={{ display:'block',fontSize:11,fontWeight:700,textTransform:'uppercase',
      letterSpacing:'0.6px',color:'#000',marginBottom:5 }}>
      {children}{req && <span style={{color:'#dc2626'}}> *</span>}
    </label>
  );
}
function Err({ msg }) {
  return msg ? <p style={{ fontSize:12,fontWeight:600,color:'#dc2626',marginTop:4 }}>{msg}</p> : null;
}
function Field({ label, req, error, children, span2 }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:0, ...(span2?{gridColumn:'1/-1'}:{}) }}>
      <Lbl req={req}>{label}</Lbl>
      {children}
      <Err msg={error} />
    </div>
  );
}

function safeArr(v) { return Array.isArray(v) ? v : []; }

function buildInit(init, phone) {
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
    presentAddress:     init?.presentAddress     || '',
    presentDistrict:    init?.presentDistrict    || '',
    presentState:       init?.presentState       || 'Tamil Nadu',
    permanentAddress:   init?.permanentAddress   || '',
    permanentDistrict:  init?.permanentDistrict  || '',
    permanentState:     init?.permanentState     || 'Tamil Nadu',
    jobRoles:           safeArr(init?.jobRoles),
    preferredDistricts: safeArr(init?.preferredDistricts),
    expectedSalary:     init?.expectedSalary     || '',
    languagesKnown:     safeArr(init?.languagesKnown),
    education:  safeArr(init?.education).length  ? init.education  : [{ institution:'',course:'' }],
    technical:  safeArr(init?.technical).length  ? init.technical  : [{ institution:'',course:'' }],
    experience: safeArr(init?.experience).length ? init.experience : [{ institution:'',role:'',fromYear:'',toYear:'' }],
  };
}

export default function ProfileWizard({ backendUrl, candidateId, verifiedPhone, initialData, onFinalizeSubmit }) {
  const draftKey = `wiz_draft_${candidateId}`;
  const stepKey  = `wiz_step_${candidateId}`; // Memory key for the wizard step

  const [form, setForm] = React.useState(() => {
    try {
      const s = localStorage.getItem(draftKey);
      if (s) {
        const p = JSON.parse(s);
        ['jobRoles','preferredDistricts','languagesKnown','education','technical','experience']
          .forEach(k => { if (!Array.isArray(p[k])) p[k] = []; });
        p.phoneNumber1 = verifiedPhone || p.phoneNumber1;
        return p;
      }
    } catch {}
    return buildInit(initialData, verifiedPhone);
  });

  // Check localStorage for the saved step, otherwise default to 1
  const [step, setStep] = React.useState(() => {
    const savedStep = localStorage.getItem(stepKey);
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  
  const [reviewing,   setReviewing]   = React.useState(false);
  const [sameAddr,    setSameAddr]    = React.useState(false);
  const [errors,      setErrors]      = React.useState({});
  const [serverErr,   setServerErr]   = React.useState('');
  const [saving,      setSaving]      = React.useState(false);

  // persist draft AND the current step
  React.useEffect(() => { 
    localStorage.setItem(draftKey, JSON.stringify(form)); 
    localStorage.setItem(stepKey, step.toString());
  }, [form, step, candidateId]);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const syncAddr = (checked) => {
    setSameAddr(checked);
    if (checked) setForm(p => ({
      ...p,
      permanentAddress:  p.presentAddress,
      permanentDistrict: p.presentDistrict,
      permanentState:    p.presentState,
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
      if (!form.presentAddress.trim()) e.presentAddress  = 'Present address is required';
      if (!form.presentDistrict)       e.presentDistrict = 'Present district is required';
      if (!sameAddr) {
        if (!form.permanentAddress.trim()) e.permanentAddress  = 'Permanent address is required';
        if (!form.permanentDistrict)       e.permanentDistrict = 'Permanent district is required';
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
      const res = await fetch(`${backendUrl}/candidate/save-wizard-step`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ candidateId, sectionIndex: step, updatedPayload: form }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Could not save. Check your server and try again.');
      }
    } catch (err) {
      setServerErr(err.message || 'Could not save. Check your server and try again.');
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
    // Clear out the memory cache completely on completion
    localStorage.removeItem(draftKey);
    localStorage.removeItem(stepKey);
    localStorage.setItem('candidate_status','PENDING_ADMIN_CALL');
    onFinalizeSubmit(form);
  };

  // shared layout styles
  const card  = { background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.07)' };
  const grid2 = { display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 };
  const secHdr= { fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.6px',color:'#1d4ed8',marginBottom:12,paddingTop:4 };
  const subHdr= { fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.6px',color:'#71717a',marginBottom:8,paddingTop:8 };
  const chip  = (on, color) => ({
    padding:'5px 11px',borderRadius:6,fontSize:12,fontWeight:600,
    border: on ? `1.5px solid ${color}` : '1.5px solid #d4d4d8',
    background: on ? color : '#fff',
    color: on ? '#fff' : '#3f3f46',
    cursor:'pointer',transition:'all 0.1s',lineHeight:1.4,
  });
  const tagPanel = (hasErr) => ({
    display:'flex',flexWrap:'wrap',gap:6,padding:10,
    border: `1.5px solid ${hasErr?'#dc2626':'#e4e4e7'}`,
    borderRadius:8,background:'#fafafa',minHeight:46,
  });

  const dynInput = {
    width:'100%',border:'none',background:'transparent',
    fontSize:13,color:'#000',outline:'none',padding:'3px 6px',fontFamily:'inherit',
  };
  const dynTh = { padding:'6px 8px',fontSize:11,fontWeight:700,textTransform:'uppercase',
    letterSpacing:'0.5px',color:'#71717a',borderBottom:'1.5px solid #e4e4e7',
    background:'#fafafa',textAlign:'left' };
  const dynTd = { padding:'6px 8px',borderBottom:'1px solid #f4f4f5' };

  // ── REVIEW ─────────────────────────────────────────────────────────────────
  if (reviewing) return (
    <div style={card}>
      <div style={{ background:'#000',padding:'20px 24px' }}>
        <div style={{ fontSize:17,fontWeight:800,color:'#fff',letterSpacing:'-0.3px' }}>Review your profile</div>
        <div style={{ fontSize:12,color:'#a1a1aa',marginTop:3 }}>Check everything before submitting.</div>
      </div>
      <div style={{ padding:'22px 24px' }}>
        {/* Personal */}
        <div style={{ ...secHdr }}>Personal Details</div>
        <div style={{ ...grid2,marginBottom:20,paddingBottom:20,borderBottom:'1px solid #f4f4f5' }}>
          <RV label="Full Name"      val={form.fullName} />
          <RV label="Mobile"         val={`+91 ${form.phoneNumber1}`} />
          <RV label="Date of Birth"  val={form.dob} />
          <RV label="Gender"         val={form.sex} />
          <RV label="Marital Status" val={form.maritalStatus} />
          {form.emailId && <RV label="Email" val={form.emailId} />}
          <div style={{ gridColumn:'1/-1' }}>
            <RV label="Present Address" val={`${form.presentAddress}, ${form.presentDistrict}, ${form.presentState}`} />
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <RV label="Permanent Address" val={`${form.permanentAddress}, ${form.permanentDistrict}, ${form.permanentState}`} />
          </div>
        </div>
        {/* Job */}
        <div style={{ ...secHdr }}>Job Preferences</div>
        <div style={{ marginBottom:20,paddingBottom:20,borderBottom:'1px solid #f4f4f5' }}>
          <RV label="Salary Expectation" val={form.expectedSalary} />
          <TagReview label="Job Roles"   tags={form.jobRoles}           color="#000" />
          <TagReview label="Districts"   tags={form.preferredDistricts} color="#1d4ed8" />
          <TagReview label="Languages"   tags={form.languagesKnown}     color="#059669" />
        </div>
        {/* Edu */}
        {form.education.some(r=>r.institution) && <>
          <div style={secHdr}>Education</div>
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13,marginBottom:16 }}>
            <thead><tr><th style={dynTh}>#</th><th style={dynTh}>Institution</th><th style={dynTh}>Course</th></tr></thead>
            <tbody>{form.education.filter(r=>r.institution).map((r,i)=>(
              <tr key={i}><td style={dynTd}>{i+1}</td><td style={dynTd}>{r.institution}</td><td style={dynTd}>{r.course}</td></tr>
            ))}</tbody>
          </table>
        </>}
        {/* Exp */}
        {form.experience.some(r=>r.institution) && <>
          <div style={secHdr}>Work Experience</div>
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13,marginBottom:16 }}>
            <thead><tr><th style={dynTh}>#</th><th style={dynTh}>Organisation</th><th style={dynTh}>Role</th><th style={dynTh}>From</th><th style={dynTh}>To</th></tr></thead>
            <tbody>{form.experience.filter(r=>r.institution).map((r,i)=>(
              <tr key={i}><td style={dynTd}>{i+1}</td><td style={dynTd}>{r.institution}</td><td style={dynTd}>{r.role}</td><td style={dynTd}>{r.fromYear}</td><td style={dynTd}>{r.toYear}</td></tr>
            ))}</tbody>
          </table>
        </>}
      </div>
      <div style={{ display:'flex',gap:10,padding:'16px 24px',borderTop:'1px solid #f4f4f5',background:'#fafafa' }}>
        <button onClick={() => { setReviewing(false); setStep(1); }} style={{
          flex:1,padding:'11px 0',border:'1.5px solid #e4e4e7',
          borderRadius:8,background:'#fff',color:'#000',fontSize:14,fontWeight:700
        }}>Edit details</button>
        <button onClick={handleFinalize} style={{
          flex:2,padding:'11px 0',border:'none',
          borderRadius:8,background:'#18181b',color:'#fff',fontSize:14,fontWeight:700
        }}>Confirm & Submit</button>
      </div>
    </div>
  );

  // ── WIZARD ─────────────────────────────────────────────────────────────────
  return (
    <div style={card}>
      {/* Header */}
      <div style={{
        background:'#000',padding:'18px 24px',
        display:'flex',alignItems:'center',justifyContent:'space-between'
      }}>
        <div>
          <div style={{ fontSize:11,fontWeight:700,letterSpacing:'0.8px',textTransform:'uppercase',color:'#60a5fa',marginBottom:2 }}>
            Step {step} of 3
          </div>
          <div style={{ fontSize:16,fontWeight:700,color:'#fff' }}>{STEP_NAMES[step-1]}</div>
        </div>
        <div style={{ display:'flex',gap:5 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              height:5,borderRadius:3,transition:'all 0.25s',
              width: s < step ? 18 : s === step ? 24 : 12,
              background: s <= step ? '#3b82f6' : '#374151'
            }}/>
          ))}
        </div>
      </div>

      <form onSubmit={handleNext}>
        <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:14 }}>
          {serverErr && (
            <div style={{ fontSize:13,fontWeight:600,color:'#dc2626',background:'#fef2f2',
              border:'1px solid #fca5a5',borderRadius:7,padding:'10px 12px' }}>{serverErr}</div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (<>
            <div style={grid2}>
              <Field label="Full Name" req error={errors.fullName}>
                <input className="wf" style={errors.fullName?inputErr:inputBase}
                  type="text" placeholder="e.g. Arun Kumar"
                  value={form.fullName} onChange={e=>upd('fullName',e.target.value)} autoFocus />
              </Field>
              <Field label="Verified Mobile">
                <input style={inputRO} readOnly disabled value={`+91 ${form.phoneNumber1}`} />
              </Field>
              <Field label="Date of Birth" req error={errors.dob}>
                <input style={errors.dob?inputErr:inputBase} type="date"
                  min="1900-01-01" max={new Date().toISOString().split('T')[0]}
                  value={form.dob} onChange={e=>upd('dob',e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()} />
              </Field>
              <div/>{/* spacer */}
              <Field label="Gender" req error={errors.sex}>
                <select style={errors.sex?selectErr:selectBase} value={form.sex} onChange={e=>upd('sex',e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Prefer not to say</option>
                </select>
              </Field>
              <Field label="Marital Status" req error={errors.maritalStatus}>
                <select style={errors.maritalStatus?selectErr:selectBase} value={form.maritalStatus} onChange={e=>upd('maritalStatus',e.target.value)}>
                  <option value="">Select</option>
                  <option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
                </select>
              </Field>
              <Field label="Alternate Mobile">
                <input style={inputBase} type="tel" maxLength={10} placeholder="Optional"
                  value={form.phoneNumber2} onChange={e=>upd('phoneNumber2',e.target.value.replace(/\D/g,''))} />
              </Field>
              <Field label="Family Contact">
                <input style={inputBase} type="tel" maxLength={10} placeholder="Optional"
                  value={form.familyPhonePrimary} onChange={e=>upd('familyPhonePrimary',e.target.value.replace(/\D/g,''))} />
              </Field>
              <Field label="Email Address">
                <input style={inputBase} type="email" placeholder="Optional"
                  value={form.emailId} onChange={e=>upd('emailId',e.target.value)} />
              </Field>
              <Field label="Secondary Email">
                <input style={inputBase} type="email" placeholder="Optional"
                  value={form.secondaryEmailId} onChange={e=>upd('secondaryEmailId',e.target.value)} />
              </Field>
            </div>

            {/* Present Address */}
            <div style={subHdr}>Present Address</div>
            <Field label="Street / Area" req error={errors.presentAddress}>
              <textarea style={errors.presentAddress?textareaErr:textareaBase}
                rows={2} placeholder="Door No., Street, Area"
                value={form.presentAddress} onChange={e=>upd('presentAddress',e.target.value)} />
            </Field>
            <div style={grid2}>
              <Field label="District" req error={errors.presentDistrict}>
                <select style={errors.presentDistrict?selectErr:selectBase}
                  value={form.presentDistrict} onChange={e=>upd('presentDistrict',e.target.value)}>
                  <option value="">Select district</option>
                  {TN_DISTRICTS.map(d=><option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="State">
                <input style={inputRO} readOnly value="Tamil Nadu" disabled />
              </Field>
            </div>

            {/* Same address checkbox */}
            <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',userSelect:'none' }}>
              <input type="checkbox" checked={sameAddr} onChange={e=>syncAddr(e.target.checked)}
                style={{ width:16,height:16,accentColor:'#000',cursor:'pointer' }} />
              <span style={{ fontSize:13,fontWeight:600,color:'#000' }}>
                Permanent address is same as present address
              </span>
            </label>

            {/* Permanent Address */}
            {!sameAddr && (<>
              <div style={subHdr}>Permanent Address</div>
              <Field label="Street / Area" req error={errors.permanentAddress}>
                <textarea style={errors.permanentAddress?textareaErr:textareaBase}
                  rows={2} placeholder="Door No., Street, Area"
                  value={form.permanentAddress} onChange={e=>upd('permanentAddress',e.target.value)} />
              </Field>
              <div style={grid2}>
                <Field label="District" req error={errors.permanentDistrict}>
                  <select style={errors.permanentDistrict?selectErr:selectBase}
                    value={form.permanentDistrict} onChange={e=>upd('permanentDistrict',e.target.value)}>
                    <option value="">Select district</option>
                    {TN_DISTRICTS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="State">
                  <input style={inputRO} readOnly value="Tamil Nadu" disabled />
                </Field>
              </div>
            </>)}
          </>)}

          {/* ── STEP 2 ── */}
          {step === 2 && (<>
            {/* Job Roles */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6 }}>
              <Lbl req>Job Roles</Lbl>
              <div style={{ display:'flex',gap:12 }}>
                <button type="button" style={{ fontSize:12,fontWeight:700,background:'none',border:'none',color:'#1d4ed8',cursor:'pointer' }}
                  onClick={()=>upd('jobRoles',[...JOB_ROLES])}>Select all</button>
                <button type="button" style={{ fontSize:12,fontWeight:700,background:'none',border:'none',color:'#dc2626',cursor:'pointer' }}
                  onClick={()=>upd('jobRoles',[])}>Clear</button>
              </div>
            </div>
            <div style={tagPanel(!!errors.jobRoles)}>
              {JOB_ROLES.map(r => {
                const on = form.jobRoles.includes(r);
                return <button type="button" key={r} style={chip(on,'#18181b')} onClick={()=>toggle('jobRoles',r)}>
                  {r}
                </button>;
              })}
            </div>
            <Err msg={errors.jobRoles} />

            {/* Districts */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:6,marginBottom:6 }}>
              <Lbl req>Preferred Districts</Lbl>
              <div style={{ display:'flex',gap:12 }}>
                <button type="button" style={{ fontSize:12,fontWeight:700,background:'none',border:'none',color:'#1d4ed8',cursor:'pointer' }}
                  onClick={()=>upd('preferredDistricts',[...TN_DISTRICTS])}>All</button>
                <button type="button" style={{ fontSize:12,fontWeight:700,background:'none',border:'none',color:'#dc2626',cursor:'pointer' }}
                  onClick={()=>upd('preferredDistricts',[])}>Clear</button>
              </div>
            </div>
            <select style={errors.preferredDistricts?selectErr:selectBase} value=""
              onChange={e=>e.target.value&&toggle('preferredDistricts',e.target.value)}>
              <option value="">Add a district…</option>
              {TN_DISTRICTS.filter(d=>!form.preferredDistricts.includes(d)).map(d=><option key={d}>{d}</option>)}
            </select>
            <div style={tagPanel(!!errors.preferredDistricts)}>
              {form.preferredDistricts.length===0
                ? <span style={{ fontSize:12,color:'#a1a1aa',fontStyle:'italic',alignSelf:'center' }}>No districts added yet</span>
                : form.preferredDistricts.map(d=>(
                  <button type="button" key={d} style={chip(true,'#1d4ed8')} onClick={()=>toggle('preferredDistricts',d)}>
                    {d} x
                  </button>
                ))}
            </div>
            <Err msg={errors.preferredDistricts} />

            {/* Salary */}
            <Field label="Monthly Salary Expectation" req error={errors.expectedSalary}>
              <select style={errors.expectedSalary?selectErr:selectBase}
                value={form.expectedSalary} onChange={e=>upd('expectedSalary',e.target.value)}>
                <option value="">Select a range</option>
                {SALARY_RANGES.map(r=><option key={r}>{r}</option>)}
              </select>
            </Field>

            {/* Languages */}
            <div>
              <Lbl req>Languages Known</Lbl>
              <div style={tagPanel(!!errors.languagesKnown)}>
                {LANGUAGES.map(l => {
                  const on = form.languagesKnown.includes(l);
                  return <button type="button" key={l} style={chip(on,'#059669')} onClick={()=>toggle('languagesKnown',l)}>
                    {l}
                  </button>;
                })}
              </div>
              <Err msg={errors.languagesKnown} />
            </div>
          </>)}

          {/* ── STEP 3 ── */}
          {step === 3 && (<>
            <p style={{ fontSize:12,color:'#71717a',background:'#fafafa',border:'1px dashed #d4d4d8',
              borderRadius:7,padding:'8px 12px' }}>
              This section is <strong>optional</strong>. Leave blank and click "Review & Submit" to skip.
            </p>

            {/* Education */}
            <div style={secHdr}>Educational Qualifications</div>
            <table style={{ width:'100%',borderCollapse:'collapse',border:'1px solid #e4e4e7',borderRadius:8,overflow:'hidden' }}>
              <thead><tr>
                <th style={dynTh}>Institution</th>
                <th style={dynTh}>Course / Degree</th>
                <th style={{ ...dynTh,width:80 }}></th>
              </tr></thead>
              <tbody>
                {form.education.map((r,i)=>(
                  <tr key={i}>
                    <td style={dynTd}><input style={dynInput} placeholder="School / College" value={r.institution} onChange={e=>updRow('education',i,'institution',e.target.value)} /></td>
                    <td style={dynTd}><input style={dynInput} placeholder="e.g. B.Sc Chemistry" value={r.course} onChange={e=>updRow('education',i,'course',e.target.value)} /></td>
                    <td style={{ ...dynTd,textAlign:'center' }}>
                      <button type="button" onClick={()=>delRow('education',i)} style={{ background:'none',border:'none',color:'#dc2626',fontSize:13, fontWeight:700, cursor:'pointer' }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={()=>addRow('education')} style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:'#1d4ed8',background:'#eff6ff',border:'1.5px dashed #93c5fd',borderRadius:7,padding:'6px 12px',cursor:'pointer' }}>Add row</button>

            {/* Technical */}
            <div style={secHdr}>Technical Qualifications</div>
            <table style={{ width:'100%',borderCollapse:'collapse',border:'1px solid #e4e4e7',borderRadius:8,overflow:'hidden' }}>
              <thead><tr>
                <th style={dynTh}>Institution</th>
                <th style={dynTh}>Course / Certificate</th>
                <th style={{ ...dynTh,width:80 }}></th>
              </tr></thead>
              <tbody>
                {form.technical.map((r,i)=>(
                  <tr key={i}>
                    <td style={dynTd}><input style={dynInput} placeholder="Institute name" value={r.institution} onChange={e=>updRow('technical',i,'institution',e.target.value)} /></td>
                    <td style={dynTd}><input style={dynInput} placeholder="e.g. Tally ERP 9" value={r.course} onChange={e=>updRow('technical',i,'course',e.target.value)} /></td>
                    <td style={{ ...dynTd,textAlign:'center' }}>
                      <button type="button" onClick={()=>delRow('technical',i)} style={{ background:'none',border:'none',color:'#dc2626',fontSize:13, fontWeight:700, cursor:'pointer' }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={()=>addRow('technical')} style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:'#1d4ed8',background:'#eff6ff',border:'1.5px dashed #93c5fd',borderRadius:7,padding:'6px 12px',cursor:'pointer' }}>Add row</button>

            {/* Experience */}
            <div style={secHdr}>Work Experience</div>
            <table style={{ width:'100%',borderCollapse:'collapse',border:'1px solid #e4e4e7',borderRadius:8,overflow:'hidden' }}>
              <thead><tr>
                <th style={dynTh}>Organisation</th>
                <th style={dynTh}>Role</th>
                <th style={{ ...dynTh,width:72 }}>From</th>
                <th style={{ ...dynTh,width:72 }}>To</th>
                <th style={{ ...dynTh,width:80 }}></th>
              </tr></thead>
              <tbody>
                {form.experience.map((r,i)=>(
                  <tr key={i}>
                    <td style={dynTd}><input style={dynInput} placeholder="Company name" value={r.institution} onChange={e=>updRow('experience',i,'institution',e.target.value)} /></td>
                    <td style={dynTd}><input style={dynInput} placeholder="Job title" value={r.role||''} onChange={e=>updRow('experience',i,'role',e.target.value)} /></td>
                    <td style={dynTd}><input style={dynInput} type="number" placeholder="2020" value={r.fromYear} onChange={e=>updRow('experience',i,'fromYear',e.target.value)} /></td>
                    <td style={dynTd}><input style={dynInput} type="number" placeholder="2024" value={r.toYear} onChange={e=>updRow('experience',i,'toYear',e.target.value)} /></td>
                    <td style={{ ...dynTd,textAlign:'center' }}>
                      <button type="button" onClick={()=>delRow('experience',i)} style={{ background:'none',border:'none',color:'#dc2626',fontSize:13, fontWeight:700, cursor:'pointer' }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={()=>addRow('experience')} style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:'#1d4ed8',background:'#eff6ff',border:'1.5px dashed #93c5fd',borderRadius:7,padding:'6px 12px',cursor:'pointer' }}>Add row</button>
          </>)}
        </div>

        {/* Footer */}
        <div style={{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'16px 24px',borderTop:'1px solid #f4f4f5',background:'#fafafa'
        }}>
          {step > 1
            ? <button type="button" onClick={()=>{setStep(s=>s-1);setErrors({});}} style={{
                padding:'10px 18px',border:'1.5px solid #e4e4e7',borderRadius:8,
                background:'#fff',color:'#000',fontSize:14,fontWeight:700
              }}>Back</button>
            : <div/>}
          <button type="submit" disabled={saving} style={{
            padding:'10px 22px',border:'none',borderRadius:8,
            background: saving ? '#a1a1aa' : '#18181b',
            color:'#fff',fontSize:14,fontWeight:700,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}>
            {saving ? 'Saving…' : step===3 ? 'Review & Submit' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper sub-components
function RV({ label, val }) {
  return (
    <div>
      <p style={{ fontSize:11,color:'#71717a',fontWeight:600,marginBottom:2 }}>{label}</p>
      <p style={{ fontSize:13,fontWeight:700,color:'#000' }}>{val || '—'}</p>
    </div>
  );
}
function TagReview({ label, tags, color }) {
  if (!tags?.length) return null;
  return (
    <div style={{ marginTop:10 }}>
      <p style={{ fontSize:11,color:'#71717a',fontWeight:600,marginBottom:5 }}>{label}</p>
      <div style={{ display:'flex',flexWrap:'wrap',gap:8, alignItems:'center' }}>
        {tags.map(t => (
          <span key={t} style={{ padding:'3px 9px',borderRadius:5,fontSize:11,fontWeight:700,
            background: color==='#000'?'#f4f4f5':color==='#1d4ed8'?'#eff6ff':'#f0fdf4',
            color, border:`1px solid ${color==='#000'?'#e4e4e7':color==='#1d4ed8'?'#bfdbfe':'#bbf7d0'}` }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}