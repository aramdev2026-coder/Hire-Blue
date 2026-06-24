import React from 'react';
import { Loader } from 'lucide-react';

export default function MatchEngine({ jobs, selectedJob, setSelectedJob, matchedCandidates, loading, fetchJobMatches, onUpdateStatus }) {
  return (
    <div className="space-y-6 w-full px-1 sm:px-0">
      {loading && !selectedJob ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Select Job to View Matches</label>
            <select 
              onChange={(e) => {
                const job = jobs.find(j => j.id === e.target.value);
                if (job) {
                  setSelectedJob(job);
                  fetchJobMatches(job.id);
                }
              }}
              value={selectedJob?.id || ''}
              className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Choose a job...</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.roleTitle} - {job.employer?.companyName || 'Unknown Employer'}
                </option>
              ))}
            </select>
          </div>

          {selectedJob && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* CURRENT ACTIVE JOB REQUIREMENT PARAMS PANEL */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between border-t-4 border-t-emerald-600 sticky top-4">
                <div className="space-y-4">
                  <div>
                    <span className="bg-slate-900 text-white text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium">Active Order Match</span>
                    <h3 className="font-bold text-slate-900 text-lg mt-1.5">{selectedJob.roleTitle}</h3>
                  </div>
                  
                  <div className="text-xs space-y-2 text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <p><strong>Company:</strong> {selectedJob.employer?.companyName || 'Unknown'}</p>
                    <p><strong>Target Boundary:</strong> {Array.isArray(selectedJob.location) ? selectedJob.location.join(', ') : selectedJob.location || 'Not Specified'}</p>
                    <p><strong>Experience Mandate:</strong> {selectedJob.expRequired === 0 ? 'Fresher / Any' : `${selectedJob.expRequired} Years`}</p>
                    <p><strong>Salary Range:</strong> {selectedJob.salaryRange}</p>
                    <p><strong>Vacancies:</strong> {selectedJob.vacanciesCount}</p>
                  </div>
                </div>
              </div>

              {/* CANDIDATE DATA MATCH STREAM */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Algorithmic Base Matches Found ({matchedCandidates.length})</p>
                {matchedCandidates.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-lg p-4 text-center text-slate-500 text-sm">
                    No matching candidates found
                  </div>
                ) : (
                  matchedCandidates.slice(0, 5).map((candidate) => (
                    <div key={candidate.id} className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between sm:items-center bg-emerald-50/40 border-emerald-100 hover:shadow-md transition-shadow">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-slate-900">{candidate.fullName || 'Candidate'}</p>
                        <p className="text-xs text-slate-500">
                          {candidate.experience && candidate.experience.length > 0 
                            ? `Exp: ${candidate.experience[0].institution || 'Experience'}`
                            : 'No experience data'}
                        </p>
                        <p className="text-xs text-slate-500">Expected: {candidate.expectedSalary || 'N/A'}</p>
                        <p className="text-xs font-mono mt-1 font-bold text-slate-700">📞 {candidate.phoneNumber1}</p>
                      </div>
                      <button 
                        onClick={() => onUpdateStatus(candidate.id, 'SHORTLISTED')}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shadow-xs text-center"
                      >
                        Shortlist
                      </button>
                    </div>
                  ))
                )}
              </div>
              
            </div>
          )}
        </>
      )}
    </div>
  );
}