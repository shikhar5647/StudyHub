// backend/server.js
require('dotenv').config(); // ✅ MUST be first

const connectDB = require('./db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
