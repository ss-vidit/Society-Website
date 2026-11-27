const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/profile', protect, getMyProfile);
router.patch('/profile', protect, upload.single('photo'), updateMyProfile);

module.exports = router;
