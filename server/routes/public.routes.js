const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const publicController = require('../controllers/public.controller');
const enquiryController = require('../controllers/enquiry.controller');
const chatController = require('../controllers/chat.controller');
const validate = require('../middleware/validate');
const { createEnquiryRules } = require('../validators/enquiry.validator');

const router = express.Router();

// ── Rate limiter for enquiry/contact submissions ──
const enquiryLimiter = rateLimit({
  windowMs: config.enquiryRateLimit.windowMs,
  max: config.enquiryRateLimit.max,
  message: { status: 'error', message: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Courses ──
router.get('/courses', publicController.getCourses);
router.get('/courses/:id', publicController.getCourse);

// ── Faculty ──
router.get('/faculty', publicController.getFaculty);
router.get('/faculty/:id', publicController.getFacultyMember);

// ── Results ──
router.get('/results', publicController.getResults);
router.get('/results/featured', publicController.getFeaturedResults);

// ── Gallery ──
router.get('/gallery', publicController.getGallery);

// ── FAQs ──
router.get('/faqs', publicController.getFaqs);

// ── Settings ──
router.get('/settings', publicController.getSettings);

// ── Enquiries (public, rate-limited) ──
router.post('/enquiries', enquiryLimiter, validate(createEnquiryRules), enquiryController.createEnquiry);
router.post('/contact', enquiryLimiter, validate(createEnquiryRules), enquiryController.createContact);

// ── Chat ──
router.post('/chat/message', chatController.sendMessage);
router.get('/chat/history/:sessionId', chatController.getChatHistory);

module.exports = router;
