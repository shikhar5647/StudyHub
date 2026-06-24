const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { createOrder, verifyPayment, getMyPayments, checkPayment } = require('../controllers/paymentController');

router.post('/create-order', protect, requireRole('student'), createOrder);
router.post('/verify', protect, requireRole('student'), verifyPayment);
router.get('/my', protect, getMyPayments);
router.get('/check/:courseSlug', protect, requireRole('student'), checkPayment);

module.exports = router;
