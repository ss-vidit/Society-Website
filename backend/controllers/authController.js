const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      year: user.year,
      photo: user.photo,
      societyRole: user.societyRole,
      isBoardMember: user.isBoardMember,
      boardRole: user.boardRole,
      mustChangePassword: user.mustChangePassword || !user.profileSetupComplete
    }
  });
};

// Fetch & parse published Google Sheet CSV for Board Members
// Expected columns (case-insensitive): email, name, role (or boardRole), rollNumber, year
const findBoardMemberInGoogleSheet = async (email) => {
  const csvUrl = process.env.GOOGLE_SHEET_BOARD_CSV_URL;
  if (!csvUrl) return null;

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) return null;
    const text = await response.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return null;

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
    const emailIdx = headers.findIndex((h) => h.includes('email'));
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const roleIdx = headers.findIndex((h) => h.includes('role') || h.includes('designation'));
    const rollIdx = headers.findIndex((h) => h.includes('roll'));
    const yearIdx = headers.findIndex((h) => h.includes('year'));

    if (emailIdx === -1) return null;

    const target = email.trim().toLowerCase();
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols[emailIdx]?.toLowerCase() === target) {
        const rawRole = (cols[roleIdx] || 'coordinator').toLowerCase().replace(/\s+/g, '_');
        return {
          email: target,
          name: cols[nameIdx] || target.split('@')[0],
          boardRole: User.BOARD_ROLES.includes(rawRole) ? rawRole : 'coordinator',
          rollNumber: cols[rollIdx] || target.split('@')[0],
          year: Number(cols[yearIdx]) || 3
        };
      }
    }
    return null;
  } catch {
    return null;
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail }).select('+password');
    const boardDefaultPassword = process.env.BOARD_DEFAULT_PASSWORD || process.env.DEMO_ACCOUNT_PASSWORD;

    // If not in MongoDB yet, check Google Sheet for verified Board Member KIIT email
    if (!user) {
      const sheetEntry = await findBoardMemberInGoogleSheet(normalizedEmail);
      if (sheetEntry && boardDefaultPassword && password === boardDefaultPassword) {
        user = await User.create({
          name: sheetEntry.name,
          email: sheetEntry.email,
          password: boardDefaultPassword,
          rollNumber: sheetEntry.rollNumber,
          year: sheetEntry.year,
          isBoardMember: true,
          boardRole: sheetEntry.boardRole,
          mustChangePassword: true
        });
        return sendTokenResponse(user, 200, res);
      }
    }

    // If user exists in DB and Google Sheet is configured, verify board membership if needed
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.mustChangePassword = user.mustChangePassword || !user.profileSetupComplete;
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/auth/create-member (board only) ───────────────────
exports.createMember = async (req, res) => {
  try {
    const { name, email, rollNumber, year, phone, instagram, societyRole, isBoardMember, boardRole, password } = req.body;

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedRollNumber = typeof rollNumber === 'string' ? rollNumber.trim() : '';
    const numericYear = Number(year);
    if (
      typeof name !== 'string' || !name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      !normalizedRollNumber ||
      !Number.isInteger(numericYear) || numericYear < 1 || numericYear > 4
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, valid email, roll number, and year (1-4) are required.'
      });
    }
    if (isBoardMember !== undefined && typeof isBoardMember !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Board membership must be a boolean.' });
    }
    if ((boardRole && !User.BOARD_ROLES.includes(boardRole)) ||
        (isBoardMember && !User.BOARD_ROLES.includes(boardRole))) {
      return res.status(400).json({ success: false, message: 'Select a valid board role.' });
    }
    if (societyRole !== undefined && (
      !Array.isArray(societyRole) ||
      societyRole.some((role) => !User.SOCIETY_ROLES.includes(role))
    )) {
      return res.status(400).json({ success: false, message: 'Select valid society roles.' });
    }
    if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { rollNumber: normalizedRollNumber }]
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email or roll number already exists.' });
    }

    const defaultPassword = isBoardMember
      ? process.env.BOARD_DEFAULT_PASSWORD || process.env.DEMO_ACCOUNT_PASSWORD
      : process.env.DEMO_ACCOUNT_PASSWORD;
    const temporaryPassword = password || defaultPassword || crypto.randomBytes(12).toString('base64url');
    if (temporaryPassword.length < 6) {
      return res.status(500).json({ success: false, message: 'Configured default password must be at least 6 characters.' });
    }
    const newUser = await User.create({
      name: name.trim(), email: normalizedEmail, rollNumber: normalizedRollNumber,
      year: numericYear, phone, instagram,
      societyRole: societyRole || [],
      isBoardMember: isBoardMember || false,
      boardRole: boardRole || null,
      password: temporaryPassword,
      mustChangePassword: true
    });

    res.status(201).json({
      success: true,
      message: 'Member account created successfully.',
      user: newUser,
      temporaryPassword
    });
  } catch (err) {
    const statusCode = err.code === 11000 ? 409 : err.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/auth/change-password ─────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    if (await user.comparePassword(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must be different from the current password.' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    user.profileSetupComplete = true;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
