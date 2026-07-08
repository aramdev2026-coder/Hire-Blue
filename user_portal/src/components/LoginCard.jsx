import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

export default function LoginCard({ backendUrl, onAuthSuccess }) {
  const [step, setStep] = useState('send'); // 'send' | 'verify'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpVals, setOtpVals] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Handle countdown for resending OTP
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Auto-focus first input box when verify step mounts
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => {
        if (inputRefs[0]?.current) {
          inputRefs[0].current.focus();
        }
      }, 50);
    }
  }, [step]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

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
      const res = await fetch(`${backendUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP.');
        return;
      }

      setStep('verify');
      setResendCountdown(60);
      setSuccessMsg('OTP sent! Please check your email.');
    } catch (err) {
      setError('Cannot reach server. Please make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length < 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const emailTrimmed = email.trim().toLowerCase();
      const res = await fetch(`${backendUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed, otpCode: trimmedOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid OTP.');
        return;
      }

      // Fetch existing profile
      let profile = null;
      try {
        const pr = await fetch(`${backendUrl}/candidate/profile/${data.candidateId}`, {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        if (pr.ok) {
          const resObj = await pr.json();
          profile = resObj.candidate;
        }
      } catch (err) {
        console.error('Failed to pre-fetch profile:', err);
      }

      const status = profile?.status ?? data.profileStatus;
      onAuthSuccess(data.token, data.candidateId, emailTrimmed, status, profile);
    } catch (err) {
      setError('Cannot reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0 || resendLoading) return;

    setError('');
    setSuccessMsg('');
    setOtp('');
    setOtpVals(['', '', '', '', '', '']);
    setResendLoading(true);

    try {
      const emailTrimmed = email.trim().toLowerCase();
      const res = await fetch(`${backendUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to resend OTP.');
        return;
      }

      setResendCountdown(60);
      setSuccessMsg('New OTP sent to your email.');
      setTimeout(() => {
        if (inputRefs[0]?.current) {
          inputRefs[0].current.focus();
        }
      }, 50);
    } catch (err) {
      setError('Cannot reach server. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('send');
    setError('');
    setSuccessMsg('');
    setOtp('');
    setOtpVals(['', '', '', '', '', '']);
  };

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    const newOtpVals = [...otpVals];
    newOtpVals[index] = cleanValue;
    setOtpVals(newOtpVals);
    setOtp(newOtpVals.join(''));
    setError('');

    // Auto-focus next input
    if (cleanValue && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpVals[index] && index > 0) {
        // Current is empty, delete previous and focus it
        const newOtpVals = [...otpVals];
        newOtpVals[index - 1] = '';
        setOtpVals(newOtpVals);
        setOtp(newOtpVals.join(''));
        inputRefs[index - 1].current.focus();
      } else if (otpVals[index]) {
        // Current has value, delete current and stay
        const newOtpVals = [...otpVals];
        newOtpVals[index] = '';
        setOtpVals(newOtpVals);
        setOtp(newOtpVals.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtpVals = [...otpVals];
      for (let i = 0; i < 6; i++) {
        newOtpVals[i] = pastedData[i] || '';
      }
      setOtpVals(newOtpVals);
      setOtp(newOtpVals.join(''));

      // Focus last pasted input
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs[focusIndex].current.focus();
    }
  };

  return (
    <div className="auth-shell">
      <style>{`
        .otp-digit-input:hover {
          border-color: var(--border-strong) !important;
        }
        .otp-digit-input:focus {
          border-color: var(--primary) !important;
          background: var(--surface) !important;
          box-shadow: 0 0 0 3px var(--primary-border) !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div className="auth-card text-center" style={{ position: 'relative' }}>
        {step === 'verify' && (
          <button
            type="button"
            onClick={handleBackToEmail}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem',
              fontWeight: '500',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.background = 'var(--border-soft)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}

        <img
          src="/favicon.png"
          alt="Aram FTC Logo"
          className="brand-logo"
          style={{ margin: '0 auto 16px', display: 'block' }}
        />

        {step === 'send' ? (
          <>
            <h1 className="auth-title">Candidate Portal</h1>
            <p className="auth-copy">Enter your email address to open or continue your profile.</p>

            {error && <div className="alert-box error">{error}</div>}
            {successMsg && <div className="alert-box success">{successMsg}</div>}

            <form onSubmit={handleSendOTP} className="form-stack">
              <div className="field text-left">
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
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="button button-primary" style={{ width: '100%' }}>
                {loading ? 'Sending OTP…' : 'Open My Profile'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">Verify Email</h1>
            <p className="auth-copy" style={{ marginBottom: '16px' }}>
              We've sent a 6-digit OTP code to <br />
              <strong style={{ color: 'var(--text)', wordBreak: 'break-all' }}>{email}</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginTop: '8px' }}>
                If you do not receive the email shortly, please <strong style={{ color: 'var(--primary)', fontWeight: '700' }}>refresh your inbox</strong> or <strong style={{ color: '#ea580c', fontWeight: '700' }}>check your spam folder</strong>.
              </span>
            </p>

            {error && <div className="alert-box error">{error}</div>}
            {successMsg && <div className="alert-box success">{successMsg}</div>}

            <form onSubmit={handleVerifyOTP} className="form-stack">
              <div className="field text-center">
                <label className="field-label" style={{ textAlign: 'left', display: 'block' }}>Enter One-Time Password *</label>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '20px 0' }}>
                  {otpVals.map((val, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      disabled={loading}
                      style={{
                        width: '46px',
                        height: '52px',
                        fontSize: '1.6rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        borderRadius: '10px',
                        border: '2px solid var(--border)',
                        background: 'var(--surface-sunken)',
                        color: 'var(--text)',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: 'var(--shadow-xs)',
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? 'not-allowed' : 'text',
                      }}
                      className="otp-digit-input"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="button button-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify & Continue</span>
                )}
              </button>
            </form>

            <div style={{ marginTop: '24px', fontSize: '0.88rem', color: 'var(--muted)' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                Please check your email thoroughly before requesting a resend for confirmation.
              </p>
              Didn't receive the email?{' '}
              {resendCountdown > 0 ? (
                <span>Resend in {resendCountdown}s</span>
              ) : (
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResendOTP}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: '600',
                    padding: 0,
                    fontFamily: 'inherit',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {resendLoading && <RefreshCw size={12} className="animate-spin" />}
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}