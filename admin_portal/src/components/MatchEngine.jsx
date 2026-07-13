import React, { useState } from 'react';
import { Loader, Search, Briefcase, Building2, MapPin, BadgePercent } from 'lucide-react';

export default function MatchEngine({ jobs, selectedJob, setSelectedJob, matchedCandidates, loading, fetchJobMatches, onUpdateStatus }) {
  const [companySearch, setCompanySearch] = useState('');

  const filteredJobs = jobs.filter(job => {
    const name = (job.employerName || job.employer?.companyName || '').toLowerCase();
    const title = (job.roleTitle || '').toLowerCase();
    return name.includes(companySearch.toLowerCase()) || title.includes(companySearch.toLowerCase());
  });

  return (
    <div className="space-y-6 w-full px-1 sm:px-0">
      {loading && !selectedJob ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase block">Search / Filter Requirements</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter by company or job role..." 
                  value={companySearch} 
                  onChange={(e) => setCompanySearch(e.target.value)} 
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="w-full md:w-80 space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase block">Select Job Requirement</label>
              <select 
                onChange={(e) => {
                  if (e.target.value === 'all') {
                    const allRolesJob = { id: 'all', roleTitle: 'All Roles', employer: { companyName: 'All Companies' } };
                    setSelectedJob(allRolesJob);
                    fetchJobMatches('all');
                  } else {
                    const job = jobs.find(j => j.id === e.target.value);
                    if (job) {
                      setSelectedJob(job);
                      fetchJobMatches(job.id);
                    }
                  }
                }}
                value={selectedJob?.id || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="">Choose a job...</option>
                {jobs.length > 1 && (
                  <option value="all">All Roles (Show all active requirements)</option>
                )}
                {filteredJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.roleTitle} - {job.employerName || job.employer?.companyName || 'Unknown Employer'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedJob && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between border-t-4 border-t-indigo-650 sticky top-4">
                <div className="space-y-4">
                  <div>
                    <span className="bg-slate-900 text-white text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium">Active Order Match</span>
                    <h3 className="font-bold text-slate-900 text-lg mt-1.5">{selectedJob.roleTitle}</h3>
                  </div>
                  
                  <div className="text-xs space-y-2 text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <p className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Company:</strong> {selectedJob.employerName || selectedJob.employer?.companyName || 'All Companies'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Target Boundary:</strong> {Array.isArray(selectedJob.location) ? selectedJob.location.join(', ') : selectedJob.location || 'Not Specified'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Experience Mandate:</strong> {selectedJob.expRequired === 0 ? 'Fresher / Any' : `${selectedJob.expRequired} Years`}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <BadgePercent className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Salary Range:</strong> {selectedJob.salaryRange || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Algorithmic Base Matches Found ({matchedCandidates.length})</p>
                {matchedCandidates.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-lg p-4 text-center text-slate-500 text-sm">
                    No matching candidates found
                  </div>
                ) : (
                  matchedCandidates.slice(0, 8).map((candidate) => {
                    const matchingJobs = jobs.filter(j => candidate.jobRoles?.includes(j.roleTitle));

                    return (
                      <div key={candidate.id} className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between sm:items-center bg-indigo-50/40 border-indigo-100 hover:shadow-md transition-shadow">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-slate-900">{candidate.fullName || 'Candidate'}</p>
                          <p className="text-xs text-slate-500">
                            {candidate.experience && candidate.experience.length > 0 
                              ? `Exp: ${candidate.experience[0].institution || 'Experience'}`
                              : 'No experience data'}
                          </p>
                          <p className="text-xs text-slate-500">Expected: {candidate.expectedSalary || 'N/A'}</p>
                          <p className="text-xs font-mono mt-1 font-bold text-slate-700">📞 {candidate.phoneNumber1}</p>
                          {selectedJob.id === 'all' && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Matches roles: {(candidate.jobRoles || []).join(', ')}
                            </p>
                          )}
                        </div>
                        <div>
                          {selectedJob.id !== 'all' ? (
                            <button 
                              onClick={() => onUpdateStatus(candidate.id, 'SHORTLISTED', selectedJob.id)}
                              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shadow-xs text-center"
                            >
                              Shortlist
                            </button>
                          ) : matchingJobs.length === 0 ? (
                            <span className="text-xs text-slate-400">No matching active job</span>
                          ) : matchingJobs.length === 1 ? (
                            <button 
                              onClick={() => onUpdateStatus(candidate.id, 'SHORTLISTED', matchingJobs[0].id)}
                              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shadow-xs text-center"
                            >
                              Shortlist ({matchingJobs[0].employerName || matchingJobs[0].employer?.companyName || 'Job'})
                            </button>
                          ) : (
                            <select
                              onChange={(e) => e.target.value && onUpdateStatus(candidate.id, 'SHORTLISTED', e.target.value)}
                              className="w-full sm:w-auto text-xs border border-indigo-300 rounded px-2 py-1 bg-white text-indigo-800 focus:outline-none"
                              value=""
                            >
                              <option value="">Shortlist for...</option>
                              {matchingJobs.map(j => (
                                <option key={j.id} value={j.id}>
                                  {j.employerName || j.employer?.companyName || 'Employer'} ({j.roleTitle})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}