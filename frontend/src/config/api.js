// In production on Vercel, API is same-origin at /api so API_BASE is empty string.
// Locally, point to the backend dev server.
export const API_BASE =
  process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001');

export const AUTH_API = `${API_BASE}/api/auth`;

export const GOOGLE_AUTH_URL = `${AUTH_API}/google`;
