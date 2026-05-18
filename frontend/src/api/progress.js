import { API_BASE } from '../config/api';
import { getAccessToken } from '../utils/auth';

function authHeaders(json = true) {
  const headers = { Authorization: `Bearer ${getAccessToken()}` };
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

async function parseJson(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function getMyProgress() {
  return fetch(`${API_BASE}/api/courses/my/progress`, {
    headers: authHeaders(false),
  }).then(parseJson);
}

export function getCourseProgress(slug) {
  return fetch(`${API_BASE}/api/courses/${slug}/progress`, {
    headers: authHeaders(false),
  }).then(parseJson);
}

export function markLessonComplete(slug, lessonId) {
  return fetch(
    `${API_BASE}/api/courses/${slug}/progress/lessons/${encodeURIComponent(lessonId)}/complete`,
    { method: 'POST', headers: authHeaders(false) }
  ).then(parseJson);
}

export function setLastLesson(slug, lessonId) {
  return fetch(`${API_BASE}/api/courses/${slug}/progress/last`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ lessonId }),
  }).then(parseJson);
}
