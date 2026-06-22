import React from 'react';
import { Search, Filter, ArrowUpDown, Loader } from 'lucide-react';

export default function CandidatesDirectory({ candidates, filter, setFilter, searchQuery, setSearchQuery, sortBy, setSortBy, loading, onUpdateStatus }) {

  // Custom workflow handler for company text entries and status updates
  const handleStatusTransition = (candidateId, currentCompany, targetStatus) => {
    if (targetStatus === 'SHORTLISTED') {
      const company = window.prompt("Enter the Company Name this candidate is being Shortlisted for:", currentCompany || "");
      
      // Edge Case: Operator clicked cancel
      if (company === null) return; 
      
      // Edge Case: Operator left input blank or entered empty spaces
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
        onUpdateStatus(candidateId, 'PENDING_ADMIN_CALL', null); // Clears the company field back to null
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Sort Utilities Control Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Name, ID, or Contact Number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer">
            <Filter className="w-3.5 h-3.5" /> Filter Status
          </button>
          <button 
            onClick={() => setSortBy(sortBy === 'salary' ? 'name' : 'salary')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort {sortBy === 'salary' ? 'Salary' : 'Name'}
          </button>
        </div>
      </div>

      {/* Roster Pipeline Segment Tabs */}
      <div className="flex gap-2">
        <button 
          onClick={() => setFilter('PENDING_ADMIN_CALL')}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${filter === 'PENDING_ADMIN_CALL' ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          Pending Call
        </button>
        <button 
          onClick={() => setFilter('PENDING_WIZARD')}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${filter === 'PENDING_WIZARD' ? 'bg-yellow-600 text-white border-yellow-700' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          Pending Wizard
        </button>
        <button 
          onClick={() => setFilter('SHORTLISTED')}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${filter === 'SHORTLISTED' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          Shortlisted
        </button>
        <button 
          onClick={() => setFilter('PLACED')}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${filter === 'PLACED' ? 'bg-purple-600 text-white border-purple-700' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          Placed
        </button>
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
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="p-4">Candidate ID</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Primary Mobile</th>
                <th className="p-4">Targeted Roles</th>
                <th className="p-4">Languages</th>
                <th className="p-4">District Preference</th>
                {/* Dynamically shift column context based on tab selection */}
                {(filter === 'SHORTLISTED' || filter === 'PLACED') ? (
                  <th className="p-4 text-amber-700 bg-amber-50/50">Assigned Company</th>
                ) : (
                  <th className="p-4">Status</th>
                )}
                {/* Dynamically render action header space based on usability requirements */}
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
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {candidate.languagesKnown && candidate.languagesKnown.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {candidate.languagesKnown.map((lang, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded text-xs font-medium">{lang}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-4">{candidate.presentDistrict || 'N/A'}</td>
                  
                  {/* Dynamic Custom Table Cell Body Switch */}
                  {(filter === 'SHORTLISTED' || filter === 'PLACED') ? (
                    <td className="p-4 font-bold text-slate-900 bg-amber-50/10">
                      🏢 {candidate.shortlistedCompany || 'Not Specified'}
                    </td>
                  ) : (
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${
                        candidate.status === 'PENDING_ADMIN_CALL' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {candidate.status}
                      </span>
                    </td>
                  )}

                  {/* Context-Driven Operational Action Controls Column */}
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
      )}
    </div>
  );
}