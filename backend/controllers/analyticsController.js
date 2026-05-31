const User = require('../models/User');
const Course = require('../models/Course');
const StudyActivity = require('../models/StudyActivity');
const asyncHandler = require('../middleware/asyncHandler');

/* ──────────────────────────────────────────────
   STUDENT ANALYTICS — GET /api/users/me/analytics
   ────────────────────────────────────────────── */
const getStudentAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate('enrolledCourses', 'title slug category metadata modules');

  // ── 1. Study Heatmap (last 365 days) ──
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setHours(0, 0, 0, 0);

  const dailyActivities = await StudyActivity.aggregate([
    { $match: { user: userId, date: { $gte: oneYearAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalLessons: { $sum: '$lessonsCompleted' },
        totalMinutes: { $sum: '$studyDurationMin' },
        totalXp: { $sum: '$xpEarned' },
        totalQuizzes: { $sum: '$quizzesTaken' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // ── 2. Weekly Study Time (last 12 weeks) ──
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
  twelveWeeksAgo.setHours(0, 0, 0, 0);

  const weeklyStudy = await StudyActivity.aggregate([
    { $match: { user: userId, date: { $gte: twelveWeeksAgo } } },
    {
      $group: {
        _id: { $isoWeek: '$date' },
        year: { $first: { $isoWeekYear: '$date' } },
        totalMinutes: { $sum: '$studyDurationMin' },
        lessonsCompleted: { $sum: '$lessonsCompleted' },
      },
    },
    { $sort: { year: 1, _id: 1 } },
    {
      $project: {
        week: '$_id',
        year: 1,
        totalMinutes: 1,
        lessonsCompleted: 1,
        _id: 0,
      },
    },
  ]);

  // ── 3. Learning Velocity (lessons per week, last 12 weeks) ──
  const velocityData = weeklyStudy.map((w) => ({
    week: `W${w.week}`,
    year: w.year,
    lessonsPerWeek: w.lessonsCompleted,
    minutesPerWeek: w.totalMinutes,
  }));

  // ── 4. Topic Strengths (based on quiz activity per category) ──
  const categoryActivity = await StudyActivity.aggregate([
    { $match: { user: userId } },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'courseData',
      },
    },
    { $unwind: '$courseData' },
    {
      $group: {
        _id: '$courseData.category',
        totalLessons: { $sum: '$lessonsCompleted' },
        totalQuizzes: { $sum: '$quizzesTaken' },
        totalMinutes: { $sum: '$studyDurationMin' },
        totalXp: { $sum: '$xpEarned' },
      },
    },
    { $sort: { totalLessons: -1 } },
  ]);

  const topicStrengths = categoryActivity.map((cat) => ({
    category: cat._id || 'General',
    lessonsCompleted: cat.totalLessons,
    quizzesTaken: cat.totalQuizzes,
    studyMinutes: cat.totalMinutes,
    xpEarned: cat.totalXp,
    // Normalize to 0-100 score
    score: Math.min(100, Math.round((cat.totalLessons * 10 + cat.totalQuizzes * 20) / 2)),
  }));

  // ── 5. Course Progress Breakdown ──
  const courseProgress = (user.enrolledCourses || []).map((course) => {
    const entry = user.learningProgress?.find(
      (p) => p.course.toString() === course._id.toString()
    );
    let totalLessons = 0;
    (course.modules || []).forEach((m) => {
      totalLessons += (m.lessons || []).length;
    });
    const completed = entry?.completedLessonIds?.length || 0;
    const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

    return {
      courseId: course._id,
      title: course.title,
      slug: course.slug,
      category: course.category || 'General',
      totalLessons,
      completedLessons: completed,
      percentComplete: percent,
      isComplete: !!entry?.completedAt,
      completedAt: entry?.completedAt || null,
      lastAccessedAt: entry?.lastAccessedAt || null,
    };
  });

  // ── 6. Streak & XP Summary ──
  const streakInfo = {
    currentStreak: user.streak?.current || 0,
    longestStreak: user.streak?.longest || 0,
    lastActive: user.streak?.lastActive || null,
    totalXp: user.xp || 0,
    badges: user.badges || [],
    totalCoursesEnrolled: user.enrolledCourses?.length || 0,
    totalCoursesCompleted: courseProgress.filter((c) => c.isComplete).length,
  };

  // ── 7. Activity by Lesson Type ──
  const lessonTypeBreakdown = await StudyActivity.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        video: { $sum: '$lessonTypes.video' },
        note: { $sum: '$lessonTypes.note' },
        quiz: { $sum: '$lessonTypes.quiz' },
        assignment: { $sum: '$lessonTypes.assignment' },
      },
    },
  ]);

  const lessonTypes =
    lessonTypeBreakdown.length > 0
      ? {
          video: lessonTypeBreakdown[0].video,
          note: lessonTypeBreakdown[0].note,
          quiz: lessonTypeBreakdown[0].quiz,
          assignment: lessonTypeBreakdown[0].assignment,
        }
      : { video: 0, note: 0, quiz: 0, assignment: 0 };

  res.status(200).json({
    success: true,
    data: {
      heatmap: dailyActivities.map((d) => ({
        date: d._id,
        count: d.totalLessons,
        minutes: d.totalMinutes,
        xp: d.totalXp,
      })),
      weeklyStudy,
      velocity: velocityData,
      topicStrengths,
      courseProgress,
      streakInfo,
      lessonTypes,
    },
  });
});

