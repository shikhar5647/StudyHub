const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true }
}, { timestamps: true });

// Prevent user from submitting more than one review per course
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (courseId) {
  const obj = await this.aggregate([
    { $match: { course: courseId } },
    { $group: { _id: '$course', avg: { $avg: '$rating' }, total: { $sum: 1 } } }
  ]);
  
  try {
    await this.model('Course').findByIdAndUpdate(courseId, {
      ratings: {
        avg: obj[0]?.avg || 0,
        total: obj[0]?.total || 0
      }
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.course);
});

// Call getAverageRating before remove
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.getAverageRating(this.course);
});

module.exports = mongoose.model('Review', reviewSchema);
