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
    <div className="auth-shell">
      <div className="auth-card auth-card--employer text-center">
        <img src="/favicon.png" alt="Aram FTC Logo" className="brand-logo" style={{ margin: '0 auto 16px', display: 'block' }} />
        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setMsg({type:'',text:''}); }}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab-button ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setMsg({type:'',text:''}); }}
          >
            Sign Up
          </button>
        </div>

        {msg.text && (
          <div className={`alert-box ${msg.type === 'error' ? 'error' : 'success'}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          {!isLogin && (
            <>
              <input className="input" type="text" placeholder="Company Name" value={form.companyName} onChange={e => upd('companyName', e.target.value)} required />
              <input className="input" type="email" placeholder="Corporate Email" value={form.email} onChange={e => upd('email', e.target.value)} required />
              <input className="input" type="tel" placeholder="Phone Number" maxLength={10} value={form.phoneNumber} onChange={e => upd('phoneNumber', e.target.value.replace(/\D/g, ''))} required />
              
              <div className="field flex items-start gap-2 text-left" style={{ margin: '8px 0 16px', display: 'flex', gap: '8px', alignItems: 'flex-start', textAlign: 'left' }}>
                <input 
                  type="checkbox" 
                  id="employer-accept-terms" 
                  checked={acceptedTerms} 
                  onChange={(e) => setAcceptedTerms(e.target.checked)} 
                  className="checkbox"
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="employer-accept-terms" className="text-xs text-slate-600 leading-normal" style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                  I accept the <button type="button" onClick={() => setShowLegal(true)} className="btn-inline text-xs font-semibold" style={{ display: 'inline', border: 'none', background: 'none', padding: 0, textDecoration: 'underline', color: 'var(--primary)', cursor: 'pointer' }}>Terms and Conditions</button> and <button type="button" onClick={() => setShowLegal(true)} className="btn-inline text-xs font-semibold" style={{ display: 'inline', border: 'none', background: 'none', padding: 0, textDecoration: 'underline', color: 'var(--primary)', cursor: 'pointer' }}>Privacy Policy</button>.
                </label>
              </div>
            </>
          )}

          {isLogin && (
            <input className="input" type="text" placeholder="Email or Phone Number" value={form.identifier} onChange={e => upd('identifier', e.target.value)} required />
          )}

          <div className="relative-container" style={{ position: 'relative', width: '100%' }}>
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Secure Password"
              value={form.password}
              onChange={(e) => upd('password', e.target.value)}
              required
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="button button-primary button-full">
            {loading ? 'Processing...' : isLogin ? 'Access Dashboard' : 'Register Company'}
          </button>
        </form>
      </div>

      <LegalModal isOpen={showLegal} onClose={() => setShowLegal(false)} />
    </div>
  );
}