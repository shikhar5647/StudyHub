const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { chat } = require('../services/aiChatService');

/**
 * POST /api/courses/:slugOrId/chat
 * Body: { message, history?, currentLessonId? }
 *
 * history is an array of previous messages in Gemini format:
 *   [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
 *
 * The frontend maintains the conversation history and sends it each time.
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { message, history, currentLessonId } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ success: false, message: 'Message too long (max 2000 characters)' });
  }

  // Find course
  const course = await Course.findOne(
    /^[a-f\d]{24}$/i.test(req.params.slugOrId)
      ? { _id: req.params.slugOrId }
      : { slug: req.params.slugOrId }
  );
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  // Verify enrollment
  const user = await User.findById(req.user._id);
  const enrolled = user.enrolledCourses.some(
    (id) => id.toString() === course._id.toString()
  );
  if (!enrolled) {
    return res.status(403).json({
      success: false,
      message: 'Enroll in this course to use the AI assistant',
    });
  }

  // Find current lesson if provided
  let currentLesson = null;
  if (currentLessonId) {
    for (const mod of course.modules || []) {
      for (const lesson of mod.lessons || []) {
        const id = lesson._id?.toString();
        if (id === currentLessonId || `${mod._id}-${lesson.order}` === currentLessonId) {
          currentLesson = lesson;
          break;
        }
      }
      if (currentLesson) break;
    }
  }

  // Validate history format (keep last 20 messages to stay within context limits)
  const sanitizedHistory = Array.isArray(history)
    ? history
        .filter(
          (h) =>
            (h.role === 'user' || h.role === 'model') &&
            Array.isArray(h.parts) &&
            h.parts.length > 0 &&
            typeof h.parts[0].text === 'string'
        )
        .slice(-20)
    : [];

  try {
    const reply = await chat(course, currentLesson, sanitizedHistory, message.trim());

    res.status(200).json({
      success: true,
      data: {
        reply,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('AI Chat error:', err.message);

    // Handle specific Gemini API errors
    if (err.message?.includes('API_KEY')) {
      return res.status(503).json({
        success: false,
        message: 'AI assistant is not configured. Please contact the administrator.',
      });
    }
    if (err.message?.includes('SAFETY')) {
      return res.status(400).json({
        success: false,
        message: 'Your message was flagged by the safety filter. Please rephrase your question.',
      });
    }
    if (err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        success: false,
        message: 'AI assistant is temporarily unavailable due to high demand. Please try again later.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to get a response from the AI assistant. Please try again.',
    });
  }
});

module.exports = { sendMessage };
