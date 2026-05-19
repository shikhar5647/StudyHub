const Review = require('../models/Review');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

async function findCourseByIdOrSlug(idOrSlug) {
  const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
  return Course.findOne(query);
}

// @desc    Get reviews for a course
// @route   GET /api/courses/:slugOrId/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const course = await findCourseByIdOrSlug(req.params.slugOrId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const reviews = await Review.find({ course: course._id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Add a review
// @route   POST /api/courses/:slugOrId/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const course = await findCourseByIdOrSlug(req.params.slugOrId);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  // Check if user is enrolled
  const user = await require('../models/User').findById(req.user._id);
  const isEnrolled = user.enrolledCourses.some(id => id.toString() === course._id.toString());
  if (!isEnrolled) {
     return res.status(403).json({ success: false, message: 'You must be enrolled to review this course' });
  }

  const alreadyReviewed = await Review.findOne({ course: course._id, user: req.user._id });
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this course' });
  }

  const { rating, comment } = req.body;
  if (!rating || !comment) {
     return res.status(400).json({ success: false, message: 'Please provide rating and comment' });
  }

  const review = await Review.create({
    course: course._id,
    user: req.user._id,
    rating,
    comment
  });

  const populated = await Review.findById(review._id).populate('user', 'name avatar');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Delete a review
// @route   DELETE /api/courses/:slugOrId/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
     return res.status(404).json({ success: false, message: 'Review not found' });
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
     return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
  }

  await review.deleteOne();

  res.status(200).json({ success: true, message: 'Review deleted' });
});

module.exports = { getReviews, addReview, deleteReview };
