import React from 'react';
import { Search, Filter, ArrowUpDown, Loader } from 'lucide-react';

export default function CandidatesDirectory({ candidates, filter, setFilter, searchQuery, setSearchQuery, sortBy, setSortBy, loading, onUpdateStatus }) {

  const handleStatusTransition = (candidateId, currentCompany, targetStatus) => {
    if (targetStatus === 'SHORTLISTED') {
      const company = window.prompt("Enter the Company Name this candidate is being Shortlisted for:", currentCompany || "");
      if (company === null) return; 
      if (!company.trim()) {
        window.alert("Action Cancelled: Company Name cannot be empty.");
        return;
      }
      onUpdateStatus(candidateId, 'SHORTLISTED', company.trim());
    } 
    else if (targetStatus === 'PLACED') {
      const company = window.prompt("Confirm or update the Company Name where this candidate is being Placed:", currentCompany || "");
      if (company === null) return;
      if (!company.trim()) {
        window.alert("Action Cancelled: Company Name cannot be empty.");
        return;
      }
      onUpdateStatus(candidateId, 'PLACED', company.trim());
    } 
    else if (targetStatus === 'PENDING_ADMIN_CALL') {
      const confirmRevoke = window.confirm("Are you sure you want to revoke this candidate back to the Pending Call list?");
      if (confirmRevoke) {
        onUpdateStatus(candidateId, 'PENDING_ADMIN_CALL', null);
      }
    }
  };

  return (
    <div className="space-y-4 w-full px-1 sm:px-0">
      {/* Search and Sort Utilities Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Name, ID, or Contact Number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button 
            onClick={() => setSortBy(sortBy === 'salary' ? 'name' : 'salary')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort {sortBy === 'salary' ? 'Salary' : 'Name'}
          </button>
        </div>
      </div>

      {/* Roster Pipeline Segment Tabs */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {['PENDING_ADMIN_CALL', 'PENDING_WIZARD', 'SHORTLISTED', 'PLACED'].map((statusKey) => {
          const colorMap = {
            PENDING_ADMIN_CALL: 'bg-blue-600 border-blue-700 text-blue-600',
            PENDING_WIZARD: 'bg-yellow-600 border-yellow-700 text-yellow-600',
            SHORTLISTED: 'bg-emerald-600 border-emerald-700 text-emerald-600',
            PLACED: 'bg-purple-600 border-purple-700 text-purple-600'
          };
          const isSelected = filter === statusKey;
          const label = statusKey.replace('PENDING_', 'Pending ').replace('WIZARD', 'Wizard').replace('ADMIN_CALL', 'Call');
          
          return (
            <button 
              key={statusKey}
              onClick={() => setFilter(statusKey)}
              className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isSelected 
                  ? `${colorMap[statusKey].split(' ')[0]} text-white ${colorMap[statusKey].split(' ')[1]}` 
                  : `bg-white border-slate-200 text-slate-600`
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Main Workspace Data Grid */}
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
          {/* RESPONSIVE LAYOUT FOR SCREEN WIDTHS BELOW EXTRALARGE (xl) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{candidate.fullName || 'N/A'}</h4>
                    <p className="text-[11px] font-mono font-bold text-emerald-600 mt-0.5">#{candidate.id.slice(0, 8)}</p>
                  </div>
                  
                  {/* Status Indicator Badge Mapping */}
                  {(filter === 'SHORTLISTED' || filter === 'PLACED') ? (
                    <div className="text-right text-xs bg-amber-50 text-slate-900 px-2 py-1 rounded border border-amber-100 max-w-[150px] truncate">
                      🏢 {candidate.shortlistedCompany || 'Not Specified'}
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

                {/* Mobile Action Controls */}
                {(filter === 'PENDING_ADMIN_CALL' || filter === 'SHORTLISTED') && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {filter === 'PENDING_ADMIN_CALL' && (
                      <button 
                        onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedCompany, 'SHORTLISTED')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-center"
                      >
                        Shortlist
                      </button>
                    )}

                    {filter === 'SHORTLISTED' && (
                      <>
                        <button 
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedCompany, 'PENDING_ADMIN_CALL')}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 rounded-md text-xs font-medium border border-slate-200 transition-colors cursor-pointer text-center"
                        >
                          Revoke
                        </button>
                        <button 
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedCompany, 'PLACED')}
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

          {/* DENSE GRID DATA TABLE STRUCTURE DISPLAYED ONLY ON LARGE MONITOR DESKTOPS (xl) */}
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
                    <td className="p-4 font-mono text-xs text-emerald-600 font-bold">#{candidate.id.slice(0, 8)}</td>
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
                        🏢 {candidate.shortlistedCompany || 'Not Specified'}
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
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedCompany, 'SHORTLISTED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                        >
                          Shortlist
                        </button>
                      </td>
                    )}

                    {filter === 'SHORTLISTED' && (
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedCompany, 'PENDING_ADMIN_CALL')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                        <button 
                          onClick={() => handleStatusTransition(candidate.id, candidate.shortlistedCompany, 'PLACED')}
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