import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import Login from './components/Login';
import CompanyVerification from './components/CompanyVerification';
import CandidatesDirectory from './components/CandidatesDirectory';
import RequirementsTracker from './components/RequirementsTracker';
import MatchEngine from './components/MatchEngine';
import SubAdminCandidates from './components/SubAdminCandidates';
import AssignmentScreen from './components/AssignmentScreen';
import SubAdminManagement from './components/SubAdminManagement';
import AdminManagement from './components/AdminManagement';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { apiFetch, getStoredUser, fetchMe } from './api';
import { formatStatus } from './constants';
import {
  listEmployers,
  createEmployer,
  updateEmployerStatus as apiUpdateEmployerStatus,
  fetchEmployerJobs,
} from './services/employerService';
import {
  listCandidatesAdmin,
  listCandidatesSubAdmin,
  listCandidateDuplicates,
  fetchCandidateAdmin,
  createCandidateSubAdmin,
  assignCandidates,
  updateCandidateAdmin,
  updateCandidateSubAdmin,
  updateCandidateStatusAdmin,
  updateCandidateStatusSubAdmin,
  fetchCandidateNotes,
  addCandidateNote,
  fetchJobMatches as apiFetchJobMatches,
} from './services/candidateService';
import {
  listSubAdmins,
  listAdmins,
  fetchSubAdminStats as apiFetchSubAdminStats,
  fetchSmtpStatus,
  createAdmin,
  createSubAdmin,
  updateAdmin,
  updateSubAdmin,
  activateAdmin,
  deactivateAdmin,
  activateSubAdmin,
  deactivateSubAdmin,
  deleteAdmin,
  deleteSubAdmin,
} from './services/adminService';

function defaultTab(role) {
  if (role === 'SUB_ADMIN') return 'candidates';
  return 'verification';
}

