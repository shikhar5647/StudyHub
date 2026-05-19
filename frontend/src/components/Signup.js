import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';

import { AUTH_API } from '../config/api';
import { saveAuthSession } from '../utils/auth';
import { dashboardPathForRole } from '../utils/rbac';
import { getSignupRoles } from '../api/users';
import GoogleSignInButton from './GoogleSignInButton';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [signupRoles, setSignupRoles] = useState([
    { id: 'student', label: 'Student' },
    { id: 'instructor', label: 'Course Instructor' },
  ]);

  useEffect(() => {
    getSignupRoles()
      .then((res) => {
        if (res.data?.length) setSignupRoles(res.data);
      })
      .catch(() => { });
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateFormData = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${AUTH_API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Signup failed');

      saveAuthSession(data.data);

      toast.success('Account created successfully!');
      navigate(dashboardPathForRole(data.data?.user?.role || formData.role));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0" style={{ borderRadius: '1rem' }}>
              <div className="card-header text-center bg-primary text-white">
                <h3 className="my-3">Create Your Account</h3>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      <FaUser className="me-2" /> Full Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={updateFormData}
                      placeholder="Enter your name"
                      required
                    />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>

                  {/* Account type */}
                  <div className="mb-3">
                    <label className="form-label">I want to join as</label>
                    <div className="d-flex flex-column gap-2">
                      {signupRoles.map((r) => (
                        <label key={r.id} className="form-check border rounded p-2">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="role"
                            value={r.id}
                            checked={formData.role === r.id}
                            onChange={updateFormData}
                          />
                          <span className="form-check-label ms-1">{r.label}</span>
                        </label>
                      ))}
                    </div>
                    <p className="form-text small text-muted">
                      Students enroll in courses. Instructors create and manage courses.
                    </p>
                  </div>

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
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={updateFormData}
                        placeholder="Create a password"
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

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      <FaLock className="me-2" /> Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={updateFormData}
                        placeholder="Confirm password"
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && <div className="text-danger">{formErrors.confirmPassword}</div>}
                  </div>

                  {/* Submit */}
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary py-2" disabled={loading}>
                      {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                  </div>

                  <div className="position-relative my-4 text-center">
                    <hr />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">
                      or
                    </span>
                  </div>

                  <GoogleSignInButton label="Sign up with Google" />

                  {/* Login link */}
                  <div className="text-center mt-3">
                    <p>Already have an account? <a href="/login" className="text-primary">Log in</a></p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
