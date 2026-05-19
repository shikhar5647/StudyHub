const User = require('../models/User');
const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const { issueAuthTokens } = require('../utils/issueAuthTokens');
const { googleOAuthEnabled } = require('../config/passport');
<<<<<<< Updated upstream
const { SIGNUP_ROLES } = require('../config/permissions');
=======

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:3001';
}
>>>>>>> Stashed changes

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:3001';
}

// SIGNUP
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
  if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

  const user = await User.create({ name, email, password, role });

<<<<<<< Updated upstream
  const accessToken = user.generateAccessToken();
  const refreshToken = crypto.randomBytes(40).toString('hex');
  await user.addRefreshToken(refreshToken);

  user.lastLogin = new Date();
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({ success: true, message: 'User registered', data: { user: userResponse, accessToken, refreshToken } });
=======
  const tokens = await issueAuthTokens(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: tokens
  });
>>>>>>> Stashed changes
});

// LOGIN
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password' });

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

<<<<<<< Updated upstream
  const valid = await user.comparePassword(password);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const accessToken = user.generateAccessToken();
  const refreshToken = crypto.randomBytes(40).toString('hex');
  await user.addRefreshToken(refreshToken);

  user.lastLogin = new Date();
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({ success: true, message: 'Login successful', data: { user: userResponse, accessToken, refreshToken } });
=======
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
>>>>>>> Stashed changes
});

// GET CURRENT USER
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('enrolledCourses', 'title description')
    .populate('createdCourses', 'title description');
  res.status(200).json({ success: true, data: user });
});

// REFRESH TOKEN
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

  const users = await User.find({});
  let user = null;
  for (let u of users) {
    if (await u.verifyRefreshToken(refreshToken)) {
      user = u;
      break;
    }
  }
  if (!user) return res.status(401).json({ success: false, message: 'Invalid refresh token' });

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = crypto.randomBytes(40).toString('hex');
  await user.addRefreshToken(newRefreshToken);

  res.status(200).json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
});

// LOGOUT
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await req.user.revokeRefreshToken(refreshToken);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

<<<<<<< Updated upstream
module.exports = { signup, login, getMe, refreshToken, logout };
=======
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
>>>>>>> Stashed changes
