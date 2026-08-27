const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const authController = require('../controllers/auth.controller');
const dashboardController = require('../controllers/dashboard.controller');
const adminController = require('../controllers/admin.controller');
const enquiryController = require('../controllers/enquiry.controller');
const chatController = require('../controllers/chat.controller');
const { loginRules } = require('../validators/auth.validator');
const { updateEnquiryRules } = require('../validators/enquiry.validator');
const { createStudentRules, updateStudentRules } = require('../validators/student.validator');
const { createCourseRules, updateCourseRules } = require('../validators/course.validator');
const { createFacultyRules, updateFacultyRules } = require('../validators/faculty.validator');
const { createResultRules, updateResultRules } = require('../validators/result.validator');
const { createFaqRules, updateFaqRules } = require('../validators/faq.validator');

const router = express.Router();

// Multer config for file uploads (memory storage for Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// ── Auth (no middleware needed) ──
router.post('/login', validate(loginRules), authController.login);

// ── All routes below require authentication ──
router.use(authenticate);

// ── Dashboard ──
router.get('/dashboard', dashboardController.getDashboard);

// ── Enquiries ──
router.get('/enquiries', enquiryController.getEnquiries);
router.patch('/enquiries/:id', validate(updateEnquiryRules), enquiryController.updateEnquiry);

// ── Students ──
router.get('/students', adminController.getStudents);
router.post('/students', validate(createStudentRules), adminController.createStudent);
router.patch('/students/:id', validate(updateStudentRules), adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// ── Courses ──
router.post('/courses', validate(createCourseRules), adminController.createCourse);
router.patch('/courses/:id', validate(updateCourseRules), adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// ── Faculty ──
router.post('/faculty', validate(createFacultyRules), adminController.createFaculty);
router.patch('/faculty/:id', validate(updateFacultyRules), adminController.updateFaculty);
router.delete('/faculty/:id', adminController.deleteFaculty);

// ── Results ──
router.post('/results', validate(createResultRules), adminController.createResult);
router.patch('/results/:id', validate(updateResultRules), adminController.updateResult);
router.delete('/results/:id', adminController.deleteResult);

// ── Gallery ──
router.post('/gallery', adminController.createGalleryItem);
router.delete('/gallery/:id', adminController.deleteGalleryItem);

// ── FAQs ──
router.post('/faqs', validate(createFaqRules), adminController.createFaq);
router.patch('/faqs/:id', validate(updateFaqRules), adminController.updateFaq);
router.delete('/faqs/:id', adminController.deleteFaq);

// ── Settings ──
router.patch('/settings', adminController.updateSettings);

// ── Image Upload ──
router.post('/upload', upload.single('image'), adminController.uploadImage);

// ── Chat Session Transcript ──
router.get('/chat/:sessionId', chatController.getAdminChatSession);

module.exports = router;
