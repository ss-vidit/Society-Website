const User = require('../models/User');
const Attendance = require('../models/Attendance');
const GBM = require('../models/GBM');

// ─── GET /api/members/board-public (public) ──────────────────────
// Returns only public board member cards (name, photo, designation) for the homepage marquee
exports.getPublicBoardMembers = async (req, res) => {
  try {
    const boardMembers = await User.find({ isActive: true, isBoardMember: true })
      .select('name photo boardRole')
      .sort({ name: 1 });

    res.status(200).json({ success: true, boardMembers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/members (board only) ───────────────────────────────
// Returns active board members with filters + their recent 5 completed GBM attendance
exports.getAllMembers = async (req, res) => {
  try {
    const { societyRole, year, search } = req.query;

    const filter = { isActive: true, isBoardMember: true };
    if (societyRole) filter.societyRole = societyRole;
    if (year) filter.year = Number(year);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await User.find(filter).sort({ isBoardMember: -1, name: 1 });

    // Fetch last 5 GBMs to compute recent attendance per member
    const recentGbms = await GBM.find({ status: 'completed' }).sort({ date: -1 }).limit(5);
    const gbmIds = recentGbms.map((g) => g._id);

    const attendanceRecords = await Attendance.find({
      gbm: { $in: gbmIds }
    }).populate('gbm', 'title date');

    const attendanceByMember = {};
    for (const rec of attendanceRecords) {
      const mId = rec.member.toString();
      if (!attendanceByMember[mId]) attendanceByMember[mId] = [];
      attendanceByMember[mId].push({
        gbmId: rec.gbm?._id,
        title: rec.gbm?.title,
        date: rec.gbm?.date,
        present: rec.present
      });
    }

    const membersWithAttendance = members.map((member) => {
      const recent = attendanceByMember[member._id.toString()] || [];
      const presentCount = recent.filter((r) => r.present).length;
      return {
        ...member.toJSON(),
        recentAttendance: recent,
        attendanceSummary: {
          present: presentCount,
          total: recentGbms.length
        }
      };
    });

    res.status(200).json({
      success: true,
      count: membersWithAttendance.length,
      recentGbms,
      members: membersWithAttendance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/members/:id/role (coordinator / student_lead / hr_lead) ─
exports.updateMemberAccess = async (req, res) => {
  try {
    const { isBoardMember, boardRole, societyRole, isActive } = req.body;
    const updates = {};

    if (isBoardMember !== undefined) updates.isBoardMember = isBoardMember;
    if (boardRole !== undefined) updates.boardRole = boardRole || null;
    if (societyRole !== undefined) updates.societyRole = societyRole;
    if (isActive !== undefined) updates.isActive = isActive;

    const member = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Member updated successfully.',
      member
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
