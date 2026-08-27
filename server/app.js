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
app.use(cors({
  origin: config.isDev
    ? ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080']
    : config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
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

// ── Serve Admin Dashboard (static files) ──
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

// ── 404 Handler for unmatched API routes ──
app.use('/api/*', (req, res) => {
  res.status(404).json({ status: 'fail', message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──
app.use(errorHandler);

module.exports = app;
