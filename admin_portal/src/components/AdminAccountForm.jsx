import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { STATES_AND_DISTRICTS } from '../utils/locationData';

export default function AdminAccountForm({
  form, setForm, errors, editing = false, showDistrict = false, onSubmit, onCancel, submitting, submitLabel,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const initialRegionState = Object.keys(STATES_AND_DISTRICTS).find(st => 
    (STATES_AND_DISTRICTS[st] || []).includes(form.region)
  ) || 'Tamil Nadu';
  const [subAdminState, setSubAdminState] = useState(initialRegionState);
  const inputCls = (field) =>
    `w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
      errors[field] ? 'border-rose-300' : 'border-slate-200'
    }`;

  const handlePhoneChange = (val) => {
    setForm({ ...form, phone: val.replace(/\D/g, '').slice(0, 10) });
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase">Name <span className="text-rose-500">*</span></label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls('name')} />
        {errors.name && <p className="text-xs text-rose-600 mt-0.5">{errors.name}</p>}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase">Email <span className="text-rose-500">*</span></label>
        <input type="email" required autoComplete="new-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls('email')} />
        {errors.email && <p className="text-xs text-rose-600 mt-0.5">{errors.email}</p>}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase">Phone</label>
        <input type="tel" maxLength={10} placeholder="10-digit mobile" value={form.phone}
          onChange={(e) => handlePhoneChange(e.target.value)} className={inputCls('phone')} />
        {errors.phone && <p className="text-xs text-rose-600 mt-0.5">{errors.phone}</p>}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase">
          Password {!editing && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative mt-1">
          <input type={showPassword ? "text" : "password"} required={!editing} autoComplete="new-password" value={form.password}
            placeholder={editing ? 'Leave blank to keep current' : ''}
            onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputCls('password').replace('mt-1', '')} pr-10`} />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-rose-600 mt-0.5">{errors.password}</p>}
      </div>

      {showDistrict && (
        <>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">State <span className="text-rose-500">*</span></label>
            <select required value={subAdminState} onChange={(e) => {
              setSubAdminState(e.target.value);
              setForm({ ...form, region: '' });
            }} className={inputCls('region')}>
              {Object.keys(STATES_AND_DISTRICTS).map((st) => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">District / Region <span className="text-rose-500">*</span></label>
            <select required value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={inputCls('region')}>
              <option value="">Select district</option>
              {(STATES_AND_DISTRICTS[subAdminState] || []).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.region && <p className="text-xs text-rose-600 mt-0.5">{errors.region}</p>}
          </div>
        </>
      )}

      <div className="sm:col-span-2 flex gap-2 pt-2">
        <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-60 transition-colors">
          {submitting ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors">Cancel</button>
      </div>
    </form>
  );
}
