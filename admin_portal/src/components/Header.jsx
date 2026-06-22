import React from 'react';

export default function Header({ activeTab }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0 shadow-xs">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 capitalize">
        {activeTab === 'tracker' ? 'Employer Requirements Tracker' : `${activeTab} Dashboard`}
      </h2>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <div className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full font-mono font-medium">Secured Node NodeAdmin</div>
      </div>
    </header>
  );
}