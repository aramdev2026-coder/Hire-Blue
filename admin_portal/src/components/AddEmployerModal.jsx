import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { apiFetch } from '../api';

export default function AddEmployerModal({ isOpen, onClose, onEmployerAdded }) {
  const [form, setForm] = useState({ companyName: '', phoneNumber: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.companyName || !form.phoneNumber || !form.password) {
      setError('Company Name, Phone Number, and Password are required.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch(`/api/admin/employers`, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      
      onEmployerAdded();
      onClose();
      setForm({ companyName: '', phoneNumber: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-lg">Add New Employer</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name *</label>
            <input 
              type="text" 
              value={form.companyName} 
              onChange={e => setForm({...form, companyName: e.target.value})} 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. Acme Corp"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
            <input 
              type="tel" 
              maxLength={10}
              value={form.phoneNumber} 
              onChange={e => setForm({...form, phoneNumber: e.target.value.replace(/\D/g, '')})} 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="10-digit mobile number"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address (Optional)</label>
            <input 
              type="email" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Leave blank to auto-generate"
            />
            <p className="text-[10px] text-slate-500 mt-1">If blank, a temporary email will be assigned.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Password *</label>
            <input 
              type="text" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Set a password for the employer"
              required 
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Create Employer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
