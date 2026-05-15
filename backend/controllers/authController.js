// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');


// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;

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

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = crypto.randomBytes(40).toString('hex');
  await user.addRefreshToken(refreshToken);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userResponse,
      accessToken,
      refreshToken
    }
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

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = crypto.randomBytes(40).toString('hex');
  await user.addRefreshToken(refreshToken);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      accessToken,
      refreshToken
    }
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

module.exports = {
  signup,
  login,
  getMe,
  refreshToken,
  logout
};
