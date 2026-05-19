import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AUTH_API } from '../config/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }

    fetch(`${AUTH_API}/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [token]);

  const icon = { loading: '⏳', success: '✅', error: '❌' }[status];
  const heading = {
    loading: 'Verifying your email…',
    success: 'Email Verified!',
    error: 'Verification Failed',
  }[status];

  return (
    <div className="login-container py-5">
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <div
          className="card shadow-lg border-0 text-center"
          style={{ borderRadius: '1rem', width: '100%', maxWidth: '420px' }}
        >
          <div className="card-header bg-primary text-white">
            <h3 className="my-3">Email Verification</h3>
          </div>
          <div className="card-body p-4">
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>{icon}</div>
            <h5>{heading}</h5>
            {status !== 'loading' && (
              <p className="text-muted mt-2">{message}</p>
            )}

            {status === 'success' && (
              <Link to="/login" className="btn btn-primary mt-2">
                Go to Log In
              </Link>
            )}
            {status === 'error' && (
              <div className="mt-3">
                <p className="text-muted small">
                  Links expire after 24 hours. You can resend one from your dashboard after logging in.
                </p>
                <Link to="/login" className="btn btn-outline-primary btn-sm">
                  Back to Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
