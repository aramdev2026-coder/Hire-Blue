import React, { useState, useEffect } from 'react';
import { PlusCircle, List, Trash2, MapPin, Award, CheckCircle2, User, Clock, AlertCircle, Briefcase, IndianRupee } from 'lucide-react';

const PRESET_ROLES = ['Delivery Staff','Driver','Supervisor','Sales Rep','Accountant','Store In-Charge','Data Entry','M/c Operator','Packing / Checking','Production Follow-up'];

const TN_DISTRICTS = ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri',
  'Dindigul','Erode','Kallakurichi','Kancheepuram','Karur','Krishnagiri','Madurai',
  'Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukkottai',
  'Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni',
  'Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur',
  'Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar'];

const EXP_OPTIONS = [
  { value: 0, label: 'Any Experience' },
  { value: 1, label: '1 Year' },
  { value: 2, label: '2 Years' },
  { value: 3, label: '3 Years' },
  { value: 4, label: '4 Years' },
  { value: 5, label: '5 Years' },
  { value: 6, label: '6 Years' },
  { value: 7, label: '7 Years' },
  { value: 8, label: '8 Years' },
  { value: 9, label: '9 Years' },
  { value: 10, label: '10 Years' },
  { value: 11, label: '10+ Years' },
];

const MARKET_TRENDS_AUTOFILL = {
  salaryRange: '₹15,000 - ₹20,000',
  location: ['Coimbatore'],
  maritalStatus: 'No Preference',
  educationLevel: '12th Pass / ITI',
  expRequired: 2
};

const EMPTY_DETAILS = { salaryRange:'', location:[], maritalStatus:'', educationLevel:'', expRequired:0 };

