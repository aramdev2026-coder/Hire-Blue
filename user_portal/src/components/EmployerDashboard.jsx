import React, { useState, useEffect } from 'react';

const PRESET_ROLES = ['Delivery Staff','Driver','Supervisor','Sales Rep','Accountant','Store In-Charge','Data Entry','M/c Operator','Packing / Checking','Production Follow-up'];

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
    // Keep active tab valid
    if (activeTab > idx) setActiveTab(activeTab - 1);
    else if (activeTab === idx) setActiveTab(Math.max(0, idx - 1));
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
      [role]: {
        salaryRange: '₹15,000 - ₹20,000',
        location: ['Coimbatore'],
        maritalStatus: 'No Preference',
        educationLevel: '12th Pass / ITI',
        expRequired: 2
      }
    }));
  };

  const submitJobs = async () => {
    setIsSubmitting(true);
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

  return (
    <div className="dashboard-layout">
      
      {/* LEFT SIDEBAR WRAPPED IN NATIVE FIXED-WIDTH CONTAINER */}
      <div className="dashboard-sidebar">
        <div className="sidebar-panel">
          <div className="sidebar-heading">
            <div className="sidebar-label">Enterprise User</div>
            <div className="sidebar-title">{companyName || 'new_comp'}</div>
          </div>

          <button 
            type="button" 
            onClick={() => setActiveMenu('POST_JOBS')} 
            className={`sidebar-item ${activeMenu === 'POST_JOBS' ? 'active' : ''}`}
          >
            + Post New Roles
          </button>
          <button 
            type="button" 
            onClick={() => setActiveMenu('ORDERS')} 
            className={`sidebar-item ${activeMenu === 'ORDERS' ? 'active' : ''}`}
          >
            View Orders
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="dashboard-main">
        
        {/* ==== VIEW: POST JOBS ==== */}
        {activeMenu === 'POST_JOBS' && (
          <>
            <h2 className="section-title">Requisition Generator</h2>

            {!isFillingDetails ? (
              <div className="form-card--narrow">
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

                <div className="field">
                  <label className="field-label">Target Job Roles</label>
                  <form onSubmit={handleAddRole} className="form-row">
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Delivery Driver, Welder, Floor Supervisor..."
                      value={roleInput}
                      onChange={e => setRoleInput(e.target.value)}
                    />
                    <button type="submit" className="button button-primary">Add</button>
                  </form>
                </div>

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

                <button
                  type="button"
                  className="button button-primary button-full"
                  onClick={startDetailFill}
                  disabled={addedRoles.length === 0}
                >
                  Proceed to Role Details →
                </button>
              </div>
            ) : (
              // PHASE 2: CONFIGURE FORM TABS
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
                  <div className="form-card--wide">
                    <div className="card-header">
                      <h3>Details for: {addedRoles[activeTab]}</h3>
                      <button
                        type="button"
                        className="button button-secondary button-small"
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
                            <label className="field-label">Location</label>
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
                              <option value="">Select</option>
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

                    <div className="form-actions">
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
          </>
        )}

        {/* ==== VIEW: ORDERS & CANDIDATES ==== */}
        {activeMenu === 'ORDERS' && (
          <>
            <h2 className="section-title">Active Hiring Requisitions</h2>

            {isLoadingOrders ? (
              <p className="field-note">Loading market data...</p>
            ) : (
              <div className="card-grid">
                {orders.length === 0 ? (
                  <p className="field-note">No orders posted yet.</p>
                ) : null}

                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-card__header">
                      <div>
                        <h3>{order.roleTitle}</h3>
                        <div className="order-card__meta">
                          <span>Location: {Array.isArray(order.location) ? order.location.join(', ') : (order.location || '—')}</span>
                          <span>Salary: {order.salaryRange}</span>
                          <span>Education: {order.educationLevel}</span>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button type="button" className="button button-danger button-small" onClick={() => deleteOrder(order.id)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="order-card__body">
                      <h4 className="section-subtitle">Matched Anonymized Candidates ({order.matchedCandidates?.length || 0})</h4>
                      {order.matchedCandidates?.length === 0 ? (
                        <p className="notice-block">Our system is currently sweeping the network. Matches will appear here.</p>
                      ) : (
                        <div className="candidate-grid">
                          {order.matchedCandidates.map(c => (
                            <div key={c.id} className="candidate-card">
                              <div className="candidate-card__header">{c.candidateIdNumber}</div>
                              <div className="candidate-card__meta">
                                <span><strong>Exp:</strong> {c.experienceYears} Years</span>
                                <span><strong>Edu:</strong> {c.topEducation}</span>
                                <span><strong>Base:</strong> {Array.isArray(c.location) ? c.location.join(', ') : (c.location || '—')} | {c.gender}</span>
                              </div>
                              <div className="candidate-actions" style={{ marginTop: '12px' }}>
                                <button type="button" className="button button-secondary button-small w-full">Request Unblind</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}