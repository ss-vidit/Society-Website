const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getUploadedImageUrl } = require('../middleware/uploadMiddleware');

// ─── GET /api/events/public ──────────────────────────────────────
// Returns upcoming events + past 8 archived events (for scrolling gallery)
exports.getPublicEvents = async (req, res) => {
  try {
    const now = new Date();

    const upcoming = await Event.find({
      isArchived: false,
      date: { $gte: new Date(now.setHours(0, 0, 0, 0)) }
    })
      .select('-performers')
      .sort({ date: 1 });

    // Keep last 6-8 past performances
    const past = await Event.find({
      $or: [{ isArchived: true }, { date: { $lt: new Date() } }]
    })
      .select('title date venue banner eventPhotos')
      .sort({ date: -1 })
      .limit(8);

    res.status(200).json({ success: true, upcoming, past });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/events (logged in users - includes performers) ─────
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('performers', 'name rollNumber year societyRole photo instagram')
      .populate('createdBy', 'name boardRole')
      .sort({ date: -1 });

    res.status(200).json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/events (board only) ───────────────────────────────
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Event name and date are required.' });
    }

    const banner = req.file ? getUploadedImageUrl(req.file) : req.body.banner || null;
    if (!banner) {
      return res.status(400).json({ success: false, message: 'An event banner image is required.' });
    }

    const event = await Event.create({
      title,
      description,
      banner,
      date,
      time: time || 'To be announced',
      venue,
      createdBy: req.user._id
    });

    // Notify active members about the new event
    const activeUsers = await User.find({ isActive: true }).select('_id');
    await Notification.create({
      title: `New Event: ${title}`,
      message: `${title} is scheduled for ${new Date(date).toLocaleDateString('en-IN')}${time ? ` at ${time}` : ''}. Register if you're performing!`,
      type: 'event_created',
      relatedId: event._id,
      recipients: activeUsers.map((u) => ({ user: u._id, read: false })),
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Event created!', event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/events/:id (board only) ──────────────────────────
exports.updateEvent = async (req, res) => {
  try {
    const allowedFields = ['title', 'description', 'date', 'time', 'venue', 'isArchived'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.file) {
      updates.banner = getUploadedImageUrl(req.file);
    }

    const event = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.status(200).json({ success: true, message: 'Event updated.', event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/events/:id/perform (logged in member) ─────────────
// Toggles "PERFORMING" status for the logged in member
exports.togglePerforming = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const userId = req.user._id.toString();
    const alreadyPerforming = event.performers.some((id) => id.toString() === userId);

    if (alreadyPerforming) {
      event.performers = event.performers.filter((id) => id.toString() !== userId);
    } else {
      event.performers.push(req.user._id);
    }

    await event.save();
    await event.populate('performers', 'name rollNumber year societyRole photo');

    res.status(200).json({
      success: true,
      isPerforming: !alreadyPerforming,
      message: !alreadyPerforming ? 'Marked as PERFORMING!' : 'Removed from performers.',
      event
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/events/:id/photos (board only) ────────────────────
// Upload photos for past/completed event gallery
exports.addEventPhotos = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const newPhotos = (req.files || []).map((f) => getUploadedImageUrl(f)).filter(Boolean);
    if (req.body.photoUrl) newPhotos.push(req.body.photoUrl);

    event.eventPhotos.push(...newPhotos);
    event.isArchived = true;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Photos added to event archive.',
      event
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
