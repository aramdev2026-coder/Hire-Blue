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
    <div style={{ display:'flex',justifyContent:'center',paddingTop:40 }}>
      <div style={{
        width:'100%',maxWidth:400,
        background:'#fff',borderRadius:14,
        border:'1px solid #e4e4e7',
        padding:'36px 28px 28px',
        boxShadow:'0 4px 24px rgba(0,0,0,0.09)'
      }}>

        <h1 style={{ fontSize:22,fontWeight:800,color:'#000',letterSpacing:'-0.4px',marginBottom:6 }}>
          Candidate Portal
        </h1>
        <p style={{ fontSize:13,color:'#52525b',marginBottom:26,lineHeight:1.5 }}>
          Enter your mobile number to open or continue your profile.
        </p>

        {error && (
          <div style={{
            fontSize:13,fontWeight:600,color:'#dc2626',
            background:'#fef2f2',border:'1px solid #fca5a5',
            borderRadius:7,padding:'10px 12px',marginBottom:14
          }}>{error}</div>
        )}

        <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:700,
              textTransform:'uppercase',letterSpacing:'0.6px',
              color:'#000',marginBottom:6 }}>
              Mobile Number *
            </label>
            <div style={{ position:'relative' }}>
              <span style={{
                position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',
                fontSize:14,fontWeight:600,color:'#52525b',pointerEvents:'none'
              }}>+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={e => { setError(''); setPhone(e.target.value.replace(/\D/g,'')); }}
                autoFocus
                style={{
                  width:'100%',paddingLeft:44,paddingRight:12,
                  paddingTop:11,paddingBottom:11,
                  border:`1.5px solid ${error?'#dc2626':'#d4d4d8'}`,
                  borderRadius:8,fontSize:15,color:'#000',
                  outline:'none',background:'#fff',
                }}
                onFocus={e => e.target.style.borderColor='#000'}
                onBlur={e  => e.target.style.borderColor=error?'#dc2626':'#d4d4d8'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width:'100%',padding:13,
              background: loading ? '#a1a1aa' : '#18181b',
              color:'#fff',border:'none',borderRadius:8,
              fontSize:15,fontWeight:700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition:'background 0.15s'
            }}
          >
            {loading ? 'Connecting…' : 'Open My Profile'}
          </button>
        </form>

        <div style={{
          marginTop:18,fontSize:12,color:'#71717a',
          background:'#fafafa',borderRadius:7,
          padding:'10px 12px',border:'1px solid #e4e4e7'
        }}>
          <strong style={{color:'#000'}}>Sandbox mode:</strong> OTP is skipped. Any 10-digit number works.
        </div>
      </div>
    </div>
  );
}