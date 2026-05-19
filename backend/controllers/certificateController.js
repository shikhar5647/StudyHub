const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { generateCertificate, generateCertificateId } = require('../services/certificateService');
const { findProgressEntry } = require('./progressController');

const downloadCertificate = asyncHandler(async (req, res) => {
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
    return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
  }

  const entry = findProgressEntry(user, course._id);
  if (!entry?.completedAt) {
    return res.status(400).json({
      success: false,
      message: 'Complete all lessons to earn your certificate',
    });
  }

  const certificateId = generateCertificateId();
  const doc = generateCertificate({
    studentName: user.name,
    courseTitle: course.title,
    completionDate: entry.completedAt,
    certificateId,
  });

  const filename = `StudyHub_Certificate_${course.slug}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);
});

module.exports = { downloadCertificate };
