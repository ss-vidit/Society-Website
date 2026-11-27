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
const { protect, requireProfileSetup, boardOnly } = require('../middleware/authMiddleware');

router.get('/public', protect, requireProfileSetup, getPublicGbms);
router.get('/', protect, requireProfileSetup, getGbms);
router.post('/', protect, requireProfileSetup, boardOnly, scheduleGbm);
router.get('/my-attendance', protect, requireProfileSetup, getMyAttendance);
router.get('/:id/attendance', protect, requireProfileSetup, boardOnly, getGbmAttendance);
router.post('/:id/attendance', protect, requireProfileSetup, boardOnly, markAttendance);

module.exports = router;
