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
  const [candidates_filter, setCandidatesFilter] = useState('PENDING_ADMIN_CALL');
  const [sortBy, setSortBy] = useState('name');
  const [jobs, setJobs] = useState([]);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [subAdmins, setSubAdmins] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [subAdminStats, setSubAdminStats] = useState(null);

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
      const data = await apiFetch(`/api/admin/employers?status=${employers_filter}`);
      setEmployers(data.employers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employers_filter]);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams();
      if (candidates_filter && !isSubAdmin) query.append('status', candidates_filter);
      if (searchQuery) query.append('search', searchQuery);

      const path = isSubAdmin
        ? `/api/sub-admin/candidates?${query}`
        : `/api/admin/candidates?${query}`;

      const data = await apiFetch(path);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [candidates_filter, searchQuery, sortBy, isSubAdmin]);

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
      const data = await apiFetch('/api/admin/sub-admins');
      setSubAdmins(data.subAdmins || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const data = await apiFetch('/api/super-admin/admins');
      setAdmins(data.admins || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchDuplicates = useCallback(async () => {
    try {
      const data = await apiFetch('/api/admin/candidates/duplicates');
      setDuplicates(data.duplicates || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSubAdminStats = useCallback(async () => {
    try {
      const data = await apiFetch('/api/sub-admin/me/stats');
      setSubAdminStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchJobMatches = async (jobId) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/admin/jobs/${jobId}/matches`);
      setMatchedCandidates(data.matches || []);
    } catch (err) {
      setMatchedCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'verification' && isAdmin) fetchEmployers();
  }, [activeTab, employers_filter, user, isAdmin, fetchEmployers]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'candidates') {
      fetchCandidates();
      if (isSubAdmin) fetchSubAdminStats();
    }
  }, [activeTab, candidates_filter, searchQuery, sortBy, user, fetchCandidates, fetchSubAdminStats, isSubAdmin]);

  useEffect(() => {
    if (!user) return;
    if (['tracker', 'match', 'assignment', 'candidates'].includes(activeTab) && isAdmin) {
      fetchJobs();
      fetchDuplicates();
    }
  }, [activeTab, user, isAdmin, fetchJobs, fetchDuplicates]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'match' && isAdmin) {
      fetchJobs().then((jobsList) => {
        if (jobsList?.length > 0) {
          fetchJobMatches(jobsList[0].id);
          setSelectedJob(jobsList[0]);
        }
      });
    }
  }, [activeTab, user, isAdmin]);

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
      await apiFetch(`/api/admin/employers/${employerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setSuccessMessage(`Employer ${newStatus.toLowerCase()}!`);
      fetchEmployers();
    } catch (err) {
      setError(err.message);
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

      const path = isSubAdmin
        ? `/api/sub-admin/candidates/${candidateId}/status`
        : `/api/admin/candidates/${candidateId}/status`;

      await apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
      setSuccessMessage(`Candidate status updated to ${newStatus.replace(/_/g, ' ').toLowerCase()}`);
      if (activeTab === 'candidates' || activeTab === 'assignment') fetchCandidates();
      if (activeTab === 'match' && selectedJob) fetchJobMatches(selectedJob.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssign = async (payload) => {
    try {
      await apiFetch('/api/admin/candidates/assign', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSuccessMessage(`Successfully assigned ${payload.candidateIds.length} candidates!`);
      fetchCandidates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubAdminCreate = async (form) => {
    await apiFetch('/api/super-admin/sub-admins', { method: 'POST', body: JSON.stringify(form) });
    setSuccessMessage('Sub-admin created');
    fetchSubAdmins();
  };

  const handleSubAdminUpdate = async (id, form) => {
    const { password, ...rest } = form;
    await apiFetch(`/api/super-admin/sub-admins/${id}`, { method: 'PUT', body: JSON.stringify(rest) });
    setSuccessMessage('Sub-admin updated');
    fetchSubAdmins();
  };

  const handleSubAdminDeactivate = async (id, reassignOpenCandidatesTo) => {
    await apiFetch(`/api/super-admin/sub-admins/${id}/deactivate`, {
      method: 'PUT',
      body: JSON.stringify({ reassignOpenCandidatesTo }),
    });
    setSuccessMessage('Sub-admin deactivated');
    fetchSubAdmins();
  };

  const handleAdminCreate = async (form) => {
    await apiFetch('/api/super-admin/admins', { method: 'POST', body: JSON.stringify(form) });
    setSuccessMessage('Admin created');
    fetchAdmins();
  };

  const handleAdminDeactivate = async (id) => {
    await apiFetch(`/api/super-admin/admins/${id}/deactivate`, { method: 'PUT' });
    setSuccessMessage('Admin deactivated');
    fetchAdmins();
  };

  const handleAddCandidate = async (data) => {
    try {
      setError('');
      await apiFetch('/api/sub-admin/candidates', { method: 'POST', body: JSON.stringify(data) });
      setSuccessMessage('Candidate added');
      fetchCandidates();
    } catch (err) {
      setError(err.message || 'Failed to add candidate');
      throw err;
    }
  };

  const handleAddNote = async (candidateId, note, callbackScheduledFor) => {
    await apiFetch(`/api/sub-admin/candidates/${candidateId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note, callbackScheduledFor }),
    });
    setSuccessMessage('Note added');
  };

  const handleFetchNotes = async (candidateId) => {
    const data = await apiFetch(`/api/sub-admin/candidates/${candidateId}/notes`);
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
            />
          )}

          {isAdmin && activeTab === 'candidates' && (
            <CandidatesDirectory
              candidates={candidates}
              filter={candidates_filter}
              setFilter={setCandidatesFilter}
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
            />
          )}

          {isAdmin && activeTab === 'assignment' && (
            <AssignmentScreen
              candidates={candidates}
              subAdmins={subAdmins}
              loading={loading}
              onAssign={handleAssign}
              duplicates={duplicates}
            />
          )}

          {isAdmin && activeTab === 'tracker' && (
            <RequirementsTracker jobs={jobs} loading={loading} />
          )}

          {isAdmin && activeTab === 'match' && (
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
            />
          )}

          {isSuperAdmin && activeTab === 'admins' && (
            <AdminManagement
              admins={admins}
              loading={loading}
              onCreate={handleAdminCreate}
              onDeactivate={handleAdminDeactivate}
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
            />
          )}
        </div>
      </main>
    </div>
  );
}
