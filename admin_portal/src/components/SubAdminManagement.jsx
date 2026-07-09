import React, { useState } from 'react';
import { Users, Plus, Edit2, UserX, UserCheck, Loader, Trash2 } from 'lucide-react';
import AdminAccountForm from './AdminAccountForm';
import { validateSubAdminAccount } from '../utils/validation';
import { useConfirm } from '../context/ConfirmContext';

const EMPTY = { name: '', email: '', phone: '', password: '', region: '' };

export default function SubAdminManagement({
  subAdmins, loading, readOnly, onCreate, onUpdate, onDeactivate, onDelete, onActivate,
}) {
  const { showConfirm } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [reassignTo, setReassignTo] = useState('');
  const [deactivating, setDeactivating] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setForm(EMPTY);
    setEditing(null);
    setShowForm(false);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateSubAdminAccount(form, { editing: !!editing });
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSubmitting(true);
    try {
      if (editing) await onUpdate(editing.id, form);
      else await onCreate(form);
      resetForm();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (sa) => {
    setEditing(sa);
    setForm({ name: sa.name, email: sa.email, phone: sa.phone || '', password: '', region: sa.region || '' });
    setErrors({});
    setShowForm(true);
  };

  const handleDeactivate = async (sa) => {
    setSubmitting(true);
    try {
      await onDeactivate(sa.id, reassignTo || null);
      setDeactivating(null);
      setReassignTo('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-lg">Sub-Admin Management</h3>
          {readOnly && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">View Only</span>
          )}
        </div>
        {!readOnly && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Sub Admin
          </button>
        )}
      </div>

      {errors.form && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{errors.form}</div>
      )}

      {showForm && !readOnly && (
        <AdminAccountForm
          form={form}
          setForm={setForm}
          errors={errors}
          editing={!!editing}
          showDistrict
          onSubmit={handleSubmit}
          onCancel={resetForm}
          submitting={submitting}
          submitLabel={editing ? 'Update Sub Admin' : 'Create Sub Admin'}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : (
        <>
          {/* Card View for Mobile Screens */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {subAdmins.map((sa) => (
              <div key={sa.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{sa.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{sa.region || 'No region'}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 font-semibold rounded-full ${sa.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {sa.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned</span>
                    <strong className="text-slate-700">{sa.assignedCount ?? 0}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Added</span>
                    <strong className="text-slate-700">{sa.addedCount ?? 0}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Placed</span>
                    <strong className="text-slate-700">{sa.placedCount ?? 0}</strong>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <p><strong>Phone:</strong> {sa.phone || '—'}</p>
                  <p><strong>Last Login:</strong> {sa.lastLoginAt ? new Date(sa.lastLoginAt).toLocaleDateString() : 'Never'}</p>
                </div>

                {!readOnly && !sa.name.startsWith('[Deleted]') && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => startEdit(sa)} 
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    {sa.isActive ? (
                      <button 
                        onClick={() => setDeactivating(sa)} 
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" /> Deactivate
                      </button>
                    ) : (
                      <button 
                        onClick={() => showConfirm('Activate Sub-Admin', `Activate sub-admin "${sa.name}"?`, () => onActivate(sa.id), 'success')} 
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Activate
                      </button>
                    )}
                    <button 
                      onClick={() => showConfirm(
                        'Delete Sub-Admin Permanently',
                        `Are you absolutely sure you want to PERMANENTLY delete Sub-Admin "${sa.name}"? This will revert all their assigned candidates to unassigned and free their email credentials. This action cannot be undone.`,
                        () => onDelete(sa.id),
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
                  <th className="p-3">District</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Assigned</th>
                  <th className="p-3">Added</th>
                  <th className="p-3">Placed</th>
                  <th className="p-3">Last Login</th>
                  <th className="p-3">Status</th>
                  {!readOnly && <th className="p-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subAdmins.map((sa) => (
                  <tr key={sa.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium">{sa.name}</td>
                    <td className="p-3">{sa.region || '—'}</td>
                    <td className="p-3 text-xs font-mono">{sa.phone || '—'}</td>
                    <td className="p-3">{sa.assignedCount ?? 0}</td>
                    <td className="p-3">{sa.addedCount ?? 0}</td>
                    <td className="p-3">{sa.placedCount ?? 0}</td>
                    <td className="p-3 text-xs">{sa.lastLoginAt ? new Date(sa.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sa.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {sa.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {!readOnly && (
                      <td className="p-3 space-x-1">
                        {!sa.name.startsWith('[Deleted]') && (
                          <>
                            {sa.isActive ? (
                              <>
                                <button onClick={() => startEdit(sa)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => setDeactivating(sa)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer" title="Deactivate"><UserX className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(sa)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => showConfirm('Activate Sub-Admin', `Activate sub-admin "${sa.name}"?`, () => onActivate(sa.id), 'success')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer" title="Activate"><UserCheck className="w-4 h-4" /></button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                showConfirm(
                                  'Delete Sub-Admin Permanently',
                                  `Are you absolutely sure you want to PERMANENTLY delete Sub-Admin "${sa.name}"? This will revert all their assigned candidates to unassigned and free their email credentials. This action cannot be undone.`,
                                  () => onDelete(sa.id),
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {deactivating && !readOnly && (
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h4 className="font-bold">Deactivate {deactivating.name}</h4>
            <p className="text-sm text-slate-600">If they have open candidates, select a replacement sub-admin for reassignment.</p>
            <select value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">No reassignment needed / select replacement</option>
              {subAdmins.filter((s) => s.isActive && s.id !== deactivating.id).map((sa) => (
                <option key={sa.id} value={sa.id}>{sa.name} ({sa.region})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => handleDeactivate(deactivating)} disabled={submitting} className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer disabled:opacity-60">Deactivate</button>
              <button onClick={() => setDeactivating(null)} className="bg-slate-100 px-4 py-2 rounded-lg text-sm cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
