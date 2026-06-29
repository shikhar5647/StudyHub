const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');
const asyncHandler = require('../middleware/asyncHandler');
const { sendEnrollmentEmail } = require('../services/emailService');

let razorpay = null;

function getRazorpay() {
  if (razorpay) return razorpay;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay credentials not configured');
  razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpay;
}

// POST /api/payments/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { courseSlug } = req.body;
  if (!courseSlug) {
    return res.status(400).json({ success: false, message: 'courseSlug is required' });
  }

  const course = await Course.findOne({ slug: courseSlug }).populate('instructor', 'name');
  if (!course || !course.published) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  if (!course.price || course.price <= 0) {
    return res.status(400).json({ success: false, message: 'This is a free course, no payment needed' });
  }

  const user = await User.findById(req.user._id);
  const alreadyEnrolled = user.enrolledCourses.some(
    (id) => id.toString() === course._id.toString()
  );
  if (alreadyEnrolled) {
    return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
  }

  const existingPayment = await Payment.findOne({
    user: req.user._id,
    course: course._id,
    status: 'paid',
  });
  if (existingPayment) {
    return res.status(400).json({ success: false, message: 'Payment already completed for this course' });
  }

  const amountInPaise = Math.round(course.price * 100);

  const rz = getRazorpay();
  const order = await rz.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    notes: {
      courseId: course._id.toString(),
      courseTitle: course.title,
      userId: req.user._id.toString(),
      userEmail: req.user.email,
    },
  });

  await Payment.create({
    user: req.user._id,
    course: course._id,
    razorpayOrderId: order.id,
    amount: amountInPaise,
    currency: 'INR',
    status: 'created',
  });

  res.status(200).json({
    success: true,
    data: {
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      courseName: course.title,
      courseSlug: course.slug,
    },
  });
});

// POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseSlug } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
  }

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'failed' }
    );
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  // Update payment record
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id, user: req.user._id },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'paid',
      paidAt: new Date(),
    },
    { new: true }
  );

  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found' });
  }

  // Auto-enroll user in the course
  const user = await User.findById(req.user._id);
  const course = await Course.findById(payment.course);

  const alreadyEnrolled = user.enrolledCourses.some(
    (id) => id.toString() === course._id.toString()
  );

  if (!alreadyEnrolled) {
    user.enrolledCourses.push(course._id);
    user.learningProgress = user.learningProgress || [];
    const hasProgress = user.learningProgress.some(
      (p) => p.course.toString() === course._id.toString()
    );
    if (!hasProgress) {
      user.learningProgress.push({
        course: course._id,
        completedLessonIds: [],
        lastAccessedAt: new Date(),
      });
    }
    await user.save();
    course.enrolledCount += 1;
    await course.save();

    sendEnrollmentEmail(user.email, user.name, course.title, course.slug).catch((err) =>
      console.error('Failed to send enrollment email:', err.message)
    );
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified and enrolled successfully',
    data: {
      paymentId: payment._id,
      courseSlug: course.slug,
    },
  });
});

// GET /api/payments/my — payment history for current user
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id, status: 'paid' })
    .populate('course', 'title slug thumbnail price')
    .sort({ paidAt: -1 });

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });
});

// GET /api/payments/check/:courseSlug — check if user has paid for a course
const checkPayment = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.courseSlug });
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const payment = await Payment.findOne({
    user: req.user._id,
    course: course._id,
    status: 'paid',
  });

  res.status(200).json({
    success: true,
    data: {
      hasPaid: !!payment,
      isFree: !course.price || course.price <= 0,
      price: course.price || 0,
    },
  });
});

module.exports = { createOrder, verifyPayment, getMyPayments, checkPayment };
