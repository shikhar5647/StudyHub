const dotenv = require('dotenv');
dotenv.config();             // ✅ load .env first
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const storageRoutes = require('./routes/storage');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const discussionRoutes = require('./routes/discussions');

require('./config/passport')(passport); // call the function and pass passport

const app = express();

// ---------------- Security & Rate Limit ----------------
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ---------------- CORS ----------------
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ---------------- Body Parser ----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------- Session Middleware ----------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat', // change to a strong secret in prod
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set true if using HTTPS
}));

// ---------------- Passport ----------------
app.use(passport.initialize());
app.use(passport.session()); // ✅ needed for session support

// ---------------- Routes ----------------
app.use('/api/auth', authRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/discussions', discussionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'StudyHub API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
