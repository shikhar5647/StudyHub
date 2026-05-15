import React, { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { API_BASE, GOOGLE_AUTH_URL } from '../config/api';

const GoogleSignInButton = ({ label = 'Continue with Google' }) => {
  const [enabled, setEnabled] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/auth/google/status`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setEnabled(Boolean(data?.data?.enabled));
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (enabled === false) return null;

  return (
    <button
      type="button"
      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
      disabled={enabled === null}
      onClick={() => {
        window.location.href = GOOGLE_AUTH_URL;
      }}
    >
      <FcGoogle size={22} />
      {enabled === null ? 'Loading Google sign-in…' : label}
    </button>
  );
};

export default GoogleSignInButton;
