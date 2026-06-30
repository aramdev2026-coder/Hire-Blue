import React, { useState, useEffect } from 'react';
import LoginCard from './components/LoginCard';
import ProfileWizard from './components/ProfileWizard';
import DigitalResume from './components/DigitalResume';
import EmployerAuth from './components/EmployerAuth';
import EmployerDashboard from './components/EmployerDashboard';

// 🛡️ Use environment variable instead of hardcoded URL
const BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

/**
 * Decode a JWT payload to check expiration (client-side only, no signature check).
 */
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return !payload.exp || payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

export default function App() {
  const [portalMode, setPortalMode] = useState('CANDIDATE');
  const [candToken, setCandToken] = useState(() => localStorage.getItem('candidate_token') || null);
  const [candId, setCandId] = useState(() => {
    const stored = localStorage.getItem('candidate_id');
    return stored ? (isNaN(Number(stored)) ? stored : Number(stored)) : null;
  });
  const [phone, setPhone] = useState(() => localStorage.getItem('candidate_phone') || '');
  const [profile, setProfile] = useState(null);
  const [candView, setCandView] = useState('LOGIN');
  const [empToken, setEmpToken] = useState(() => localStorage.getItem('employer_token') || null);
  const [empId, setEmpId] = useState(() => localStorage.getItem('employer_id') || null);
  const [empName, setEmpName] = useState(() => localStorage.getItem('employer_name') || '');

  // 🛡️ Validate tokens on app mount — clear expired ones
  useEffect(() => {
    if (candToken && isTokenExpired(candToken)) {
      handleLogoutCandidate();
      return;
    }
    if (empToken && isTokenExpired(empToken)) {
      handleLogoutEmployer();
      return;
    }
  }, []);

  useEffect(() => {
    if (!candToken || !candId) return;
    // 🛡️ Include Authorization header in candidate profile fetch
    fetch(`${BACKEND}/candidate/profile/${candId}`, {
      headers: { Authorization: `Bearer ${candToken}` },
    })
      .then((res) => {
        if (res.status === 401) {
          handleLogoutCandidate();
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data?.candidate) setProfile(data.candidate);
        const status = data?.candidate?.status || localStorage.getItem('candidate_status');
        setCandView(status === 'PENDING_ADMIN_CALL' ? 'DASHBOARD' : 'WIZARD');
      })
      .catch(() => setCandView('WIZARD'));
  }, [candToken, candId]);

  const handleCandAuth = (token, id, phoneNumber, status, profileData) => {
    localStorage.setItem('candidate_token', token);
    localStorage.setItem('candidate_id', String(id));
    localStorage.setItem('candidate_phone', phoneNumber);
    localStorage.setItem('candidate_status', status);
    setCandToken(token);
    setCandId(id);
    setPhone(phoneNumber);
    setProfile(profileData);
    setCandView(status === 'PENDING_ADMIN_CALL' ? 'DASHBOARD' : 'WIZARD');
  };

  const handleCandFinalized = (finalData) => {
    localStorage.setItem('candidate_status', 'PENDING_ADMIN_CALL');
    setProfile(finalData);
    setCandView('DASHBOARD');
  };

  const handleEmpAuth = (token, id, name) => {
    localStorage.setItem('employer_token', token);
    localStorage.setItem('employer_id', id);
    localStorage.setItem('employer_name', name);
    setEmpToken(token);
    setEmpId(id);
    setEmpName(name);
  };

  const handleLogoutCandidate = () => {
    localStorage.removeItem('candidate_token');
    localStorage.removeItem('candidate_id');
    localStorage.removeItem('candidate_phone');
    localStorage.removeItem('candidate_status');
    setCandToken(null);
    setCandId(null);
    setPhone('');
    setProfile(null);
    setCandView('LOGIN');
  };

  const handleLogoutEmployer = () => {
    localStorage.removeItem('employer_token');
    localStorage.removeItem('employer_id');
    localStorage.removeItem('employer_name');
    setEmpToken(null);
    setEmpId(null);
    setEmpName('');
  };

  const handleLogout = () => {
    if (portalMode === 'CANDIDATE') {
      handleLogoutCandidate();
    } else {
      handleLogoutEmployer();
    }
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div className="brand-copy">
            <span className="brand-title">Aram FTC</span>
            <span className="brand-subtitle">Candidate & Employer Portal</span>
          </div>
        </div>

        <div className="button-group">
          {((portalMode === 'CANDIDATE' && !candToken) || (portalMode === 'EMPLOYER' && !empToken)) && (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setPortalMode(portalMode === 'CANDIDATE' ? 'EMPLOYER' : 'CANDIDATE')}
            >
              Switch to {portalMode === 'CANDIDATE' ? 'Employer' : 'Candidate'} login
            </button>
          )}

          {((portalMode === 'CANDIDATE' && candToken) || (portalMode === 'EMPLOYER' && empToken)) && (
            <button type="button" className="button button-danger" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="shell-content">
        {portalMode === 'CANDIDATE' && (
          <>
            {candView === 'LOGIN' && <LoginCard backendUrl={BACKEND} onAuthSuccess={handleCandAuth} />}
            {candView === 'WIZARD' && (
              <ProfileWizard
                backendUrl={BACKEND}
                candidateId={candId}
                verifiedPhone={phone}
                initialData={profile}
                onFinalizeSubmit={handleCandFinalized}
                authToken={candToken}
              />
            )}
            {candView === 'DASHBOARD' && (
              <DigitalResume verifiedPhone={phone} profileData={profile} onTriggerEdit={() => setCandView('WIZARD')} />
            )}
          </>
        )}

        {portalMode === 'EMPLOYER' && (
          <>
            {!empToken ? (
              <EmployerAuth backendUrl={BACKEND} onAuthSuccess={handleEmpAuth} />
            ) : (
              <EmployerDashboard backendUrl={BACKEND} employerId={empId} companyName={empName} authToken={empToken} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
