const express = require('express');
const router = express.Router();
const { login, getMe, createMember, changePassword } = require('../controllers/authController');
const { protect, boardOnly, restrictTo } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/create-member', protect, boardOnly, restrictTo('coordinator', 'student_lead', 'hr_lead', 'assistant_coordinator'), createMember);
router.patch('/change-password', protect, changePassword);

module.exports = router;
