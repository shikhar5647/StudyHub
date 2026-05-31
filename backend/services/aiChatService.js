const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getClient() {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

/**
 * Build a system prompt with course context so the AI acts as a course-specific tutor.
 */
function buildSystemPrompt(course, currentLesson) {
  const modulesSummary = (course.modules || [])
    .sort((a, b) => a.order - b.order)
    .map((mod) => {
      const lessons = (mod.lessons || [])
        .sort((a, b) => a.order - b.order)
        .map((l) => {
          let detail = `    - ${l.title} (${l.type})`;
          if (l.content?.markdown && l.type !== 'quiz') {
            // Include first 500 chars of note content for context
            const snippet = l.content.markdown.substring(0, 500);
            detail += `\n      Content: ${snippet}`;
          }
          return detail;
        })
        .join('\n');
      return `  Module: ${mod.title}\n${lessons}`;
    })
    .join('\n\n');

  let currentContext = '';
  if (currentLesson) {
    currentContext = `\n\nThe student is currently viewing:\n- Lesson: "${currentLesson.title}" (${currentLesson.type})`;
    if (currentLesson.content?.markdown && currentLesson.type !== 'quiz') {
      currentContext += `\n- Lesson content:\n${currentLesson.content.markdown.substring(0, 2000)}`;
    }
    if (currentLesson.content?.url) {
      currentContext += `\n- Lesson resource URL: ${currentLesson.content.url}`;
    }
  }

  return `You are StudyBot, an intelligent AI study assistant for the online learning platform StudyHub. You are helping a student with the course "${course.title}".

Course Details:
- Title: ${course.title}
- Description: ${course.description}
- Category: ${course.category || 'General'}
- Level: ${course.level || 'All Levels'}
- Total Lessons: ${course.metadata?.totalLessons || 0}

Course Structure:
${modulesSummary}
${currentContext}

Your Guidelines:
1. Be friendly, encouraging, and supportive — like a helpful teaching assistant.
2. Answer questions specifically related to this course and its topics.
3. If the student asks about the current lesson, use the lesson content provided above.
4. Explain concepts clearly with examples when possible.
5. If the student seems stuck, provide hints before giving full answers.
6. You can suggest which lesson to study next based on the course structure.
7. Use markdown formatting for code blocks, lists, and emphasis where appropriate.
8. Keep responses concise but thorough — aim for 2-4 paragraphs unless a longer explanation is needed.
9. If asked about something completely unrelated to education or this course, politely redirect the conversation back to studying.
10. Never fabricate course content — if you don't know something specific to the course material, say so honestly.`;
}

/**
 * Send a message to Gemini and get a response.
 * @param {Object} course - The full course document
 * @param {Object|null} currentLesson - The lesson the student is currently viewing
 * @param {Array} history - Array of { role: 'user'|'model', parts: [{ text }] }
 * @param {string} userMessage - The new message from the user
 * @returns {Promise<string>} The AI response text
 */
async function chat(course, currentLesson, history, userMessage) {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction: buildSystemPrompt(course, currentLesson),
  });

  const chatSession = model.startChat({
    history: history || [],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });

  const result = await chatSession.sendMessage(userMessage);
  return result.response.text();
}

module.exports = { chat, buildSystemPrompt };
