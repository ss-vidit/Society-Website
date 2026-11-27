const express = require('express');
const router = express.Router();
const { login, logout, getMe, createMember, changePassword } = require('../controllers/authController');
const { protect, requireProfileSetup, boardOnly, restrictTo } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/create-member', protect, requireProfileSetup, boardOnly, restrictTo('coordinator', 'student_lead', 'hr_lead', 'assistant_coordinator'), createMember);
router.patch('/change-password', protect, changePassword);

module.exports = router;
