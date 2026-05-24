const app = require('../app');
const connectDB = require('../db');

// Connect to DB immediately when this serverless function boots up
connectDB();

// Export the express app as a serverless function
module.exports = app;
