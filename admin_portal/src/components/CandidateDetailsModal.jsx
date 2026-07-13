import React from 'react';
import { X, User, MapPin, Mail, Phone, Calendar, Heart, Award, Briefcase, GraduationCap } from 'lucide-react';

export default function CandidateDetailsModal({ candidate, onClose }) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all flex flex-col my-8 border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900">{candidate.fullName || 'N/A'}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                #{candidate.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Source:</span>
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                {candidate.sourceLabel || candidate.source || 'USER_PORTAL'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          
          {/* Status Badge Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Hiring Status:</span>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                {candidate.status}
              </span>
            </div>
            {candidate.shortlistedJob && (
              <div className="text-xs text-slate-700 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-lg">
                🏢 Sourced for: <span className="font-bold text-slate-900">{candidate.shortlistedJob.employer?.companyName || 'Not Specified'}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <User className="w-3.5 h-3.5" /> Personal Details
              </h4>
              
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Phone</span>
                  <span className="font-mono text-slate-900 font-semibold">{candidate.phoneNumber1 || '—'}</span>
                </div>
                {candidate.phoneNumber2 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Alternate Phone</span>
                    <span className="font-mono text-slate-900">{candidate.phoneNumber2}</span>
                  </div>
                )}
                {candidate.emailId && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Email</span>
                    <span className="text-slate-900 truncate max-w-[180px]" title={candidate.emailId}>{candidate.emailId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Date of Birth</span>
                  <span className="text-slate-900 font-semibold">
                    {candidate.dob ? new Date(candidate.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> Gender</span>
                  <span className="text-slate-900 font-semibold">{candidate.sex || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-slate-400" /> Marital Status</span>
                  <span className="text-slate-900 font-semibold">{candidate.maritalStatus || '—'}</span>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <MapPin className="w-3.5 h-3.5" /> Address Profile
              </h4>

              <div className="space-y-3.5 text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Present Address</p>
                  <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {candidate.presentAddress || '—'}
                    {candidate.presentDistrict && `, ${candidate.presentDistrict}`}
                    {candidate.presentState && `, ${candidate.presentState}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Permanent Address</p>
                  <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {candidate.permanentAddress || '—'}
                    {candidate.permanentDistrict && `, ${candidate.permanentDistrict}`}
                    {candidate.permanentState && `, ${candidate.permanentState}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Award className="w-3.5 h-3.5" /> Job Preferences & Skills
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Targeted Roles</p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.jobRoles && candidate.jobRoles.length > 0 ? (
                    candidate.jobRoles.map((role, idx) => (
                      <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {role}
                      </span>
                    ))
                  ) : <span className="text-slate-400">—</span>}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Expected Monthly Salary</p>
                <span className="inline-block bg-slate-100 border border-slate-200 text-slate-800 font-bold px-3 py-1 rounded-lg text-sm">
                  {candidate.expectedSalary || '—'}
                </span>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Preferred Districts</p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.preferredDistricts && candidate.preferredDistricts.length > 0 ? (
                    candidate.preferredDistricts.map((d, idx) => (
                      <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                        {d}
                      </span>
                    ))
                  ) : <span className="text-slate-400">—</span>}
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Languages Known</p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.languagesKnown && candidate.languagesKnown.length > 0 ? (
                    candidate.languagesKnown.map((lang, idx) => (
                      <span key={idx} className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {lang}
                      </span>
                    ))
                  ) : <span className="text-slate-400">—</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Education and Qualifications */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <GraduationCap className="w-3.5 h-3.5" /> Education & Technical Skills
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Academic Education */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Academic Profile</p>
                {(!candidate.education || candidate.education.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No academic qualifications listed.</p>
                ) : (
                  <div className="space-y-3">
                    {candidate.education.map((edu, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <p className="text-sm font-bold text-slate-900">{edu.course || 'Degree/Course'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{edu.institution || 'Institution'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Technical Training */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Technical Qualifications</p>
                {(!candidate.technical || candidate.technical.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No technical skills listed.</p>
                ) : (
                  <div className="space-y-3">
                    {candidate.technical.map((tech, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <p className="text-sm font-bold text-slate-900">{tech.course || 'Training/Course'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{tech.institution || 'Training Centre'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Briefcase className="w-3.5 h-3.5" /> Employment History
            </h4>

            {(!candidate.experience || candidate.experience.length === 0) ? (
              <p className="text-xs text-slate-400 italic bg-slate-50/50 p-4 rounded-xl text-center border border-slate-100">No work experience listed.</p>
            ) : (
              <div className="space-y-3">
                {candidate.experience.map((exp, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-900">{exp.role || 'Designation'}</p>
                      <p className="text-xs text-slate-500">{exp.institution || 'Organization'}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-indigo-50 border border-indigo-100/60 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {exp.fromYear} – {exp.toYear || 'Present'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-5 rounded-lg shadow-sm transition-all cursor-pointer animate-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
