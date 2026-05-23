// Vercel serverless entry point — wraps the Express app
const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  await mongoose.connect(process.env.MONGO_URI, {
    bufferCommands: false,
  });
  isConnected = true;
  console.log('MongoDB connected (serverless)');
}

// Import the Express app (dotenv is loaded inside app.js)
const app = require('../backend/app');

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
