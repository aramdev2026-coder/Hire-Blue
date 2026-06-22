import React, { useState } from 'react';

export default function LoginCard({ backendUrl, onAuthSuccess }) {
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      // Sandbox: skip real OTP, call verify directly
      const res  = await fetch(`${backendUrl}/auth/verify-otp`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phoneNumber:phone, otpCode:'123456', otpSessionId:'SANDBOX_SESSION_ACTIVE' }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Login failed. Try again.'); return; }

      // Fetch existing profile
      let profile = null;
      try {
        const pr = await fetch(`${backendUrl}/candidate/profile/${data.candidateId}`);
        if (pr.ok) profile = await pr.json();
      } catch {}

      const status = profile?.status ?? data.profileStatus;
      onAuthSuccess(data.token, data.candidateId, phone, status, profile);
    } catch {
      setError('Cannot reach server on port 5000. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">

        <h1 className="auth-title">Candidate Portal</h1>
        <p className="auth-copy">Enter your mobile number to open or continue your profile.</p>

        {error && <div className="alert-box error">{error}</div>}

        <form onSubmit={submit} className="form-stack">
          <div className="field">
            <label className="field-label">Mobile Number *</label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => { setError(''); setPhone(e.target.value.replace(/\D/g, '')); }}
                autoFocus
                className={`input input-with-prefix ${error ? 'input-error' : ''}`}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="button button-primary">
            {loading ? 'Connecting…' : 'Open My Profile'}
          </button>
        </form>

        <div className="notice-box">
          <strong>Sandbox mode:</strong> OTP is skipped. Any 10-digit number works.
        </div>
      </div>
    </div>
  );
}