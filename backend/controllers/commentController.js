const Comment = require('../models/Comment');
const Discussion = require('../models/Discussion');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/discussions/:slug/comments
const getComments = asyncHandler(async (req, res) => {
  const { sort = 'best' } = req.query;

  const discussion = await Discussion.findOne({ slug: req.params.slug });
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }

  let sortObj;
  switch (sort) {
    case 'newest':
      sortObj = { createdAt: -1 };
      break;
    case 'oldest':
      sortObj = { createdAt: 1 };
      break;
    case 'best':
    default:
      sortObj = { isAccepted: -1, voteScore: -1, createdAt: 1 };
      break;
  }

  const comments = await Comment.find({ discussion: discussion._id })
    .sort(sortObj)
    .populate('author', 'name avatar role')
    .lean();

  // Build tree: top-level comments with nested replies
  const map = {};
  const roots = [];
  comments.forEach((c) => {
    c.replies = [];
    map[c._id.toString()] = c;
  });
  comments.forEach((c) => {
    if (c.parent) {
      const parentComment = map[c.parent.toString()];
      if (parentComment) parentComment.replies.push(c);
      else roots.push(c);
    } else {
      roots.push(c);
    }
  });

  res.status(200).json({
    success: true,
    data: roots,
    total: comments.length,
  });
});

// POST /api/discussions/:slug/comments
const createComment = asyncHandler(async (req, res) => {
  const { body, parent } = req.body;
  if (!body) {
    return res.status(400).json({ success: false, message: 'Comment body is required' });
  }

  const discussion = await Discussion.findOne({ slug: req.params.slug });
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }

  if (discussion.isClosed) {
    return res.status(400).json({ success: false, message: 'Discussion is closed' });
  }

  if (parent) {
    const parentComment = await Comment.findById(parent);
    if (!parentComment || parentComment.discussion.toString() !== discussion._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid parent comment' });
    }
  }

  const comment = await Comment.create({
    body,
    author: req.user._id,
    discussion: discussion._id,
    parent: parent || null,
  });

  discussion.commentCount = await Comment.countDocuments({ discussion: discussion._id });
  await discussion.save({ validateBeforeSave: false });

  await comment.populate('author', 'name avatar role');

  res.status(201).json({ success: true, data: comment });
});

// PUT /api/discussions/:slug/comments/:commentId
const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  const isOwner = comment.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const { body } = req.body;
  if (body) comment.body = body;
  await comment.save();
  await comment.populate('author', 'name avatar role');

  res.status(200).json({ success: true, data: comment });
});

// DELETE /api/discussions/:slug/comments/:commentId
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  const isOwner = comment.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Delete child replies too
  await Comment.deleteMany({ parent: comment._id });
  await comment.deleteOne();

  const discussion = await Discussion.findById(comment.discussion);
  if (discussion) {
    discussion.commentCount = await Comment.countDocuments({ discussion: discussion._id });
    await discussion.save({ validateBeforeSave: false });
  }

  res.status(200).json({ success: true, message: 'Comment deleted' });
});

// POST /api/discussions/:slug/comments/:commentId/vote
const voteComment = asyncHandler(async (req, res) => {
  const { vote } = req.body;
  if (!['up', 'down', 'none'].includes(vote)) {
    return res.status(400).json({ success: false, message: 'Vote must be up, down, or none' });
  }

  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  const userId = req.user._id;
  comment.upvotes = comment.upvotes.filter((id) => id.toString() !== userId.toString());
  comment.downvotes = comment.downvotes.filter((id) => id.toString() !== userId.toString());

  if (vote === 'up') comment.upvotes.push(userId);
  if (vote === 'down') comment.downvotes.push(userId);

  await comment.save();

  res.status(200).json({
    success: true,
    data: {
      voteScore: comment.voteScore,
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
    },
  });
});

// POST /api/discussions/:slug/comments/:commentId/accept
const acceptComment = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findOne({ slug: req.params.slug });
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }

  const isDiscussionOwner = discussion.author.toString() === req.user._id.toString();
  if (!isDiscussionOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only the discussion author can accept answers' });
  }

  // Unaccept any previously accepted comment
  await Comment.updateMany(
    { discussion: discussion._id, isAccepted: true },
    { isAccepted: false }
  );

  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  comment.isAccepted = !comment.isAccepted;
  await comment.save();

  res.status(200).json({ success: true, data: { isAccepted: comment.isAccepted } });
});

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  voteComment,
  acceptComment,
};
