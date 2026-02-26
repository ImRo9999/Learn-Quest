const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  percentageCompleted: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
