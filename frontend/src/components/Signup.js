import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  
  const updateFormData = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate password as user types
    if (name === 'password') {
      validatePassword(value);
    }
    
    // Clear individual field error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validatePassword = (password) => {
    // Check password strength
    let strength = 0;
    const regexes = {
      length: /.{5,}/,
      upper: /[A-Z]/,
      lower: /[a-z]/,
      number: /[0-9]/,
      special: /[^A-Za-z0-9]/
    };
    
    Object.values(regexes).forEach(regex => {
      if (regex.test(password)) strength++;
    });
    
    let strengthText = '';
    let strengthColor = '';
    
    if (strength < 2) {
      strengthText = 'Weak';
      strengthColor = 'text-danger';
    } else if (strength < 4) {
      strengthText = 'Medium';
      strengthColor = 'text-warning';
    } else {
      strengthText = 'Strong';
      strengthColor = 'text-success';
    }
    
    setPasswordStrength({ text: strengthText, color: strengthColor });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Form validation
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 5) {
      errors.password = 'Password must be at least 5 characters long';
    } else if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password) || !/[^a-zA-Z0-9]/.test(formData.password)) {
      errors.password = 'Password must include letters, numbers, and special characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }
    
    // Here you would normally submit to your backend
    setTimeout(() => {
      toast.success('Account created successfully! You can now log in.');
      setLoading(false);
      navigate('/dashboard'); // Redirect to dashboard or login
    }, 1500);
  };
  
  return (
    <div className="signup-container py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0" style={{borderRadius: '1rem'}}>
              <div className="card-header text-center bg-primary text-white">
                <h3 className="my-3">Create Your Account</h3>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Name Field */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      <FaUser className="me-2" />
                      Full Name
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
                    {formErrors.name && (
                      <div className="invalid-feedback">{formErrors.name}</div>
                    )}
                  </div>
                  
                  {/* Email Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <FaEnvelope className="me-2" />
                      Email Address
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
                    {formErrors.email && (
                      <div className="invalid-feedback">{formErrors.email}</div>
                    )}
                  </div>
                  
                  {/* Password Field */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      <FaLock className="me-2" />
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={updateFormData}
                        placeholder="Create a strong password"
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
                    {passwordStrength && (
                      <div className={`mt-1 ${passwordStrength.color}`}>
                        Password strength: {passwordStrength.text}
                      </div>
                    )}
                    {formErrors.password && (
                      <div className="text-danger">{formErrors.password}</div>
                    )}
                  </div>
                  
                  {/* Confirm Password Field */}
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      <FaLock className="me-2" />
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={updateFormData}
                        placeholder="Confirm your password"
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
                    {formErrors.confirmPassword && (
                      <div className="text-danger">{formErrors.confirmPassword}</div>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary py-2" 
                      disabled={loading}
                    >
                      {loading ? (
                        <span>Creating your account...</span>
                      ) : (
                        <span>Sign Up</span>
                      )}
                    </button>
                  </div>
                  
                  {/* Login Link */}
                  <div className="text-center mt-3">
                    <p>Already have an account? <a href="#" className="text-primary">Log in</a></p>
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