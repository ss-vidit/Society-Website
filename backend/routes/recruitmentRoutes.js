const express = require('express');
const router = express.Router();
const {
  getRecruitmentStatus,
  toggleRecruitment,
  getApplicants,
  addApplicant,
  grantMemberAccess
} = require('../controllers/recruitmentController');
const { protect, boardOnly } = require('../middleware/authMiddleware');

const applicantSubmissionWindow = new Map();
const limitApplicantSubmissions = (req, res, next) => {
  const key = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const previous = applicantSubmissionWindow.get(key) || [];
  const recent = previous.filter((timestamp) => now - timestamp < 60_000);
  if (recent.length >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Too many applicant submissions. Please wait before trying again.'
    });
  }
  recent.push(now);
  applicantSubmissionWindow.set(key, recent);
  next();
};

router.get('/status', getRecruitmentStatus);
router.post('/toggle', protect, boardOnly, toggleRecruitment);
router.get('/applicants', protect, boardOnly, getApplicants);
router.post('/applicants', limitApplicantSubmissions, addApplicant);
router.post('/grant-access/:applicantId', protect, boardOnly, grantMemberAccess);

module.exports = router;
