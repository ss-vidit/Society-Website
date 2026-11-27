const express = require('express');
const router = express.Router();
const {
  getRecruitmentStatus,
  toggleRecruitment,
  getApplicants,
  addApplicant,
  grantMemberAccess
} = require('../controllers/recruitmentController');
const { protect, requireProfileSetup, boardOnly } = require('../middleware/authMiddleware');
const { applicantLimiter } = require('../middleware/rateLimitMiddleware');

router.get('/status', getRecruitmentStatus);
router.post('/toggle', protect, requireProfileSetup, boardOnly, toggleRecruitment);
router.get('/applicants', protect, requireProfileSetup, boardOnly, getApplicants);
router.post('/applicants', applicantLimiter, addApplicant);
router.post('/grant-access/:applicantId', protect, requireProfileSetup, boardOnly, grantMemberAccess);

module.exports = router;
