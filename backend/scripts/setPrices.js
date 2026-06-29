require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db');
const Course = require('../models/Course');

const PRICES = {
  'Artificial Intelligence': 499,
  'Web Development': 0,
  'Cyber Security': 399,
  'Data Science': 499,
  'Cloud Computing': 299,
  'Game Development': 349,
};

async function run() {
  await connectDB();

  for (const [title, price] of Object.entries(PRICES)) {
    const result = await Course.findOneAndUpdate(
      { title },
      { price },
      { new: true }
    );
    if (result) {
      console.log(`${title}: ₹${price}`);
    } else {
      console.log(`${title}: not found, skipped`);
    }
  }

  console.log('Done.');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
