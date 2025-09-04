require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    mongoose.connection.close();
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
