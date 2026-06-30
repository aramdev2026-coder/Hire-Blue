import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Loader, Users, Send, AlertTriangle } from 'lucide-react';
import { ALL_CANDIDATE_STATUSES, formatStatus, sourceBadgeClass } from '../constants';

export default function CandidatesDirectory({ 
  candidates, filter, setFilter, searchQuery, setSearchQuery, sortBy, setSortBy, loading, onUpdateStatus, onAssignToSubAdmin, subAdmins, jobs = [], duplicates = [],
}) {
  const [delegationMode, setDelegationMode] = useState(false);
  const [delDistrict, setDelDistrict] = useState('');
  const [delRole, setDelRole] = useState('');
  const [delCount, setDelCount] = useState('');
  const [delSubAdmin, setDelSubAdmin] = useState('');

  const duplicatePhones = useMemo(() => {
    const set = new Set();
    duplicates.forEach((g) => set.add(g.phoneNumber1));
    return set;
  }, [duplicates]);

  const uniqueDistricts = useMemo(() => [...new Set(candidates.map(c => c.presentDistrict).filter(Boolean))].sort(), [candidates]);
  const uniqueRoles = useMemo(() => [...new Set(candidates.flatMap(c => c.jobRoles || []).filter(Boolean))].sort(), [candidates]);

  const delegatedCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchDistrict = delDistrict ? c.presentDistrict === delDistrict : true;
      const matchRole = delRole ? c.jobRoles?.includes(delRole) : true;
      return matchDistrict && matchRole;
    });
  }, [candidates, delDistrict, delRole]);

  const handleDelegationSubmit = () => {
    if (!delSubAdmin) return window.alert("Please select a Sub Admin.");
    
    const countToAssign = delCount ? parseInt(delCount) : delegatedCandidates.length;
    if (countToAssign <= 0 || countToAssign > delegatedCandidates.length) {
      return window.alert(`Invalid count. Max available for this filter is ${delegatedCandidates.length}.`);
    }

    const candidateIdsToAssign = delegatedCandidates.slice(0, countToAssign).map(c => c.id);
    onAssignToSubAdmin(candidateIdsToAssign, delSubAdmin);
    setDelegationMode(false); 
    setDelCount('');
  };

  const handleStatusTransition = (candidateId, currentJobId, targetStatus) => {
    if (targetStatus === 'SHORTLISTED') {
      const jobOptions = jobs.map((j) => `${j.id}: ${j.roleTitle} @ ${j.employerName || j.employer?.companyName || 'Unknown'}`).join('\n');
      const choice = window.prompt(`Enter Job ID to shortlist for:\n\n${jobOptions || 'No jobs available'}`);
      if (choice === null) return;
      if (!choice.trim()) {
        window.alert('Action Cancelled: Job ID is required.');
        return;
      }
      onUpdateStatus(candidateId, 'SHORTLISTED', choice.trim());
    } 
    else if (targetStatus === 'PLACED') {
      const confirm = window.confirm('Mark this candidate as PLACED?');
      if (confirm) onUpdateStatus(candidateId, 'PLACED', currentJobId);
    } 
    else if (targetStatus === 'PENDING_ADMIN_CALL') {
      const confirmRevoke = window.confirm("Are you sure you want to revoke this candidate back to the Pending Call list?");
      if (confirmRevoke) onUpdateStatus(candidateId, 'PENDING_ADMIN_CALL', null);
    }
  };

  const getCompanyLabel = (candidate) =>
    candidate.shortlistedJob?.employer?.companyName ||
    candidate.shortlistedJob?.employerName ||
    jobs.find((j) => j.id === candidate.shortlistedJobId)?.employerName ||
    'Not Specified';

  return (
    <div className="space-y-4 w-full px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Name, ID, or Contact Number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => setDelegationMode(!delegationMode)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              delegationMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Delegate
          </button>
          <button 
            onClick={() => setSortBy(sortBy === 'salary' ? 'name' : 'salary')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort {sortBy === 'salary' ? 'Salary' : 'Name'}
          </button>
        </div>
      </div>

      {delegationMode && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Send className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-indigo-900">Bulk Assign to Sub-Admin</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-indigo-800 uppercase">Filter District</label>
              <select value={delDistrict} onChange={(e) => setDelDistrict(e.target.value)} className="w-full p-2 text-sm border border-indigo-200 rounded-md bg-white">
                <option value="">All Districts</option>
                {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-indigo-800 uppercase">Filter Role</label>
              <select value={delRole} onChange={(e) => setDelRole(e.target.value)} className="w-full p-2 text-sm border border-indigo-200 rounded-md bg-white">
                <option value="">All Roles</option>
                {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-indigo-800 uppercase">Select Sub-Admin</label>
              <select value={delSubAdmin} onChange={(e) => setDelSubAdmin(e.target.value)} className="w-full p-2 text-sm border border-indigo-200 rounded-md bg-white">
                <option value="">-- Choose --</option>
                {subAdmins.map(sa => <option key={sa.id} value={sa.id}>{sa.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-indigo-800 uppercase">Count (Max: {delegatedCandidates.length})</label>
              <input 
                type="number" 
                placeholder={`All ${delegatedCandidates.length}`}
                value={delCount} 
                onChange={(e) => setDelCount(e.target.value)}
                max={delegatedCandidates.length}
                className="w-full p-2 text-sm border border-indigo-200 rounded-md bg-white outline-none"
              />
            </div>

            <button 
              onClick={handleDelegationSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md text-sm transition-colors cursor-pointer shadow-sm"
            >
              Assign Selected
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white cursor-pointer"
        >
          <option value="">All Statuses</option>
          {ALL_CANDIDATE_STATUSES.map((s) => (
            <option key={s} value={s}>{formatStatus(s)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          No candidates found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      {candidate.fullName || 'N/A'}
                      {duplicatePhones.has(candidate.phoneNumber1) && (
                        <AlertTriangle className="inline w-3.5 h-3.5 text-amber-500 ml-1" title="Duplicate phone" />
                      )}
                    </h4>
                    <p className="text-[11px] font-mono font-bold text-emerald-600 mt-0.5">#{candidate.id}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border ${sourceBadgeClass(candidate.sourceLabel)}`}>
                      {candidate.sourceLabel || candidate.source}
                    </span>
                  </div>
                  
                  {(filter === 'SHORTLISTED' || filter === 'PLACED') ? (
                    <div className="text-right text-xs bg-amber-50 text-slate-900 px-2 py-1 rounded border border-amber-100 max-w-[150px] truncate">
                      🏢 {getCompanyLabel(candidate)}
                    </div>
                  ) : (
                    <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full border ${
                      candidate.status === 'PENDING_ADMIN_CALL' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {candidate.status}
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1.5 text-slate-600">
                  <div><strong>Mobile:</strong> <span className="font-mono">{candidate.phoneNumber1}</span></div>
                  <div><strong>District:</strong> {candidate.presentDistrict || 'N/A'}</div>
                  
                  <div className="sm:col-span-2">
                    <strong>Targeted Roles:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.jobRoles && candidate.jobRoles.length > 0 ? (
                        candidate.jobRoles.slice(0, 3).map((role, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] inline-block">{role}</span>
                        ))
                      ) : <span className="text-slate-400">-</span>}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <strong>Languages:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.languagesKnown && candidate.languagesKnown.length > 0 ? (
                        candidate.languagesKnown.map((lang, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded text-[11px] font-medium">{lang}</span>
                        ))
                      ) : <span className="text-slate-400">-</span>}
                    </div>
                  </div>
                </div>

                {(filter === 'PENDING_ADMIN_CALL' || filter === 'SHORTLISTED') && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {filter === 'PENDING_ADMIN_CALL' && (
                      <button 
                        onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedJobId, 'SHORTLISTED')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-center"
                      >
                        Shortlist
                      </button>
                    )}

                    {filter === 'SHORTLISTED' && (
                      <>
                        <button 
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedJobId, 'PENDING_ADMIN_CALL')}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 rounded-md text-xs font-medium border border-slate-200 transition-colors cursor-pointer text-center"
                        >
                          Revoke
                        </button>
                        <button 
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedJobId, 'PLACED')}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-center"
                        >
                          Move to Placed
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden xl:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="p-4">Candidate ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Primary Mobile</th>
                  <th className="p-4">Targeted Roles</th>
                  <th className="p-4">Languages</th>
                  <th className="p-4">District Preference</th>
                  {(filter === 'SHORTLISTED' || filter === 'PLACED') ? (
                    <th className="p-4 text-amber-700 bg-amber-50/50">Assigned Company</th>
                  ) : (
                    <th className="p-4">Status</th>
                  )}
                  {(filter === 'PENDING_ADMIN_CALL' || filter === 'SHORTLISTED') && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono text-xs text-emerald-600 font-bold">#{candidate.id}</td>
                    <td className="p-4 font-semibold text-slate-900">{candidate.fullName || 'N/A'}</td>
                    <td className="p-4 font-mono">{candidate.phoneNumber1}</td>
                    <td className="p-4">
                      {candidate.jobRoles && candidate.jobRoles.length > 0 ? (
                        candidate.jobRoles.slice(0, 2).map((role, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs mr-1 inline-block">{role}</span>
                        ))
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="p-4">
                      {candidate.languagesKnown && candidate.languagesKnown.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {candidate.languagesKnown.map((lang, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded text-xs font-medium">{lang}</span>
                          ))}
                        </div>
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="p-4">{candidate.presentDistrict || 'N/A'}</td>
                    
                    {(filter === 'SHORTLISTED' || filter === 'PLACED') ? (
                      <td className="p-4 font-bold text-slate-900 bg-amber-50/10">
                        🏢 {getCompanyLabel(candidate)}
                      </td>
                    ) : (
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                          candidate.status === 'PENDING_ADMIN_CALL' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                    )}

                    {filter === 'PENDING_ADMIN_CALL' && (
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedJobId, 'SHORTLISTED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                        >
                          Shortlist
                        </button>
                      </td>
                    )}

                    {filter === 'SHORTLISTED' && (
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedJobId, 'PENDING_ADMIN_CALL')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                        <button 
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedJobId, 'PLACED')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shadow-xs"
                        >
                          Move to Placed
                        </button>
                      </td>
                    )}
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