import { API_BASE } from '../config/api';
import { authFetch } from '../utils/auth';

async function parseJson(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function getStudentAnalytics() {
  return authFetch(`${API_BASE}/api/users/me/analytics`).then(parseJson);
}

export function getInstructorOverview() {
  return authFetch(`${API_BASE}/api/users/me/instructor-analytics`).then(parseJson);
}

export function getCourseAnalytics(slugOrId) {
  return authFetch(`${API_BASE}/api/courses/${slugOrId}/analytics`).then(parseJson);
}
