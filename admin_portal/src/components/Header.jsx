import React, { useState } from 'react';
import { Lock, X, Key, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../api';

const TAB_TITLES = {
  verification: 'Employer Management',
  candidates: 'Candidates Dashboard',
  tracker: 'Employer Requirements Tracker',
  match: 'Match Engine Pipeline',
  assignment: 'Candidate Assignment',
  subadmins: 'Sub-Admin Management',
  admins: 'Admin Management',
  analytics: 'Platform Analytics',
};

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  SUB_ADMIN: 'Sub Admin',
};

export default function Header({ activeTab, user }) {
  const role = user?.role;
  const dotColor = role === 'SUB_ADMIN' ? 'bg-indigo-500' : role === 'SUPER_ADMIN' ? 'bg-amber-500' : 'bg-emerald-500';

  const [isOpen, setIsOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleOpen = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setShowOldPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setShowOldPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/admin/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      setSuccess('Password changed successfully!');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between sm:items-center shrink-0 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
          {TAB_TITLES[activeTab] || `${activeTab} Dashboard`}
        </h2>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${dotColor}`} />
          <div className="text-[11px] sm:text-xs bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full font-mono font-medium truncate max-w-xs">
            {ROLE_LABELS[role] || role} · {user?.email}
          </div>
          <button
            onClick={handleOpen}
            className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-xs bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer"
            title="Change Password"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Change Password</h3>
              </div>
              <button onClick={handleClose} className="p-1 cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-md p-2">{error}</p>}
              {success && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md p-2">{success}</p>}

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
