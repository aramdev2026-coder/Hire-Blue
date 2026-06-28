import React from 'react';
import { TN_DISTRICTS } from '../constants';

export default function AdminAccountForm({
  form, setForm, errors, editing = false, showDistrict = false, onSubmit, onCancel, submitting, submitLabel,
}) {
  const inputCls = (field) =>
    `w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
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
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls('email')} />
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
        <input type="password" required={!editing} value={form.password}
          placeholder={editing ? 'Leave blank to keep current' : ''}
          onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls('password')} />
        {errors.password && <p className="text-xs text-rose-600 mt-0.5">{errors.password}</p>}
      </div>

      {showDistrict && (
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-600 uppercase">District / Region <span className="text-rose-500">*</span></label>
          <select required value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={inputCls('region')}>
            <option value="">Select district</option>
            {TN_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.region && <p className="text-xs text-rose-600 mt-0.5">{errors.region}</p>}
        </div>
      )}

      <div className="sm:col-span-2 flex gap-2">
        <button type="submit" disabled={submitting} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer disabled:opacity-60">
          {submitting ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm cursor-pointer">Cancel</button>
      </div>
    </form>
  );
}
