// backend/controllers/authController.js
const User = require('../models/User');
const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const { issueAuthTokens } = require('../utils/issueAuthTokens');
const { googleOAuthEnabled } = require('../config/passport');
const { SIGNUP_ROLES } = require('../config/permissions');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:3001';
}


// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role: requestedRole } = req.body;
  const role = SIGNUP_ROLES.includes(requestedRole) ? requestedRole : 'student';

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email and password'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  if (requestedRole === 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Admin accounts cannot be created via public signup',
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // Send email verification (non-blocking — don't fail signup if email fails)
  try {
    const verifyToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(email, verifyToken);
  } catch (emailErr) {
    console.error('Failed to send verification email:', emailErr.message);
  }

  const tokens = await issueAuthTokens(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    data: tokens
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (!user.password) {
    return res.status(401).json({
      success: false,
      message: 'This account uses Google sign-in. Please continue with Google.'
    });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const tokens = await issueAuthTokens(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: tokens
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  // Find user with this refresh token
  const users = await User.find({});
  let user = null;

  for (const u of users) {
    const isValid = await u.revokeRefreshToken(refreshToken);
    if (isValid) {
      user = u;
      break;
    }
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }

  // Generate new tokens
  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = crypto.randomBytes(40).toString('hex');
  await user.addRefreshToken(newRefreshToken);

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await req.user.revokeRefreshToken(refreshToken);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Google OAuth callback — issue JWT and redirect to frontend
// @route   GET /api/auth/google/callback
const googleCallback = asyncHandler(async (req, res) => {
  const frontend = getFrontendUrl();
  const tokens = await issueAuthTokens(req.user);
  const url = new URL(`${frontend}/auth/callback`);
  url.searchParams.set('accessToken', tokens.accessToken);
  url.searchParams.set('refreshToken', tokens.refreshToken);
  res.redirect(url.toString());
});

const getGoogleAuthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      enabled: googleOAuthEnabled(),
    },
  });
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.emailVerified) {
    return res.status(400).json({ success: false, message: 'Email is already verified.' });
  }

  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(user.email, verifyToken);

  res.status(200).json({ success: true, message: 'Verification email sent.' });
});

// @desc    Verify email with token from link
// @route   GET /api/auth/verify-email?token=xxx
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required.' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Token is invalid or has expired.' });
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
});

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide your email address.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond with success to prevent email enumeration
  if (!user) {
    return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  }

  if (!user.password) {
    return res.status(400).json({
      success: false,
      message: 'This account uses Google sign-in and does not have a password to reset.',
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch (emailErr) {
    // Clean up the token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ success: false, message: 'Could not send reset email. Please try again later.' });
  }

  res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
});

// @desc    Reset password using token from email link
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and new password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Token is invalid or has expired.' });
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successful. You can now log in with your new password.' });
});

module.exports = {
  signup,
  login,
  getMe,
  refreshToken,
  logout,
  googleCallback,
  getGoogleAuthStatus,
  resendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
