import React from 'react';

export default function DigitalResume({ verifiedPhone, profileData: p, onTriggerEdit }) {
  const safeArr = v => Array.isArray(v) ? v : [];

  return (
    <div className="resume-card">
      <div className="resume-hero">
        <div className="resume-hero-tag">
          <span className="status-dot" />
          Pending placement call
        </div>
        <h2 className="resume-hero-title">{p?.fullName || 'Your Profile'}</h2>
        <p className="resume-hero-subtitle">+91 {verifiedPhone}</p>
      </div>

      <div className="resume-body">
        <div className="resume-section">
          <div className="resume-section-title">Personal Details</div>
          <div className="responsive-grid">
            <F label="Date of Birth" val={p?.dob ? new Date(p.dob).toLocaleDateString('en-IN') : null} />
            <F label="Gender" val={p?.sex} />
            <F label="Marital Status" val={p?.maritalStatus} />
            {p?.emailId && <F label="Email" val={p.emailId} />}
            {p?.phoneNumber2 && <F label="Alternate Mobile" val={p.phoneNumber2} />}
            {p?.familyPhonePrimary && <F label="Family Contact" val={p.familyPhonePrimary} />}
          </div>
          <div className="mt-16">
            <F label="Present Address" val={[p?.presentAddress, p?.presentDistrict, p?.presentState].filter(Boolean).join(', ')} />
          </div>
          {p?.permanentAddress && (
            <div className="mt-12">
              <F label="Permanent Address" val={[p.permanentAddress, p.permanentDistrict, p.permanentState].filter(Boolean).join(', ')} />
            </div>
          )}
        </div>

        <div className="resume-section">
          <div className="resume-section-title">Job Preferences</div>
          <F label="Monthly Salary Expectation" val={p?.expectedSalary} />

          {safeArr(p?.jobRoles).length > 0 && (
            <div className="mt-16">
              <p className="resume-detail-label">Job Roles</p>
              <div className="badge-list">
                {p.jobRoles.map(r => (
                  <span key={r} className="badge badge--primary">{r}</span>
                ))}
              </div>
            </div>
          )}

          {safeArr(p?.preferredDistricts).length > 0 && (
            <div className="mt-16">
              <p className="resume-detail-label">Preferred Districts</p>
              <div className="badge-list">
                {p.preferredDistricts.map(d => (
                  <span key={d} className="badge badge--muted">{d}</span>
                ))}
              </div>
            </div>
          )}

          {safeArr(p?.languagesKnown).length > 0 && (
            <div className="mt-16">
              <p className="resume-detail-label">Languages Known</p>
              <div className="badge-list">
                {p.languagesKnown.map(l => (
                  <span key={l} className="badge badge--success">{l}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {safeArr(p?.education).some(r => r.institution) && (
          <div className="resume-section">
            <div className="resume-section-title">Education</div>
            <div className="table-wrapper">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th className="table-cell--small">#</th>
                    <th>Institution</th>
                    <th>Course</th>
                  </tr>
                </thead>
                <tbody>
                  {p.education.filter(r => r.institution).map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.institution}</td>
                      <td>{r.course}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {safeArr(p?.technical).some(r => r.institution) && (
          <div className="resume-section">
            <div className="resume-section-title">Technical Qualifications</div>
            <div className="table-wrapper">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th className="table-cell--small">#</th>
                    <th>Institution</th>
                    <th>Course</th>
                  </tr>
                </thead>
                <tbody>
                  {p.technical.filter(r => r.institution).map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.institution}</td>
                      <td>{r.course}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {safeArr(p?.experience).some(r => r.institution) && (
          <div className="resume-section">
            <div className="resume-section-title">Work Experience</div>
            <div className="table-wrapper">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th className="table-cell--small">#</th>
                    <th>Organisation</th>
                    <th>Role</th>
                    <th className="table-cell--xsmall">From</th>
                    <th className="table-cell--xsmall">To</th>
                  </tr>
                </thead>
                <tbody>
                  {p.experience.filter(r => r.institution).map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.institution}</td>
                      <td>{r.role || '—'}</td>
                      <td>{r.fromYear}</td>
                      <td>{r.toYear}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="resume-footer">
        <p>Your data is securely finalized. Administrators will review your preferences shortly.</p>
        <button type="button" className="button button-primary resume-action" onClick={onTriggerEdit}>
          Edit Profile
        </button>
      </div>
    </div>
  );
}

function F({ label, val }) {
  return (
    <div className="resume-detail">
      <p className="resume-detail-label">{label}</p>
      <p className="resume-detail-value">{val || '—'}</p>
    </div>
  );
}
