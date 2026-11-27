const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Protect: must be logged in ──────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not logged in. Please log in.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get fresh user from DB
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User no longer exists or is inactive.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ─── Board only: must be a board member ──────────────────────────
const boardOnly = (req, res, next) => {
  if (!req.user.isBoardMember) {
    return res.status(403).json({ success: false, message: 'Access denied. Board members only.' });
  }
  next();
};

// ─── Specific roles only ─────────────────────────────────────────
// Usage: restrictTo('coordinator', 'student_lead')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.boardRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${roles.join(', ')} can do this.`
      });
    }
    next();
  };
};

module.exports = { protect, boardOnly, restrictTo };
