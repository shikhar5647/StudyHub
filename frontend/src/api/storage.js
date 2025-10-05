const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function uploadCourseFile({ token, file, courseSlug, subfolder }) {
  const form = new FormData();
  form.append('file', file);
  form.append('courseSlug', courseSlug);
  if (subfolder) form.append('subfolder', subfolder);

  return fetch(`${API_BASE}/api/storage/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  }).then(r => r.json());
}

export function listCourseFiles({ token, courseSlug, prefix }) {
  const params = new URLSearchParams();
  params.set('courseSlug', courseSlug);
  if (prefix) params.set('prefix', prefix);

  return fetch(`${API_BASE}/api/storage/list?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
}

export function signCourseFile({ token, key, expiresInSec = 3600 }) {
  return fetch(`${API_BASE}/api/storage/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ key, expiresInSec })
  }).then(r => r.json());
}

export function deleteCourseFile({ token, key }) {
  return fetch(`${API_BASE}/api/storage/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ key })
  }).then(r => r.json());
}


