import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { apiFetch } from '../api';

export default function AddRequirementModal({ isOpen, onClose, onRequirementAdded }) {
  const [employers, setEmployers] = useState([]);
  const [form, setForm] = useState({
    employerId: '',
    roleTitle: '',
    salaryRange: '',
    location: '',
    educationLevel: '',
    expRequired: '0',
    vacanciesCount: '1',
    maritalStatus: 'No Preference'
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchEmployers();
    }
  }, [isOpen]);

  const fetchEmployers = async () => {
    setFetching(true);
    try {
      const data = await apiFetch(`/api/admin/employers?status=ACTIVE`);
      setEmployers(data.employers || []);
    } catch (err) {
      console.error('Failed to fetch employers', err);
    } finally {
      setFetching(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.employerId || !form.roleTitle || !form.salaryRange || !form.location || !form.educationLevel) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // API expects jobs array
      const payload = {
        jobs: [{
          ...form,
          expRequired: parseInt(form.expRequired, 10) || 0,
          vacanciesCount: parseInt(form.vacanciesCount, 10) || 1,
          location: form.location.split(',').map(l => l.trim()).filter(Boolean)
        }]
      };

      await apiFetch(`/api/admin/employers/${form.employerId}/jobs`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      onRequirementAdded();
      onClose();
      // Reset form
      setForm({
        employerId: '', roleTitle: '', salaryRange: '', location: '', educationLevel: '', expRequired: '0', vacanciesCount: '1', maritalStatus: 'No Preference'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
          <h3 className="font-bold text-slate-800 text-lg">Add Job Requirement</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Employer *</label>
            {fetching ? (
              <div className="flex items-center text-xs text-slate-500 py-2"><Loader className="w-4 h-4 animate-spin mr-2" /> Loading employers...</div>
            ) : (
              <select
                value={form.employerId}
                onChange={e => setForm({...form, employerId: e.target.value})}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              >
                <option value="">-- Choose Employer --</option>
                {employers.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.companyName} ({emp.phoneNumber})</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Role Title *</label>
            <input 
              type="text" 
              value={form.roleTitle} 
              onChange={e => setForm({...form, roleTitle: e.target.value})} 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. Electrician, Welder"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Salary Range *</label>
              <input 
                type="text" 
                value={form.salaryRange} 
                onChange={e => setForm({...form, salaryRange: e.target.value})} 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. 15,000 - 20,000"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Number of Vacancies *</label>
              <input 
                type="number" 
                min="1"
                value={form.vacanciesCount} 
                onChange={e => setForm({...form, vacanciesCount: e.target.value})} 
                onFocus={e => e.target.select()}
                onBlur={e => {
                  const val = parseInt(e.target.value, 10);
                  if (!val || val < 1) setForm({...form, vacanciesCount: '1'});
                }}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Locations (Comma separated) *</label>
            <input 
              type="text" 
              value={form.location} 
              onChange={e => setForm({...form, location: e.target.value})} 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. Chennai, Madurai"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Education Level Required *</label>
            <input 
              type="text" 
              value={form.educationLevel} 
              onChange={e => setForm({...form, educationLevel: e.target.value})} 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. ITI, Diploma, 12th Pass"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Minimum Experience (Years)</label>
              <input 
                type="number" 
                min="0"
                value={form.expRequired} 
                onChange={e => setForm({...form, expRequired: e.target.value})} 
                onFocus={e => e.target.select()}
                onBlur={e => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val) || val < 0) setForm({...form, expRequired: '0'});
                }}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-500 mt-1">Use 0 for Fresher</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Marital Status Pref.</label>
              <select
                value={form.maritalStatus}
                onChange={e => setForm({...form, maritalStatus: e.target.value})}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="No Preference">No Preference</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3 sticky bottom-0 bg-white border-t border-slate-100 p-2 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || fetching}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Save Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
