import { API_ROUTES } from '../api/routes';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

function getHeaders() {
  const token = localStorage.getItem('employer_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function signUpEmployer(companyName, email, phoneNumber, password) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.EMPLOYER.SIGNUP}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName, email, phoneNumber, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Signup failed');
  }
  return res.json();
}

export async function logInEmployer(identifier, password) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.EMPLOYER.LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }
  return res.json();
}

export async function createJobRequisition(employerId, payload) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.EMPLOYER.JOBS}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ employerId, jobs: payload }),
  });
  return res;
}

export async function fetchEmployerOrders(employerId) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.EMPLOYER.ORDERS(employerId)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch orders');
  }
  return res.json();
}

export async function updateEmployerOrder(orderId, payload) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.EMPLOYER.ORDER_BY_ID(orderId)}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update order');
  }
  return res.json();
}

export async function deleteEmployerOrder(orderId) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.EMPLOYER.ORDER_BY_ID(orderId)}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete order');
  }
  return res.json();
}

export async function fetchEmployerProfile() {
  const res = await fetch(`${BASE_URL}${API_ROUTES.EMPLOYER.PROFILE}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch profile');
  }
  return res.json();
}

export async function saveEmployerProfile(profileData) {
  const res = await fetch(`${BASE_URL}${API_ROUTES.EMPLOYER.PROFILE}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update profile');
  }
  return res.json();
}
