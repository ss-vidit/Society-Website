const mongoose = require('mongoose');

const galleryPhotoSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [120, 'Event name cannot exceed 120 characters']
  },
  photo: {
    type: String,
    required: [true, 'A gallery photo is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GalleryPhoto', galleryPhotoSchema);