export default function App() {
  const [user, setUser] = useState(() => getStoredUser());
  const [authLoading, setAuthLoading] = useState(!!getStoredUser());
  const [activeTab, setActiveTab] = useState(() => defaultTab(getStoredUser()?.role));
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [employers, setEmployers] = useState([]);
  const [employers_filter, setEmployersFilter] = useState('ACTIVE');
  const [candidates, setCandidates] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [candidates_filter, setCandidatesFilter] = useState('PENDING_ADMIN_CALL');
  const [candidates_district, setCandidatesDistrict] = useState('');
  const [candidates_role, setCandidatesRole] = useState('');
  const [candidates_minAge, setCandidatesMinAge] = useState('');
  const [candidates_maxAge, setCandidatesMaxAge] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [jobs, setJobs] = useState([]);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [subAdmins, setSubAdmins] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [subAdminStats, setSubAdminStats] = useState(null);
  const [smtpError, setSmtpError] = useState(null);

  const role = user?.role;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN' || isSuperAdmin;
  const isSubAdmin = role === 'SUB_ADMIN';

  useEffect(() => {
    if (user) {
      fetchMe().then(setUser).catch(() => setUser(null)).finally(() => setAuthLoading(false));
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'SUPER_ADMIN') {
      fetchSmtpStatus()
        .then((res) => {
          if (res.healthy === false) {
            setSmtpError(res.error || 'Authentication Failed');
          } else {
            setSmtpError(null);
          }
        })
        .catch((err) => {
          console.error('SMTP check failed:', err);
        });
    } else {
      setSmtpError(null);
    }
  }, [user]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const fetchEmployers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const targetFilter = activeTab === 'tracker' ? 'ACTIVE' : employers_filter;
      const data = await listEmployers(targetFilter);
      setEmployers(data.employers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, employers_filter]);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams();
      const targetStatus = activeTab === 'assignment' ? '' : candidates_filter;
      if (targetStatus && !isSubAdmin) query.append('status', targetStatus);
      if (candidates_district && activeTab !== 'assignment') query.append('district', candidates_district);
      if (candidates_role && activeTab !== 'assignment') query.append('role', candidates_role);
      if (candidates_minAge && activeTab !== 'assignment') query.append('minAge', candidates_minAge);
      if (candidates_maxAge && activeTab !== 'assignment') query.append('maxAge', candidates_maxAge);
      if (searchQuery) query.append('search', searchQuery);

      const queryString = query.toString();
      const data = isSubAdmin
        ? await listCandidatesSubAdmin(queryString)
        : await listCandidatesAdmin(queryString);

      let list = data.candidates || [];
      if (sortBy === 'salary') {
        const parseSalaryValue = (val) => {
          if (!val) return 0;
          const numPart = val.split('-')[0] || '';
          const digits = numPart.replace(/\D/g, '');
          return parseInt(digits, 10) || 0;
        };
        list = [...list].sort((a, b) => {
          const aVal = parseSalaryValue(a.expectedSalary);
          const bVal = parseSalaryValue(b.expectedSalary);
          return bVal - aVal;
        });
      }
      setCandidates(list);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, candidates_filter, candidates_district, candidates_role, candidates_minAge, candidates_maxAge, searchQuery, sortBy, isSubAdmin]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/jobs');
      setJobs(data.jobs || []);
      return data.jobs || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubAdmins = useCallback(async () => {
    try {
      const data = await listSubAdmins();
      setSubAdmins(data.subAdmins || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const data = await listAdmins();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchDuplicates = useCallback(async () => {
    try {
      const data = await listCandidateDuplicates();
      setDuplicates(data.duplicates || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSubAdminStats = useCallback(async () => {
    try {
      const data = await apiFetchSubAdminStats();
      setSubAdminStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchJobMatches = async (jobId) => {
    setLoading(true);
    try {
      const data = await apiFetchJobMatches(jobId);
      setMatchedCandidates(data.matches || []);
    } catch (err) {
      setMatchedCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if ((activeTab === 'verification' || activeTab === 'tracker') && isAdmin) fetchEmployers();
  }, [activeTab, employers_filter, user, isAdmin, fetchEmployers]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'candidates' || activeTab === 'assignment') {
      fetchCandidates();
      if (isSubAdmin) fetchSubAdminStats();
    }
  }, [activeTab, candidates_filter, candidates_district, candidates_role, candidates_minAge, candidates_maxAge, searchQuery, sortBy, user, fetchCandidates, fetchSubAdminStats, isSubAdmin]);

  useEffect(() => {
    if (!user) return;
    const hasAccess = ['tracker', 'assignment', 'candidates'].includes(activeTab) && isAdmin;
    const hasMatchAccess = activeTab === 'match' && isSuperAdmin;
    if (hasAccess || hasMatchAccess) {
      fetchJobs();
      fetchDuplicates();
    }
  }, [activeTab, user, isAdmin, isSuperAdmin, fetchJobs, fetchDuplicates]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'match' && isSuperAdmin) {
      fetchJobs().then((jobsList) => {
        if (jobsList?.length > 0) {
          if (jobsList.length > 1) {
            const allRolesJob = { id: 'all', roleTitle: 'All Roles', employer: { companyName: 'All Companies' } };
            setSelectedJob(allRolesJob);
            fetchJobMatches('all');
          } else {
            setSelectedJob(jobsList[0]);
            fetchJobMatches(jobsList[0].id);
          }
        }
      });
    }
  }, [activeTab, user, isSuperAdmin]);

  useEffect(() => {
    if (!user) return;
    if (['assignment', 'candidates', 'subadmins'].includes(activeTab) && isAdmin) fetchSubAdmins();
  }, [activeTab, user, isAdmin, fetchSubAdmins]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'assignment' && isAdmin) fetchCandidates();
  }, [activeTab, user, isAdmin, fetchCandidates]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'subadmins' && isAdmin) fetchSubAdmins();
    if (activeTab === 'admins' && isSuperAdmin) fetchAdmins();
  }, [activeTab, user, isAdmin, isSuperAdmin, fetchSubAdmins, fetchAdmins]);

  const updateEmployerStatus = async (employerId, newStatus) => {
    try {
      await apiUpdateEmployerStatus(employerId, newStatus);
      setSuccessMessage(`Employer ${newStatus.toLowerCase()}!`);
      fetchEmployers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateEmployer = async (employerData) => {
    try {
      setError('');
      await createEmployer(employerData);
      setSuccessMessage('Employer account created successfully.');
      fetchEmployers();
    } catch (err) {
      setError(err.message || 'Failed to create employer account');
      throw err;
    }
  };

  const handleCreateRequirement = async (requirementData) => {
    try {
      setError('');
      await apiFetch('/api/admin/jobs', {
        method: 'POST',
        body: JSON.stringify(requirementData),
      });
      setSuccessMessage('Job requirement posted successfully.');
      fetchJobs();
    } catch (err) {
      setError(err.message || 'Failed to post job requirement');
      throw err;
    }
  };

  const updateCandidateStatus = async (candidateId, newStatus, shortlistedJobIdOrNote = null, note = null) => {
    try {
      const body = { status: newStatus };
      if (['SHORTLISTED', 'PLACED'].includes(newStatus) && shortlistedJobIdOrNote) {
        body.shortlistedJobId = shortlistedJobIdOrNote;
      }
      if (newStatus === 'BLACKLISTED' && (note || shortlistedJobIdOrNote)) {
        body.note = note || shortlistedJobIdOrNote;
      }

      if (isSubAdmin) {
        await updateCandidateStatusSubAdmin(candidateId, body);
      } else {
        await updateCandidateStatusAdmin(candidateId, body);
      }
      setSuccessMessage(`Candidate status updated to ${formatStatus(newStatus).toLowerCase()}`);
      if (activeTab === 'candidates' || activeTab === 'assignment') fetchCandidates();
      if (activeTab === 'match' && selectedJob) fetchJobMatches(selectedJob.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssign = async (payload) => {
    try {
      await assignCandidates(payload);
      setSuccessMessage(`Successfully assigned ${payload.candidateIds.length} candidates!`);
      fetchCandidates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubAdminCreate = async (form) => {
    try {
      await createSubAdmin(form);
      setSuccessMessage('Sub-admin created');
      fetchSubAdmins();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('insufficient permissions')) {
        handleLogout();
      }
    }
  };

  const handleSubAdminUpdate = async (id, form) => {
    try {
      const { password, ...rest } = form;
      await updateSubAdmin(id, rest);
      setSuccessMessage('Sub-admin updated');
      fetchSubAdmins();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('insufficient permissions')) {
        handleLogout();
      }
    }
  };

  const handleSubAdminDeactivate = async (id, reassignOpenCandidatesTo) => {
    try {
      await deactivateSubAdmin(id, { reassignOpenCandidatesTo });
      setSuccessMessage('Sub-admin deactivated');
      fetchSubAdmins();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('insufficient permissions')) {
        handleLogout();
      }
    }
  };

  const handleAdminCreate = async (form) => {
    try {
      await createAdmin(form);
      setSuccessMessage('Admin created');
      fetchAdmins();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('insufficient permissions')) {
        handleLogout();
      }
    }
  };

  const handleAdminDeactivate = async (id) => {
    try {
      await deactivateAdmin(id);
      setSuccessMessage('Admin deactivated');
      fetchAdmins();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('insufficient permissions')) {
        handleLogout();
      }
    }
  };

  const handleSubAdminActivate = async (id) => {
    try {
      await activateSubAdmin(id);
      setSuccessMessage('Sub-admin successfully activated');
      fetchSubAdmins();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('insufficient permissions')) {
        handleLogout();
      }
    }
  };

  const handleAdminActivate = async (id) => {
    try {
      await activateAdmin(id);
      setSuccessMessage('Admin successfully activated');
      fetchAdmins();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('insufficient permissions')) {
        handleLogout();
      }
    }
  };

  const handleSubAdminDelete = async (id) => {
    try {
      await deleteSubAdmin(id);
      setSuccessMessage('Sub-admin permanently deleted');
      fetchSubAdmins();
      fetchCandidates();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('insufficient permissions')) {
        handleLogout();
      }
    }
  };

  const handleAdminDelete = async (id) => {
    try {
      await deleteAdmin(id);
      setSuccessMessage('Admin permanently deleted');
      fetchAdmins();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired') || err.message.includes('insufficient permissions')) {
        handleLogout();
      }
    }
  };

  const handleAddCandidate = async (data) => {
    try {
      setError('');
      await createCandidateSubAdmin(data);
      setSuccessMessage('Candidate added');
      fetchCandidates();
    } catch (err) {
      setError(err.message || 'Failed to add candidate');
      throw err;
    }
  };

  const handleEditCandidate = async (candidateId, data) => {
    try {
      setError('');
      if (isSubAdmin) {
        await updateCandidateSubAdmin(candidateId, data);
      } else {
        await updateCandidateAdmin(candidateId, data);
      }
      setSuccessMessage('Candidate details updated successfully.');
      fetchCandidates();
    } catch (err) {
      setError(err.message || 'Failed to update candidate');
      throw err;
    }
  };

  const handleAddNote = async (candidateId, note, callbackScheduledFor) => {
    await addCandidateNote(candidateId, { note, callbackScheduledFor });
    setSuccessMessage('Note added');
  };

  const handleFetchNotes = async (candidateId) => {
    const data = await fetchCandidateNotes(candidateId);
    return data.logs || [];
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setActiveTab(defaultTab(loggedInUser.role));
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('verification');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-sm">Loading session...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeTab={activeTab} user={user} />

        {isSuperAdmin && smtpError && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-700 flex items-center justify-between shadow-sm shrink-0">
            <span className="flex items-center gap-2">
              ⚠️ Warning: SMTP Mail Transporter is failing: "{smtpError}". Users will not receive OTP emails. Please check your credentials or network setup.
            </span>
          </div>
        )}

        <Toast
          error={error}
          successMessage={successMessage}
          setError={setError}
          setSuccessMessage={setSuccessMessage}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {isAdmin && activeTab === 'verification' && (
            <CompanyVerification
              employers={employers}
              filter={employers_filter}
              setFilter={setEmployersFilter}
              loading={loading}
              onUpdateStatus={updateEmployerStatus}
              onCreateEmployer={handleCreateEmployer}
            />
          )}

          {isAdmin && activeTab === 'candidates' && (
            <CandidatesDirectory
              candidates={candidates}
              filter={candidates_filter}
              setFilter={setCandidatesFilter}
              districtFilter={candidates_district}
              setDistrictFilter={setCandidatesDistrict}
              roleFilter={candidates_role}
              setRoleFilter={setCandidatesRole}
              minAge={candidates_minAge}
              setMinAge={setCandidatesMinAge}
              maxAge={candidates_maxAge}
              setMaxAge={setCandidatesMaxAge}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              loading={loading}
              onUpdateStatus={updateCandidateStatus}
              onAssignToSubAdmin={(ids, subAdminId) => handleAssign({ candidateIds: ids, subAdminId })}
              subAdmins={subAdmins}
              jobs={jobs}
              duplicates={duplicates}
              statusCounts={statusCounts}
            />
          )}

          {isAdmin && activeTab === 'assignment' && (
            <AssignmentScreen
              candidates={candidates}
              subAdmins={subAdmins}
              loading={loading}
              onAssign={handleAssign}
              duplicates={duplicates}
              statusCounts={statusCounts}
            />
          )}

          {isAdmin && activeTab === 'tracker' && (
            <RequirementsTracker
              jobs={jobs}
              loading={loading}
              employers={employers}
              onCreateRequirement={handleCreateRequirement}
              onCreateEmployer={handleCreateEmployer}
            />
          )}

          {isSuperAdmin && activeTab === 'match' && (
            <MatchEngine
              jobs={jobs}
              selectedJob={selectedJob}
              setSelectedJob={setSelectedJob}
              matchedCandidates={matchedCandidates}
              loading={loading}
              fetchJobMatches={fetchJobMatches}
              onUpdateStatus={updateCandidateStatus}
            />
          )}

          {isAdmin && activeTab === 'subadmins' && (
            <SubAdminManagement
              subAdmins={subAdmins}
              loading={loading}
              readOnly={!isSuperAdmin}
              onCreate={handleSubAdminCreate}
              onUpdate={handleSubAdminUpdate}
              onDeactivate={handleSubAdminDeactivate}
              onDelete={handleSubAdminDelete}
              onActivate={handleSubAdminActivate}
            />
          )}

          {isSuperAdmin && activeTab === 'admins' && (
            <AdminManagement
              admins={admins}
              loading={loading}
              onCreate={handleAdminCreate}
              onDeactivate={handleAdminDeactivate}
              onDelete={handleAdminDelete}
              onActivate={handleAdminActivate}
            />
          )}

          {isSuperAdmin && activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {isSubAdmin && activeTab === 'candidates' && (
            <SubAdminCandidates
              candidates={candidates}
              loading={loading}
              stats={subAdminStats}
              onRefresh={() => { fetchCandidates(); fetchSubAdminStats(); }}
              onAddCandidate={handleAddCandidate}
              onUpdateStatus={updateCandidateStatus}
              onAddNote={handleAddNote}
              onFetchNotes={handleFetchNotes}
              statusCounts={statusCounts}
              onEditCandidate={handleEditCandidate}
            />
          )}
        </div>
      </main>
    </div>
  );
}
