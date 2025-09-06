const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  signup,
  login,
  getMe,
  refreshToken,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// ----- Google OAuth -----
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => res.send("✅ Login Successful via Google!")
);

// ----- Auth Routes -----
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

module.exports = router;
