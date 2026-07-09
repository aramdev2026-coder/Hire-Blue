import React, { useState } from 'react';
import { Briefcase, X, Search } from 'lucide-react';

export default function ShortlistJobModal({ jobs = [], onClose, onConfirm }) {
  const [search, setSearch] = useState('');

  const filteredJobs = jobs.filter((j) => {
    const title = j.roleTitle || '';
    const company = j.employerName || j.employer?.companyName || '';
    const q = search.toLowerCase();
    return title.toLowerCase().includes(q) || company.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 bg-slate-950/40 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 flex flex-col max-h-[85vh] space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start pb-2 border-b border-slate-100">
          <div className="flex gap-3 items-center">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base leading-snug">Shortlist Candidate</h4>
              <p className="text-xs text-slate-500">Select a job from the list below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Jobs List */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1 max-h-[40vh] min-h-[20vh]">
          {filteredJobs.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">
              No matching jobs found.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onConfirm(job.id)}
                className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex justify-between items-center group cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
              >
                <div className="truncate pr-2">
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
                    {job.roleTitle}
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {job.employerName || job.employer?.companyName || 'Not Specified'}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  ID: {job.id.slice(0, 8)}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
