import React, { useState, useEffect } from 'react';
import LoginCard     from './components/LoginCard';
import ProfileWizard from './components/ProfileWizard';
import DigitalResume from './components/DigitalResume';

const BACKEND = 'http://localhost:5000/api';

export default function App() {
  const [token,    setToken]    = useState(() => localStorage.getItem('candidate_token') || null);
  const [candId,   setCandId]   = useState(() => localStorage.getItem('candidate_id')    || null);
  const [phone,    setPhone]    = useState(() => localStorage.getItem('candidate_phone')  || '');
  const [profile,  setProfile]  = useState(null);
  const [view,     setView]     = useState('LOGIN');

  useEffect(() => {
    if (!token || !candId) return;
    fetch(`${BACKEND}/candidate/profile/${candId}`)
      .then(r => r.ok ? r.json() : null)
      .then(p => {
        if (p) setProfile(p);
        const status = p?.status || localStorage.getItem('candidate_status');
        setView(status === 'PENDING_ADMIN_CALL' ? 'DASHBOARD' : 'WIZARD');
      })
      .catch(() => setView('WIZARD'));
  }, [token, candId]);

  const handleAuthSuccess = (tok, id, ph, status, prof) => {
    localStorage.setItem('candidate_token', tok);
    localStorage.setItem('candidate_id',    id);
    localStorage.setItem('candidate_phone', ph);
    localStorage.setItem('candidate_status', status);
    setToken(tok); setCandId(id); setPhone(ph); setProfile(prof);
    setView(status === 'PENDING_ADMIN_CALL' ? 'DASHBOARD' : 'WIZARD');
  };

  const handleFinalized = (finalData) => {
    localStorage.setItem('candidate_status', 'PENDING_ADMIN_CALL');
    setProfile(finalData);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null); setCandId(null); setPhone(''); setProfile(null);
    setView('LOGIN');
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f4f4f5', fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* 📱 RESPONSIVE CSS ENGINE INJECTED HERE */}
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',system-ui,sans-serif; background:#f4f4f5;}
        input,select,textarea,button{font-family:inherit;}
        button{cursor:pointer;}
        
        .responsive-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .table-wrapper { width: 100%; overflow-x: auto; border: 1px solid #e4e4e7; border-radius: 8px; margin-bottom: 16px; }
        .responsive-table { width: 100%; border-collapse: collapse; min-width: 500px; text-align: left; }
        
        @media(max-width: 640px) {
          .responsive-grid { grid-template-columns: 1fr !important; gap: 12px; }
        }
      `}</style>

      <header style={{
        position:'sticky',top:0,zIndex:50,
        background:'#fff',borderBottom:'1px solid #e4e4e7',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 20px',height:54,
        boxShadow:'0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{
            width:30,height:30,borderRadius:7,background:'#18181b',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'#fff',fontWeight:800,fontSize:15,flexShrink:0
          }}>B</div>
          <span style={{ fontWeight:700,fontSize:14,color:'#000',letterSpacing:'-0.2px' }}>
            Blue-Collar Central
          </span>
        </div>
        {token && (
          <button onClick={handleLogout} style={{
            padding:'6px 14px',borderRadius:7,
            border:'1px solid #fca5a5',background:'#fff1f2',
            color:'#dc2626',fontSize:12,fontWeight:700
          }}>
            Logout
          </button>
        )}
      </header>

      {/* 📏 MAX-WIDTH SET TO 850px: Optimal for resumes/forms without stretching inputs */}
      <main style={{ maxWidth:850, margin:'0 auto', padding:'30px 16px 60px' }}>
        {view === 'LOGIN' && (
          <LoginCard backendUrl={BACKEND} onAuthSuccess={handleAuthSuccess} />
        )}
        {view === 'WIZARD' && (
          <ProfileWizard
            backendUrl={BACKEND}
            candidateId={candId}
            verifiedPhone={phone}
            initialData={profile}
            onFinalizeSubmit={handleFinalized}
          />
        )}
        {view === 'DASHBOARD' && (
          <DigitalResume
            verifiedPhone={phone}
            profileData={profile}
            onTriggerEdit={() => setView('WIZARD')}
          />
        )}
      </main>
    </div>
  );
}