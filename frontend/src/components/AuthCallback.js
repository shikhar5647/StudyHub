import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE } from '../config/api';
import { saveAuthSession } from '../utils/auth';
import { dashboardPathForRole } from '../utils/rbac';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    if (!accessToken) {
      toast.error('Missing sign-in token. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    const finishLogin = async () => {
      try {
        saveAuthSession({ accessToken, refreshToken });

        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Could not load profile');

        saveAuthSession({
          accessToken,
          refreshToken,
          user: data.data,
        });

        toast.success('Signed in with Google!');
        navigate(dashboardPathForRole(data.data?.role), { replace: true });
      } catch (err) {
        toast.error(err.message);
        navigate('/login', { replace: true });
      }
    };

    finishLogin();
  }, [navigate, searchParams]);

  return (
    <div className="container py-5 text-center">
      <p>Completing Google sign-in…</p>
    </div>
  );
};

export default AuthCallback;
