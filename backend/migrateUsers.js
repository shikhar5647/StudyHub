require('dotenv').config({path: './.env'});
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({ name: { $exists: false } });
  for (let user of users) {
    user.name = user.email ? user.email.split('@')[0] : 'User';
    await user.save();
    console.log(`Updated user ${user.email} with name ${user.name}`);
  }
  
  // also check if any users have name as empty string
  const emptyUsers = await User.find({ name: "" });
  for (let user of emptyUsers) {
    user.name = user.email ? user.email.split('@')[0] : 'User';
    await user.save();
    console.log(`Updated empty-name user ${user.email} with name ${user.name}`);
  }

  console.log('Done migrating user names');
  mongoose.disconnect();
}).catch(err => {
  console.error(err);
  mongoose.disconnect();
});
