// backend/controllers/authController.js
const User = require('../models/User');
const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const { issueAuthTokens } = require('../utils/issueAuthTokens');
const { googleOAuthEnabled } = require('../config/passport');
const { SIGNUP_ROLES } = require('../config/permissions');

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

  const tokens = await issueAuthTokens(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
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

module.exports = {
  signup,
  login,
  getMe,
  refreshToken,
  logout,
  googleCallback,
  getGoogleAuthStatus,
};
