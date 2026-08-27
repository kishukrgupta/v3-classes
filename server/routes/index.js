const express = require('express');
const publicRoutes = require('./public.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

// Public API routes
router.use('/', publicRoutes);

// Admin API routes (under /api/admin/*)
router.use('/admin', adminRoutes);

module.exports = router;
