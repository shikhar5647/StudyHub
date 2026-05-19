import { API_BASE } from '../config/api';
import { getAccessToken } from '../utils/auth';

function authHeaders(json = true) {
  const token = getAccessToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

async function parseJson(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function getSignupRoles() {
  return fetch(`${API_BASE}/api/users/roles`).then(parseJson);
}

export function getMyProfile() {
  return fetch(`${API_BASE}/api/users/me/profile`, {
    headers: authHeaders(false),
  }).then(parseJson);
}

export function listUsers() {
  return fetch(`${API_BASE}/api/users`, {
    headers: authHeaders(false),
  }).then(parseJson);
}

export function updateUserRole(userId, role) {
  return fetch(`${API_BASE}/api/users/${userId}/role`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  }).then(parseJson);
}
