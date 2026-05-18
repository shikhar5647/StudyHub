// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;

const REFRESH_TOKEN_EXPIRE_DAYS = 30;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  password: { type: String, select: false }, // only for local auth
  role: { type: String, enum: ['student','instructor','admin'], default: 'student' },
  avatar: { type: String, default: 'https://via.placeholder.com/150' },
  providers: { // support multiple OAuth providers
    google: { id: { type: String, index: true, sparse: true }, emailVerified: Boolean },
    facebook: { id: { type: String, index: true, sparse: true }, emailVerified: Boolean }
  },
  refreshTokens: [{ // store hashed refresh tokens (for revocation)
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
  }],
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  learningProgress: [{
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessonIds: [{ type: String }],
    lastLessonId: { type: String },
    lastAccessedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  }],
  createdCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  notes: [{ // personal notes saved by student for courses
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    title: String,
    markdown: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
  }],
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  passwordResetToken: { type: String, select: false },
  lastLogin: Date,
  preferences: {
    theme: { type: String, enum: ['dark','light'], default: 'dark' },
    notifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Hash password pre-save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

// generate JWT access token
userSchema.methods.generateAccessToken = function() {
  const payload = { sub: this._id, role: this.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '15m' });
};

// store hashed refresh token
userSchema.methods.addRefreshToken = async function(plainToken) {
  const salt = await bcrypt.genSalt(10);
  const tokenHash = await bcrypt.hash(plainToken, salt);
  const expiresAt = new Date(Date.now() + (REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600 * 1000));
  this.refreshTokens.push({ tokenHash, expiresAt });
  await this.save();
};

// revoke a refresh token by comparing hashes
userSchema.methods.revokeRefreshToken = async function(plainToken) {
  const tokens = this.refreshTokens || [];
  const keep = [];
  for (let t of tokens) {
    const ok = await bcrypt.compare(plainToken, t.tokenHash);
    if (!ok) keep.push(t);
  }
  this.refreshTokens = keep;
  await this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
