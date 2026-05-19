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

// SIGNUP
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email and password'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  user.lastLogin = new Date();
  await user.save();

  // Send verification email (non-blocking)
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

// LOGIN
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Provide email and password'
    });
  }

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

  user.lastLogin = new Date();
  await user.save();

  const tokens = await issueAuthTokens(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: tokens
  });
});

// GET CURRENT USER
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('enrolledCourses', 'title description')
    .populate('createdCourses', 'title description');

  res.status(200).json({
    success: true,
    data: user
  });
});

// REFRESH TOKEN
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token required'
    });
  }

  const users = await User.find({});
  let user = null;

  for (let u of users) {
    if (await u.verifyRefreshToken(refreshToken)) {
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

// LOGOUT
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

// GOOGLE CALLBACK
const googleCallback = asyncHandler(async (req, res) => {
  const frontend = getFrontendUrl();

  const tokens = await issueAuthTokens(req.user);

  const url = new URL(`${frontend}/auth/callback`);

  url.searchParams.set('accessToken', tokens.accessToken);
  url.searchParams.set('refreshToken', tokens.refreshToken);

  res.redirect(url.toString());
});

// GOOGLE AUTH STATUS
const getGoogleAuthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      enabled: googleOAuthEnabled(),
    },
  });
};

// RESEND VERIFICATION
const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.emailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified.'
    });
  }

  const verifyToken = user.createEmailVerificationToken();

  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail(user.email, verifyToken);

  res.status(200).json({
    success: true,
    message: 'Verification email sent.'
  });
});

// VERIFY EMAIL
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required.'
    });
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Token is invalid or has expired.'
    });
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now log in.'
  });
});

// FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your email address.'
    });
  }

  const user = await User.findOne({
    email: email.toLowerCase()
  });

  // Prevent email enumeration
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    });
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
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Could not send reset email. Please try again later.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.'
  });
});

// RESET PASSWORD
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      success: false,
      message: 'Token and new password are required.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters.'
    });
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Token is invalid or has expired.'
    });
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You can now log in with your new password.'
  });
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