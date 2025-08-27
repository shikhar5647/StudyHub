// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('./models/user'); // adjust path if needed

// Attach user to req.user if access token valid
// Token sources supported: Authorization header "Bearer <token>" or cookie "accessToken"
const protect = async (req, res, next) => {
  try {
    let token;

    // 1) Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2) fallback to cookie (useful if you set httpOnly cookie)
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Token missing.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Attach user (without sensitive fields)
    const user = await User.findById(decoded.sub).select('-password -refreshTokens -emailVerificationToken -passwordResetToken');
    if (!user) return res.status(401).json({ message: 'User not found (token invalid)' });

    req.user = user;
    next();
  } catch (err) {
    // if token expired or invalid, jwt.verify will throw — forward as 401
    return res.status(401).json({ message: 'Authentication failed', error: err.message });
  }
};

module.exports = { protect };
