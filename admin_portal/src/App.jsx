import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import CompanyVerification from './components/CompanyVerification';
import CandidatesDirectory from './components/CandidatesDirectory';
import RequirementsTracker from './components/RequirementsTracker';
import MatchEngine from './components/MatchEngine';

const API_BASE_URL = 'https://hire-blue.onrender.com/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('verification');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Employer Verification State
  const [employers, setEmployers] = useState([]);
  const [employers_filter, setEmployersFilter] = useState('PENDING_VERIFICATION');

  // Candidates Directory State
  const [candidates, setCandidates] = useState([]);
  const [candidates_filter, setCandidatesFilter] = useState('PENDING_ADMIN_CALL');
  const [sortBy, setSortBy] = useState('name');

  // Requirements Tracker State
  const [jobs, setJobs] = useState([]);

  // Match Engine Pipeline State
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Trigger hooks
  useEffect(() => {
    if (activeTab === 'verification') fetchEmployers();
  }, [activeTab, employers_filter]);

  useEffect(() => {
    if (activeTab === 'candidates') fetchCandidates();
  }, [activeTab, candidates_filter, searchQuery, sortBy]);

  useEffect(() => {
    if (activeTab === 'tracker') fetchJobs();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'match') {
      fetchJobs().then(jobsList => {
        if (jobsList && jobsList.length > 0) {
          fetchJobMatches(jobsList[0].id);
          setSelectedJob(jobsList[0]);
        }
      });
    }
  }, [activeTab]);

  // Alert clearance triggers
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ==================== FETCH ACTIONS ====================
  const fetchEmployers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employers?status=${employers_filter}`);
      if (!response.ok) throw new Error('Failed to fetch employers');
      const data = await response.json();
      setEmployers(data.employers || []);
    } catch (err) {
      setError('Failed to load employers. Make sure backend is running on port 5000');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams();
      if (candidates_filter) query.append('status', candidates_filter);
      if (searchQuery) query.append('search', searchQuery);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/candidates?${query}`);
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const data = await response.json();
      let candidatesList = data.candidates || [];
      
      if (sortBy === 'salary') {
        candidatesList.sort((a, b) => {
          const aVal = parseInt(a.expectedSalary?.split('-')[0] || 0);
          const bVal = parseInt(b.expectedSalary?.split('-')[0] || 0);
          return bVal - aVal;
        });
      }
      setCandidates(candidatesList);
    } catch (err) {
      setError('Failed to load candidates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/jobs`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data.jobs || []);
      return data.jobs || [];
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchJobMatches = async (jobId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}/matches`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();
      setMatchedCandidates(data.matches || []);
    } catch (err) {
      console.error('Failed to load job matches:', err);
      setMatchedCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================== STATE PUT UPDATES ====================
  const updateEmployerStatus = async (employerId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employers/${employerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update employer');
      setSuccessMessage(`Employer ${newStatus.toLowerCase()}!`);
      fetchEmployers();
    } catch (err) {
      setError('Failed to update employer status');
      console.error(err);
    }
  };

  // 🔄 UPDATED: Captures companyName and updates the payload body to synchronize with PostgreSQL
  const updateCandidateStatus = async (candidateId, newStatus, companyName = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/candidates/${candidateId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus, 
          shortlistedCompany: companyName // 👈 Sends string payload to Express server.js body parser
        }),
      });
      if (!response.ok) throw new Error('Failed to update candidate');
      setSuccessMessage(`Candidate ${newStatus.toLowerCase()}!`);
      if (activeTab === 'candidates') fetchCandidates();
      if (activeTab === 'match' && selectedJob) fetchJobMatches(selectedJob.id);
    } catch (err) {
      setError('Failed to update candidate status');
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col overflow-hidden">
        
        <Header activeTab={activeTab} />

        <Toast 
          error={error} 
          successMessage={successMessage} 
          setError={setError} 
          setSuccessMessage={setSuccessMessage} 
        />

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'verification' && (
            <CompanyVerification 
              employers={employers} 
              filter={employers_filter} 
              setFilter={setEmployersFilter} 
              loading={loading} 
              onUpdateStatus={updateEmployerStatus} 
            />
          )}

          {activeTab === 'candidates' && (
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
            />
          )}

          {activeTab === 'tracker' && (
            <RequirementsTracker jobs={jobs} loading={loading} />
          )}

          {activeTab === 'match' && (
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
        </div>
      </main>
    </div>
  );
}