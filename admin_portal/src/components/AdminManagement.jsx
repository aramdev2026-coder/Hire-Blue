import React, { useState } from 'react';
import { Shield, Plus, UserX, Loader } from 'lucide-react';
import AdminAccountForm from './AdminAccountForm';
import { validateAdminAccount } from '../utils/validation';

const EMPTY = { name: '', email: '', phone: '', password: '' };

export default function AdminManagement({ admins, loading, onCreate, onDeactivate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateAdminAccount(form);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSubmitting(true);
    try {
      await onCreate(form);
      setForm(EMPTY);
      setErrors({});
      setShowForm(false);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-lg">Admin Management</h3>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setErrors({}); }}
          className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      {errors.form && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{errors.form}</div>
      )}

      {showForm && (
        <AdminAccountForm
          form={form}
          setForm={setForm}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setErrors({}); }}
          submitting={submitting}
          submitLabel="Create Admin"
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-amber-600" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Approvals</th>
                <th className="p-3">Sub-Admins</th>
                <th className="p-3">Last Login</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3 text-xs">{a.email}</td>
                  <td className="p-3 text-xs font-mono">{a.phone || '—'}</td>
                  <td className="p-3">{a.employerApprovals ?? 0}</td>
                  <td className="p-3">{a.subAdminsManaged ?? 0}</td>
                  <td className="p-3 text-xs">{a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    {a.isActive && (
                      <button
                        onClick={() => window.confirm(`Deactivate ${a.name}?`) && onDeactivate(a.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
