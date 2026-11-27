const User = require('../models/User');
const { getUploadedImageUrl } = require('../middleware/uploadMiddleware');

// ─── GET /api/users/profile ──────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/users/profile ────────────────────────────────────
exports.updateMyProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'instagram', 'societyRole', 'year'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (typeof updates.societyRole === 'string') {
      try {
        updates.societyRole = JSON.parse(updates.societyRole);
      } catch {
        updates.societyRole = updates.societyRole.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    if (req.file) {
      updates.photo = getUploadedImageUrl(req.file);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
