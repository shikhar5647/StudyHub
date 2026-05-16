require('dotenv').config({path: './.env'});
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({});
  let missingName = users.filter(u => !u.name);
  console.log('Users missing name:', missingName);
  mongoose.disconnect();
});
