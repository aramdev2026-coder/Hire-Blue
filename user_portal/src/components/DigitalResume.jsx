import React from 'react';

export default function DigitalResume({ verifiedPhone, profileData: p, onTriggerEdit }) {
  const safeArr = v => Array.isArray(v) ? v : [];

  const card = { background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.07)' };
  const secTitle = { fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.6px',color:'#71717a',marginBottom:10 };
  const grid2 = { display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 };
  const thStyle = { padding:'6px 10px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',color:'#71717a',borderBottom:'1.5px solid #e4e4e7',background:'#fafafa',textAlign:'left' };
  const tdStyle = { padding:'8px 10px',borderBottom:'1px solid #f4f4f5',fontSize:13,color:'#000' };

  const badge = (color, bg, border) => ({
    display:'inline-block',padding:'3px 9px',borderRadius:5,fontSize:11,fontWeight:700,
    color, background:bg, border:`1px solid ${border}`,
  });

  return (
    <div style={card}>
      {/* Hero */}
      <div style={{
        background:'linear-gradient(135deg,#18181b 0%,#1e3a5f 100%)',
        padding:'26px 24px 22px'
      }}>
        <div style={{
          display:'inline-flex',alignItems:'center',gap:6,
          fontSize:11,fontWeight:700,letterSpacing:'0.5px',textTransform:'uppercase',
          color:'#6ee7b7',background:'rgba(110,231,183,0.12)',
          border:'1px solid rgba(110,231,183,0.25)',borderRadius:100,
          padding:'4px 12px',marginBottom:12
        }}>
          <span style={{ width:6,height:6,borderRadius:'50%',background:'#6ee7b7',display:'inline-block' }}/>
          Pending placement call
        </div>
        <div style={{ fontSize:26,fontWeight:800,color:'#fff',letterSpacing:'-0.5px',marginBottom:5 }}>
          {p?.fullName || 'Your Profile'}
        </div>
        <div style={{ fontSize:13,color:'#94a3b8' }}>+91 {verifiedPhone}</div>
      </div>

      <div style={{ padding:'22px 24px',display:'flex',flexDirection:'column',gap:20 }}>

        {/* Personal */}
        <div style={{ paddingBottom:18,borderBottom:'1px solid #f4f4f5' }}>
          <div style={secTitle}>Personal Details</div>
          <div style={grid2}>
            <F label="Date of Birth"  val={p?.dob ? new Date(p.dob).toLocaleDateString('en-IN') : null} />
            <F label="Gender"         val={p?.sex} />
            <F label="Marital Status" val={p?.maritalStatus} />
            {p?.emailId         && <F label="Email"            val={p.emailId} />}
            {p?.phoneNumber2    && <F label="Alternate Mobile" val={p.phoneNumber2} />}
            {p?.familyPhonePrimary && <F label="Family Contact" val={p.familyPhonePrimary} />}
          </div>
          <div style={{ marginTop:12 }}>
            <F label="Present Address"
              val={[p?.presentAddress,p?.presentDistrict,p?.presentState].filter(Boolean).join(', ')} />
          </div>
          {p?.permanentAddress && (
            <div style={{ marginTop:10 }}>
              <F label="Permanent Address"
                val={[p.permanentAddress,p.permanentDistrict,p.permanentState].filter(Boolean).join(', ')} />
            </div>
          )}
        </div>

        {/* Job Prefs */}
        <div style={{ paddingBottom:18,borderBottom:'1px solid #f4f4f5' }}>
          <div style={secTitle}>Job Preferences</div>
          <F label="Salary Expectation" val={p?.expectedSalary} />
          {safeArr(p?.jobRoles).length>0 && (
            <div style={{ marginTop:10 }}>
              <p style={{ fontSize:11,color:'#71717a',fontWeight:600,marginBottom:5 }}>Job Roles</p>
              {/* Added Alignments */}
              <div style={{ display:'flex',flexWrap:'wrap',gap:8, alignItems:'center' }}>
                {p.jobRoles.map(r=><span key={r} style={badge('#1d4ed8','#eff6ff','#bfdbfe')}>{r}</span>)}
              </div>
            </div>
          )}
          {safeArr(p?.preferredDistricts).length>0 && (
            <div style={{ marginTop:10 }}>
              <p style={{ fontSize:11,color:'#71717a',fontWeight:600,marginBottom:5 }}>Preferred Districts</p>
              {/* Added Alignments */}
              <div style={{ display:'flex',flexWrap:'wrap',gap:8, alignItems:'center' }}>
                {p.preferredDistricts.map(d=><span key={d} style={badge('#3f3f46','#f4f4f5','#e4e4e7')}>{d}</span>)}
              </div>
            </div>
          )}
          {safeArr(p?.languagesKnown).length>0 && (
            <div style={{ marginTop:10 }}>
              <p style={{ fontSize:11,color:'#71717a',fontWeight:600,marginBottom:5 }}>Languages</p>
              {/* Added Alignments */}
              <div style={{ display:'flex',flexWrap:'wrap',gap:8, alignItems:'center' }}>
                {p.languagesKnown.map(l=><span key={l} style={badge('#059669','#f0fdf4','#bbf7d0')}>{l}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Education */}
        {safeArr(p?.education).some(r=>r.institution) && (
          <div style={{ paddingBottom:18,borderBottom:'1px solid #f4f4f5' }}>
            <div style={secTitle}>Education</div>
            <table style={{ width:'100%',borderCollapse:'collapse',border:'1px solid #e4e4e7' }}>
              <thead><tr><th style={thStyle}>#</th><th style={thStyle}>Institution</th><th style={thStyle}>Course</th></tr></thead>
              <tbody>{p.education.filter(r=>r.institution).map((r,i)=>(
                <tr key={i}><td style={tdStyle}>{i+1}</td><td style={tdStyle}>{r.institution}</td><td style={tdStyle}>{r.course}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* Technical */}
        {safeArr(p?.technical).some(r=>r.institution) && (
          <div style={{ paddingBottom:18,borderBottom:'1px solid #f4f4f5' }}>
            <div style={secTitle}>Technical Qualifications</div>
            <table style={{ width:'100%',borderCollapse:'collapse',border:'1px solid #e4e4e7' }}>
              <thead><tr><th style={thStyle}>#</th><th style={thStyle}>Institution</th><th style={thStyle}>Course</th></tr></thead>
              <tbody>{p.technical.filter(r=>r.institution).map((r,i)=>(
                <tr key={i}><td style={tdStyle}>{i+1}</td><td style={tdStyle}>{r.institution}</td><td style={tdStyle}>{r.course}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* Experience */}
        {safeArr(p?.experience).some(r=>r.institution) && (
          <div>
            <div style={secTitle}>Work Experience</div>
            <table style={{ width:'100%',borderCollapse:'collapse',border:'1px solid #e4e4e7' }}>
              <thead><tr><th style={thStyle}>#</th><th style={thStyle}>Organisation</th><th style={thStyle}>Role</th><th style={thStyle}>From</th><th style={thStyle}>To</th></tr></thead>
              <tbody>{p.experience.filter(r=>r.institution).map((r,i)=>(
                <tr key={i}>
                  <td style={tdStyle}>{i+1}</td><td style={tdStyle}>{r.institution}</td>
                  <td style={tdStyle}>{r.role||'—'}</td><td style={tdStyle}>{r.fromYear}</td><td style={tdStyle}>{r.toYear}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ padding:'18px 24px',borderTop:'1px solid #f4f4f5',background:'#fafafa',display:'flex',justifyContent:'center' }}>
        <button onClick={onTriggerEdit} style={{
          padding:'11px 32px',background:'#18181b',color:'#fff',
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
    <div style={{ marginBottom:2 }}>
      <p style={{ fontSize:11,color:'#71717a',fontWeight:600,marginBottom:2 }}>{label}</p>
      <p style={{ fontSize:14,fontWeight:600,color:'#000' }}>{val||'—'}</p>
    </div>
  );
}