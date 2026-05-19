const express = require('express');
const router = express.Router();
const passport = require('passport');
const configurePassport = require('../config/passport');
const {
  signup,
  login,
  getMe,
  refreshToken,
  logout,
  googleCallback,
  googleAuthFailure,
  getGoogleAuthStatus,
  resendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const googleEnabled = configurePassport.googleOAuthEnabled;

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:3001';
}

// ----- Google OAuth -----
router.get('/google/status', getGoogleAuthStatus);

router.get('/google', (req, res, next) => {
  if (!googleEnabled()) {
    return res.status(503).json({
      success: false,
      message: 'Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env',
    });
  }
  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!googleEnabled()) {
      return res.redirect(`${getFrontendUrl()}/login?error=google_not_configured`);
    }
    next();
  },
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${getFrontendUrl()}/login?error=google_auth_failed`,
  }),
  googleCallback
);

// ----- Email/password auth -----
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

// ----- Email verification -----
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', protect, resendVerification);

// ----- Password reset -----
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
