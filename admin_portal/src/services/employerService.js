import { apiFetch } from '../api';
import { API_ROUTES } from '../api/routes';

export async function listEmployers(statusFilter = '') {
  const path = statusFilter 
    ? `${API_ROUTES.ADMIN.EMPLOYERS}?status=${statusFilter}` 
    : API_ROUTES.ADMIN.EMPLOYERS;
  return apiFetch(path);
}

export async function createEmployer(payload) {
  return apiFetch(API_ROUTES.ADMIN.EMPLOYERS, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateEmployerStatus(employerId, status) {
  return apiFetch(API_ROUTES.ADMIN.EMPLOYER_STATUS(employerId), {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function fetchEmployerJobs(employerId) {
  return apiFetch(API_ROUTES.ADMIN.EMPLOYER_JOBS(employerId));
}
