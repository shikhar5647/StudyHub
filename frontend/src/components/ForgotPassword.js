import React, { useState } from 'react';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AUTH_API } from '../config/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong.');
      setSent(true);
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
            <h3 className="my-3">Forgot Password</h3>
          </div>

          <div className="card-body p-4">
            {sent ? (
              <div className="text-center py-3">
                <div style={{ fontSize: '3rem' }}>📬</div>
                <h5 className="mt-3">Check your inbox!</h5>
                <p className="text-muted">
                  If an account exists for <strong>{email}</strong>, we've sent a
                  password reset link. It expires in <strong>1 hour</strong>.
                </p>
                <Link to="/login" className="btn btn-primary mt-2">
                  Back to Log In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-muted mb-3">
                  Enter your account email and we'll send you a link to reset your
                  password.
                </p>

                <div className="mb-3">
                  <label htmlFor="fp-email" className="form-label">
                    <FaEnvelope className="me-2" />
                    Email Address
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary py-2"
                    disabled={loading}
                  >
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </div>

                <div className="text-center mt-3">
                  <Link to="/login" className="text-muted small">
                    <FaArrowLeft className="me-1" />
                    Back to Log In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
