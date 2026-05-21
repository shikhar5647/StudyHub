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

export function listDiscussions(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${API_BASE}/api/discussions${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(false),
  }).then(parseJson);
}

export function getDiscussion(slug) {
  return fetch(`${API_BASE}/api/discussions/${slug}`, {
    headers: authHeaders(false),
  }).then(parseJson);
}

export function createDiscussion(data) {
  return fetch(`${API_BASE}/api/discussions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(parseJson);
}

export function updateDiscussion(slug, data) {
  return fetch(`${API_BASE}/api/discussions/${slug}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(parseJson);
}

export function deleteDiscussion(slug) {
  return fetch(`${API_BASE}/api/discussions/${slug}`, {
    method: 'DELETE',
    headers: authHeaders(false),
  }).then(parseJson);
}

export function voteDiscussion(slug, vote) {
  return fetch(`${API_BASE}/api/discussions/${slug}/vote`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ vote }),
  }).then(parseJson);
}

export function getDiscussionComments(slug, sort = 'best') {
  return fetch(`${API_BASE}/api/discussions/${slug}/comments?sort=${sort}`, {
    headers: authHeaders(false),
  }).then(parseJson);
}

export function createComment(slug, data) {
  return fetch(`${API_BASE}/api/discussions/${slug}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(parseJson);
}

export function updateComment(slug, commentId, data) {
  return fetch(`${API_BASE}/api/discussions/${slug}/comments/${commentId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(parseJson);
}

export function deleteComment(slug, commentId) {
  return fetch(`${API_BASE}/api/discussions/${slug}/comments/${commentId}`, {
    method: 'DELETE',
    headers: authHeaders(false),
  }).then(parseJson);
}

export function voteComment(slug, commentId, vote) {
  return fetch(`${API_BASE}/api/discussions/${slug}/comments/${commentId}/vote`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ vote }),
  }).then(parseJson);
}

export function acceptComment(slug, commentId) {
  return fetch(`${API_BASE}/api/discussions/${slug}/comments/${commentId}/accept`, {
    method: 'POST',
    headers: authHeaders(false),
  }).then(parseJson);
}

export function getCategories() {
  return fetch(`${API_BASE}/api/discussions/categories`).then(parseJson);
}

export function getPopularTags() {
  return fetch(`${API_BASE}/api/discussions/tags/popular`).then(parseJson);
}
