import React, { useState } from 'react';
import {
  Building2, Users, FileSpreadsheet, Briefcase, LogOut, Menu, X,
  UserCog, Shield, BarChart3, UserPlus,
} from 'lucide-react';
import { logout } from '../api';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const role = user?.role;

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN' || isSuperAdmin;
  const isSubAdmin = role === 'SUB_ADMIN';

  const badge = isSuperAdmin ? 'SA' : isAdmin ? 'AD' : 'SU';
  const badgeColor = isSubAdmin ? 'bg-indigo-500 text-white' : isSuperAdmin ? 'bg-amber-500 text-slate-900' : 'bg-emerald-500 text-slate-900';
  const title = isSubAdmin ? 'Sub-Admin Portal' : isSuperAdmin ? 'Super Admin Hub' : 'Admin Dashboard';

  const mainItems = [
    ...(isAdmin ? [
      { id: 'verification', label: 'Employer Management', icon: Building2 },
      { id: 'tracker', label: 'Requirements Tracker', icon: FileSpreadsheet },
      ...(isSuperAdmin ? [{ id: 'match', label: 'Match Engine Pipeline', icon: Briefcase }] : []),
      { id: 'candidates', label: 'Candidates Directory', icon: Users },
      { id: 'assignment', label: 'Candidate Assignment', icon: UserPlus },
    ] : []),
    ...(isSubAdmin ? [
      { id: 'candidates', label: 'My Candidates Queue', icon: Users },
    ] : []),
  ];

  const adminItems = [
    ...(isSuperAdmin ? [
      { id: 'admins', label: 'Admin Management', icon: Shield },
    ] : []),
    ...(isAdmin ? [
      { id: 'subadmins', label: 'Sub-Admin Management', icon: UserCog },
    ] : []),
  ];

  const analyticsItems = [
    ...(isSuperAdmin ? [
      { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
    ] : []),
  ];

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const renderNavItem = (item) => {
    const IconComponent = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30 font-semibold'
            : 'hover:bg-slate-800 hover:text-slate-100'
        }`}
      >
        <IconComponent className="w-4 h-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  const NavContent = () => (
    <>
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between px-3 py-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg font-black tracking-tighter text-sm ${badgeColor}`}>{badge}</div>
              <div>
                <h1 className="font-bold text-white text-sm tracking-wide">{title}</h1>
                <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{user?.name}</p>
              </div>
            </div>
            <button className="md:hidden p-1 text-slate-400 hover:text-white cursor-pointer" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-1">Core Modules</span>
              {mainItems.map(renderNavItem)}
            </div>

            {adminItems.length > 0 && (
              <div className="space-y-1.5 border-t border-b border-slate-800 py-4 my-4 bg-slate-900/45 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-2 block mb-1">User Administration</span>
                {adminItems.map(renderNavItem)}
              </div>
            )}

            {analyticsItems.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-1">Reports & Analytics</span>
                {analyticsItems.map(renderNavItem)}
              </div>
            )}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-all duration-200 cursor-pointer mt-8"
        >
          <LogOut className="w-4 h-4 shrink-0" /> Secure Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden w-full bg-slate-900 text-slate-300 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg font-black tracking-tighter text-sm ${badgeColor}`}>{badge}</div>
          <h1 className="font-bold text-white text-base tracking-wide">{title}</h1>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && <div className="fixed inset-0 bg-slate-950/60 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shadow-xl shrink-0 transform transition-transform duration-300 md:relative md:transform-none md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavContent />
      </aside>
    </>
  );
}
