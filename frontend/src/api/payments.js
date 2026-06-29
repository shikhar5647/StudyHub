import { API_BASE } from '../config/api';
import { authFetch } from '../utils/auth';

async function parseJson(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function createOrder(courseSlug) {
  return authFetch(`${API_BASE}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseSlug }),
  }).then(parseJson);
}

export function verifyPayment(payload) {
  return authFetch(`${API_BASE}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(parseJson);
}

export function getMyPayments() {
  return authFetch(`${API_BASE}/api/payments/my`).then(parseJson);
}

export function checkPaymentStatus(courseSlug) {
  return authFetch(`${API_BASE}/api/payments/check/${courseSlug}`).then(parseJson);
}
