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
const { protect, boardOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/public', getPublicEvents);
router.get('/', protect, getAllEvents);
router.post('/', protect, boardOnly, upload.single('banner'), createEvent);
router.patch('/:id', protect, boardOnly, upload.single('banner'), updateEvent);
router.post('/:id/perform', protect, togglePerforming);
router.post('/:id/photos', protect, boardOnly, upload.array('photos', 10), addEventPhotos);

module.exports = router;
