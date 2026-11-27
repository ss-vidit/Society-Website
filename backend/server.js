const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { readAuthCookie } = require('./middleware/authCookie');

// Load environment variables
dotenv.config();

const app = express();
const clientUrl = process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173';
const clientUrlObject = new URL(clientUrl);
const clientOrigin = clientUrlObject.origin;
const allowedClientOrigins = new Set([clientOrigin]);
const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');
const serveFrontend = process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true';

if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL && !process.env.RENDER_EXTERNAL_URL) {
  throw new Error('Set CLIENT_URL or deploy on a host that provides RENDER_EXTERNAL_URL.');
}

// Render terminates TLS at its reverse proxy and forwards the original client IP.
if (process.env.RENDER === 'true') app.set('trust proxy', 1);

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

if (serveFrontend) {
  app.use(express.static(frontendBuildPath, { index: false }));
}

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

if (serveFrontend) {
  app.get('*', (req, res, next) => {
    if (req.path === '/api' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (error) => {
      if (error) next(error);
    });
  });
}

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
