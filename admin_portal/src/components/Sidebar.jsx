import React from 'react';
import { Building2, Users, FileSpreadsheet, Briefcase, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shadow-xl shrink-0">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-6">
          <div className="bg-emerald-500 text-slate-900 p-1.5 rounded-lg font-black tracking-tighter text-sm">AD</div>
          <h1 className="font-bold text-white text-base tracking-wide">Admin</h1>
        </div>
        
        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('verification')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'verification' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Building2 className="w-4 h-4" /> Company Verification
          </button>
          
          <button 
            onClick={() => setActiveTab('candidates')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'candidates' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Users className="w-4 h-4" /> Candidates Directory
          </button>
          
          <button 
            onClick={() => setActiveTab('tracker')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'tracker' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Requirements Tracker
          </button>
          
          <button 
            onClick={() => setActiveTab('match')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'match' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Briefcase className="w-4 h-4" /> Match Engine Pipeline
          </button>
        </nav>
      </div>

      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-all duration-200 cursor-pointer">
        <LogOut className="w-4 h-4" /> Secure Logout
      </button>
    </aside>
  );
}