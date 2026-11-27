const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// All board roles in Binary Boppers
const BOARD_ROLES = [
  'coordinator',
  'student_lead',
  'operations_lead',
  'hr_lead',
  'assistant_coordinator',
  'student_representative',
  'hr_member',
  'operations_member',
  'content_lead',
  'social_media_lead'
];

const SOCIETY_ROLES = [
  'western_dancer',
  'classical_dancer',
  'both_dancer',
  'videographer',
  'photographer',
  'content_team',
  'graphics_designer'
];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false  // never return password in queries by default
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  phone: {
    type: String,
    trim: true
  },
  instagram: {
    type: String,
    trim: true
  },
  photo: {
    type: String,         // Cloudinary URL
    default: null
  },
  societyRole: [{
    type: String,
    enum: SOCIETY_ROLES
  }],

  // Access level
  isBoardMember: {
    type: Boolean,
    default: false
  },
  boardRole: {
    type: String,
    enum: [...BOARD_ROLES, null],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // For recruits who haven't been given access yet
  isPending: {
    type: Boolean,
    default: false
  },
  mustChangePassword: {
    type: Boolean,
    default: true
  },
  profileSetupComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ─── Hash password before saving ─────────────────────────────────
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Compare passwords ────────────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Hide sensitive fields in JSON output ─────────────────────────
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
module.exports.BOARD_ROLES = BOARD_ROLES;
module.exports.SOCIETY_ROLES = SOCIETY_ROLES;
