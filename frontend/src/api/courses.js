import { API_BASE } from '../config/api';
import { getAccessToken } from '../utils/auth';

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJson(res) {
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

export function listCourses(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.level) qs.set('level', params.level);
  if (params.search) qs.set('search', params.search);

  const query = qs.toString();
  return fetch(`${API_BASE}/api/courses${query ? `?${query}` : ''}`).then(parseJson);
}

export function getCourse(slug) {
  return fetch(`${API_BASE}/api/courses/${slug}`, {
    headers: authHeaders(),
  }).then(parseJson);
}

export function listCategories() {
  return fetch(`${API_BASE}/api/courses/categories/list`).then(parseJson);
}

export function getMyEnrolledCourses() {
  return fetch(`${API_BASE}/api/courses/my/enrolled`, {
    headers: authHeaders(),
  }).then(parseJson);
}

export function enrollInCourse(slug) {
  return fetch(`${API_BASE}/api/courses/${slug}/enroll`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  }).then(parseJson);
}

export function unenrollFromCourse(slug) {
  return fetch(`${API_BASE}/api/courses/${slug}/unenroll`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  }).then(parseJson);
}
