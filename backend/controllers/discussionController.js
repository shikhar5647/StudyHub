const Discussion = require('../models/Discussion');
const Comment = require('../models/Comment');
const asyncHandler = require('../middleware/asyncHandler');

const CATEGORIES = ['general', 'help', 'course-discussion', 'feedback', 'resource', 'career'];

// GET /api/discussions
const getDiscussions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 15,
    sort = 'newest',
    category,
    tag,
    search,
    course,
    author,
  } = req.query;

  const filter = {};
  if (category && CATEGORIES.includes(category)) filter.category = category;
  if (tag) filter.tags = tag.toLowerCase();
  if (course) filter.course = course;
  if (author) filter.author = author;
  if (search) {
    filter.$text = { $search: search };
  }

  let sortObj;
  switch (sort) {
    case 'most_votes':
      sortObj = { isPinned: -1, voteScore: -1, createdAt: -1 };
      break;
    case 'most_comments':
      sortObj = { isPinned: -1, commentCount: -1, createdAt: -1 };
      break;
    case 'most_views':
      sortObj = { isPinned: -1, viewCount: -1, createdAt: -1 };
      break;
    case 'oldest':
      sortObj = { isPinned: -1, createdAt: 1 };
      break;
    case 'newest':
    default:
      sortObj = { isPinned: -1, createdAt: -1 };
      break;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [discussions, total] = await Promise.all([
    Discussion.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'name avatar role')
      .populate('course', 'title slug')
      .lean(),
    Discussion.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: discussions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// GET /api/discussions/categories
const getCategories = asyncHandler(async (_req, res) => {
  res.status(200).json({ success: true, data: CATEGORIES });
});

// GET /api/discussions/tags/popular
const getPopularTags = asyncHandler(async (_req, res) => {
  const tags = await Discussion.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);
  res.status(200).json({
    success: true,
    data: tags.map((t) => ({ tag: t._id, count: t.count })),
  });
});

// GET /api/discussions/:slug
const getDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findOne({ slug: req.params.slug })
    .populate('author', 'name avatar role')
    .populate('course', 'title slug');

  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }

  discussion.viewCount += 1;
  await discussion.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, data: discussion });
});

// POST /api/discussions
const createDiscussion = asyncHandler(async (req, res) => {
  const { title, body, category, tags, course } = req.body;

  if (!title || !body) {
    return res.status(400).json({ success: false, message: 'Title and body are required' });
  }

  const discussion = await Discussion.create({
    title,
    body,
    category: category || 'general',
    tags: tags || [],
    course: course || null,
    author: req.user._id,
  });

  await discussion.populate('author', 'name avatar role');

  res.status(201).json({ success: true, data: discussion });
});

// PUT /api/discussions/:slug
const updateDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findOne({ slug: req.params.slug });
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }

  const isOwner = discussion.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const { title, body, category, tags } = req.body;
  if (title) discussion.title = title;
  if (body) discussion.body = body;
  if (category) discussion.category = category;
  if (tags) discussion.tags = tags;

  await discussion.save();
  await discussion.populate('author', 'name avatar role');

  res.status(200).json({ success: true, data: discussion });
});

// DELETE /api/discussions/:slug
const deleteDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findOne({ slug: req.params.slug });
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }

  const isOwner = discussion.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await Comment.deleteMany({ discussion: discussion._id });
  await discussion.deleteOne();

  res.status(200).json({ success: true, message: 'Discussion deleted' });
});

// POST /api/discussions/:slug/vote
const voteDiscussion = asyncHandler(async (req, res) => {
  const { vote } = req.body; // 'up', 'down', or 'none'
  if (!['up', 'down', 'none'].includes(vote)) {
    return res.status(400).json({ success: false, message: 'Vote must be up, down, or none' });
  }

  const discussion = await Discussion.findOne({ slug: req.params.slug });
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }

  const userId = req.user._id;

  discussion.upvotes = discussion.upvotes.filter((id) => id.toString() !== userId.toString());
  discussion.downvotes = discussion.downvotes.filter((id) => id.toString() !== userId.toString());

  if (vote === 'up') discussion.upvotes.push(userId);
  if (vote === 'down') discussion.downvotes.push(userId);

  await discussion.save();

  res.status(200).json({
    success: true,
    data: {
      voteScore: discussion.voteScore,
      upvotes: discussion.upvotes.length,
      downvotes: discussion.downvotes.length,
    },
  });
});

// POST /api/discussions/:slug/pin  (admin only)
const pinDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findOne({ slug: req.params.slug });
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }

  discussion.isPinned = !discussion.isPinned;
  await discussion.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, data: { isPinned: discussion.isPinned } });
});

// POST /api/discussions/:slug/close
const closeDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findOne({ slug: req.params.slug });
  if (!discussion) {
    return res.status(404).json({ success: false, message: 'Discussion not found' });
  }

  const isOwner = discussion.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  discussion.isClosed = !discussion.isClosed;
  await discussion.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, data: { isClosed: discussion.isClosed } });
});

module.exports = {
  getDiscussions,
  getCategories,
  getPopularTags,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  voteDiscussion,
  pinDiscussion,
  closeDiscussion,
};
