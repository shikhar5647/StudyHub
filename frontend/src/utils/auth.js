import { API_BASE } from '../config/api';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export function saveAuthSession(payload) {
  if (!payload?.accessToken) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  if (payload.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
  }
  if (payload.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  }
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

let refreshPromise = null;

async function refreshAccessToken() {
  const rt = getRefreshToken();
  if (!rt) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  })
    .then(async (res) => {
      if (!res.ok) {
        clearAuthSession();
        return null;
      }
      const data = await res.json();
      saveAuthSession(data.data || data);
      return getAccessToken();
    })
    .catch(() => {
      clearAuthSession();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function authFetch(url, options = {}) {
  let token = getAccessToken();
  if (token) {
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  }

  let res = await fetch(url, options);

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      options.headers = { ...options.headers, Authorization: `Bearer ${newToken}` };
      res = await fetch(url, options);
    } else {
      window.dispatchEvent(new Event('auth:expired'));
    }
  }

  return res;
}
