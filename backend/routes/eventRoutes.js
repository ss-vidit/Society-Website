const express = require('express');
const router = express.Router();
const {
  getPublicEvents,
  getAllEvents,
  createEvent,
  updateEvent,
  togglePerforming,
  addEventPhotos
} = require('../controllers/eventController');
const { protect, requireProfileSetup, boardOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimitMiddleware');

router.get('/public', getPublicEvents);
router.get('/', protect, requireProfileSetup, getAllEvents);
router.post('/', protect, requireProfileSetup, boardOnly, uploadLimiter, upload.single('banner'), createEvent);
router.patch('/:id', protect, requireProfileSetup, boardOnly, uploadLimiter, upload.single('banner'), updateEvent);
router.post('/:id/perform', protect, requireProfileSetup, togglePerforming);
router.post('/:id/photos', protect, requireProfileSetup, boardOnly, uploadLimiter, upload.array('photos', 10), addEventPhotos);

module.exports = router;
