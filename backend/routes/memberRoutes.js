const express = require('express');
const router = express.Router();
const { getAllMembers, updateMemberAccess, getPublicBoardMembers } = require('../controllers/memberController');
const { protect, requireProfileSetup, boardOnly, restrictTo } = require('../middleware/authMiddleware');

router.get('/board-public', getPublicBoardMembers);
router.get('/', protect, requireProfileSetup, boardOnly, getAllMembers);
router.patch(
  '/:id/role',
  protect,
  requireProfileSetup,
  boardOnly,
  restrictTo('coordinator', 'student_lead', 'hr_lead', 'assistant_coordinator'),
  updateMemberAccess
);

module.exports = router;
