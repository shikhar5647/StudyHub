const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const {
  getMyProfile,
  getSignupRoles,
  listUsers,
  updateUserRole,
  getLeaderboard,
  getNotes,
  createNote,
  deleteNote
} = require('../controllers/userController');

router.get('/roles', getSignupRoles);
router.get('/me/profile', protect, getMyProfile);
router.get('/leaderboard', getLeaderboard); // Gamification Leaderboard

// Notes routes
router.get('/me/notes', protect, getNotes);
router.post('/me/notes', protect, createNote);
router.delete('/me/notes/:id', protect, deleteNote);

router.get('/', protect, requirePermission('user:list'), listUsers);
router.patch(
  '/:id/role',
  protect,
  requireRole('admin'),
  requirePermission('user:update:role'),
  updateUserRole
);

module.exports = router;
