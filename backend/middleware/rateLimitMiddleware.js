const { rateLimit } = require('express-rate-limit');

const rateLimitResponse = (message) => ({ success: false, message });

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: rateLimitResponse('Too many sign-in attempts. Wait a little and try again.')
});

const applicantLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: rateLimitResponse('Too many applications were sent. Please wait before trying again.')
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => req.user?._id?.toString() || 'unauthenticated',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: rateLimitResponse('Too many uploads. Please wait before trying again.')
});

module.exports = { loginLimiter, applicantLimiter, uploadLimiter };
