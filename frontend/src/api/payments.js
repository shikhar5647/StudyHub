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

export function createOrder(courseSlug) {
  return fetch(`${API_BASE}/api/payments/create-order`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ courseSlug }),
  }).then(parseJson);
}

export function verifyPayment(payload) {
  return fetch(`${API_BASE}/api/payments/verify`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then(parseJson);
}

export function getMyPayments() {
  return fetch(`${API_BASE}/api/payments/my`, {
    headers: authHeaders(false),
  }).then(parseJson);
}

export function checkPaymentStatus(courseSlug) {
  return fetch(`${API_BASE}/api/payments/check/${courseSlug}`, {
    headers: authHeaders(false),
  }).then(parseJson);
}
