const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const upload = require('../middleware/upload');
const { uploadFile, listFiles, signUrl, deleteFile } = require('../controllers/storageController');

router.post(
  '/upload',
  protect,
  requireRole('instructor', 'admin'),
  requirePermission('storage:upload'),
  upload.single('file'),
  uploadFile
);
router.get('/list', protect, listFiles);
router.post('/sign', protect, signUrl);
router.delete(
  '/delete',
  protect,
  requireRole('instructor', 'admin'),
  requirePermission('storage:manage'),
  deleteFile
);

module.exports = router;


