import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE } from '../config/api';
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  saveAuthSession,
} from '../utils/auth';
import { hasRole } from '../utils/rbac';

export function useAuthUser({ roles = null } = {}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      toast.info('Please log in first');
      navigate('/login');
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || 'Failed to load profile');
        if (roles && !hasRole(data.data, ...roles)) {
          toast.error('You do not have access to this page');
          navigate('/dashboard');
          return;
        }
        setUser(data.data);
        saveAuthSession({ accessToken: token, user: data.data });
      })
      .catch((err) => {
        toast.error(err.message);
        clearAuthSession();
        navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [navigate, roles]);

  const logout = () => {
    clearAuthSession();
    toast.success('Logged out');
    navigate('/login');
  };

  return { user, loading, logout };
}
