const express = require('express');
const router = express.Router();
const { getAllMembers, updateMemberAccess, getPublicBoardMembers } = require('../controllers/memberController');
const { protect, boardOnly, restrictTo } = require('../middleware/authMiddleware');

router.get('/board-public', getPublicBoardMembers);
router.get('/', protect, boardOnly, getAllMembers);
router.patch(
  '/:id/role',
  protect,
  boardOnly,
  restrictTo('coordinator', 'student_lead', 'hr_lead', 'assistant_coordinator'),
  updateMemberAccess
);

module.exports = router;
