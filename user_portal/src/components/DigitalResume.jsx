import React from 'react';

export default function DigitalResume({ verifiedPhone, profileData: p, onTriggerEdit }) {
  const safeArr = v => Array.isArray(v) ? v : [];

  const card = { background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.07)' };
  const secTitle = { fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.8px',color:'#18181b',marginBottom:14 };
  const thStyle = { padding:'10px 12px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',color:'#71717a',borderBottom:'1.5px solid #e4e4e7',background:'#fafafa' };
  const tdStyle = { padding:'10px 12px',borderBottom:'1px solid #f4f4f5',fontSize:13,color:'#000' };

  const badge = (color, bg, border) => ({
    display:'inline-block',padding:'4px 10px',borderRadius:6,fontSize:12,fontWeight:600,
    color, background:bg, border:`1px solid ${border}`,
  });

  return (
    <div style={card}>
      <div style={{
        background:'linear-gradient(135deg,#18181b 0%,#1e3a5f 100%)',
        padding:'32px 28px'
      }}>
        <div style={{
          display:'inline-flex',alignItems:'center',gap:6,
          fontSize:11,fontWeight:700,letterSpacing:'0.5px',textTransform:'uppercase',
          color:'#6ee7b7',background:'rgba(110,231,183,0.12)',
          border:'1px solid rgba(110,231,183,0.25)',borderRadius:100,
          padding:'4px 12px',marginBottom:16
        }}>
          <span style={{ width:6,height:6,borderRadius:'50%',background:'#6ee7b7',display:'inline-block' }}/>
          Pending placement call
        </div>
        <div style={{ fontSize:28,fontWeight:800,color:'#fff',letterSpacing:'-0.5px',marginBottom:6 }}>
          {p?.fullName || 'Your Profile'}
        </div>
        <div style={{ fontSize:14,color:'#94a3b8',fontWeight:500 }}>+91 {verifiedPhone}</div>
      </div>

      <div style={{ padding:'28px',display:'flex',flexDirection:'column',gap:28, textAlign: 'left' }}>
        
        {/* Personal Details */}
        <div style={{ paddingBottom:24,borderBottom:'1px solid #f4f4f5' }}>
          <div style={secTitle}>Personal Details</div>
          <div className="responsive-grid">
            <F label="Date of Birth"  val={p?.dob ? new Date(p.dob).toLocaleDateString('en-IN') : null} />
            <F label="Gender"         val={p?.sex} />
            <F label="Marital Status" val={p?.maritalStatus} />
            {p?.emailId         && <F label="Email"            val={p.emailId} />}
            {p?.phoneNumber2    && <F label="Alternate Mobile" val={p.phoneNumber2} />}
            {p?.familyPhonePrimary && <F label="Family Contact" val={p.familyPhonePrimary} />}
          </div>
          <div style={{ marginTop:16 }}>
            <F label="Present Address" val={[p?.presentAddress,p?.presentDistrict,p?.presentState].filter(Boolean).join(', ')} />
          </div>
          {p?.permanentAddress && (
            <div style={{ marginTop:12 }}>
              <F label="Permanent Address" val={[p.permanentAddress,p.permanentDistrict,p.permanentState].filter(Boolean).join(', ')} />
            </div>
          )}
        </div>

        {/* Job Preferences */}
        <div style={{ paddingBottom:24,borderBottom:'1px solid #f4f4f5' }}>
          <div style={secTitle}>Job Preferences</div>
          <F label="Monthly Salary Expectation" val={p?.expectedSalary} />
          
          {safeArr(p?.jobRoles).length>0 && (
            <div style={{ marginTop:16 }}>
              <p style={{ fontSize:12,color:'#71717a',fontWeight:700,marginBottom:8 }}>Job Roles</p>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                {p.jobRoles.map(r=><span key={r} style={badge('#1d4ed8','#eff6ff','#bfdbfe')}>{r}</span>)}
              </div>
            </div>
          )}
          {safeArr(p?.preferredDistricts).length>0 && (
            <div style={{ marginTop:16 }}>
              <p style={{ fontSize:12,color:'#71717a',fontWeight:700,marginBottom:8 }}>Preferred Districts</p>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                {p.preferredDistricts.map(d=><span key={d} style={badge('#3f3f46','#f4f4f5','#e4e4e7')}>{d}</span>)}
              </div>
            </div>
          )}
          {safeArr(p?.languagesKnown).length>0 && (
            <div style={{ marginTop:16 }}>
              <p style={{ fontSize:12,color:'#71717a',fontWeight:700,marginBottom:8 }}>Languages Known</p>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                {p.languagesKnown.map(l=><span key={l} style={badge('#059669','#f0fdf4','#bbf7d0')}>{l}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Education & Experience Blocks */}
        {safeArr(p?.education).some(r=>r.institution) && (
          <div>
            <div style={secTitle}>Education</div>
            <div className="table-wrapper">
              <table className="responsive-table">
                <thead><tr><th style={thStyle}>#</th><th style={thStyle}>Institution</th><th style={thStyle}>Course</th></tr></thead>
                <tbody>{p.education.filter(r=>r.institution).map((r,i)=>(
                  <tr key={i}><td style={tdStyle}>{i+1}</td><td style={tdStyle}>{r.institution}</td><td style={tdStyle}>{r.course}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {safeArr(p?.technical).some(r=>r.institution) && (
          <div>
            <div style={secTitle}>Technical Qualifications</div>
            <div className="table-wrapper">
              <table className="responsive-table">
                <thead><tr><th style={thStyle}>#</th><th style={thStyle}>Institution</th><th style={thStyle}>Course</th></tr></thead>
                <tbody>{p.technical.filter(r=>r.institution).map((r,i)=>(
                  <tr key={i}><td style={tdStyle}>{i+1}</td><td style={tdStyle}>{r.institution}</td><td style={tdStyle}>{r.course}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {safeArr(p?.experience).some(r=>r.institution) && (
          <div>
            <div style={secTitle}>Work Experience</div>
            <div className="table-wrapper">
              <table className="responsive-table">
                <thead><tr><th style={thStyle}>#</th><th style={thStyle}>Organisation</th><th style={thStyle}>Role</th><th style={thStyle}>From</th><th style={thStyle}>To</th></tr></thead>
                <tbody>{p.experience.filter(r=>r.institution).map((r,i)=>(
                  <tr key={i}>
                    <td style={tdStyle}>{i+1}</td><td style={tdStyle}>{r.institution}</td>
                    <td style={tdStyle}>{r.role||'—'}</td><td style={tdStyle}>{r.fromYear}</td><td style={tdStyle}>{r.toYear}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Info & Actions Footer */}
      <div style={{ padding:'20px 28px',borderTop:'1px solid #f4f4f5',background:'#fafafa',display:'flex',flexDirection:'column',gap:14, alignItems:'flex-start' }}>
        <p style={{ fontSize:12, color:'#71717a', lineHeight:1.5 }}>Your data is securely finalized. Administrators will review your preferences shortly.</p>
        <button onClick={onTriggerEdit} style={{
          padding:'12px 24px',background:'#18181b',color:'#fff',
          border:'none',borderRadius:8,fontSize:14,fontWeight:700,cursor:'pointer'
        }}>
          Edit Profile
        </button>
      </div>
    </div>
  );
}

function F({ label, val }) {
  return (
    <div style={{ marginBottom:4 }}>
      <p style={{ fontSize:11,color:'#71717a',fontWeight:600,marginBottom:2 }}>{label}</p>
      <p style={{ fontSize:14,fontWeight:600,color:'#000' }}>{val||'—'}</p>
    </div>
  );
}