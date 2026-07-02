import React from 'react';
import { Edit, FileText, Download } from 'lucide-react';

export default function DigitalResume({ verifiedPhone, profileData: p, onTriggerEdit }) {
  const safeArr = v => Array.isArray(v) ? v : [];

  const downloadTextResume = () => {
    const text = `
DIGITAL RESUME - ${p?.fullName || 'Candidate'}
Mobile: +91 ${verifiedPhone}
Email: ${p?.emailId || '—'}
Date of Birth: ${p?.dob ? new Date(p.dob).toLocaleDateString('en-IN') : '—'}
Gender: ${p?.sex || '—'}
Marital Status: ${p?.maritalStatus || '—'}
Present Address: ${[p?.presentAddress, p?.presentDistrict, p?.presentState].filter(Boolean).join(', ')}
Permanent Address: ${[p?.permanentAddress, p?.permanentDistrict, p?.permanentState].filter(Boolean).join(', ')}

JOB PREFERENCES:
Expected Monthly Salary: ${p?.expectedSalary || '—'}
Job Roles: ${safeArr(p?.jobRoles).join(', ') || '—'}
Preferred Districts: ${safeArr(p?.preferredDistricts).join(', ') || '—'}
Languages Known: ${safeArr(p?.languagesKnown).join(', ') || '—'}

EDUCATION:
${safeArr(p?.education).filter(r => r.institution).map((r, i) => `${i + 1}. ${r.institution} - ${r.course}`).join('\n') || 'None'}

TECHNICAL QUALIFICATIONS:
${safeArr(p?.technical).filter(r => r.institution).map((r, i) => `${i + 1}. ${r.institution} - ${r.course}`).join('\n') || 'None'}

WORK EXPERIENCE:
${safeArr(p?.experience).filter(r => r.institution).map((r, i) => `${i + 1}. ${r.institution} (${r.role || 'Role'}) - From ${r.fromYear} to ${r.toYear}`).join('\n') || 'None'}
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${(p?.fullName || 'resume').replace(/\s+/g, '_')}_resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="resume-card">
      <div className="resume-hero">
        <div className="resume-hero-tag no-print">
          <span className="status-dot" />
          Pending placement call
        </div>
        <h2 className="resume-hero-title">{p?.fullName || 'Your Profile'}</h2>
        <p className="resume-hero-subtitle">
          +91 {verifiedPhone}
          {p?.emailId && <span className="print-only-inline"> | {p.emailId}</span>}
        </p>
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
              <div className="badge-list no-print">
                {p.jobRoles.map(r => (
                  <span key={r} className="badge badge--primary">{r}</span>
                ))}
              </div>
              <p className="print-only print-text-list">{p.jobRoles.join('  •  ')}</p>
            </div>
          )}

          {safeArr(p?.preferredDistricts).length > 0 && (
            <div className="mt-16">
              <p className="resume-detail-label">Preferred Districts</p>
              <div className="badge-list no-print">
                {p.preferredDistricts.map(d => (
                  <span key={d} className="badge badge--muted">{d}</span>
                ))}
              </div>
              <p className="print-only print-text-list">{p.preferredDistricts.join('  •  ')}</p>
            </div>
          )}

          {safeArr(p?.languagesKnown).length > 0 && (
            <div className="mt-16">
              <p className="resume-detail-label">Languages Known</p>
              <div className="badge-list no-print">
                {p.languagesKnown.map(l => (
                  <span key={l} className="badge badge--success">{l}</span>
                ))}
              </div>
              <p className="print-only print-text-list">{p.languagesKnown.join('  •  ')}</p>
            </div>
          )}
        </div>

        {safeArr(p?.education).some(r => r.institution) && (
          <div className="resume-section">
            <div className="resume-section-title">Education</div>
            <div className="table-wrapper no-print">
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
            <div className="print-only print-list">
              {p.education.filter(r => r.institution).map((r, i) => (
                <div key={i} className="print-list-item">
                  <span className="print-item-left">{r.course}</span>
                  <span className="print-item-right">{r.institution}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {safeArr(p?.technical).some(r => r.institution) && (
          <div className="resume-section">
            <div className="resume-section-title">Technical Qualifications</div>
            <div className="table-wrapper no-print">
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
            <div className="print-only print-list">
              {p.technical.filter(r => r.institution).map((r, i) => (
                <div key={i} className="print-list-item">
                  <span className="print-item-left">{r.course}</span>
                  <span className="print-item-right">{r.institution}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {safeArr(p?.experience).some(r => r.institution) && (
          <div className="resume-section">
            <div className="resume-section-title">Work Experience</div>
            <div className="table-wrapper no-print">
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
            <div className="print-only print-list">
              {p.experience.filter(r => r.institution).map((r, i) => (
                <div key={i} className="print-list-item">
                  <span className="print-item-left">
                    {r.role ? `${r.role}, ` : ''}{r.institution}
                  </span>
                  <span className="print-item-right">
                    {r.fromYear} – {r.toYear}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="resume-footer">
        <p className="no-print">Your data is securely finalized. Administrators will review your preferences shortly.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '1rem' }} className="no-print">
          <button type="button" className="button button-primary resume-action" onClick={onTriggerEdit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Edit size={16} />
            <span>Edit Profile</span>
          </button>
          <button type="button" className="button button-secondary resume-action" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FileText size={16} />
            <span>Download PDF</span>
          </button>
          <button type="button" className="button button-ghost resume-action" onClick={downloadTextResume} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Download size={16} />
            <span>Download TXT</span>
          </button>
        </div>
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
