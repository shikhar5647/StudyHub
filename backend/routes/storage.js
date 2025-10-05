const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const upload = require('../middleware/upload');
const { uploadFile, listFiles, signUrl, deleteFile } = require('../controllers/storageController');

router.post('/upload', protect, requireRole(['instructor', 'admin']), upload.single('file'), uploadFile);
router.get('/list', protect, listFiles);
router.post('/sign', protect, signUrl);
router.delete('/delete', protect, requireRole(['instructor', 'admin']), deleteFile);

module.exports = router;


