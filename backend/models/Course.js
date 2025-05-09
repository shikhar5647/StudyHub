const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub-schema for modules within a course
const moduleSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  description: { // Brief description of the module
    type: String,
    trim: true,
  },
  order: { // To maintain the order of modules
    type: Number,
    required: true,
  },
  lessons: [{
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    type: { // 'video', 'note' (PDF/MD), 'quiz', 'assignment'
      type: String,
      enum: ['video', 'note', 'quiz', 'assignment'],
      required: [true, 'Lesson type is required'],
    },
    contentUrl: { // URL to YouTube video, PDF on S3, etc.
      type: String,
      // Required if type is 'video' or 'note' (for external files)
      required: function() { return this.type === 'video' || (this.type === 'note' && !this.markdownContent); }
    },
    markdownContent: { // For inline Markdown notes
        type: String,
        // Required if type is 'note' and no contentUrl is provided
        required: function() { return this.type === 'note' && !this.contentUrl; }
    },
    quizId: { // Reference to a Quiz model (if type is 'quiz')
        type: Schema.Types.ObjectId,
        ref: 'Quiz', // You'll need to create a Quiz model
        // Required if type is 'quiz'
        required: function() { return this.type === 'quiz'; }
    },
    duration: { // Optional: estimated time to complete lesson (e.g., in minutes or as a string "15 mins")
        type: String,
    },
    // You can add more fields like 'isPreviewable' for lessons
  }],
});

const courseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    unique: true, // Assuming course titles should be unique
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
  },
  category: { // E.g., 'Web Development', 'Data Science'
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  level: { // E.g., 'Beginner', 'Intermediate', 'Advanced'
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels',
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  thumbnailUrl: { // URL to the course thumbnail image (stored on S3)
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Course+Thumbnail',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    default: 0, // Can be 0 for free courses
  },
  tags: [String], // For better searchability
  published: { // Whether the course is visible to students
    type: Boolean,
    default: false,
  },
  modules: [moduleSchema],
  enrolledStudents: [{ // List of students enrolled in this course
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  // You might add ratings, reviews, prerequisites, etc.
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  // If you have a separate Review model:
  // reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]
}, {
  timestamps: true,
});

// Indexing for better query performance
courseSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' }); // For text search
courseSchema.index({ category: 1 });
courseSchema.index({ creator: 1 });
courseSchema.index({ price: 1 });


const Course = mongoose.model('Course', courseSchema);
module.exports = Course;