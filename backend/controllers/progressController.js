const Course = require('../models/Course');
const User = require('../models/User');
const StudyActivity = require('../models/StudyActivity');
const asyncHandler = require('../middleware/asyncHandler');
const { sendCourseCompletionEmail } = require('../services/emailService');

function updateGamification(user, isNewComplete, justFinishedCourse, lessonType) {
  let xpGained = 0;
  let newBadges = [];

  const now = new Date();
  if (!user.streak) user.streak = { current: 0, longest: 0, lastActive: null };
  const lastActive = user.streak.lastActive;

  if (lastActive) {
    const diffTime = Math.abs(now.setHours(0,0,0,0) - new Date(lastActive).setHours(0,0,0,0));
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      user.streak.current += 1;
      if (user.streak.current > user.streak.longest) user.streak.longest = user.streak.current;
    } else if (diffDays > 1) {
      user.streak.current = 1;
    }
  } else {
    user.streak.current = 1;
    user.streak.longest = 1;
  }
  user.streak.lastActive = new Date();

  if (user.streak.current === 7 && !user.badges.some(b => b.name === '7-Day Streak')) {
    user.badges.push({ name: '7-Day Streak', earnedAt: new Date() });
    newBadges.push('7-Day Streak');
  }

  if (isNewComplete) {
    xpGained += 10;
    if (lessonType === 'quiz' && !user.badges.some(b => b.name === 'Quiz Master')) {
       user.badges.push({ name: 'Quiz Master', earnedAt: new Date() });
       newBadges.push('Quiz Master');
    }
  }
  if (justFinishedCourse) {
    xpGained += 50;
    if (!user.badges.some(b => b.name === 'First Course')) {
       user.badges.push({ name: 'First Course', earnedAt: new Date() });
       newBadges.push('First Course');
    }
  }

  user.xp = (user.xp || 0) + xpGained;
  return { xpGained, newBadges };
}

function countLessons(course) {
  if (course.metadata && typeof course.metadata.totalLessons === 'number') {
    return course.metadata.totalLessons;
  }
  let n = 0;
  (course.modules || []).forEach((m) => {
    n += (m.lessons || []).length;
  });
  return n;
}

function lessonIdsFromCourse(course) {
  const ids = [];
  (course.modules || []).forEach((mod, mi) => {
    (mod.lessons || []).forEach((lesson, li) => {
      const id = lesson._id?.toString() || `${mi}-${li}-${lesson.order}`;
      ids.push(id);
    });
  });
  return ids;
}

function findProgressEntry(user, courseId) {
  return user.learningProgress?.find(
    (p) => p.course.toString() === courseId.toString()
  );
}

function buildProgressPayload(course, entry) {
  const total = countLessons(course);
  const completed = entry?.completedLessonIds?.length || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    courseId: course._id,
    courseSlug: course.slug,
    totalLessons: total,
    completedLessons: completed,
    percentComplete: percent,
    completedLessonIds: entry?.completedLessonIds || [],
    lastLessonId: entry?.lastLessonId || null,
    completedAt: entry?.completedAt || null,
    isComplete: total > 0 && completed >= total,
  };
}

// GET /api/courses/my/progress
const getMyProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'enrolledCourses',
    'title slug thumbnail metadata'
  );

  const data = (user.enrolledCourses || []).map((course) => {
    const entry = findProgressEntry(user, course._id);
    return {
      course,
      progress: buildProgressPayload(course, entry),
    };
  });

  res.status(200).json({ success: true, count: data.length, data });
});

// GET /api/courses/:slugOrId/progress
const getCourseProgress = asyncHandler(async (req, res) => {
  const course = await Course.findOne(
    /^[a-f\d]{24}$/i.test(req.params.slugOrId)
      ? { _id: req.params.slugOrId }
      : { slug: req.params.slugOrId }
  );
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const user = await User.findById(req.user._id);
  const enrolled = user.enrolledCourses.some(
    (id) => id.toString() === course._id.toString()
  );
  if (!enrolled) {
    return res.status(403).json({
      success: false,
      message: 'Enroll in this course to track progress',
    });
  }

  const entry = findProgressEntry(user, course._id);
  res.status(200).json({
    success: true,
    data: buildProgressPayload(course, entry),
  });
});

