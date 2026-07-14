import { API_ROUTES } from '../api/routes';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

function getHeaders(token) {
  const effectiveToken = token || localStorage.getItem('candidate_token');
  return {
    'Content-Type': 'application/json',
    ...(effectiveToken ? { 'Authorization': `Bearer ${effectiveToken}` } : {}),
  };
}

export async function sendOtp(email) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.AUTH.SEND_OTP}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to send OTP');
  }
  return res.json();
}

export async function verifyOtp(email, otpCode) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.AUTH.VERIFY_OTP}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otpCode }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to verify OTP');
  }
  return res.json();
}

export async function resendOtp(email) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.AUTH.RESEND_OTP}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to resend OTP');
  }
  return res.json();
}

export async function saveWizardStep(candidateId, sectionIndex, updatedPayload, token) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.CANDIDATE.SAVE_STEP}`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ candidateId, sectionIndex, updatedPayload }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save wizard progress');
  }
  return res.json();
}

export async function finalizeWizard(candidateId, token) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.CANDIDATE.FINALIZE}`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ candidateId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to finalize candidate details');
  }
  return res.json();
}

export async function fetchCandidateProfile(candidateId, token) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.CANDIDATE.PROFILE(candidateId)}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load profile details');
  }
  return res.json();
}
