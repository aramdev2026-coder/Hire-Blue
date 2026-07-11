import React, { useState } from 'react';
import { Loader, Folder, FolderOpen, ArrowLeft, Briefcase, Users, Search, Filter, Plus } from 'lucide-react';
import AddRequirementModal from './AddRequirementModal';

export default function RequirementsTracker({ jobs, loading, backendUrl, token, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL_ROLES');

  const uniqueRoles = Array.from(
    new Set(jobs.map((job) => job.roleTitle).filter(Boolean))
  ).sort();

  const groupedCompanies = jobs.reduce((acc, job) => {
    const companyName = job.employerName || job.employer?.companyName || 'Unknown Company';
    const roleTitle = job.roleTitle || '';

    if (roleFilter !== 'ALL_ROLES' && roleTitle !== roleFilter) {
      return acc;
    }

    if (searchQuery && !companyName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return acc;
    }

    if (!acc[companyName]) {
      acc[companyName] = {
        companyName: companyName,
        totalOrders: 0,
        totalVacancies: 0,
        requirements: []
      };
    }

    acc[companyName].totalOrders += 1;
    acc[companyName].totalVacancies += parseInt(job.vacanciesCount || 0, 10);
    acc[companyName].requirements.push(job);

    return acc;
  }, {});

  const companyFolders = Object.values(groupedCompanies);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        No job requirements found
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {!selectedCompany && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search across company folders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="relative w-full sm:w-auto flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL_ROLES">All Roles Demand (Show All)</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role} Requisitions Only
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Requirement
        </button>
      </div>

      {!selectedCompany ? (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Corporate Demand Directory ({companyFolders.length} Folders Matching Criteria)
          </p>
          
          {companyFolders.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center text-slate-400 text-sm">
              No corporate folders match your current search or filter combinations.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyFolders.map((folder) => (
                <div
                  key={folder.companyName}
                  onClick={() => setSelectedCompany(folder.companyName)}
                  className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-5 shadow-xs flex items-start gap-4 transition-all duration-200 cursor-pointer group hover:shadow-sm"
                >
                  <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 rounded-xl transition-colors shrink-0">
                    <Folder className="w-6 h-6 group-hover:hidden" />
                    <FolderOpen className="w-6 h-6 hidden group-hover:block" />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-base tracking-tight truncate group-hover:text-emerald-700 transition-colors">
                      {folder.companyName}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                        {folder.totalOrders} {folder.totalOrders === 1 ? 'Order' : 'Orders'}
                      </span>
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-md">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        {folder.totalVacancies} Openings
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
            <button
              onClick={() => setSelectedCompany(null)}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-600 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
            </button>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedCompany}</h3>
              <p className="text-xs text-slate-500">
                {roleFilter !== 'ALL_ROLES' 
                  ? `Showing order parameters matching specified role: ${roleFilter}` 
                  : 'Displaying complete profile deployment requisitions'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {groupedCompanies[selectedCompany]?.requirements.map((job) => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm">
                  <div>
                    <span className="font-bold text-slate-900">{job.roleTitle}</span> 
                    <span className="text-slate-500 text-xs ml-2 font-medium">(Demanding {job.vacanciesCount} Positions)</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-700">Salary Target: {job.salaryRange}</div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500 px-1">
                  <div>📍 Location Boundaries: <span className="text-slate-800">{Array.isArray(job.location) ? job.location.join(', ') : job.location || 'Not Specified'}</span></div>
                  <div>⏳ Target Experience: <span className="text-slate-800">{job.expRequired === 0 ? 'Fresher / Any' : `${job.expRequired} Years`}</span></div>
                  <div className="text-slate-400 font-mono text-[10px]">ORDER_REF: #{job.id.slice(0, 8)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddRequirementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequirementAdded={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}