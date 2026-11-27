const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
  isLive: {
    type: Boolean,
    default: false
  },
  formLink: {
    type: String,
    trim: true
  },
  madeBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  applicants: [{
    name: { type: String, required: true },
    email: { type: String, required: true },
    rollNumber: { type: String },
    phone: { type: String },
    year: { type: Number },
    interestedIn: { type: String },   // what they want to do
    submittedAt: { type: Date, default: Date.now },
    isSelected: { type: Boolean, default: false }
  }],
  startedAt: { type: Date },
  endedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recruitment', recruitmentSchema);
