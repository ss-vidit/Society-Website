const Recruitment = require('../models/Recruitment');
const User = require('../models/User');
const crypto = require('crypto');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLL_PATTERN = /^[A-Za-z0-9-]{4,30}$/;

const isGoogleFormsUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (
      url.hostname === 'forms.gle' ||
      (['docs.google.com', 'forms.google.com'].includes(url.hostname) && url.pathname.startsWith('/forms/'))
    );
  } catch {
    return false;
  }
};

// Helper: get or create the single recruitment state doc
const getRecruitmentDoc = async () => {
  let doc = await Recruitment.findOne().sort({ createdAt: -1 });
  if (!doc) {
    doc = await Recruitment.create({ isLive: false, applicants: [] });
  }
  return doc;
};

// ─── GET /api/recruitment/status (public) ────────────────────────
exports.getRecruitmentStatus = async (req, res) => {
  try {
    const doc = await getRecruitmentDoc();
    res.status(200).json({
      success: true,
      isLive: Boolean(doc.isLive && doc.formLink),
      formLink: doc.isLive && doc.formLink ? doc.formLink : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/recruitment/toggle (board only) ───────────────────
// Body: { isLive, formLink }
exports.toggleRecruitment = async (req, res) => {
  try {
    const { isLive, formLink } = req.body;
    const goLive = isLive === true || isLive === 'true';
    const doc = await getRecruitmentDoc();

    if (goLive) {
      if (!isGoogleFormsUrl(formLink)) {
        return res.status(400).json({
          success: false,
          message: 'Enter a valid HTTPS Google Forms link (docs.google.com/forms or forms.gle).'
        });
      }
      doc.isLive = true;
      doc.formLink = formLink.trim();
      doc.madeBy = req.user._id;
      doc.startedAt = new Date();
      doc.endedAt = null;
      await doc.save();
    } else {
      doc.isLive = false;
      doc.endedAt = new Date();
      await doc.save();
    }

    res.status(200).json({
      success: true,
      message: doc.isLive ? 'Recruitment is now LIVE!' : 'Recruitment ended. The saved form link can be published again.',
      recruitment: doc
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/recruitment/applicants (board only) ────────────────
exports.getApplicants = async (req, res) => {
  try {
    const doc = await getRecruitmentDoc();
    res.status(200).json({
      success: true,
      isLive: doc.isLive,
      formLink: doc.formLink,
      applicants: doc.applicants
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/recruitment/applicants (public or board) ──────────
// Adds an applicant to the temporary recruitment list
exports.addApplicant = async (req, res) => {
  try {
    const { name, email, rollNumber, phone, year, interestedIn } = req.body;
    const doc = await getRecruitmentDoc();

    if (!doc.isLive) {
      return res.status(400).json({ success: false, message: 'Recruitment is not currently live.' });
    }

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }
    if (!EMAIL_PATTERN.test(email.trim()) || email.trim().length > 254) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (rollNumber && (typeof rollNumber !== 'string' || !ROLL_PATTERN.test(rollNumber.trim()))) {
      return res.status(400).json({ success: false, message: 'A valid roll number is required.' });
    }
    if (year !== undefined && year !== '' && (!Number.isInteger(Number(year)) || Number(year) < 1 || Number(year) > 4)) {
      return res.status(400).json({ success: false, message: 'Year must be between 1 and 4.' });
    }
    if ((phone !== undefined && typeof phone !== 'string') || (interestedIn !== undefined && typeof interestedIn !== 'string')) {
      return res.status(400).json({ success: false, message: 'Phone and interest details must be text.' });
    }
    if (name.trim().length > 100 || (phone && phone.trim().length > 40) || (interestedIn && interestedIn.trim().length > 200)) {
      return res.status(400).json({ success: false, message: 'One or more fields are too long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const duplicate = doc.applicants.some((applicant) =>
      applicant.email?.toLowerCase() === normalizedEmail ||
      (rollNumber && applicant.rollNumber?.toLowerCase() === String(rollNumber).trim().toLowerCase())
    );
    if (duplicate) {
      return res.status(409).json({ success: false, message: 'This applicant is already on the list.' });
    }

    doc.applicants.push({
      name: name.trim(),
      email: normalizedEmail,
      rollNumber: rollNumber?.trim(),
      phone: phone?.trim(),
      year: year ? Number(year) : undefined,
      interestedIn: interestedIn?.trim()
    });
    await doc.save();

    res.status(201).json({
      success: true,
      message: 'Your application details were received.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/recruitment/grant-access/:applicantId (board only) 
// Marks applicant selected and creates their official Member account
exports.grantMemberAccess = async (req, res) => {
  try {
    const doc = await getRecruitmentDoc();
    const applicant = doc.applicants.id(req.params.applicantId);

    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Applicant not found.' });
    }

    const existing = await User.findOne({
      $or: [{ email: applicant.email }, { rollNumber: applicant.rollNumber }]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'User account already exists for this applicant.' });
    }

    const requestedPassword = req.body.password;
    if (requestedPassword !== undefined && (typeof requestedPassword !== 'string' || requestedPassword.length < 6)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    const temporaryPassword = requestedPassword || process.env.DEMO_ACCOUNT_PASSWORD || crypto.randomBytes(12).toString('base64url');
    if (temporaryPassword.length < 6) {
      return res.status(500).json({ success: false, message: 'Configured default password must be at least 6 characters.' });
    }
    const societyRole = req.body.societyRole || [];
    if (!Array.isArray(societyRole) || societyRole.some((role) => !User.SOCIETY_ROLES.includes(role))) {
      return res.status(400).json({ success: false, message: 'Select valid society roles.' });
    }
    const newUser = await User.create({
      name: applicant.name,
      email: applicant.email,
      rollNumber: applicant.rollNumber || `BB-${Date.now()}`,
      year: applicant.year || 1,
      phone: applicant.phone || '',
      societyRole,
      isBoardMember: false,
      password: temporaryPassword,
      mustChangePassword: true
    });

    applicant.isSelected = true;
    await doc.save();

    res.status(201).json({
      success: true,
      message: `${applicant.name} granted Member access!`,
      user: newUser,
      temporaryPassword
    });
  } catch (err) {
    const statusCode = err.code === 11000 ? 409 : err.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};
