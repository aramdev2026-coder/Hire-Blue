import React from 'react';

const TAB_TITLES = {
  verification: 'Company Verification',
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

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between sm:items-center shrink-0 shadow-xs">
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
        {TAB_TITLES[activeTab] || `${activeTab} Dashboard`}
      </h2>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${dotColor}`} />
        <div className="text-[11px] sm:text-xs bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full font-mono font-medium truncate max-w-xs">
          {ROLE_LABELS[role] || role} · {user?.email}
        </div>
      </div>
    </header>
  );
}
