const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const {
  getCourses,
  getCategories,
  getCourse,
  getMyCreated,
  getMyEnrolled,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
} = require('../controllers/courseController');
const {
  getMyProgress,
  getCourseProgress,
  markLessonComplete,
  setLastLesson,
} = require('../controllers/progressController');
const { downloadCertificate } = require('../controllers/certificateController');

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

router.get(
  '/my/created',
  protect,
  requireRole('instructor', 'admin'),
  requirePermission('course:read:own'),
  getMyCreated
);
router.get(
  '/my/enrolled',
  protect,
  requireRole('student'),
  getMyEnrolled
);
router.get(
  '/my/progress',
  protect,
  requireRole('student'),
  getMyProgress
);

router.post(
  '/',
  protect,
  requireRole('instructor', 'admin'),
  requirePermission('course:create'),
  createCourse
);

router.get(
  '/:slugOrId/progress',
  protect,
  requireRole('student'),
  getCourseProgress
);
router.post(
  '/:slugOrId/progress/lessons/:lessonId/complete',
  protect,
  requireRole('student'),
  markLessonComplete
);
router.patch(
  '/:slugOrId/progress/last',
  protect,
  requireRole('student'),
  setLastLesson
);

router.get(
  '/:slugOrId/certificate',
  protect,
  requireRole('student'),
  downloadCertificate
);

router.get('/:slugOrId', optionalAuth, getCourse);

router.put(
  '/:slugOrId',
  protect,
  requireRole('instructor', 'admin'),
  updateCourse
);
router.delete(
  '/:slugOrId',
  protect,
  requireRole('instructor', 'admin'),
  deleteCourse
);

router.post(
  '/:slugOrId/enroll',
  protect,
  requireRole('student'),
  requirePermission('course:enroll'),
  enrollCourse
);
router.post('/:slugOrId/unenroll', protect, requireRole('student'), unenrollCourse);

module.exports = router;
