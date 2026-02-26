const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  difficultyLevel: {
    type: String
  },
  status: {
    type: String,
    enum: ['recommended', 'in_progress', 'completed'],
    default: 'recommended'
  },
  completionDate: {
    type: Date
  },
  progress: {
    type: Number, // percentage (0–100)
    default: 0
  },
  platform: {
    type: String,
    enum: ['coursera', 'linkedin', 'udemy'],
    default: 'coursera'
  },
  slug: {
    type: String // for generating course URL or ID ref from Coursera
  },
  thumbnail: {
    type: String // course image URL
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
