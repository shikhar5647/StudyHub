require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db');
const User = require('../models/User');

const USERS = [
  {
    name: 'StudyHub Admin',
    email: 'admin@studyhub.dev',
    password: 'admin123',
    role: 'admin',
    emailVerified: true,
  },
  {
    name: 'StudyHub Instructor',
    email: 'instructor@studyhub.dev',
    password: 'studyhub123',
    role: 'instructor',
    emailVerified: true,
  },
  {
    name: 'Demo Student',
    email: 'student@studyhub.dev',
    password: 'student123',
    role: 'student',
    emailVerified: true,
  },
];

async function seed() {
  await connectDB();

  for (const data of USERS) {
    const exists = await User.findOne({ email: data.email });
    if (exists) {
      console.log(`Skip (exists): ${data.email} [${exists.role}]`);
      continue;
    }
    await User.create(data);
    console.log(`Created: ${data.email} / ${data.password} [${data.role}]`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