export default function EmployerDashboard({ backendUrl, employerId, companyName }) {
  const [activeMenu, setActiveMenu] = useState('POST_JOBS'); // 'POST_JOBS' or 'ORDERS'
  
  // POST JOBS STATE
  const [roleInput, setRoleInput] = useState('');
  const [addedRoles, setAddedRoles] = useState([]);
  const [isFillingDetails, setIsFillingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [jobDetails, setJobDetails] = useState({}); // { 'Role1': { salary... }, 'Role2': {...} }
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ORDERS STATE
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (activeMenu === 'ORDERS') fetchOrders();
  }, [activeMenu]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`${backendUrl}/employer/orders/${employerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('employer_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.jobs || []);
      }
    } catch (e) { console.error('Failed to fetch orders'); }
    setIsLoadingOrders(false);
  };

  // --- JOB POSTING HANDLERS ---
  const handleAddRole = (e) => {
    e.preventDefault();
    const role = roleInput.trim();
    if (!role || addedRoles.includes(role)) return;
    setAddedRoles(prev => [...prev, role]);
    setJobDetails(prev => ({ ...prev, [role]: prev[role] || { ...EMPTY_DETAILS } }));
    setRoleInput('');
  };

  const handleRemoveRole = (role) => {
    const idx = addedRoles.indexOf(role);
    const next = addedRoles.filter(r => r !== role);
    setAddedRoles(next);
    setJobDetails(prev => {
      const copy = { ...prev };
      delete copy[role];
      return copy;
    });
    // Keep the active tab pointing at a valid role
    if (activeTab > idx) setActiveTab(activeTab - 1);
    else if (activeTab === idx) setActiveTab(Math.max(0, idx - 1));
    // Removing the last role while on the detail screen drops back to role selection
    if (isFillingDetails && next.length === 0) setIsFillingDetails(false);
  };

  const startDetailFill = () => {
    if (addedRoles.length > 0) setIsFillingDetails(true);
  };

  const handleDetailChange = (role, field, value) => {
    setJobDetails(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value
      }
    }));
  };

  const autoFillTrends = (role) => {
    setJobDetails(prev => ({
      ...prev,
      [role]: { ...MARKET_TRENDS_AUTOFILL }
    }));
  };

  const submitJobs = async () => {
    setIsSubmitting(true);
    // Submit each role as a separate requisition record in parallel
    try {
      const promises = addedRoles.map(async (role) => {
        const details = jobDetails[role];
        const payload = [{
          roleTitle: role,
          salaryRange: details.salaryRange || 'Not Specified',
          location: details.location,
          maritalStatus: details.maritalStatus || 'No Preference',
          educationLevel: details.educationLevel || 'Not Specified',
          expRequired: Number(details.expRequired) || 0
        }];

        return fetch(`${backendUrl}/employer/jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('employer_token')}`
          },
          body: JSON.stringify({ employerId, jobs: payload })
        });
      });

      const results = await Promise.all(promises);
      const allOk = results.every(res => res.ok);

      if (allOk) {
        setAddedRoles([]);
        setJobDetails({});
        setIsFillingDetails(false);
        setActiveMenu('ORDERS');
      } else {
        alert('Some job requisitions failed to post. Please verify details.');
      }
    } catch (e) {
      alert('Failed to submit job requisitions.');
    }
    setIsSubmitting(false);
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Delete this requisition? This will mark it inactive.')) return;
    try {
      const res = await fetch(`${backendUrl}/employer/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('employer_token')}` }
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert('Failed to delete order.');
      }
    } catch (e) {
      alert('Failed to delete order.');
    }
  };

  // Compute metrics summaries for the analytics row
  const activeRequisitionsCount = orders.length;
  const totalMatchesCount = orders.reduce((acc, curr) => acc + (curr.matchedCandidates?.length || 0), 0);
  const totalCompletedPlacements = orders.reduce((acc, curr) => acc + (curr.status === 'COMPLETED' ? 1 : 0), 0);

  return (
    <div className="dashboard-layout">
      
      {/* LEFT SIDEBAR */}
      <div className="sidebar-panel">
        <div className="sidebar-heading border-b border-slate-100 pb-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm uppercase shrink-0 border border-indigo-100">
              {companyName?.slice(0, 2) || 'EN'}
            </div>
            <div className="truncate">
              <div className="sidebar-label">Enterprise User</div>
              <div className="sidebar-title truncate">{companyName || 'new_comp'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-1 w-full">
          <button 
            type="button" 
            onClick={() => setActiveMenu('POST_JOBS')} 
            className={`sidebar-item flex items-center gap-3 w-full ${activeMenu === 'POST_JOBS' ? 'active' : ''}`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Post New Roles</span>
          </button>
          <button 
            type="button" 
            onClick={() => setActiveMenu('ORDERS')} 
            className={`sidebar-item flex items-center gap-3 w-full ${activeMenu === 'ORDERS' ? 'active' : ''}`}
          >
            <List className="w-4 h-4 shrink-0" />
            <span className="font-semibold">View Orders</span>
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="dashboard-main space-y-6">
        
        {/* TOP METRICS GRID BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Requisitions</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">{activeRequisitionsCount}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Matches Found</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">{totalMatchesCount}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sourcing Status</p>
              <h3 className="text-sm font-bold text-slate-600 mt-1">Active Pipeline</h3>
            </div>
          </div>
        </div>

        {/* ==== VIEW: POST JOBS ==== */}
        {activeMenu === 'POST_JOBS' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Requisition Generator</h2>
              <p className="text-xs text-slate-500 mt-1">Select job roles and configure experience/salary preferences to find blue-collar matches.</p>
            </div>

            {!isFillingDetails ? (
              <div className="space-y-6">
                {/* Shaded preset chips card container */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preset Job Roles Suggestions</span>
                  <div className="role-list">
                    {PRESET_ROLES.map(r => (
                      <button
                        key={r}
                        type="button"
                        className={`role-chip ${addedRoles.includes(r) ? 'role-chip--selected' : ''}`}
                        onClick={() => {
                          if (!addedRoles.includes(r)) {
                            setAddedRoles(prev => [...prev, r]);
                            setJobDetails(prev => ({ ...prev, [r]: prev[r] || { ...EMPTY_DETAILS } }));
                          }
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Row Input Group */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Target Job Roles</label>
                  <form onSubmit={handleAddRole} className="flex gap-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="e.g. Delivery Driver, Welder, Floor Supervisor..."
                      value={roleInput}
                      onChange={e => setRoleInput(e.target.value)}
                    />
                    <button type="submit" className="button button-primary shrink-0 px-6">Add</button>
                  </form>
                </div>

                {/* Tag Panel selected preview */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Selected Roles Queue</label>
                  <div className="tag-panel">
                    {addedRoles.length === 0 ? <span className="field-note">No roles added yet.</span> : null}
                    {addedRoles.map(role => (
                      <button
                        key={role}
                        type="button"
                        className="tag-chip tag-chip--selected"
                        onClick={() => handleRemoveRole(role)}
                      >
                        {role} ×
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="button button-primary button-full py-3 text-sm font-semibold flex justify-center items-center gap-2"
                  onClick={startDetailFill}
                  disabled={addedRoles.length === 0}
                >
                  <span>Proceed to Role Details</span>
                  <span>→</span>
                </button>
              </div>
            ) : (
              // PHASE 2: TABS CONFIGURATION FORM
              <div>
                <div className="tab-track">
                  {addedRoles.map((role, idx) => (
                    <div key={role} className={`tab-pill ${activeTab === idx ? 'active' : ''}`}>
                      <button
                        type="button"
                        className="tab-pill__label"
                        onClick={() => setActiveTab(idx)}
                      >
                        {role}
                      </button>
                      <button
                        type="button"
                        className="tab-pill__close"
                        aria-label={`Remove ${role}`}
                        title={`Remove ${role}`}
                        onClick={() => handleRemoveRole(role)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {addedRoles.length > 0 && (
                  <div className="form-card--wide border border-slate-100 rounded-xl p-5 bg-slate-50/20">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                      <h3 className="font-bold text-slate-800 text-sm">Configure Parameters: <span className="text-indigo-600">{addedRoles[activeTab]}</span></h3>
                      <button
                        type="button"
                        className="button button-secondary button-small flex items-center gap-1.5"
                        onClick={() => autoFillTrends(addedRoles[activeTab])}
                      >
                        Auto-Fill Market Trends
                      </button>
                    </div>

                    {(() => {
                      const activeRole = addedRoles[activeTab] || addedRoles[0];
                      const details = jobDetails[activeRole] || { ...EMPTY_DETAILS };
                      return (
                        <div className="responsive-grid">
                          <div className="field">
                            <label className="field-label">Salary Range</label>
                            <input
                              className="input"
                              value={details.salaryRange || ''}
                              onChange={e => handleDetailChange(activeRole, 'salaryRange', e.target.value)}
                              placeholder="e.g. ₹15,000 - ₹20,000"
                            />
                          </div>
                          
                          <div className="field">
                            <label className="field-label">Target Locations</label>
                            <input
                              className="input"
                              value={Array.isArray(details.location) ? details.location.join(', ') : (details.location || '')}
                              onChange={e => handleDetailChange(activeRole, 'location', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                              placeholder="e.g. Coimbatore, Salem"
                            />
                          </div>

                          <div className="field">
                            <label className="field-label">Marital Status Pref.</label>
                            <select
                              className="select"
                              value={details.maritalStatus || ''}
                              onChange={e => handleDetailChange(activeRole, 'maritalStatus', e.target.value)}
                            >
                              <option value="">Select No Preference</option>
                              <option>No Preference</option>
                              <option>Single</option>
                              <option>Married</option>
                            </select>
                          </div>

                          <div className="field">
                            <label className="field-label">Education Level</label>
                            <input
                              className="input"
                              value={details.educationLevel || ''}
                              onChange={e => handleDetailChange(activeRole, 'educationLevel', e.target.value)}
                              placeholder="e.g. 10th Pass / ITI"
                            />
                          </div>

                          <div className="field span-full">
                            <label className="field-label">Experience Required (Years)</label>
                            <input
                              className="input"
                              type="number"
                              min="0"
                              value={typeof details.expRequired === 'number' && details.expRequired > 0 ? details.expRequired : (details.expRequired === 0 ? 0 : '')}
                              onChange={e => {
                                const v = e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0;
                                handleDetailChange(activeRole, 'expRequired', v);
                              }}
                              placeholder="e.g. 2"
                            />
                          </div>
                        </div>
                      );
                    })()}

                    <div className="form-actions border-t border-slate-100 pt-4 mt-6">
                      <button type="button" className="button button-secondary" onClick={() => setIsFillingDetails(false)}>
                        ← Add More Roles
                      </button>
                      <button type="button" className="button button-primary" onClick={submitJobs} disabled={isSubmitting}>
                        {isSubmitting ? 'Posting...' : 'Publish Requisitions'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==== VIEW: ORDERS & CANDIDATES ==== */}
        {activeMenu === 'ORDERS' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900">Active Hiring Requisitions</h2>
                <p className="text-xs text-slate-500 mt-1">Review candidate matches sourced for your active job requisitions.</p>
              </div>

              {isLoadingOrders ? (
                <div className="text-center py-10 text-sm text-slate-400">Loading requisitions data...</div>
              ) : (
                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                      No requisitions posted yet.
                    </div>
                  ) : null}

                  {orders.map(order => (
                    <div key={order.id} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden hover:border-slate-300 transition-colors">
                      <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <h3 className="font-bold text-slate-950 text-base">{order.roleTitle}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {Array.isArray(order.location) ? order.location.join(', ') : (order.location || '—')}</span>
                            <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {order.salaryRange}</span>
                            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Exp: {order.expRequired ? `${order.expRequired} yrs` : 'Any'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button type="button" className="button button-secondary button-small text-xs py-1.5 px-3">Edit</button>
                          <button 
                            type="button" 
                            className="button button-danger button-small text-xs py-1.5 px-3 flex items-center gap-1.5" 
                            onClick={() => deleteOrder(order.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Matched Candidates ({order.matchedCandidates?.length || 0})</h4>
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">Live Sweep Active</span>
                        </div>

                        {order.matchedCandidates?.length === 0 ? (
                          <div className="p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 text-center">
                            <p className="text-xs text-slate-500">Our system is currently sweeping the network. Matches will appear here.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {order.matchedCandidates.map(c => (
                              <div key={c.id} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                      <User className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-mono text-xs font-bold text-slate-700">{c.candidateIdNumber}</span>
                                  </div>
                                  
                                  <div className="space-y-1.5 text-xs text-slate-600">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Experience:</span>
                                      <span className="font-semibold text-slate-700">{c.experienceYears} Years</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Education:</span>
                                      <span className="font-semibold text-slate-700 truncate max-w-[120px] text-right" title={c.topEducation}>{c.topEducation}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Location:</span>
                                      <span className="font-semibold text-slate-700 truncate max-w-[120px] text-right" title={Array.isArray(c.location) ? c.location.join(', ') : (c.location || '—')}>{Array.isArray(c.location) ? c.location.join(', ') : (c.location || '—')}</span>
                                    </div>
                                  </div>
                                </div>

                                <button type="button" className="button button-secondary button-small text-xs py-1.5 px-3 w-full mt-4 font-semibold text-center">
                                  Request Unblind
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}