import React, { useState } from 'react';
import { Building2, Users, FileSpreadsheet, Briefcase, LogOut, Search, Filter, ArrowUpDown, CheckCircle, XCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('verification');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      
      {/* SIDEBAR NAVIGATION CONTROL */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shadow-xl shrink-0">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-6">
            <div className="bg-emerald-500 text-slate-900 p-1.5 rounded-lg font-black tracking-tighter text-sm">HQ</div>
            <h1 className="font-bold text-white text-base tracking-wide">Hiring Command</h1>
          </div>
          
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('verification')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'verification' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
            >
              <Building2 className="w-4 h-4" /> Company Verification
            </button>
            
            <button 
              onClick={() => setActiveTab('candidates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'candidates' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
            >
              <Users className="w-4 h-4" /> Candidates Directory
            </button>
            
            <button 
              onClick={() => setActiveTab('tracker')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'tracker' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Requirements Tracker
            </button>
            
            <button 
              onClick={() => setActiveTab('match')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'match' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
            >
              <Briefcase className="w-4 h-4" /> Match Engine Pipeline
            </button>
          </nav>
        </div>

        {/* SECURE TERMINATION FOOTER */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-all duration-200 cursor-pointer">
          <LogOut className="w-4 h-4" /> Secure Logout
        </button>
      </aside>

      {/* DYNAMIC SYSTEM WORKSPACE MODULE */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* APP CORE HEADER BAR */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0 shadow-xs">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 capitalize">
            {activeTab === 'tracker' ? 'Employer Requirements Tracker' : `${activeTab} Dashboard`}
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <div className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full font-mono font-medium">Secured Node NodeAdmin</div>
          </div>
        </header>

        {/* DYNAMIC INJECT PANEL SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* OPTION 1: COMPANY APPROVAL PIPELINE */}
          {activeTab === 'verification' && (
            <div className="space-y-4 max-w-4xl">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                💡 <strong>Awaiting Action:</strong> These employers have signed up and cannot view candidate arrays until approved.
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="p-4">Company Name</th>
                      <th className="p-4">Contact Information</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    <tr>
                      <td className="p-4 font-semibold text-slate-900">Sri Krishna Automotives</td>
                      <td className="p-4 text-slate-600">krishna@auto.com | +91 98765 43210</td>
                      <td className="p-4"><span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">Pending</span></td>
                      <td className="p-4 text-right space-x-2">
                        <button className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-md text-xs font-medium border border-rose-200 transition-colors cursor-pointer">Reject</button>
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer">Approve Entity</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OPTION 2: CANDIDATES DIRECTORY (MASTER ROSTER WITH SORT/FILTER UI) */}
          {activeTab === 'candidates' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by Name, ID, or Contact Number..." 
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer">
                    <Filter className="w-3.5 h-3.5" /> Filter Location
                  </button>
                  <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer">
                    <ArrowUpDown className="w-3.5 h-3.5" /> Sort Salary
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="p-4">Candidate ID</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Primary Mobile</th>
                      <th className="p-4">Targeted Roles</th>
                      <th className="p-4">Languages</th> {/* Updated Header Label */}
                      <th className="p-4">District Preference</th>
                      <th className="p-4">Workflow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono text-xs text-emerald-600 font-bold">#USR-8930</td>
                      <td className="p-4 font-semibold text-slate-900">Arun Kumar R</td>
                      <td className="p-4 font-mono">+91 94432 81102</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs">Driver</span>
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs ml-1">Delivery Staff</span>
                      </td>
                      <td className="p-4"> {/* Display Languages Array */}
                        <div className="flex flex-wrap gap-1">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded text-xs font-medium">Tamil</span>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded text-xs font-medium">English</span>
                        </div>
                      </td>
                      <td className="p-4">Coimbatore</td>
                      <td className="p-4"><span className="px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full">Pending Admin Call</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OPTION 3: EMPLOYER REQUIREMENTS TRACKER */}
          {activeTab === 'tracker' && (
            <div className="space-y-4 max-w-4xl">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Lakshmi Mill Supply Corp</h3>
                    <p className="text-xs text-slate-500">Registered Corporate Client</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-medium text-xs px-2.5 py-1 rounded-sm">Active Orders</span>
                </div>
                
                <div className="pl-4 border-l-2 border-emerald-500 space-y-3">
                  <div className="flex items-center justify-between text-sm bg-slate-50 p-3 border border-slate-100 rounded-lg">
                    <div>
                      <span className="font-semibold text-slate-900">M/c Operator</span> 
                      <span className="text-slate-500 text-xs ml-2">(Need 5 Candidates)</span>
                    </div>
                    <div className="text-xs font-mono text-slate-600">Salary Target: ₹15,000 - ₹20,000</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OPTION 4: THE CORE MATCH ENGINE PIPELINE */}
          {activeTab === 'match' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between border-t-4 border-t-emerald-600">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-slate-900 text-white text-xs font-mono uppercase px-2 py-0.5 rounded font-medium">Active Order Match</span>
                      <h3 className="font-bold text-slate-900 text-lg mt-1.5">Garments Production Operator</h3>
                    </div>
                  </div>
                  
                  <div className="text-xs space-y-1 text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <p><strong>Company:</strong> TexStyles India Ltd</p>
                    <p><strong>Target Boundary:</strong> Tiruppur District</p>
                    <p><strong>Experience Mandate:</strong> 1-2 Years Minimum</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Algorithmic Base Matches Found</p>
                    <div className="border border-slate-200 rounded-lg p-3 flex justify-between items-center bg-emerald-50/40 border-emerald-100">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Candidate #USR-4412</p>
                        <p className="text-xs text-slate-500">Exp: 2 Yrs Garments | Expected: ₹15k-20k</p>
                        <p className="text-xs font-mono mt-1 font-bold text-slate-700">📞 HR Line: +91 90432 XXXXX</p>
                      </div>
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shadow-xs">Shortlist</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}