import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Loader, Send, AlertTriangle, Download } from 'lucide-react';
import { ALL_CANDIDATE_STATUSES, formatStatus, sourceBadgeClass, JOB_ROLES } from '../constants';
import { STATES_AND_DISTRICTS } from '../utils/locationData';
const TN_DISTRICTS = STATES_AND_DISTRICTS["Tamil Nadu"];
import { useConfirm } from '../context/ConfirmContext';
import ShortlistJobModal from './ShortlistJobModal';
import CandidateDetailsModal from './CandidateDetailsModal';

export default function CandidatesDirectory({ 
  candidates, filter, setFilter, districtFilter, setDistrictFilter, roleFilter, setRoleFilter, minAge, setMinAge, maxAge, setMaxAge, searchQuery, setSearchQuery, sortBy, setSortBy, sortDirection, setSortDirection, loading, onUpdateStatus, onAssignToSubAdmin, subAdmins, jobs = [], duplicates = [], statusCounts = {},
}) {
  const { showConfirm, showAlert } = useConfirm();
  const [selectedStateFilter, setSelectedStateFilter] = useState('Tamil Nadu');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [delegationMode, setDelegationMode] = useState(false);
  const [shortlistTarget, setShortlistTarget] = useState(null);
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
    if (!delSubAdmin) return showAlert('Delegation Warning', "Please select a Sub Admin.", 'warning');
    
    const countToAssign = delCount ? parseInt(delCount) : delegatedCandidates.length;
    if (countToAssign <= 0 || countToAssign > delegatedCandidates.length) {
      return showAlert('Delegation Error', `Invalid count. Max available for this filter is ${delegatedCandidates.length}.`, 'danger');
    }

    const candidateIdsToAssign = delegatedCandidates.slice(0, countToAssign).map(c => c.id);
    onAssignToSubAdmin(candidateIdsToAssign, delSubAdmin);
    setDelegationMode(false); 
    setDelCount('');
  };

  const handleStatusTransition = (candidateId, currentJobId, targetStatus) => {
    if (targetStatus === 'SHORTLISTED') {
      setShortlistTarget({ candidateId, currentJobId });
    } 
    else if (targetStatus === 'PLACED') {
      showConfirm(
        'Confirm Placement',
        'Mark this candidate as PLACED?',
        () => onUpdateStatus(candidateId, 'PLACED', currentJobId),
        'success'
      );
    } 
    else if (targetStatus === 'PENDING_ADMIN_CALL') {
      showConfirm(
        'Revoke Candidate',
        'Are you sure you want to revoke this candidate back to the Pending Call list?',
        () => onUpdateStatus(candidateId, 'PENDING_ADMIN_CALL', null),
        'warning'
      );
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
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              if (sortBy === 'name') {
                setSortBy('salary');
                setSortDirection('desc');
              } else if (sortDirection === 'desc') {
                setSortDirection('asc');
              } else {
                setSortBy('name');
                setSortDirection('desc');
              }
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            {sortBy === 'salary' ? (
              sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5" />
            )}
            {sortBy === 'salary' 
              ? `Salary: ${sortDirection === 'asc' ? 'Low → High' : 'High → Low'}` 
              : 'Sort: Name'
            }
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center w-full justify-between">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white cursor-pointer"
          >
            <option value="">All Statuses</option>
            {ALL_CANDIDATE_STATUSES.map((s) => {
              const count = statusCounts[s] ?? 0;
              return (
                <option key={s} value={s}>
                  {formatStatus(s)} ({count})
                </option>
              );
            })}
          </select>

          <select
            value={selectedStateFilter}
            onChange={(e) => {
              setSelectedStateFilter(e.target.value);
              setDistrictFilter('');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white cursor-pointer"
          >
            <option value="">All States</option>
            {Object.keys(STATES_AND_DISTRICTS).map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white cursor-pointer"
          >
            <option value="">All Districts</option>
            {(selectedStateFilter
              ? (STATES_AND_DISTRICTS[selectedStateFilter] || [])
              : Object.values(STATES_AND_DISTRICTS).flat()
            ).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white cursor-pointer"
          >
            <option value="">All Job Roles</option>
            {JOB_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg bg-white px-2.5 py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age:</span>
            <input
              type="number"
              min="18"
              max="99"
              placeholder="Min"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              className="w-10 text-xs font-semibold focus:outline-none bg-transparent"
            />
            <span className="text-slate-300 font-normal text-xs">-</span>
            <input
              type="number"
              min="18"
              max="99"
              placeholder="Max"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              className="w-10 text-xs font-semibold focus:outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-6 h-6 animate-spin text-indigo-600" />
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
                      <span 
                        onClick={() => setSelectedCandidate(candidate)} 
                        className="hover:underline hover:text-indigo-650 cursor-pointer text-indigo-600 transition-colors"
                      >
                        {candidate.fullName || 'N/A'}
                      </span>
                      {duplicatePhones.has(candidate.phoneNumber1) && (
                        <AlertTriangle className="inline w-3.5 h-3.5 text-amber-500 ml-1" title="Duplicate phone" />
                      )}
                    </h4>
                    <p className="text-[11px] font-mono font-bold text-indigo-600 mt-0.5">#{candidate.id}</p>
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
                  <div><strong>Present District:</strong> {candidate.presentDistrict || 'N/A'}</div>
                  <div><strong>Expected Salary:</strong> <span className="font-semibold text-slate-900">{candidate.expectedSalary || 'N/A'}</span></div>
                  <div><strong>Registered:</strong> {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</div>
                  
                  <div className="sm:col-span-2">
                    <strong>Preferred Districts:</strong> {candidate.preferredDistricts && candidate.preferredDistricts.length > 0 ? candidate.preferredDistricts.join(', ') : 'N/A'}
                  </div>
                  
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
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-center"
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
                  <th className="p-4">Candidate Details</th>
                  <th className="p-4">Roles & Languages</th>
                  <th className="p-4">Locations</th>
                  <th className="p-4">Expected Salary</th>
                  <th className="p-4">Registered Date</th>
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
                    {/* Candidate Details */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 flex items-center">
                        <span 
                          onClick={() => setSelectedCandidate(candidate)} 
                          className="hover:underline hover:text-indigo-650 cursor-pointer text-indigo-600 transition-colors"
                        >
                          {candidate.fullName || 'N/A'}
                        </span>
                        {duplicatePhones.has(candidate.phoneNumber1) && (
                          <AlertTriangle className="inline w-3.5 h-3.5 text-amber-500 ml-1.5" title="Duplicate phone" />
                        )}
                      </div>
                      <div className="flex gap-2 items-center mt-1 text-[11px]">
                        <span className="font-mono text-indigo-600 font-bold">#{candidate.id}</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-mono text-slate-500">{candidate.phoneNumber1}</span>
                      </div>
                    </td>

                    {/* Roles & Languages */}
                    <td className="p-4 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {candidate.jobRoles && candidate.jobRoles.length > 0 ? (
                          candidate.jobRoles.slice(0, 2).map((role, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] inline-block">{role}</span>
                          ))
                        ) : <span className="text-slate-400">-</span>}
                      </div>
                      {candidate.languagesKnown && candidate.languagesKnown.length > 0 && (
                        <div className="text-[11px] text-slate-500">
                          Languages: <span className="font-medium text-slate-700">{candidate.languagesKnown.join(', ')}</span>
                        </div>
                      )}
                    </td>

                    {/* Locations */}
                    <td className="p-4 text-xs space-y-1">
                      <div><span className="text-slate-400">Present:</span> <span className="font-medium text-slate-700">{candidate.presentDistrict || 'N/A'}</span></div>
                      <div className="max-w-[180px] truncate" title={candidate.preferredDistricts?.join(', ')}>
                        <span className="text-slate-400">Preferred:</span>{' '}
                        <span className="font-medium text-slate-700">
                          {candidate.preferredDistricts && candidate.preferredDistricts.length > 0 ? (
                            candidate.preferredDistricts.length > 2 
                              ? `${candidate.preferredDistricts.slice(0, 2).join(', ')} +${candidate.preferredDistricts.length - 2}` 
                              : candidate.preferredDistricts.join(', ')
                          ) : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Expected Salary */}
                    <td className="p-4 font-semibold text-indigo-600">{candidate.expectedSalary || 'N/A'}</td>

                    {/* Registered Date */}
                    <td className="p-4 whitespace-nowrap text-xs">
                      {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                    </td>
                    
                    {/* Status / Company */}
                    {(filter === 'SHORTLISTED' || filter === 'PLACED') ? (
                      <td className="p-4 font-bold text-slate-900 bg-amber-50/10 text-xs">
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

                    {/* Actions */}
                    {filter === 'PENDING_ADMIN_CALL' && (
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedJobId, 'SHORTLISTED')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
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

      {shortlistTarget && (
        <ShortlistJobModal
          jobs={jobs}
          onClose={() => setShortlistTarget(null)}
          onConfirm={(jobId) => {
            onUpdateStatus(shortlistTarget.candidateId, 'SHORTLISTED', jobId);
            setShortlistTarget(null);
          }}
        />
      )}

      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}