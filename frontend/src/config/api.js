export const API_BASE =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AUTH_API = `${API_BASE}/api/auth`;

export const GOOGLE_AUTH_URL = `${AUTH_API}/google`;
