const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    // Required only if not using OAuth, or if you want a local password backup
    // For pure OAuth, you might not store a password.
    // For local auth + OAuth, this would be required for local signups.
    // Let's assume local auth is an option.
    required: function() { return !this.googleId && !this.facebookId; }, // Only required if no OAuth ID
    select: false, // Don't send password back by default on queries
  },
  role: {
    type: String,
    enum: ['student', 'creator', 'admin'], // Added admin role
    default: 'student',
  },
  avatar: { // URL to profile picture
    type: String,
    default: 'https://via.placeholder.com/150', // Default avatar
  },
  // OAuth provider IDs
  googleId: {
    type: String,
    sparse: true, // Allows multiple nulls, but unique if value exists
    unique: true,
    default: null,
  },
  facebookId: { // Example, if you add Facebook login
    type: String,
    sparse: true,
    unique: true,
    default: null,
  },
  refreshToken: { // For JWT refresh strategy
    type: String,
    select: false, // Don't send by default
  },
  enrolledCourses: [{ // Courses the user is enrolled in (if student)
    type: Schema.Types.ObjectId,
    ref: 'Course',
  }],
  createdCourses: [{ // Courses created by the user (if creator)
    type: Schema.Types.ObjectId,
    ref: 'Course',
  }],
  // You might add more fields like bio, social links, etc.
  lastLogin: {
    type: Date,
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Pre-save hook to hash password before saving (for local auth)
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare entered password with hashed password (for local auth)
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false; // If no password (e.g. OAuth user)
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;