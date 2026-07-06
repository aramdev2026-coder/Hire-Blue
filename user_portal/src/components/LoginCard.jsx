import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export default function LoginCard({ backendUrl, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = email.trim().toLowerCase();
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
      setError('Please enter a valid, legitimate email address (e.g. name@gmail.com).');
      return;
    }
    setLoading(true);
    try {
      // Sandbox: skip real OTP, call verify directly
      const res = await fetch(`${backendUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed, otpCode: '123456', otpSessionId: 'SANDBOX_SESSION_ACTIVE' }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Login failed. Try again.'); return; }

      // Fetch existing profile
      let profile = null;
      try {
        const pr = await fetch(`${backendUrl}/candidate/profile/${data.candidateId}`, {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        if (pr.ok) {
          const resObj = await pr.json();
          profile = resObj.candidate; // Since the backend returns { success: true, candidate }
        }
      } catch { }

      const status = profile?.status ?? data.profileStatus;
      onAuthSuccess(data.token, data.candidateId, emailTrimmed, status, profile);
    } catch {
      setError('Cannot reach server. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card text-center">
        <img src="/favicon.png" alt="Aram FTC Logo" className="brand-logo" style={{ margin: '0 auto 16px', display: 'block' }} />
        <h1 className="auth-title">Candidate Portal</h1>
        <p className="auth-copy">Enter your email address to open or continue your profile.</p>

        {error && <div className="alert-box error">{error}</div>}

        <form onSubmit={submit} className="form-stack">
          <div className="field">
            <label className="field-label">Email Address *</label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} style={{ opacity: 0.7 }} />
              </span>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => { setError(''); setEmail(e.target.value); }}
                autoFocus
                className={`input input-with-prefix ${error ? 'input-error' : ''}`}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="button button-primary">
            {loading ? 'Connecting…' : 'Open My Profile'}
          </button>
        </form>

        <div className="notice-box">
          <strong>Sandbox mode:</strong> OTP is skipped. Any valid email address works. Code is 123456.
        </div>
      </div>
    </div>
  );
}