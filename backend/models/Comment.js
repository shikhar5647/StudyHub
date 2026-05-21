const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'Comment body is required'],
      maxlength: [5000, 'Comment cannot exceed 5000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussion',
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    voteScore: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.pre('save', function (next) {
  this.voteScore = (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
  next();
});

commentSchema.index({ discussion: 1, createdAt: 1 });
commentSchema.index({ parent: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ voteScore: -1 });

module.exports = mongoose.model('Comment', commentSchema);
