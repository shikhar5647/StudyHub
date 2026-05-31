const mongoose = require('mongoose');
const { Schema } = mongoose;

const studyActivitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true, index: true }, // normalized to midnight UTC
  lessonsCompleted: { type: Number, default: 0 },
  quizzesTaken: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  studyDurationMin: { type: Number, default: 0 }, // estimated minutes
  lessonTypes: {
    video: { type: Number, default: 0 },
    note: { type: Number, default: 0 },
    quiz: { type: Number, default: 0 },
    assignment: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Compound index: one record per user per course per day
studyActivitySchema.index({ user: 1, course: 1, date: 1 }, { unique: true });
// For querying user-wide daily activity (heatmap)
studyActivitySchema.index({ user: 1, date: 1 });

const StudyActivity = mongoose.model('StudyActivity', studyActivitySchema);
module.exports = StudyActivity;
