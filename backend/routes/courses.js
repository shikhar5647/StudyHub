const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const {
  getCourses,
  getCategories,
  getCourse,
  getMyEnrolled,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
} = require('../controllers/courseController');

// Public & optional-auth (attach user when token present)
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.sub).select('-password');
    } catch (_) {
      req.user = null;
    }
  }
  next();
};

router.get('/', getCourses);
router.get('/categories/list', getCategories);
router.get('/my/enrolled', protect, getMyEnrolled);

router.post('/', protect, requireRole(['instructor', 'admin']), createCourse);

router.get('/:slugOrId', optionalAuth, getCourse);
router.put('/:slugOrId', protect, requireRole(['instructor', 'admin']), updateCourse);
router.delete('/:slugOrId', protect, requireRole(['instructor', 'admin']), deleteCourse);

router.post('/:slugOrId/enroll', protect, enrollCourse);
router.post('/:slugOrId/unenroll', protect, unenrollCourse);

module.exports = router;
