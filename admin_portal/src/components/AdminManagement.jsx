import React, { useState } from 'react';
import { Shield, Plus, UserX, UserCheck, Loader, Trash2 } from 'lucide-react';
import AdminAccountForm from './AdminAccountForm';
import { validateAdminAccount } from '../utils/validation';
import { useConfirm } from '../context/ConfirmContext';

const EMPTY = { name: '', email: '', phone: '', password: '' };

export default function AdminManagement({ admins, loading, onCreate, onDeactivate, onDelete, onActivate }) {
  const { showConfirm } = useConfirm();
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
          <Shield className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-lg">Admin Management</h3>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setErrors({}); }}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-750 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
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
        <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : (
        <>
          {/* Card View for Mobile Screens */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {admins.map((a) => (
              <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{a.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{a.email}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 font-semibold rounded-full ${a.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {a.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 p-2 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Approvals</span>
                    <strong className="text-slate-700">{a.employerApprovals ?? 0}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Sub-Admins Managed</span>
                    <strong className="text-slate-700">{a.subAdminsManaged ?? 0}</strong>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <p><strong>Phone:</strong> {a.phone || '—'}</p>
                  <p><strong>Last Login:</strong> {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString() : 'Never'}</p>
                </div>

                {!a.name.startsWith('[Deleted]') && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    {a.isActive ? (
                      <button 
                        onClick={() => showConfirm('Deactivate Admin', `Are you sure you want to deactivate ${a.name}?`, () => onDeactivate(a.id), 'danger')}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" /> Deactivate
                      </button>
                    ) : (
                      <button 
                        onClick={() => showConfirm('Activate Admin', `Are you sure you want to activate ${a.name}?`, () => onActivate(a.id), 'success')}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Activate
                      </button>
                    )}
                    <button 
                      onClick={() => showConfirm(
                        'Delete Admin Permanently',
                        `Are you absolutely sure you want to PERMANENTLY delete Admin "${a.name}"? This action cannot be undone.`,
                        () => onDelete(a.id),
                        'danger'
                      )}
                      className="px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden">
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
                    <td className="p-3 space-x-1">
                      {!a.name.startsWith('[Deleted]') && (
                        <>
                          {a.isActive ? (
                            <button
                              onClick={() => showConfirm('Deactivate Admin', `Are you sure you want to deactivate ${a.name}?`, () => onDeactivate(a.id), 'danger')}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Deactivate"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => showConfirm('Activate Admin', `Are you sure you want to activate ${a.name}?`, () => onActivate(a.id), 'success')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Activate"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              showConfirm(
                                'Delete Admin Permanently',
                                `Are you absolutely sure you want to PERMANENTLY delete Admin "${a.name}"? This will revert all their assigned candidates to unassigned and free their email credentials. This action cannot be undone.`,
                                () => onDelete(a.id),
                                'danger'
                              );
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800 rounded cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
