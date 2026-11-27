const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  gbm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GBM',
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  present: {
    type: Boolean,
    default: false
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  markedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// A member can only have one attendance record per GBM
attendanceSchema.index({ gbm: 1, member: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
