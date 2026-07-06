import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  TN_DISTRICTS, JOB_ROLES, SALARY_RANGES, LANGUAGES,
  GENDER_OPTIONS, MARITAL_OPTIONS, emptyCandidateForm,
} from '../constants';
import { validateCandidateForm, buildCandidatePayload } from '../utils/validation';

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

const STEP_NAMES = ['Personal Details', 'Job Preferences', 'Education & Experience'];

function Field({ label, required, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-slate-600 uppercase">
        {label}{required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-600 mt-0.5">{error}</p>}
    </div>
  );
}

function TagPicker({ options, selected, onToggle, error }) {
  return (
    <>
      <div className={`flex flex-wrap gap-1.5 mt-1 ${error ? 'ring-1 ring-rose-300 rounded-lg p-1' : ''}`}>
        {options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                on ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-rose-600 mt-0.5">{error}</p>}
    </>
  );
}

export default function AddCandidateModal({ onClose, onSubmit, submitting }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyCandidateForm);
  const [errors, setErrors] = useState({});
  const [customRole, setCustomRole] = useState('');

  const upd = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggle = (key, val) => setForm((f) => ({
    ...f,
    [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
  }));

  const updRow = (key, index, field, val) => {
    setForm((f) => {
      const rows = [...f[key]];
      rows[index] = { ...rows[index], [field]: val };
      return { ...f, [key]: rows };
    });
  };

  const addRow = (key, template) => setForm((f) => ({ ...f, [key]: [...f[key], { ...template }] }));
  const delRow = (key, index) => setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== index) }));

  const validateStep = () => {
    const all = validateCandidateForm(form);
    const stepFields = {
      1: ['fullName', 'phoneNumber1', 'phoneNumber2', 'familyPhonePrimary', 'familyPhoneBackup', 'emailId', 'secondaryEmailId', 'dob', 'sex', 'maritalStatus', 'presentStreet1', 'presentCity', 'permanentStreet1', 'permanentCity'],
      2: ['jobRoles', 'preferredDistricts', 'expectedSalary', 'languagesKnown'],
      3: [],
    };
    const e = {};
    stepFields[step].forEach((k) => { if (all[k]) e[k] = all[k]; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 3) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    const all = validateCandidateForm(form);
    setErrors(all);
    if (Object.keys(all).length) return;
    try {
      await onSubmit(buildCandidatePayload(form));
    } catch (err) {
      const errMsg = err.message || '';
      const newErrors = {};
      if (errMsg.toLowerCase().includes('phone number') || errMsg.toLowerCase().includes('phone')) {
        newErrors.phoneNumber1 = 'A candidate with this phone number already exists';
        setStep(1);
      } else if (errMsg.toLowerCase().includes('email')) {
        newErrors.emailId = 'A candidate with this email address already exists';
        setStep(1);
      } else {
        newErrors.form = errMsg;
      }
      setErrors(newErrors);
      throw err;
    }
  };

  const inputCls = (err) => `w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${err ? 'border-rose-300' : 'border-slate-200'}`;

  return (
    <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
          <div>
            <p className="text-xs text-slate-500">Step {step} of 3</p>
            <h3 className="font-bold text-lg">{STEP_NAMES[step - 1]}</h3>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer p-1"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {errors.form && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg p-3">
              ❌ {errors.form}
            </div>
          )}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Full Name" required error={errors.fullName}>
                  <input className={inputCls(errors.fullName)} value={form.fullName} onChange={(e) => upd('fullName', e.target.value)} />
                </Field>
                <Field label="Primary Mobile" required error={errors.phoneNumber1}>
                  <input className={inputCls(errors.phoneNumber1)} maxLength={10} placeholder="10-digit number"
                    value={form.phoneNumber1} onChange={(e) => upd('phoneNumber1', e.target.value.replace(/\D/g, ''))} />
                </Field>
                <Field label="Date of Birth" required error={errors.dob}>
                  <input type="date" className={inputCls(errors.dob)} max={new Date().toISOString().split('T')[0]}
                    value={form.dob} onChange={(e) => upd('dob', e.target.value)} />
                </Field>
                <Field label="Gender" required error={errors.sex}>
                  <select className={inputCls(errors.sex)} value={form.sex} onChange={(e) => upd('sex', e.target.value)}>
                    <option value="">Select</option>
                    {GENDER_OPTIONS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Marital Status" required error={errors.maritalStatus}>
                  <select className={inputCls(errors.maritalStatus)} value={form.maritalStatus} onChange={(e) => upd('maritalStatus', e.target.value)}>
                    <option value="">Select</option>
                    {MARITAL_OPTIONS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Alternate Mobile" error={errors.phoneNumber2}>
                  <input className={inputCls(errors.phoneNumber2)} maxLength={10} value={form.phoneNumber2}
                    onChange={(e) => upd('phoneNumber2', e.target.value.replace(/\D/g, ''))} />
                </Field>
                <Field label="Family Contact" error={errors.familyPhonePrimary}>
                  <input className={inputCls(errors.familyPhonePrimary)} maxLength={10} value={form.familyPhonePrimary}
                    onChange={(e) => upd('familyPhonePrimary', e.target.value.replace(/\D/g, ''))} />
                </Field>
                <Field label="Family Contact Backup" error={errors.familyPhoneBackup}>
                  <input className={inputCls(errors.familyPhoneBackup)} maxLength={10} value={form.familyPhoneBackup}
                    onChange={(e) => upd('familyPhoneBackup', e.target.value.replace(/\D/g, ''))} />
                </Field>
                <Field label="Email" error={errors.emailId}>
                  <input type="email" className={inputCls(errors.emailId)} value={form.emailId} onChange={(e) => upd('emailId', e.target.value)} />
                </Field>
                <Field label="Secondary Email" error={errors.secondaryEmailId}>
                  <input type="email" className={inputCls(errors.secondaryEmailId)} value={form.secondaryEmailId} onChange={(e) => upd('secondaryEmailId', e.target.value)} />
                </Field>
              </div>

              <p className="text-xs font-bold uppercase text-slate-500 pt-2">Present Address</p>
              <Field label="Street Address 1" required error={errors.presentStreet1}>
                <input className={inputCls(errors.presentStreet1)} value={form.presentStreet1} onChange={(e) => upd('presentStreet1', e.target.value)} />
              </Field>
              <Field label="Street Address 2">
                <input className={inputCls()} value={form.presentStreet2} onChange={(e) => upd('presentStreet2', e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="District" required error={errors.presentCity}>
                  <select className={inputCls(errors.presentCity)} value={form.presentCity} onChange={(e) => upd('presentCity', e.target.value)}>
                    <option value="">Select district</option>
                    {TN_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="State">
                  <input className={`${inputCls()} bg-slate-50`} readOnly value="Tamil Nadu" />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.sameAddress} onChange={(e) => upd('sameAddress', e.target.checked)} />
                Permanent address same as present
              </label>

              {!form.sameAddress && (
                <>
                  <p className="text-xs font-bold uppercase text-slate-500 pt-2">Permanent Address</p>
                  <Field label="Street Address 1" required error={errors.permanentStreet1}>
                    <input className={inputCls(errors.permanentStreet1)} value={form.permanentStreet1} onChange={(e) => upd('permanentStreet1', e.target.value)} />
                  </Field>
                  <Field label="Street Address 2">
                    <input className={inputCls()} value={form.permanentStreet2} onChange={(e) => upd('permanentStreet2', e.target.value)} />
                  </Field>
                  <Field label="District" required error={errors.permanentCity}>
                    <select className={inputCls(errors.permanentCity)} value={form.permanentCity} onChange={(e) => upd('permanentCity', e.target.value)}>
                      <option value="">Select district</option>
                      {TN_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </Field>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Job Roles" required error={errors.jobRoles}>
                <TagPicker options={JOB_ROLES} selected={form.jobRoles} onToggle={(r) => toggle('jobRoles', r)} />
              </Field>
              <div className="flex gap-2">
                <input className={`flex-1 ${inputCls()}`} placeholder="Add custom role..." value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)} />
                <button type="button" className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-medium cursor-pointer"
                  onClick={() => { if (customRole.trim() && !form.jobRoles.includes(customRole.trim())) toggle('jobRoles', customRole.trim()); setCustomRole(''); }}>
                  Add
                </button>
              </div>

              <Field label="Preferred Districts" required error={errors.preferredDistricts}>
                <div className="flex gap-2 mb-1">
                  <button type="button" className="text-xs text-emerald-600 cursor-pointer" onClick={() => upd('preferredDistricts', [...TN_DISTRICTS])}>Select all</button>
                  <button type="button" className="text-xs text-slate-500 cursor-pointer" onClick={() => upd('preferredDistricts', [])}>Clear</button>
                </div>
                <select className={inputCls()} value="" onChange={(e) => e.target.value && toggle('preferredDistricts', e.target.value)}>
                  <option value="">Add district...</option>
                  {TN_DISTRICTS.filter((d) => !form.preferredDistricts.includes(d)).map((d) => <option key={d}>{d}</option>)}
                </select>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.preferredDistricts.map((d) => (
                    <button key={d} type="button" onClick={() => toggle('preferredDistricts', d)}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs cursor-pointer">
                      {d} ×
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Salary Expectation" required error={errors.expectedSalary}>
                {(() => {
                  const { minVal, maxVal } = parseSalaryRange(form.expectedSalary || '₹15,000 - ₹25,000');
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
                    <div className="salary-slider-wrapper py-2">
                      <div className="salary-display text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 inline-block mb-3">
                        {form.expectedSalary || `₹${minVal.toLocaleString('en-IN')} - ₹${maxVal.toLocaleString('en-IN')}`}
                      </div>

                      <div className="range-slider-container relative w-full h-6 mt-2">
                        <div className="range-slider-track absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 -translate-y-1/2 rounded-full" />
                        <div
                          className="range-slider-highlight absolute top-1/2 h-1.5 bg-emerald-600 -translate-y-1/2 rounded-full"
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
                          className="range-slider-input absolute top-1/2 left-0 w-full h-0 -translate-y-1/2 appearance-none bg-transparent pointer-events-none z-10"
                          style={{ outline: 'none' }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={SALARY_STEPS.length - 1}
                          value={maxIdx}
                          onChange={handleMaxSliderChange}
                          className="range-slider-input absolute top-1/2 left-0 w-full h-0 -translate-y-1/2 appearance-none bg-transparent pointer-events-none z-10"
                          style={{ outline: 'none' }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                        <span>₹10,000</span>
                        <span>₹5,00,000+</span>
                      </div>
                    </div>
                  );
                })()}
              </Field>

              <Field label="Languages Known" required error={errors.languagesKnown}>
                <TagPicker options={LANGUAGES} selected={form.languagesKnown} onToggle={(l) => toggle('languagesKnown', l)} />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">Education & experience are optional. Leave blank to skip.</p>

              <p className="text-xs font-bold uppercase text-slate-500">Education</p>
              {form.education.map((row, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <Field label="Institution"><input className={inputCls()} value={row.institution} onChange={(e) => updRow('education', i, 'institution', e.target.value)} /></Field>
                  <Field label="Course"><input className={inputCls()} value={row.course} onChange={(e) => updRow('education', i, 'course', e.target.value)} /></Field>
                  {form.education.length > 1 && (
                    <button type="button" className="text-xs text-rose-600 pb-2 cursor-pointer" onClick={() => delRow('education', i)}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" className="text-xs text-emerald-600 cursor-pointer" onClick={() => addRow('education', { institution: '', course: '' })}>+ Add education row</button>

              <p className="text-xs font-bold uppercase text-slate-500 pt-2">Technical Qualifications</p>
              {form.technical.map((row, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <Field label="Institution"><input className={inputCls()} value={row.institution} onChange={(e) => updRow('technical', i, 'institution', e.target.value)} /></Field>
                  <Field label="Certificate"><input className={inputCls()} value={row.course} onChange={(e) => updRow('technical', i, 'course', e.target.value)} /></Field>
                  {form.technical.length > 1 && (
                    <button type="button" className="text-xs text-rose-600 pb-2 cursor-pointer" onClick={() => delRow('technical', i)}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" className="text-xs text-emerald-600 cursor-pointer" onClick={() => addRow('technical', { institution: '', course: '' })}>+ Add technical row</button>

              <p className="text-xs font-bold uppercase text-slate-500 pt-2">Work Experience</p>
              {form.experience.map((row, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                  <Field label="Organisation" className="sm:col-span-2"><input className={inputCls()} value={row.institution} onChange={(e) => updRow('experience', i, 'institution', e.target.value)} /></Field>
                  <Field label="Role"><input className={inputCls()} value={row.role} onChange={(e) => updRow('experience', i, 'role', e.target.value)} /></Field>
                  <Field label="From"><input className={inputCls()} maxLength={4} placeholder="YYYY" value={row.fromYear} onChange={(e) => updRow('experience', i, 'fromYear', e.target.value.replace(/\D/g, '').slice(0, 4))} /></Field>
                  <Field label="To"><input className={inputCls()} maxLength={4} placeholder="YYYY" value={row.toYear} onChange={(e) => updRow('experience', i, 'toYear', e.target.value.replace(/\D/g, '').slice(0, 4))} /></Field>
                  {form.experience.length > 1 && (
                    <button type="button" className="text-xs text-rose-600 pb-2 cursor-pointer sm:col-span-5" onClick={() => delRow('experience', i)}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" className="text-xs text-emerald-600 cursor-pointer" onClick={() => addRow('experience', { institution: '', role: '', fromYear: '', toYear: '' })}>+ Add experience row</button>
            </>
          )}
        </div>

        <div className="flex justify-between p-4 border-t border-slate-200 shrink-0">
          <button type="button" onClick={() => (step > 1 ? setStep((s) => s - 1) : onClose())}
            className="flex items-center gap-1 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> {step > 1 ? 'Back' : 'Cancel'}
          </button>
          <button type="button" onClick={handleNext} disabled={submitting}
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg cursor-pointer disabled:opacity-60">
            {submitting ? 'Saving...' : step === 3 ? 'Create Candidate' : 'Continue'}
            {step < 3 && !submitting && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
