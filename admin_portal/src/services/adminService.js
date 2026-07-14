import { apiFetch } from '../api';
import { API_ROUTES } from '../api/routes';

export async function logInAdmin(email, password) {
  return apiFetch(API_ROUTES.ADMIN.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function changePassword(oldPassword, newPassword) {
  return apiFetch(API_ROUTES.ADMIN.AUTH.CHANGE_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function listSubAdmins() {
  return apiFetch(API_ROUTES.ADMIN.SUB_ADMINS);
}

export async function listAdmins() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ADMINS);
}

export async function fetchSubAdminStats() {
  return apiFetch(API_ROUTES.SUB_ADMIN.ME_STATS);
}

export async function fetchSmtpStatus() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.SMTP_STATUS);
}

export async function createAdmin(data) {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ADMINS, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createSubAdmin(data) {
  return apiFetch(API_ROUTES.SUPER_ADMIN.SUB_ADMINS, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdmin(id, data) {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ADMIN_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateSubAdmin(id, data) {
  return apiFetch(API_ROUTES.SUPER_ADMIN.SUB_ADMIN_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function activateAdmin(id) {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ADMIN_ACTIVATE(id), {
    method: 'PUT',
  });
}

export async function deactivateAdmin(id) {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ADMIN_DEACTIVATE(id), {
    method: 'PUT',
  });
}

export async function activateSubAdmin(id) {
  return apiFetch(API_ROUTES.SUPER_ADMIN.SUB_ADMIN_ACTIVATE(id), {
    method: 'PUT',
  });
}

export async function deactivateSubAdmin(id, bodyData) {
  return apiFetch(API_ROUTES.SUPER_ADMIN.SUB_ADMIN_DEACTIVATE(id), {
    method: 'PUT',
    body: bodyData ? JSON.stringify(bodyData) : undefined,
  });
}

export async function deleteAdmin(id) {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ADMIN_BY_ID(id), {
    method: 'DELETE',
  });
}

export async function deleteSubAdmin(id) {
  return apiFetch(API_ROUTES.SUPER_ADMIN.SUB_ADMIN_BY_ID(id), {
    method: 'DELETE',
  });
}