/* ──────────────────────────────────────────────────
   INSTRUCTOR ANALYTICS — GET /api/courses/:slugOrId/analytics
   ────────────────────────────────────────────────── */
const getCourseAnalytics = asyncHandler(async (req, res) => {
  const course = await Course.findOne(
    /^[a-f\d]{24}$/i.test(req.params.slugOrId)
      ? { _id: req.params.slugOrId }
      : { slug: req.params.slugOrId }
  );
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  // Verify instructor owns the course
  if (
    req.user.role !== 'admin' &&
    course.instructor?.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Not your course' });
  }

  const courseId = course._id;

  // ── 1. Enrollment Trend (last 6 months, monthly) ──
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const enrolledUsers = await User.find(
    { enrolledCourses: courseId },
    'learningProgress enrolledCourses createdAt'
  );

  // Build monthly enrollment counts from user creation dates (approximate)
  const enrollmentByMonth = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    enrollmentByMonth[key] = 0;
  }

  // Use study activity dates as enrollment proxy
  const enrollmentActivity = await StudyActivity.aggregate([
    { $match: { course: courseId, date: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          user: '$user',
          month: { $dateToString: { format: '%Y-%m', date: '$date' } },
        },
      },
    },
    {
      $group: {
        _id: '$_id.month',
        activeStudents: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const enrollmentTrend = Object.keys(enrollmentByMonth)
    .sort()
    .map((month) => {
      const found = enrollmentActivity.find((e) => e._id === month);
      return {
        month,
        activeStudents: found?.activeStudents || 0,
      };
    });

  // Also add total enrollment count
  const totalEnrolled = enrolledUsers.length;

  // ── 2. Lesson Drop-Off / Completion Rates ──
  const allLessons = [];
  (course.modules || []).forEach((mod) => {
    (mod.lessons || []).forEach((lesson) => {
      allLessons.push({
        id: lesson._id?.toString(),
        title: lesson.title,
        type: lesson.type,
        moduleTitle: mod.title,
      });
    });
  });

  const lessonCompletionCounts = {};
  allLessons.forEach((l) => {
    lessonCompletionCounts[l.id] = 0;
  });

  enrolledUsers.forEach((u) => {
    const progress = u.learningProgress?.find(
      (p) => p.course.toString() === courseId.toString()
    );
    if (progress) {
      progress.completedLessonIds.forEach((lid) => {
        if (lessonCompletionCounts[lid] !== undefined) {
          lessonCompletionCounts[lid]++;
        }
      });
    }
  });

  const dropOffData = allLessons.map((lesson) => ({
    lessonId: lesson.id,
    title: lesson.title,
    type: lesson.type,
    module: lesson.moduleTitle,
    completions: lessonCompletionCounts[lesson.id] || 0,
    completionRate:
      totalEnrolled > 0
        ? Math.round(((lessonCompletionCounts[lesson.id] || 0) / totalEnrolled) * 100)
        : 0,
  }));

  // ── 3. Overall Completion Stats ──
  let completedCount = 0;
  let totalProgress = 0;

  enrolledUsers.forEach((u) => {
    const progress = u.learningProgress?.find(
      (p) => p.course.toString() === courseId.toString()
    );
    if (progress) {
      const pct =
        allLessons.length > 0
          ? (progress.completedLessonIds.length / allLessons.length) * 100
          : 0;
      totalProgress += pct;
      if (progress.completedAt) completedCount++;
    }
  });

  const avgProgress = totalEnrolled > 0 ? Math.round(totalProgress / totalEnrolled) : 0;

  // ── 4. Rating Breakdown ──
  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  // Query reviews if the Review model exists
  try {
    const Review = require('../models/Review');
    const reviews = await Review.find({ course: courseId }, 'rating');
    reviews.forEach((r) => {
      const rounded = Math.round(r.rating);
      if (ratingBreakdown[rounded] !== undefined) ratingBreakdown[rounded]++;
    });
  } catch (_) {
    // Review model may not exist
  }

  // ── 5. Activity Over Time (daily, last 30 days) ──
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyCourseActivity = await StudyActivity.aggregate([
    { $match: { course: courseId, date: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        activeStudents: { $addToSet: '$user' },
        totalLessons: { $sum: '$lessonsCompleted' },
        totalMinutes: { $sum: '$studyDurationMin' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        activeStudents: { $size: '$activeStudents' },
        lessonsCompleted: '$totalLessons',
        studyMinutes: '$totalMinutes',
        _id: 0,
      },
    },
  ]);

  // ── 6. Lesson Type Distribution ──
  const lessonTypeDist = { video: 0, note: 0, quiz: 0, assignment: 0 };
  allLessons.forEach((l) => {
    if (lessonTypeDist[l.type] !== undefined) lessonTypeDist[l.type]++;
  });

  // ── 7. Top Performing Students (anonymized) ──
  const topStudents = enrolledUsers
    .map((u) => {
      const progress = u.learningProgress?.find(
        (p) => p.course.toString() === courseId.toString()
      );
      return {
        completedLessons: progress?.completedLessonIds?.length || 0,
        isComplete: !!progress?.completedAt,
        lastAccessed: progress?.lastAccessedAt,
      };
    })
    .sort((a, b) => b.completedLessons - a.completedLessons)
    .slice(0, 10);

  res.status(200).json({
    success: true,
    data: {
      courseInfo: {
        title: course.title,
        slug: course.slug,
        totalLessons: allLessons.length,
        totalEnrolled,
        totalCompleted: completedCount,
        avgProgress,
        avgRating: course.ratings?.avg || 0,
        totalRatings: course.ratings?.total || 0,
      },
      enrollmentTrend,
      dropOff: dropOffData,
      ratingBreakdown,
      dailyActivity: dailyCourseActivity,
      lessonTypeDist,
      topStudents,
    },
  });
});

/* ──────────────────────────────────────────────────
   INSTRUCTOR OVERVIEW — GET /api/users/me/instructor-analytics
   ────────────────────────────────────────────────── */
const getInstructorOverview = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'createdCourses',
    'title slug enrolledCount ratings metadata modules'
  );

  const courses = user.createdCourses || [];

  const overview = courses.map((course) => {
    let totalLessons = 0;
    (course.modules || []).forEach((m) => {
      totalLessons += (m.lessons || []).length;
    });

    return {
      courseId: course._id,
      title: course.title,
      slug: course.slug,
      totalLessons,
      enrolledCount: course.enrolledCount || 0,
      avgRating: course.ratings?.avg || 0,
      totalRatings: course.ratings?.total || 0,
    };
  });

  // Aggregate totals
  const totalStudents = overview.reduce((sum, c) => sum + c.enrolledCount, 0);
  const totalCourses = overview.length;
  const avgRating =
    overview.length > 0
      ? (overview.reduce((sum, c) => sum + c.avgRating, 0) / overview.length).toFixed(1)
      : 0;

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalCourses,
        totalStudents,
        avgRating: parseFloat(avgRating),
        totalLessons: overview.reduce((sum, c) => sum + c.totalLessons, 0),
      },
      courses: overview,
    },
  });
});

module.exports = { getStudentAnalytics, getCourseAnalytics, getInstructorOverview };
