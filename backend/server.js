const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { readAuthCookie } = require('./middleware/authCookie');

// Load environment variables
dotenv.config();

const app = express();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const clientUrlObject = new URL(clientUrl);
const clientOrigin = clientUrlObject.origin;
const allowedClientOrigins = new Set([clientOrigin]);

// Local development can be opened through either loopback hostname. Keep
// production restricted to the configured client origin.
if (process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(clientUrlObject.hostname)) {
  for (const hostname of ['localhost', '127.0.0.1']) {
    const localUrl = new URL(clientUrl);
    localUrl.hostname = hostname;
    allowedClientOrigins.add(localUrl.origin);
  }
}

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => callback(null, !origin || allowedClientOrigins.has(origin)),
  credentials: true
}));
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const origin = req.get('origin');
  const hasAuthCookie = Boolean(readAuthCookie(req));
  if (
    req.get('sec-fetch-site') === 'cross-site' ||
    (origin && !allowedClientOrigins.has(origin)) ||
    (hasAuthCookie && !allowedClientOrigins.has(origin))
  ) {
    return res.status(403).json({ success: false, message: 'Request origin is not allowed.' });
  }
  next();
});
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/gbm', require('./routes/gbmRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/recruitment', require('./routes/recruitmentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ─── Health check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Binary Boppers API is running 🕺' });
});

// ─── Error handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || (err.name === 'MulterError' ? (err.code === 'LIMIT_FILE_SIZE' ? 413 : 400) : 500);
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Internal Server Error' : (err.message || 'Invalid request.')
  });
});

// ─── Database + Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
