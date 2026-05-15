import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';

import { AUTH_API } from '../config/api';
import { saveAuthSession } from '../utils/auth';
import GoogleSignInButton from './GoogleSignInButton';

const AUTH_ERRORS = {
  google_auth_failed: 'Google sign-in was cancelled or failed.',
  google_not_configured: 'Google sign-in is not configured on the server.',
};

const Login = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = searchParams.get('error');
    if (code && AUTH_ERRORS[code]) {
      toast.error(AUTH_ERRORS[code]);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const updateFormData = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const errors = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      saveAuthSession(data.data);

      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container py-5">
      <div className="container d-flex justify-content-center align-items-center" style={{ width: '360px', height: '576px' }}>
        <div className="card shadow-lg border-0" style={{ borderRadius: '1rem', width: '100%' }}>
          <div className="card-header text-left bg-primary text-white">
            <h3 className="my-3">Log In</h3>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  <FaEnvelope className="me-2" /> Email Address
                </label>
                <input
                  type="email"
                  className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={updateFormData}
                  placeholder="you@example.com"
                  required
                />
                {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  <FaLock className="me-2" /> Password
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={updateFormData}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formErrors.password && <div className="text-danger">{formErrors.password}</div>}
              </div>

              {/* Submit */}
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary py-2" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </div>

              <div className="position-relative my-4 text-center">
                <hr />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">
                  or
                </span>
              </div>

              <GoogleSignInButton label="Sign in with Google" />

              {/* Signup link */}
              <div className="text-left mt-3">
                <p>Don't have an account? <a href="/signup" className="text-primary">Sign up</a></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

