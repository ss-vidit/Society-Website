const express = require('express');
const router = express.Router();
const {
  getPublicGbms,
  scheduleGbm,
  getGbms,
  getGbmAttendance,
  markAttendance,
  getMyAttendance
} = require('../controllers/gbmController');
const { protect, boardOnly } = require('../middleware/authMiddleware');

router.get('/public', protect, getPublicGbms);
router.get('/', protect, getGbms);
router.post('/', protect, boardOnly, scheduleGbm);
router.get('/my-attendance', protect, getMyAttendance);
router.get('/:id/attendance', protect, boardOnly, getGbmAttendance);
router.post('/:id/attendance', protect, boardOnly, markAttendance);

module.exports = router;
