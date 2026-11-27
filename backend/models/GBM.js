const mongoose = require('mongoose');

const gbmSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'GBM title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'GBM date is required']
  },
  time: {
    type: String,     // e.g. "5:00 PM"
    required: true
  },
  venue: {
    type: String,
    trim: true
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // attendance is tracked in separate Attendance model
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GBM', gbmSchema);
