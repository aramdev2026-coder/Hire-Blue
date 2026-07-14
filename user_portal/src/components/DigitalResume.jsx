import React from 'react';
import { Edit, FileText } from 'lucide-react';

export default function DigitalResume({ verifiedPhone, profileData: p, onTriggerEdit }) {
  const safeArr = v => Array.isArray(v) ? v : [];



  const downloadWordResume = () => {
    // Generate education table rows if any
    const eduRows = safeArr(p?.education)
      .filter(r => r.institution)
      .map((edu, idx) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${edu.institution}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${edu.course || '—'}</td>
        </tr>
      `).join('');

    const eduSection = eduRows ? `
      <h2 style="color: #1e3a8a; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 3px; margin-top: 22px; margin-bottom: 8px; font-family: Calibri, Arial, sans-serif; font-size: 16px; font-weight: bold; text-transform: uppercase;">Education</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-family: Calibri, Arial, sans-serif; font-size: 13px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold; width: 8%;">#</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold;">Institution</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold;">Course</th>
          </tr>
        </thead>
        <tbody>
          ${eduRows}
        </tbody>
      </table>
    ` : '';

    // Same for technical rows
    const techRows = safeArr(p?.technical)
      .filter(r => r.institution)
      .map((tech, idx) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${tech.institution}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${tech.course || '—'}</td>
        </tr>
      `).join('');

    const techSection = techRows ? `
      <h2 style="color: #1e3a8a; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 3px; margin-top: 22px; margin-bottom: 8px; font-family: Calibri, Arial, sans-serif; font-size: 16px; font-weight: bold; text-transform: uppercase;">Technical / Skills</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-family: Calibri, Arial, sans-serif; font-size: 13px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold; width: 8%;">#</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold;">Institution</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold;">Course / Certification</th>
          </tr>
        </thead>
        <tbody>
          ${techRows}
        </tbody>
      </table>
    ` : '';

    // Same for experience rows
    const expRows = safeArr(p?.experience)
      .filter(r => r.institution)
      .map((exp, idx) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${exp.institution}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${exp.role || '—'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${exp.fromYear}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">${exp.toYear}</td>
        </tr>
      `).join('');

    const expSection = expRows ? `
      <h2 style="color: #1e3a8a; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 3px; margin-top: 22px; margin-bottom: 8px; font-family: Calibri, Arial, sans-serif; font-size: 16px; font-weight: bold; text-transform: uppercase;">Experience</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-family: Calibri, Arial, sans-serif; font-size: 13px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold; width: 8%;">#</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold;">Employer</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold;">Role</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold; width: 12%;">From</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold; width: 12%;">To</th>
          </tr>
        </thead>
        <tbody>
          ${expRows}
        </tbody>
      </table>
    ` : '';

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Curriculum Vitae - ${p?.fullName || 'Candidate'}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.5;
            color: #1e293b;
          }
        </style>
      </head>
      <body style="padding: 40px;">
        <h1 style="color: #1e3a8a; font-family: Calibri, Arial, sans-serif; font-size: 26px; margin-bottom: 2px; font-weight: bold;">${p?.fullName || 'Candidate Profile'}</h1>
        <div style="font-family: Calibri, Arial, sans-serif; font-size: 13px; color: #475569; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
          <strong>Mobile:</strong> ${p?.phoneNumber1 ? '+91 ' + p.phoneNumber1 : '—'} &nbsp;|&nbsp; 
          <strong>Email:</strong> ${verifiedPhone || p?.emailId || '—'}
        </div>

        <h2 style="color: #1e3a8a; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 3px; margin-top: 22px; margin-bottom: 8px; font-family: Calibri, Arial, sans-serif; font-size: 16px; font-weight: bold; text-transform: uppercase;">Personal Details</h2>
        <table style="width: 100%; border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 13px; margin-bottom: 15px;">
          <tr>
            <td style="width: 25%; font-weight: bold; color: #475569; padding: 4px 0; border: none;">Date of Birth:</td>
            <td style="padding: 4px 0; border: none;">${p?.dob ? new Date(p.dob).toLocaleDateString('en-IN') : '—'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; padding: 4px 0; border: none;">Gender:</td>
            <td style="padding: 4px 0; border: none;">${p?.sex || '—'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; padding: 4px 0; border: none;">Marital Status:</td>
            <td style="padding: 4px 0; border: none;">${p?.maritalStatus || '—'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; padding: 4px 0; border: none;">Present Address:</td>
            <td style="padding: 4px 0; border: none;">${[p?.presentAddress, p?.presentDistrict, p?.presentState].filter(Boolean).join(', ') || '—'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; padding: 4px 0; border: none;">Permanent Address:</td>
            <td style="padding: 4px 0; border: none;">${[p?.permanentAddress, p?.permanentDistrict, p?.permanentState].filter(Boolean).join(', ') || '—'}</td>
          </tr>
        </table>

        <h2 style="color: #1e3a8a; border-bottom: 1.5pt solid #1e3a8a; padding-bottom: 3px; margin-top: 22px; margin-bottom: 8px; font-family: Calibri, Arial, sans-serif; font-size: 16px; font-weight: bold; text-transform: uppercase;">Job Preferences</h2>
        <table style="width: 100%; border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 13px; margin-bottom: 15px;">
          <tr>
            <td style="width: 25%; font-weight: bold; color: #475569; padding: 4px 0; border: none;">Expected Salary (Monthly):</td>
            <td style="padding: 4px 0; border: none;">${p?.expectedSalary || '—'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; padding: 4px 0; border: none;">Job Roles:</td>
            <td style="padding: 4px 0; border: none;">${safeArr(p?.jobRoles).join(', ') || '—'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; padding: 4px 0; border: none;">Preferred Districts:</td>
            <td style="padding: 4px 0; border: none;">${safeArr(p?.preferredDistricts).join(', ') || '—'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; padding: 4px 0; border: none;">Languages Known:</td>
            <td style="padding: 4px 0; border: none;">${safeArr(p?.languagesKnown).join(', ') || '—'}</td>
          </tr>
        </table>

        ${eduSection}
        ${techSection}
        ${expSection}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(p?.fullName || 'resume').replace(/\s+/g, '_')}_resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          {p?.phoneNumber1 ? `+91 ${p.phoneNumber1}` : 'No mobile number'}
          {(verifiedPhone || p?.emailId) && <span className="print-only-inline"> | {verifiedPhone || p.emailId}</span>}
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
          <button type="button" className="button button-secondary resume-action" onClick={downloadWordResume} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FileText size={16} />
            <span>Download Word</span>
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
