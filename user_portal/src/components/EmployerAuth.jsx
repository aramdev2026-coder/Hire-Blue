import React, { useState } from 'react';

export default function EmployerAuth({ backendUrl, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' }); // type: 'error' | 'success'

  const [form, setForm] = useState({
    companyName: '', email: '', phoneNumber: '', password: '', identifier: ''
  });

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
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
        
        setMsg({ type: 'success', text: 'Thank you! Your account is pending verification by our HR team.' });
        setForm({ companyName: '', email: '', phoneNumber: '', password: '', identifier: '' });
        setTimeout(() => setIsLogin(true), 4000);
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
            </>
          )}

          {isLogin && (
            <input className="input" type="text" placeholder="Email or Phone Number" value={form.identifier} onChange={e => upd('identifier', e.target.value)} required />
          )}

          <input className="input" type="password" placeholder="Secure Password" value={form.password} onChange={e => upd('password', e.target.value)} required />

          <button type="submit" disabled={loading} className="button button-primary button-full">
            {loading ? 'Processing...' : isLogin ? 'Access Dashboard' : 'Request Account'}
          </button>
        </form>
      </div>
    </div>
  );
}