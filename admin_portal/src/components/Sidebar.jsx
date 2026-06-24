import React, { useState } from 'react';
import { Building2, Users, FileSpreadsheet, Briefcase, LogOut, Menu, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { id: 'verification', label: 'Company Verification', icon: Building2 },
    { id: 'candidates', label: 'Candidates Directory', icon: Users },
    { id: 'tracker', label: 'Requirements Tracker', icon: FileSpreadsheet },
    { id: 'match', label: 'Match Engine Pipeline', icon: Briefcase },
  ];

  return (
    <>
      {/* MOBILE TRIGGER HEADER BAR */}
      <div className="md:hidden w-full bg-slate-900 text-slate-300 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-900 p-1.5 rounded-lg font-black tracking-tighter text-sm">AD</div>
          <h1 className="font-bold text-white text-base tracking-wide">Admin Hub</h1>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* BACKDROP SHADE FOR MOBILE */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* CORE SIDEBAR MODULE */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shadow-xl shrink-0
        transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        md:relative md:transform-none md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* HEADER LAYER */}
          <div className="flex items-center justify-between px-3 py-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 text-slate-900 p-1.5 rounded-lg font-black tracking-tighter text-sm">AD</div>
              <h1 className="font-bold text-white text-base tracking-wide">Admin Dashboard</h1>
            </div>
            <button className="md:hidden p-1 text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* NAVIGATION LINKS */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold' 
                      : 'hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" /> 
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* FOOTER LAYER */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-all duration-200 cursor-pointer mt-auto">
          <LogOut className="w-4 h-4 shrink-0" /> Secure Logout
        </button>
      </aside>
    </>
  );
}