// POST /api/courses/:slugOrId/progress/lessons/:lessonId/complete
const markLessonComplete = asyncHandler(async (req, res) => {
  const course = await Course.findOne(
    /^[a-f\d]{24}$/i.test(req.params.slugOrId)
      ? { _id: req.params.slugOrId }
      : { slug: req.params.slugOrId }
  );
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const user = await User.findById(req.user._id);
  const enrolled = user.enrolledCourses.some(
    (id) => id.toString() === course._id.toString()
  );
  if (!enrolled) {
    return res.status(403).json({ success: false, message: 'Not enrolled' });
  }

  const lessonId = req.params.lessonId;
  const validIds = lessonIdsFromCourse(course);
  if (!validIds.includes(lessonId)) {
    return res.status(400).json({ success: false, message: 'Invalid lesson' });
  }

  let entry = findProgressEntry(user, course._id);
  if (!entry) {
    user.learningProgress.push({
      course: course._id,
      completedLessonIds: [],
      lastLessonId: lessonId,
      lastAccessedAt: new Date(),
    });
    entry = findProgressEntry(user, course._id);
  }

  let isNewComplete = false;
  if (!entry.completedLessonIds.includes(lessonId)) {
    entry.completedLessonIds.push(lessonId);
    isNewComplete = true;
  }
  entry.lastLessonId = lessonId;
  entry.lastAccessedAt = new Date();

  const total = countLessons(course);
  const justCompleted =
    entry.completedLessonIds.length >= total && total > 0 && !entry.completedAt;
  if (justCompleted) {
    entry.completedAt = new Date();
  }

  // Find lesson type
  let lessonType = 'video';
  course.modules.forEach(m => {
    m.lessons.forEach(l => {
      const id = l._id?.toString() || `${m._id}-${l.order}`; // Fallback if _id is missing
      if (id === lessonId || l._id?.toString() === lessonId) lessonType = l.type;
    });
  });

  const { xpGained, newBadges } = updateGamification(user, isNewComplete, justCompleted, lessonType);

  await user.save();

  // ── Track study activity for analytics ──
  if (isNewComplete) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updateFields = {
      $inc: {
        lessonsCompleted: 1,
        xpEarned: xpGained,
        studyDurationMin: lessonType === 'video' ? 15 : lessonType === 'quiz' ? 10 : 5,
      },
    };

    // Increment the specific lesson type counter
    if (['video', 'note', 'quiz', 'assignment'].includes(lessonType)) {
      updateFields.$inc[`lessonTypes.${lessonType}`] = 1;
    }
    if (lessonType === 'quiz') {
      updateFields.$inc.quizzesTaken = 1;
    }

    StudyActivity.findOneAndUpdate(
      { user: req.user._id, course: course._id, date: today },
      updateFields,
      { upsert: true, new: true }
    ).catch((err) => console.error('Failed to track study activity:', err.message));
  }

  if (justCompleted) {
    sendCourseCompletionEmail(user.email, user.name, course.title, course.slug).catch(
      (err) => console.error('Failed to send completion email:', err.message)
    );
  }

  res.status(200).json({
    success: true,
    data: buildProgressPayload(course, entry),
    gamification: { xpGained, newBadges, currentXp: user.xp, streak: user.streak }
  });
});

// PATCH /api/courses/:slugOrId/progress/last — body: { lessonId }
const setLastLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.body;
  if (!lessonId) {
    return res.status(400).json({ success: false, message: 'lessonId required' });
  }

  const course = await Course.findOne(
    /^[a-f\d]{24}$/i.test(req.params.slugOrId)
      ? { _id: req.params.slugOrId }
      : { slug: req.params.slugOrId }
  );
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const user = await User.findById(req.user._id);
  const enrolled = user.enrolledCourses.some(
    (id) => id.toString() === course._id.toString()
  );
  if (!enrolled) {
    return res.status(403).json({ success: false, message: 'Not enrolled' });
  }

  let entry = findProgressEntry(user, course._id);
  if (!entry) {
    user.learningProgress.push({
      course: course._id,
      completedLessonIds: [],
      lastLessonId: lessonId,
      lastAccessedAt: new Date(),
    });
  } else {
    entry.lastLessonId = lessonId;
    entry.lastAccessedAt = new Date();
  }

  await user.save();
  const updated = await User.findById(req.user._id);
  const prog = findProgressEntry(updated, course._id);

  res.status(200).json({
    success: true,
    data: buildProgressPayload(course, prog),
  });
});

module.exports = {
  getMyProgress,
  getCourseProgress,
  markLessonComplete,
  setLastLesson,
  buildProgressPayload,
  findProgressEntry,
};
