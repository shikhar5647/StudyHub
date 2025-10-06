const express = require('express');
const router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/User'); // import User model
const { signup, login, getMe, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ---------------- Google OAuth ----------------
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const profile = req.user;

      // Safe access to email and avatar
      const email = profile.emails?.[0]?.value || `noemail-${profile.id}@google.com`;
      const avatar = profile.photos?.[0]?.value || 'https://via.placeholder.com/150';
      const emailVerified = profile.emails?.[0]?.verified || false;
      const displayName = profile.displayName || 'No Name';

      // Find existing user by Google ID
      let user = await User.findOne({ 'providers.google.id': profile.id });

      if (!user) {
        // Check if a user already exists with the same email
        user = await User.findOne({ email });

        if (!user) {
          // Create new user if doesn't exist
          user = await User.create({
            name: displayName,
            email,
            avatar,
            role: 'student',
            providers: {
              google: {
                id: profile.id,
                emailVerified
              }
            }
          });
        } else {
          // Link Google provider to existing account
          user.providers.google = {
            id: profile.id,
            emailVerified
          };
          await user.save();
        }
      }

      // Generate JWT tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = crypto.randomBytes(40).toString('hex');
      await user.addRefreshToken(refreshToken);

      // Redirect to frontend with tokens in query
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (err) {
      console.error('Google OAuth error:', err);
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// ---------------- Auth routes ----------------
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

module.exports = router;
