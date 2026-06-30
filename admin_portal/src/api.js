const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Token Management ─────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('adminToken');
}

export function setAuthToken(token) {
  if (token) localStorage.setItem('adminToken', token);
  else localStorage.removeItem('adminToken');
}

/**
 * Decode a JWT payload without verifying the signature.
 * Used client-side only to check expiration before making API calls.
 */
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Check if the stored token is expired or about to expire (within 5 min buffer).
 * Returns true if the token is still valid.
 */
function isTokenValid() {
  const token = getToken();
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;

  const bufferSec = 5 * 60; // 5 minute buffer
  return decoded.exp > (Date.now() / 1000) + bufferSec;
}

// ─── User Storage ──────────────────────────────────────────────────────

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('adminUser');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // 🛡️ Basic type check to prevent JSON injection
    if (!parsed || typeof parsed !== 'object' || !parsed.id || !parsed.role) {
      localStorage.removeItem('adminUser');
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem('adminUser');
    return null;
  }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem('adminUser', JSON.stringify(user));
  else localStorage.removeItem('adminUser');
}

export function logout() {
  setAuthToken(null);
  setStoredUser(null);
}

function rolePrefix(role) {
  if (role === 'SUB_ADMIN') return '/api/sub-admin';
  if (role === 'SUPER_ADMIN') return '/api/super-admin';
  return '/api/admin';
}

// ─── API Fetch Wrapper ─────────────────────────────────────────────────

export async function apiFetch(path, options = {}, role = null) {
  // 🛡️ Check token validity before making requests
  if (!isTokenValid()) {
    logout();
    throw new Error('Session expired. Please log in again.');
  }

  const user = getStoredUser();
  const effectiveRole = role || user?.role;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error('Session expired or insufficient permissions. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

// ─── Auth Functions ────────────────────────────────────────────────────

export async function login(email, password) {
  // Login doesn't require an existing valid token
  const headers = { 'Content-Type': 'application/json' };
  const url = `${API_BASE_URL}/api/admin/auth/login`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  setAuthToken(data.token);
  setStoredUser(data.user);
  return data.user;
}

export async function fetchMe() {
  const data = await apiFetch('/api/admin/auth/me');
  setStoredUser(data.user);
  return data.user;
}

export { API_BASE_URL, rolePrefix, isTokenValid };
