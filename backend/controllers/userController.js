const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { ROLE_LABELS, SIGNUP_ROLES } = require('../config/permissions');

const publicProfileFields = 'name email role avatar emailVerified createdAt lastLogin preferences enrolledCourses createdCourses xp streak badges notes';

// GET /api/users/me/profile
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select(publicProfileFields)
    .populate('enrolledCourses', 'title slug thumbnail')
    .populate('createdCourses', 'title slug thumbnail published');

  res.status(200).json({
    success: true,
    data: {
      user,
      roleLabel: ROLE_LABELS[user.role] || user.role,
    },
  });
});

// GET /api/users/roles
const getSignupRoles = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: SIGNUP_ROLES.map((id) => ({ id, label: ROLE_LABELS[id] })),
  });
});

// GET /api/users — admin
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select(publicProfileFields)
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({
    success: true,
    count: users.length,
    data: users.map((u) => ({
      ...u.toObject(),
      roleLabel: ROLE_LABELS[u.role],
    })),
  });
});

// PATCH /api/users/:id/role — admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const allowed = ['student', 'instructor', 'admin'];

  if (!allowed.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Allowed: ${allowed.join(', ')}`,
    });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Admins cannot demote themselves via this endpoint',
    });
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      user: await User.findById(user._id).select(publicProfileFields),
      roleLabel: ROLE_LABELS[role],
    },
  });
});

// Gamification
// GET /api/users/leaderboard
const getLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('name avatar xp badges streak')
    .sort({ xp: -1 })
    .limit(10);
  
  res.status(200).json({ success: true, data: users });
});

// Notes
// GET /api/users/me/notes
const getNotes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('notes.course', 'title slug');
  res.status(200).json({ success: true, data: user.notes });
});

// POST /api/users/me/notes
const createNote = asyncHandler(async (req, res) => {
  const { course, lessonId, title, markdown } = req.body;
  const user = await User.findById(req.user._id);

  // Check if a note already exists for this lesson
  const existingNoteIndex = user.notes.findIndex(n => n.lessonId === lessonId && n.course.toString() === course);
  
  if (existingNoteIndex !== -1) {
    user.notes[existingNoteIndex].title = title || user.notes[existingNoteIndex].title;
    user.notes[existingNoteIndex].markdown = markdown;
    user.notes[existingNoteIndex].updatedAt = Date.now();
  } else {
    user.notes.push({ course, lessonId, title, markdown });
  }

  await user.save();
  const updatedUser = await User.findById(req.user._id).populate('notes.course', 'title slug');
  
  res.status(201).json({ success: true, data: updatedUser.notes });
});

// DELETE /api/users/me/notes/:id
const deleteNote = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.notes = user.notes.filter(n => n._id.toString() !== req.params.id);
  await user.save();
  res.status(200).json({ success: true, data: user.notes });
});

module.exports = {
  getMyProfile,
  getSignupRoles,
  listUsers,
  updateUserRole,
  getLeaderboard,
  getNotes,
  createNote,
  deleteNote
};
