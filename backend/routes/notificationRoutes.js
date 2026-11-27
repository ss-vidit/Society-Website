const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { protect, requireProfileSetup } = require('../middleware/authMiddleware');

router.get('/', protect, requireProfileSetup, getMyNotifications);
router.patch('/:id/read', protect, requireProfileSetup, markAsRead);

module.exports = router;
