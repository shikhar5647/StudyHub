// models/course.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');

const lessonSchema = new Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['video','note','assignment','quiz'], required: true },
  // content metadata (store storage keys, external ids)
  content: {
    // for youtube: { provider: 'youtube', videoId: 'abc' }
    // for uploaded file: { provider: 's3', key: 'uploads/course123/lesson1.mp4', mimeType: 'video/mp4', size: 12345 }
    provider: { type: String, enum: ['youtube','s3','inline'], required: true },
    url: String, // canonical URL or embed URL
    s3Key: String, // S3 key if uploaded
    markdown: String, // inline notes
    durationSec: Number,
    previewImage: String
  },
  order: { type: Number, required: true },
  isPreviewable: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const moduleSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  lessons: [lessonSchema]
});

const courseSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, index: true, unique: true },
  description: { type: String, required: true },
  category: { type: String },
  level: { type: String, enum: ['Beginner','Intermediate','Advanced','All Levels'], default: 'All Levels' },
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  thumbnail: { type: String },
  price: { type: Number, default: 0 },
  tags: [String],
  published: { type: Boolean, default: false },
  modules: [moduleSchema],
  enrolledCount: { type: Number, default: 0 },
  ratings: {
    avg: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  metadata: { // analytics-friendly
    totalLessons: { type: Number, default: 0 },
    totalDurationSec: { type: Number, default: 0 }
  }
}, { timestamps: true });

// middleware to set slug & metadata
courseSchema.pre('validate', function(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  // compute some metadata
  let total = 0;
  let dur = 0;
  if (this.modules && this.modules.length) {
    this.modules.forEach(m => {
      if (m.lessons) {
        total += m.lessons.length;
        m.lessons.forEach(l => { if (l.content && l.content.durationSec) dur += l.content.durationSec; });
      }
    });
  }
  if (!this.metadata) this.metadata = {};
  this.metadata.totalLessons = total;
  this.metadata.totalDurationSec = dur;
  next();
});

// text index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text', category: 'text' });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
