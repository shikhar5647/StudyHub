const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const {
  getMyProfile,
  getSignupRoles,
  listUsers,
  updateUserRole,
} = require('../controllers/userController');

router.get('/roles', getSignupRoles);
router.get('/me/profile', protect, getMyProfile);
router.get('/', protect, requirePermission('user:list'), listUsers);
router.patch(
  '/:id/role',
  protect,
  requireRole('admin'),
  requirePermission('user:update:role'),
  updateUserRole
);

module.exports = router;
