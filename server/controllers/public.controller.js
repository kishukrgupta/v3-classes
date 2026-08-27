const prisma = require('../utils/prisma');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

// ═══════════════════════════════════════
// PUBLIC API CONTROLLERS
// ═══════════════════════════════════════

/** GET /api/courses — List all active courses */
const getCourses = catchAsync(async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ status: 'success', data: courses });
});

/** GET /api/courses/:id — Get a single course */
const getCourse = catchAsync(async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
  });
  if (!course) throw ApiError.notFound('Course not found');
  res.json({ status: 'success', data: course });
});

/** GET /api/faculty — List all active faculty */
const getFaculty = catchAsync(async (req, res) => {
  const faculty = await prisma.faculty.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ status: 'success', data: faculty });
});

/** GET /api/faculty/:id — Get a single faculty member */
const getFacultyMember = catchAsync(async (req, res) => {
  const member = await prisma.faculty.findUnique({
    where: { id: req.params.id },
  });
  if (!member) throw ApiError.notFound('Faculty member not found');
  res.json({ status: 'success', data: member });
});

/** GET /api/results — List all results */
const getResults = catchAsync(async (req, res) => {
  const { category, year } = req.query;
  const where = {};
  if (category) where.category = category;
  if (year) where.year = year;

  const results = await prisma.result.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ status: 'success', data: results });
});

/** GET /api/results/featured — List featured results only */
const getFeaturedResults = catchAsync(async (req, res) => {
  const results = await prisma.result.findMany({
    where: { isFeatured: true },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ status: 'success', data: results });
});

/** GET /api/gallery — List all gallery images */
const getGallery = catchAsync(async (req, res) => {
  const { category } = req.query;
  const where = {};
  if (category) where.category = category;

  const gallery = await prisma.gallery.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ status: 'success', data: gallery });
});

/** GET /api/faqs — List all active FAQs */
const getFaqs = catchAsync(async (req, res) => {
  const { category } = req.query;
  const where = { isActive: true };
  if (category) where.category = category;

  const faqs = await prisma.fAQ.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ status: 'success', data: faqs });
});

/** GET /api/settings — Get website settings */
const getSettings = catchAsync(async (req, res) => {
  let settings = await prisma.websiteSettings.findFirst();
  if (!settings) {
    // Create default settings if none exist
    settings = await prisma.websiteSettings.create({
      data: {
        instituteName: 'V3 Classes',
        phone: '9386851441',
        email: 'vikashprakashv3class@gmail.com',
      },
    });
  }
  res.json({ status: 'success', data: settings });
});

module.exports = {
  getCourses,
  getCourse,
  getFaculty,
  getFacultyMember,
  getResults,
  getFeaturedResults,
  getGallery,
  getFaqs,
  getSettings,
};
