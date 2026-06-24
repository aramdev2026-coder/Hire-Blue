import React from 'react';
import { Loader } from 'lucide-react';

export default function CompanyVerification({ employers, filter, setFilter, loading, onUpdateStatus }) {
  return (
    <div className="space-y-4 max-w-4xl w-full px-2 sm:px-0">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        💡 <strong>Awaiting Action:</strong> These employers have signed up and cannot view candidate arrays until approved.
      </div>

      {/* Tabs / Filters */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setFilter('PENDING_VERIFICATION')}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${filter === 'PENDING_VERIFICATION' ? 'bg-amber-600 text-white border-amber-700' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setFilter('ACTIVE')}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${filter === 'ACTIVE' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          Active
        </button>
        <button 
          onClick={() => setFilter('REJECTED')}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${filter === 'REJECTED' ? 'bg-rose-600 text-white border-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : employers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          No employers found
        </div>
      ) : (
        <>
          {/* RESPONSIVE LAYOUT FOR MOBILE DEVICES */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {employers.map((employer) => (
              <div key={employer.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{employer.companyName}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: #{employer.id.slice(0, 8)}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    employer.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-800' :
                    employer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {employer.status}
                  </span>
                </div>
                
                <div className="text-xs space-y-1 text-slate-600">
                  <p><strong>Email:</strong> {employer.email}</p>
                  <p><strong>Phone:</strong> {employer.phoneNumber}</p>
                </div>

                {filter === 'PENDING_VERIFICATION' && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => onUpdateStatus(employer.id, 'REJECTED')}
                      className="flex-1 max-w-[100px] text-center bg-rose-50 hover:bg-rose-100 text-rose-600 py-1.5 rounded-md text-xs font-medium border border-rose-200 transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(employer.id, 'ACTIVE')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-center"
                    >
                      Approve Entity
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* TABLE INTERFACE FOR DESKTOP SCREEN RESOLUTIONS */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="p-4">Company Name</th>
                  <th className="p-4">Contact Information</th>
                  <th className="p-4">Status</th>
                  {filter === 'PENDING_VERIFICATION' && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {employers.map((employer) => (
                  <tr key={employer.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{employer.companyName}</td>
                    <td className="p-4 text-slate-600">{employer.email} | {employer.phoneNumber}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        employer.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-800' :
                        employer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {employer.status}
                      </span>
                    </td>
                    {filter === 'PENDING_VERIFICATION' && (
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => onUpdateStatus(employer.id, 'REJECTED')}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-md text-xs font-medium border border-rose-200 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(employer.id, 'ACTIVE')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
                        >
                          Approve Entity
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