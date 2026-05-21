const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      maxlength: [10000, 'Body cannot exceed 10000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'help', 'course-discussion', 'feedback', 'resource', 'career'],
      default: 'general',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    voteScore: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isClosed: { type: Boolean, default: false },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

discussionSchema.pre('validate', function (next) {
  if (this.isNew || this.isModified('title')) {
    const base = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = this._id.toString().slice(-6);
    this.slug = `${base}-${suffix}`;
  }
  this.voteScore = (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
  next();
});

discussionSchema.index({ title: 'text', body: 'text', tags: 'text' });
discussionSchema.index({ category: 1, createdAt: -1 });
discussionSchema.index({ voteScore: -1 });
discussionSchema.index({ slug: 1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ course: 1 });

module.exports = mongoose.model('Discussion', discussionSchema);
