const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// ─── GET /api/notifications (logged in user) ─────────────────────
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      'recipients.user': req.user._id
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const formatted = notifications.map((n) => {
      const rec = n.recipients.find((r) => r.user.toString() === req.user._id.toString());
      return {
        _id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        relatedId: n.relatedId,
        read: rec ? rec.read : false,
        createdAt: n.createdAt
      };
    });

    res.status(200).json({ success: true, notifications: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/notifications/:id/read ───────────────────────────
exports.markAsRead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID.' });
    }

    const result = await Notification.updateOne(
      { _id: req.params.id, 'recipients.user': req.user._id },
      { $set: { 'recipients.$.read': true } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.status(200).json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
