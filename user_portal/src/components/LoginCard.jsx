import React, { useState } from 'react';
import { PhoneCall } from 'lucide-react';

export default function LoginCard({ backendUrl, onAuthSuccess }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const res = await fetch(`${backendUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, otpCode: '123456', otpSessionId: 'SANDBOX_SESSION_ACTIVE' }),
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
      onAuthSuccess(data.token, data.candidateId, phone, status, profile);
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
        <p className="auth-copy">Enter your mobile number to open or continue your profile.</p>

        {error && <div className="alert-box error">{error}</div>}

        <form onSubmit={submit} className="form-stack">
          <div className="field">
            <label className="field-label">Mobile Number *</label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={16} style={{ opacity: 0.7 }} />
                <span>+91</span>
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => { setError(''); setPhone(e.target.value.replace(/\D/g, '')); }}
                autoFocus
                className={`input input-with-prefix ${error ? 'input-error' : ''}`}
                style={{ paddingLeft: '72px' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="button button-primary">
            {loading ? 'Connecting…' : 'Open My Profile'}
          </button>
        </form>

        <div className="notice-box">
          <strong>Sandbox mode:</strong> OTP is skipped. Any 10-digit valid phonenumber works.
        </div>
      </div>
    </div>
  );
}