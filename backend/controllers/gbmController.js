const GBM = require('../models/GBM');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getPublicGbms = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const gbms = await GBM.find({
      date: { $gte: startOfToday },
      status: { $ne: 'completed' }
    })
      .select('title description date time venue status')
      .sort({ date: 1 });
    res.status(200).json({ success: true, gbms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/gbm (board only) ──────────────────────────────────
// Schedule a GBM and notify all active members
exports.scheduleGbm = async (req, res) => {
  try {
    const { title, description, date, time, venue } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ success: false, message: 'Title, date, and time are required.' });
    }

    const gbm = await GBM.create({
      title,
      description,
      date,
      time,
      venue,
      scheduledBy: req.user._id
    });

    // Notify all active users
    const activeUsers = await User.find({ isActive: true }).select('_id');
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    await Notification.create({
      title: `New GBM Scheduled: ${title}`,
      message: `${title} on ${formattedDate} at ${time}${venue ? ` (${venue})` : ''}.`,
      type: 'gbm_scheduled',
      relatedId: gbm._id,
      recipients: activeUsers.map((u) => ({ user: u._id, read: false })),
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'GBM scheduled and members notified!',
      gbm
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/gbm (logged in users) ──────────────────────────────
exports.getGbms = async (req, res) => {
  try {
    const gbms = await GBM.find()
      .populate('scheduledBy', 'name boardRole')
      .sort({ date: -1 });

    res.status(200).json({ success: true, gbms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/gbm/:id/attendance (board only) ────────────────────
exports.getGbmAttendance = async (req, res) => {
  try {
    const gbm = await GBM.findById(req.params.id);
    if (!gbm) {
      return res.status(404).json({ success: false, message: 'GBM not found.' });
    }

    const members = await User.find({ isActive: true }).sort({ name: 1 });
    const records = await Attendance.find({ gbm: req.params.id });

    const recordMap = {};
    for (const r of records) {
      recordMap[r.member.toString()] = r.present;
    }

    const checklist = members.map((m) => ({
      member: m,
      present: recordMap[m._id.toString()] ?? false
    }));

    res.status(200).json({ success: true, gbm, checklist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/gbm/:id/attendance (board only) ───────────────────
// Body: { records: [{ memberId, present }] }
exports.markAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    const gbm = await GBM.findById(req.params.id);

    if (!gbm) {
      return res.status(404).json({ success: false, message: 'GBM not found.' });
    }

    if (!Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Attendance records array is required.' });
    }
    if (records.some((record) =>
      !record ||
      typeof record.memberId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(record.memberId) ||
      typeof record.present !== 'boolean'
    )) {
      return res.status(400).json({
        success: false,
        message: 'Each attendance record must include a member ID and a boolean present value.'
      });
    }

    const memberIds = records.map((record) => record.memberId).filter(Boolean);
    if (new Set(memberIds).size !== memberIds.length) {
      return res.status(400).json({ success: false, message: 'Attendance records cannot contain duplicate members.' });
    }
    const validMembers = await User.find({
      _id: { $in: memberIds },
      isActive: true
    }).select('_id');
    const validMemberIds = new Set(validMembers.map((member) => member._id.toString()));
    const invalidMemberIds = memberIds.filter((memberId) => !validMemberIds.has(memberId.toString()));

    if (invalidMemberIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance contains inactive or unknown member accounts.'
      });
    }

    const ops = records.map(({ memberId, present }) => ({
      updateOne: {
        filter: { gbm: gbm._id, member: memberId },
        update: {
          $set: {
            present: Boolean(present),
            markedBy: req.user._id,
            markedAt: new Date()
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(ops);

    gbm.status = 'completed';
    await gbm.save();

    res.status(200).json({
      success: true,
      message: 'Attendance saved successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/gbm/my-attendance (logged in member) ───────────────
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ member: req.user._id })
      .populate('gbm', 'title date time venue')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
