const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const instructorFields = 'name avatar role';
const listProjection =
  'title slug description category level thumbnail price tags published enrolledCount ratings metadata instructor createdAt';

async function findCourseByIdOrSlug(idOrSlug) {
  const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
  return Course.findOne(query).populate('instructor', instructorFields);
}

function canManageCourse(user, course) {
  if (!user || !course) return false;
  if (user.role === 'admin') return true;
  return (
    user.role === 'instructor' &&
    course.instructor &&
    course.instructor._id.toString() === user._id.toString()
  );
}

// GET /api/courses
const getCourses = asyncHandler(async (req, res) => {
  const { category, level, search } = req.query;
  const filter = { published: true };

  if (category) filter.category = new RegExp(category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (level) filter.level = level;
  if (search) filter.$text = { $search: search };

  const courses = await Course.find(filter)
    .select(listProjection)
    .populate('instructor', instructorFields)
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: courses.length, data: courses });
});

// GET /api/courses/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Course.distinct('category', { published: true });
  res.status(200).json({ success: true, data: categories.filter(Boolean).sort() });
});

// GET /api/courses/:slug
const getCourse = asyncHandler(async (req, res) => {
  const course = await findCourseByIdOrSlug(req.params.slugOrId);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const isOwnerOrAdmin = req.user && canManageCourse(req.user, course);
  if (!course.published && !isOwnerOrAdmin) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  let enrolled = false;
  if (req.user) {
    const user = await User.findById(req.user._id).select('enrolledCourses');
    enrolled = user.enrolledCourses.some(
      (id) => id.toString() === course._id.toString()
    );
  }

  res.status(200).json({
    success: true,
    data: { course, enrolled },
  });
});

// GET /api/courses/my/created — instructor own courses; admin sees all
const getMyCreated = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    const courses = await Course.find()
      .populate('instructor', instructorFields)
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  }

  const user = await User.findById(req.user._id).populate({
    path: 'createdCourses',
    populate: { path: 'instructor', select: instructorFields },
  });

  res.status(200).json({
    success: true,
    count: user.createdCourses.length,
    data: user.createdCourses,
  });
});

// GET /api/courses/my/enrolled
const getMyEnrolled = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'enrolledCourses',
    select: listProjection,
    populate: { path: 'instructor', select: instructorFields },
  });

  res.status(200).json({
    success: true,
    count: user.enrolledCourses.length,
    data: user.enrolledCourses,
  });
});

// POST /api/courses
const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    level,
    thumbnail,
    price,
    tags,
    published,
    modules,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required',
    });
  }

  const course = await Course.create({
    title,
    description,
    category,
    level,
    thumbnail,
    price,
    tags,
    published: Boolean(published),
    modules: modules || [],
    instructor: req.user._id,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { createdCourses: course._id },
  });

  const populated = await Course.findById(course._id).populate(
    'instructor',
    instructorFields
  );

  res.status(201).json({ success: true, data: populated });
});

// PUT /api/courses/:slugOrId
const updateCourse = asyncHandler(async (req, res) => {
  let course = await findCourseByIdOrSlug(req.params.slugOrId);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  if (!canManageCourse(req.user, course)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const allowed = [
    'title',
    'description',
    'category',
    'level',
    'thumbnail',
    'price',
    'tags',
    'published',
    'modules',
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) course[key] = req.body[key];
  });

  await course.save();
  course = await Course.findById(course._id).populate('instructor', instructorFields);

  res.status(200).json({ success: true, data: course });
});

// DELETE /api/courses/:slugOrId
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await findCourseByIdOrSlug(req.params.slugOrId);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }
  if (!canManageCourse(req.user, course)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  await course.deleteOne();
  await User.updateMany(
    {},
    {
      $pull: {
        enrolledCourses: course._id,
        createdCourses: course._id,
      },
    }
  );

  res.status(200).json({ success: true, message: 'Course deleted' });
});

// POST /api/courses/:slugOrId/enroll — students only
const enrollCourse = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Only students can enroll in courses. Instructors manage courses from the instructor dashboard.',
    });
  }

  const course = await findCourseByIdOrSlug(req.params.slugOrId);
  if (!course || !course.published) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const user = await User.findById(req.user._id);
  const alreadyEnrolled = user.enrolledCourses.some(
    (id) => id.toString() === course._id.toString()
  );

  if (alreadyEnrolled) {
    return res.status(400).json({
      success: false,
      message: 'You are already enrolled in this course',
    });
  }

  user.enrolledCourses.push(course._id);

  const hasProgress = user.learningProgress?.some(
    (p) => p.course.toString() === course._id.toString()
  );
  if (!hasProgress) {
    user.learningProgress = user.learningProgress || [];
    user.learningProgress.push({
      course: course._id,
      completedLessonIds: [],
      lastAccessedAt: new Date(),
    });
  }

  await user.save();
  course.enrolledCount += 1;
  await course.save();

  res.status(200).json({
    success: true,
    message: 'Enrolled successfully',
    data: { courseId: course._id },
  });
});

// POST /api/courses/:slugOrId/unenroll
const unenrollCourse = asyncHandler(async (req, res) => {
  const course = await findCourseByIdOrSlug(req.params.slugOrId);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const user = await User.findById(req.user._id);
  const wasEnrolled = user.enrolledCourses.some(
    (id) => id.toString() === course._id.toString()
  );

  if (!wasEnrolled) {
    return res.status(400).json({
      success: false,
      message: 'You are not enrolled in this course',
    });
  }

  user.enrolledCourses = user.enrolledCourses.filter(
    (id) => id.toString() !== course._id.toString()
  );
  user.learningProgress = (user.learningProgress || []).filter(
    (p) => p.course.toString() !== course._id.toString()
  );
  await user.save();
  course.enrolledCount = Math.max(0, course.enrolledCount - 1);
  await course.save();

  res.status(200).json({ success: true, message: 'Unenrolled successfully' });
});

module.exports = {
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
};
