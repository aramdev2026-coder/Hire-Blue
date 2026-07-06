import React from 'react';
import { X } from 'lucide-react';

export default function LegalModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', padding: '24px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '720px', maxHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>Aram FTC Legal Policies & Compliance</h3>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Professional Document Navigation Index */}
        <div style={{ padding: '12px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontWeight: 600 }}>Sections:</span>
          <span>1. Privacy Policy</span> |
          <span>2. Terms (Candidates)</span> |
          <span>3. Terms (Employers)</span> |
          <span>4. Cookie Policy</span> |
          <span>5. Grievance Redressal</span>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, flex: 1 }}>
          <div style={{ background: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '12px 16px', borderRadius: '4px', fontSize: '0.82rem', color: '#1e3a8a' }}>
            <strong>Official Notice:</strong> Aram Fintech Concept (Aram FTC) is a registered technology provider. These legal agreements govern user interactions, data handling, and automated candidate matching algorithms on this platform.
          </div>

          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>1. Privacy Policy</h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.75rem', color: '#94a3b8' }}>Effective Date: July 2, 2026</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p><strong>1. Information We Collect</strong></p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                <li><strong>Account Data:</strong> Email address (verified via secure single-use OTP).</li>
                <li><strong>Profile Data:</strong> Full name, date of birth, gender, marital status, base location (district), primary and alternate mobile numbers, and languages spoken.</li>
                <li><strong>Professional Data:</strong> Job role preferences, expected salary, educational background, and work experience.</li>
                <li><strong>Technical Data:</strong> Device type, IP address, and basic log data required to secure your active session.</li>
              </ul>

              <p><strong>2. How We Use Your Information</strong></p>
              <p>We use this data strictly to operate the platform, including:</p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                <li>Creating your Digital Resume.</li>
                <li>Powering our automated "Blind Matching Engine" to connect candidates with relevant job requisitions.</li>
                <li>Sending transactional communications via Email or SMS (e.g., OTPs, interview requests, profile updates).</li>
              </ul>

              <p><strong>3. How We Share Your Information (The Blind Match)</strong></p>
              <p>We prioritize candidate privacy. When an employer posts a job, our system matches profiles based on skills and location.</p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                <li><strong>Blind Phase:</strong> Employers only see anonymized data (Candidate ID, experience level, education, and district). They do not see your name, exact address, email, or mobile number.</li>
                <li><strong>Unblind Phase:</strong> Only when an employer officially requests to connect with your profile, and the request is approved by our Admin team, will your direct contact information (Name, Email, and Mobile Number) be shared with that specific verified employer.</li>
              </ul>

              <p><strong>4. Data Deletion</strong></p>
              <p>Users reserve the right to delete their profiles at any time. Upon request, all personally identifiable information will be permanently removed from our active database.</p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>2. Terms of Service (For Candidates)</h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.75rem', color: '#94a3b8' }}>Effective Date: July 2, 2026</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p><strong>1. Acceptance of Terms</strong></p>
              <p>By logging in via Email OTP, you agree to these Terms of Service. You must be at least 18 years old to use this platform.</p>

              <p><strong>2. Accuracy of Information</strong></p>
              <p>You agree to provide truthful and accurate information regarding your identity, education, and work experience. Creating fake profiles or misrepresenting your qualifications will result in immediate account termination.</p>

              <p><strong>3. Our Role (No Guarantee of Employment)</strong></p>
              <p>This platform acts strictly as a digital bridge between job seekers and employers. We do not guarantee job placement, interview callbacks, or specific salary outcomes.</p>

              <p><strong>4. Assumption of Risk</strong></p>
              <p>We do not conduct background checks on every physical workplace. You are responsible for using your own judgment when communicating with employers, attending interviews, or accepting job offers. We are not liable for workplace conditions, unpaid wages, or disputes between you and the employer.</p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>3. Terms of Service (For Employers)</h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.75rem', color: '#94a3b8' }}>Effective Date: July 2, 2026</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p><strong>1. Account Verification</strong></p>
              <p>Registering on the platform allows you to log in instantly. However, full access to search and view candidate profiles remains subject to manual verification and approval by our Admin team. We reserve the right to reject, suspend, or revoke access to any employer account at our sole discretion, without prior notice.</p>

              <p><strong>2. Data Usage and Confidentiality</strong></p>
              <p>When a candidate profile is "unblinded" for your company:</p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                <li>You agree to use their contact information strictly for hiring purposes related to the specific job requisition.</li>
                <li>You are strictly prohibited from sharing, selling, or distributing candidate data to third parties, marketing agencies, or other external entities.</li>
              </ul>

              <p><strong>3. Fair Employment Practices</strong></p>
              <p>You agree to abide by all applicable local and national labor laws, including minimum wage requirements, workplace safety regulations, and anti-discrimination laws.</p>

              <p><strong>4. Jurisdiction</strong></p>
              <p>These Terms shall be governed by the laws of India. Any disputes arising from the use of this platform shall be subject to the exclusive jurisdiction of the courts in Coimbatore, Tamil Nadu.</p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>4. Cookie & Local Storage Policy</h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.75rem', color: '#94a3b8' }}>Effective Date: July 2, 2026</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p><strong>1. How We Use Local Storage</strong></p>
              <p>Unlike traditional websites that use cookies to track you across the internet for advertising, our platform primarily utilizes your browser's Local Storage for essential functionality only:</p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                <li><strong>Session Memory:</strong> We save your progress in the Profile Wizard so that if you accidentally close your browser, you can resume exactly where you left off.</li>
                <li><strong>Authentication:</strong> We store secure digital tokens (JWT) to keep you logged in safely without requiring an email OTP on every single page load.</li>
              </ul>

              <p><strong>2. Third-Party Tracking</strong></p>
              <p>We do not use third-party advertising cookies. Your data is not tracked for targeted marketing outside of our platform.</p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>5. Grievance Redressal Mechanism</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>In compliance with digital regulations, we are committed to addressing your concerns promptly. If you encounter fraudulent employers, experience technical issues, wish to report misuse of your data, or want to permanently delete your account, please contact our Grievance Officer.</p>
              <p><strong>Aram Fintech Concept</strong><br />Registered Office: Coimbatore, Tamil Nadu, India.</p>
              <p><strong>Email:</strong> grievance@aramftc.com</p>
              <p><strong>Response Time:</strong> We aim to acknowledge all grievances within 48 hours and resolve them within 15 business days.</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ border: 'none', background: '#059669', color: '#ffffff', borderRadius: '8px', padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
            Close & Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
