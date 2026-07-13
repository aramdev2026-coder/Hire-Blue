import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import LegalModal from './LegalModal';

export default function EmployerAuth({ backendUrl, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' }); // type: 'error' | 'success'
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  const [form, setForm] = useState({
    companyName: '', email: '', phoneNumber: '', password: '', identifier: ''
  });

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!isLogin) {
      if (!acceptedTerms) {
        setMsg({ type: 'error', text: 'Please accept the terms and privacy policy to proceed.' });
        return;
      }
      const emailTrimmed = form.email.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const domainTypos = [
        'gamil.com', 'gamil.co', 'gmaill.com', 'gmaile.com', 'gmile.com', 'gmail.con', 'gmail.col',
        'yaho.com', 'yhoo.com', 'yahoo.co', 'hotmal.com', 'hotmale.com', 'outlok.com', 'outloock.com',
        'gamil.in', 'gamil.net', 'gamil.org', 'yaho.in', 'yahoo.con', 'hotmail.con'
      ];
      const [localPart, domainPart] = emailTrimmed.split('@');

      if (
        !emailRegex.test(emailTrimmed) ||
        (localPart.length > 5 && !/[aeiouy]/.test(localPart)) ||
        /([a-zA-Z0-9])\1{4,}/.test(localPart) ||
        domainTypos.includes(domainPart)
      ) {
        setMsg({ type: 'error', text: 'Please enter a valid, legitimate corporate email address.' });
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch(`${backendUrl}/employer/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: form.identifier, password: form.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        onAuthSuccess(data.token, data.employerId, data.companyName);
      } else {
        const res = await fetch(`${backendUrl}/employer/signup`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: form.companyName, email: form.email, phoneNumber: form.phoneNumber, password: form.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setMsg({ type: 'success', text: 'Account created successfully. You can log in now.' });
        setForm({ companyName: '', email: '', phoneNumber: '', password: '', identifier: '' });
        setTimeout(() => setIsLogin(true), 3000);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Connection failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <style>{`
        .employer-auth-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 30px -10px rgba(37, 99, 235, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02);
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .employer-auth-card:hover {
          box-shadow: 0 20px 40px -15px rgba(37, 99, 235, 0.12), 0 1px 4px rgba(0, 0, 0, 0.03);
          border-color: #cbd5e1;
        }
        .employer-brand-logo {
          height: 48px;
          object-fit: contain;
          margin: 0 auto 20px;
          display: block;
        }
        .employer-auth-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 6px;
          letter-spacing: -0.025em;
        }
        .employer-auth-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 24px;
        }
        .employer-tab-container {
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
        }
        .employer-tab-btn {
          flex: 1;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: #64748b;
        }
        .employer-tab-btn.active {
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .employer-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }
        .employer-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .employer-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .employer-input {
          width: 100%;
          padding: 10px 14px;
          font-size: 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
        }
        .employer-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .employer-checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 4px 0 8px;
        }
        .employer-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          cursor: pointer;
          accent-color: #2563eb;
          margin-top: 2px;
        }
        .employer-checkbox-label {
          font-size: 0.785rem;
          color: #475569;
          line-height: 1.4;
        }
        .employer-btn-inline {
          background: none;
          border: none;
          padding: 0;
          color: #2563eb;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
        }
        .employer-submit-btn {
          width: 100%;
          padding: 12px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .employer-submit-btn:hover:not(:disabled) {
          background: #1d4ed8;
          box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.2);
        }
        .employer-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="employer-auth-card">
        <img src="/employer-logo.png" alt="Employer Portal Logo" className="employer-brand-logo" />
        
        <h1 className="employer-auth-title">Employer Portal</h1>
        <p className="employer-auth-subtitle">
          {isLogin ? 'Log in to manage hiring requisitions' : 'Register your corporate account'}
        </p>

        <div className="employer-tab-container">
          <button
            type="button"
            className={`employer-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setMsg({ type: '', text: '' }); }}
          >
            Login
          </button>
          <button
            type="button"
            className={`employer-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setMsg({ type: '', text: '' }); }}
          >
            Sign Up
          </button>
        </div>

        {msg.text && (
          <div 
            className={`alert-box ${msg.type === 'error' ? 'error' : 'success'}`} 
            style={{ 
              marginBottom: '20px', 
              padding: '12px 16px', 
              fontSize: '0.825rem', 
              borderRadius: '8px', 
              textAlign: 'left',
              borderLeftWidth: '4px'
            }}
          >
            {msg.type === 'error' ? '⚠️ ' : '✅ '}
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="employer-form">
          {!isLogin && (
            <>
              <div className="employer-input-group">
                <label className="employer-label">Company Name *</label>
                <input 
                  className="employer-input" 
                  type="text" 
                  placeholder="e.g. Acme Corporation" 
                  value={form.companyName} 
                  onChange={e => upd('companyName', e.target.value)} 
                  required 
                />
              </div>

              <div className="employer-input-group">
                <label className="employer-label">Corporate Email *</label>
                <input 
                  className="employer-input" 
                  type="email" 
                  placeholder="name@company.com" 
                  value={form.email} 
                  onChange={e => upd('email', e.target.value)} 
                  required 
                />
              </div>

              <div className="employer-input-group">
                <label className="employer-label">Phone Number *</label>
                <input 
                  className="employer-input" 
                  type="tel" 
                  placeholder="10-digit mobile number" 
                  maxLength={10} 
                  value={form.phoneNumber} 
                  onChange={e => upd('phoneNumber', e.target.value.replace(/\D/g, ''))} 
                  required 
                />
              </div>
              
              <div className="employer-checkbox-container">
                <input 
                  type="checkbox" 
                  id="employer-accept-terms" 
                  checked={acceptedTerms} 
                  onChange={(e) => setAcceptedTerms(e.target.checked)} 
                  className="employer-checkbox"
                />
                <label htmlFor="employer-accept-terms" className="employer-checkbox-label">
                  I accept the{' '}
                  <button type="button" onClick={() => setShowLegal(true)} className="employer-btn-inline">
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button type="button" onClick={() => setShowLegal(true)} className="employer-btn-inline">
                    Privacy Policy
                  </button>.
                </label>
              </div>
            </>
          )}

          {isLogin && (
            <div className="employer-input-group">
              <label className="employer-label">Email or Phone Number *</label>
              <input 
                className="employer-input" 
                type="text" 
                placeholder="hr@company.com or mobile" 
                value={form.identifier} 
                onChange={e => upd('identifier', e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="employer-input-group">
            <label className="employer-label">Secure Password *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                className="employer-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => upd('password', e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="employer-submit-btn">
            {loading ? 'Processing...' : isLogin ? 'Access Dashboard' : 'Register Company'}
          </button>
        </form>
      </div>

      <LegalModal isOpen={showLegal} onClose={() => setShowLegal(false)} />
    </div>
  );
}