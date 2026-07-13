import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { useConfirm } from '../context/ConfirmContext';

export default function CompanyVerification({ employers, filter, setFilter, loading, onUpdateStatus, onCreateEmployer }) {
  const { showAlert } = useConfirm();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    phoneNumber: '',
    email: '',
    password: '',
    status: 'ACTIVE',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!form.companyName.trim()) {
      setModalError('Company Name is required');
      return;
    }
    if (!form.phoneNumber.trim()) {
      setModalError('Phone Number is required');
      return;
    }
    if (!/^\d{10}$/.test(form.phoneNumber.trim())) {
      setModalError('Enter a valid 10-digit phone number');
      return;
    }
    if (!form.password.trim()) {
      setModalError('Password is required');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateEmployer({
        companyName: form.companyName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim() || undefined,
        password: form.password.trim(),
        status: form.status,
      });
      setShowAddModal(false);
      setForm({ companyName: '', phoneNumber: '', email: '', password: '', status: 'ACTIVE' });
    } catch (err) {
      setModalError(err.message || 'Failed to add employer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800">
        <div className="flex-1">
          💡 <strong>Company Management:</strong> Toggle company accounts between active and blocked. Blocked companies cannot log in or view candidates.
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          ➕ Add Employer
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center w-full">
        <button
          onClick={() => setFilter('ACTIVE')}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${filter === 'ACTIVE' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('SUSPENDED')}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${filter === 'SUSPENDED' ? 'bg-rose-600 text-white border-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          Blocked
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : employers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          No companies found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {employers.map((employer) => (
              <div key={employer.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{employer.companyName}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: #{employer.id.slice(0, 8)}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${employer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                    {employer.status === 'ACTIVE' ? 'ACTIVE' : 'BLOCKED'}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <p><strong>Email:</strong> {employer.email}</p>
                  <p><strong>Phone:</strong> {employer.phoneNumber}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {employer.status === 'ACTIVE' ? (
                    <button
                      onClick={() => onUpdateStatus(employer.id, 'SUSPENDED')}
                      className="flex-1 text-center bg-rose-50 hover:bg-rose-100 text-rose-600 py-1.5 rounded-md text-xs font-medium border border-rose-200 transition-colors cursor-pointer"
                    >
                      Block Company
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(employer.id, 'ACTIVE')}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-center"
                    >
                      Activate Company
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="p-4">Company Name</th>
                  <th className="p-4">Contact Information</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {employers.map((employer) => (
                  <tr key={employer.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{employer.companyName}</td>
                    <td className="p-4 text-slate-600">{employer.email} | {employer.phoneNumber}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${employer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                        {employer.status === 'ACTIVE' ? 'ACTIVE' : 'BLOCKED'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {employer.status === 'ACTIVE' ? (
                        <button
                          onClick={() => onUpdateStatus(employer.id, 'SUSPENDED')}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-md text-xs font-medium border border-rose-200 transition-colors cursor-pointer"
                        >
                          Block Company
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(employer.id, 'ACTIVE')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
                        >
                          Activate Company
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all text-left">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Add New Employer</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg p-3">
                  ⚠️ {modalError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. Acme Corporation"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="tel"
                  required
                  maxLength={10}
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Email Address <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                </label>
                <input 
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="hr@company.com"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Set initial password for employer"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-emerald-600"
                >
                  <option value="ACTIVE">Active (Approved)</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg cursor-pointer transition-colors"
                >
                  {submitting ? 'Adding...' : 'Add Employer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}