import { apiFetch } from '../api';
import { API_ROUTES } from '../api/routes';

export async function listCandidatesAdmin(query = '') {
  const path = query ? `${API_ROUTES.ADMIN.CANDIDATES}?${query}` : API_ROUTES.ADMIN.CANDIDATES;
  return apiFetch(path);
}

export async function listCandidatesSubAdmin(query = '') {
  const path = query ? `${API_ROUTES.SUB_ADMIN.CANDIDATES}?${query}` : API_ROUTES.SUB_ADMIN.CANDIDATES;
  return apiFetch(path);
}

export async function listCandidateDuplicates() {
  return apiFetch(API_ROUTES.ADMIN.CANDIDATE_DUPLICATES);
}

export async function fetchCandidateAdmin(id) {
  return apiFetch(API_ROUTES.ADMIN.CANDIDATE_BY_ID(id));
}

export async function createCandidateSubAdmin(data) {
  return apiFetch(API_ROUTES.SUB_ADMIN.CANDIDATES, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function assignCandidates({ candidateIds, subAdminId, subAdminIds, strategy }) {
  return apiFetch(API_ROUTES.ADMIN.CANDIDATE_ASSIGN, {
    method: 'POST',
    body: JSON.stringify({ candidateIds, subAdminId, subAdminIds, strategy }),
  });
}

export async function updateCandidateAdmin(id, data) {
  return apiFetch(API_ROUTES.ADMIN.CANDIDATE_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateCandidateSubAdmin(id, data) {
  return apiFetch(API_ROUTES.SUB_ADMIN.CANDIDATE_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateCandidateStatusAdmin(id, statusPayload) {
  return apiFetch(API_ROUTES.ADMIN.CANDIDATE_STATUS(id), {
    method: 'PUT',
    body: JSON.stringify(statusPayload),
  });
}

export async function updateCandidateStatusSubAdmin(id, statusPayload) {
  return apiFetch(API_ROUTES.SUB_ADMIN.CANDIDATE_STATUS(id), {
    method: 'PUT',
    body: JSON.stringify(statusPayload),
  });
}

export async function fetchCandidateNotes(id) {
  return apiFetch(API_ROUTES.SUB_ADMIN.CANDIDATE_NOTES(id));
}

export async function addCandidateNote(id, noteData) {
  return apiFetch(API_ROUTES.SUB_ADMIN.CANDIDATE_NOTES(id), {
    method: 'POST',
    body: JSON.stringify(noteData),
  });
}

export async function fetchJobMatches(jobId) {
  return apiFetch(API_ROUTES.ADMIN.JOB_MATCHES(jobId));
}
