// backend/app.js
const express = require('express');
const dotenv = require('dotenv');
const passport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const cors = require('cors');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
