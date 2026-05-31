import { API_BASE } from '../config/api';
import { getAccessToken } from '../utils/auth';

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJson(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function getStudentAnalytics() {
  return fetch(`${API_BASE}/api/users/me/analytics`, {
    headers: authHeaders(),
  }).then(parseJson);
}

export function getInstructorOverview() {
  return fetch(`${API_BASE}/api/users/me/instructor-analytics`, {
    headers: authHeaders(),
  }).then(parseJson);
}

export function getCourseAnalytics(slugOrId) {
  return fetch(`${API_BASE}/api/courses/${slugOrId}/analytics`, {
    headers: authHeaders(),
  }).then(parseJson);
}
