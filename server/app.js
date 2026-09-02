const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// ── Security Headers ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// ── CORS ──
// Build allowed origins list
function buildAllowedOrigins() {
  const origins = [
    'https://v3classes.co.in',
    'https://www.v3classes.co.in',
    'https://v3-classes.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  // Always allow configured frontend URL(s) — supports comma-separated values
  if (config.frontendUrl) {
    config.frontendUrl.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/+$/, ''); // strip trailing slashes
      if (trimmed) origins.push(trimmed);
    });
  }

  // Allow additional localhost/dev origins in development
  if (config.isDev) {
    origins.push(
      'http://localhost:8080',
      'http://localhost:5000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:3000'
    );
  }

  return [...new Set(origins)]; // deduplicate
}

const allowedOrigins = buildAllowedOrigins();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Strip trailing slash from incoming origin for comparison
    const cleanOrigin = origin.replace(/\/+$/, '');

    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // In development, be more permissive
    if (config.isDev) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ──
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', generalLimiter);

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ──
app.use('/api', routes);

// ── Serve Admin Dashboard (development only — in production, admin is served from Vercel) ──
if (config.isDev) {
  app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
  });
}

// ── 404 Handler for unmatched API routes ──
app.use('/api/*', (req, res) => {
  res.status(404).json({ status: 'fail', message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──
app.use(errorHandler);

module.exports = app;
