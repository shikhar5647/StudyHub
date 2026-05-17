import React, { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AUTH_API } from '../config/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!token) {
      toast.error('Reset token is missing. Please use the link from your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong.');
      setDone(true);
      toast.success('Password reset! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container py-5">
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <div
          className="card shadow-lg border-0"
          style={{ borderRadius: '1rem', width: '100%', maxWidth: '420px' }}
        >
          <div className="card-header text-left bg-primary text-white">
            <h3 className="my-3">Reset Password</h3>
          </div>

          <div className="card-body p-4">
            {done ? (
              <div className="text-center py-3">
                <div style={{ fontSize: '3rem' }}>✅</div>
                <h5 className="mt-3">Password Updated!</h5>
                <p className="text-muted">
                  Redirecting you to the login page…
                </p>
              </div>
            ) : !token ? (
              <div className="text-center py-3">
                <div style={{ fontSize: '3rem' }}>❌</div>
                <h5 className="mt-3">Invalid Link</h5>
                <p className="text-muted">
                  This reset link is invalid or has expired.
                </p>
                <Link to="/forgot-password" className="btn btn-primary mt-2">
                  Request a new link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-muted mb-3">Enter your new password below.</p>

                {/* New Password */}
                <div className="mb-3">
                  <label htmlFor="rp-password" className="form-label">
                    <FaLock className="me-2" />
                    New Password
                  </label>
                  <div className="input-group">
                    <input
                      id="rp-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                  <label htmlFor="rp-confirm" className="form-label">
                    <FaLock className="me-2" />
                    Confirm Password
                  </label>
                  <input
                    id="rp-confirm"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary py-2"
                    disabled={loading}
                  >
                    {loading ? 'Saving…' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
