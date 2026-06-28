const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('adminToken');
}

export function setAuthToken(token) {
  if (token) localStorage.setItem('adminToken', token);
  else localStorage.removeItem('adminToken');
}

export function getStoredUser() {
  const raw = localStorage.getItem('adminUser');
  return raw ? JSON.parse(raw) : null;
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

export async function apiFetch(path, options = {}, role = null) {
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

  if (response.status === 401) {
    logout();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export async function login(email, password) {
  const data = await apiFetch('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.token);
  setStoredUser(data.user);
  return data.user;
}

export async function fetchMe() {
  const data = await apiFetch('/api/admin/auth/me');
  setStoredUser(data.user);
  return data.user;
}

export { API_BASE_URL, rolePrefix };
