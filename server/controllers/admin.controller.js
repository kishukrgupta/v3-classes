const prisma = require('../utils/prisma');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const storageService = require('../services/storage.service');
const chatbotService = require('../services/chatbot.service');

// ═══════════════════════════════════════
// STUDENT CRUD
// ═══════════════════════════════════════

const getStudents = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.student.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: students,
    pagination: { page: parseInt(page), limit: take, total, pages: Math.ceil(total / take) },
  });
});

const createStudent = catchAsync(async (req, res) => {
  const { name, phone, email, class: studentClass, course, school } = req.body;
  const student = await prisma.student.create({
    data: { name, phone, email, class: studentClass, course, school },
  });
  res.status(201).json({ status: 'success', data: student });
});

const updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const student = await prisma.student.update({ where: { id }, data: req.body });
  res.json({ status: 'success', data: student });
});

const deleteStudent = catchAsync(async (req, res) => {
  await prisma.student.delete({ where: { id: req.params.id } });
  res.json({ status: 'success', message: 'Student deleted' });
});

// ═══════════════════════════════════════
// COURSE CRUD
// ═══════════════════════════════════════

const createCourse = catchAsync(async (req, res) => {
  const course = await prisma.course.create({ data: req.body });
  res.status(201).json({ status: 'success', data: course });
});

const updateCourse = catchAsync(async (req, res) => {
  const course = await prisma.course.update({ where: { id: req.params.id }, data: req.body });
  res.json({ status: 'success', data: course });
});

const deleteCourse = catchAsync(async (req, res) => {
  await prisma.course.delete({ where: { id: req.params.id } });
  res.json({ status: 'success', message: 'Course deleted' });
});

// ═══════════════════════════════════════
// FACULTY CRUD
// ═══════════════════════════════════════

const createFaculty = catchAsync(async (req, res) => {
  const faculty = await prisma.faculty.create({ data: req.body });
  res.status(201).json({ status: 'success', data: faculty });
});

const updateFaculty = catchAsync(async (req, res) => {
  const faculty = await prisma.faculty.update({ where: { id: req.params.id }, data: req.body });
  res.json({ status: 'success', data: faculty });
});

const deleteFaculty = catchAsync(async (req, res) => {
  await prisma.faculty.delete({ where: { id: req.params.id } });
  res.json({ status: 'success', message: 'Faculty member deleted' });
});

// ═══════════════════════════════════════
// RESULT CRUD
// ═══════════════════════════════════════

const createResult = catchAsync(async (req, res) => {
  const result = await prisma.result.create({ data: req.body });
  res.status(201).json({ status: 'success', data: result });
});

const updateResult = catchAsync(async (req, res) => {
  const result = await prisma.result.update({ where: { id: req.params.id }, data: req.body });
  res.json({ status: 'success', data: result });
});

const deleteResult = catchAsync(async (req, res) => {
  await prisma.result.delete({ where: { id: req.params.id } });
  res.json({ status: 'success', message: 'Result deleted' });
});

// ═══════════════════════════════════════
// GALLERY CRUD
// ═══════════════════════════════════════

const createGalleryItem = catchAsync(async (req, res) => {
  const { title, imageUrl, category, description } = req.body;
  const item = await prisma.gallery.create({
    data: { title, imageUrl, category, description },
  });
  res.status(201).json({ status: 'success', data: item });
});

const deleteGalleryItem = catchAsync(async (req, res) => {
  await prisma.gallery.delete({ where: { id: req.params.id } });
  res.json({ status: 'success', message: 'Gallery item deleted' });
});

// ═══════════════════════════════════════
// FAQ CRUD
// ═══════════════════════════════════════

const createFaq = catchAsync(async (req, res) => {
  const faq = await prisma.fAQ.create({ data: req.body });
  // Invalidate chatbot FAQ cache
  chatbotService.invalidateCache();
  res.status(201).json({ status: 'success', data: faq });
});

const updateFaq = catchAsync(async (req, res) => {
  const faq = await prisma.fAQ.update({ where: { id: req.params.id }, data: req.body });
  // Invalidate chatbot FAQ cache
  chatbotService.invalidateCache();
  res.json({ status: 'success', data: faq });
});

const deleteFaq = catchAsync(async (req, res) => {
  await prisma.fAQ.delete({ where: { id: req.params.id } });
  chatbotService.invalidateCache();
  res.json({ status: 'success', message: 'FAQ deleted' });
});

// ═══════════════════════════════════════
// WEBSITE SETTINGS
// ═══════════════════════════════════════

const updateSettings = catchAsync(async (req, res) => {
  // Find existing settings or create
  let settings = await prisma.websiteSettings.findFirst();

  if (settings) {
    settings = await prisma.websiteSettings.update({
      where: { id: settings.id },
      data: req.body,
    });
  } else {
    settings = await prisma.websiteSettings.create({ data: req.body });
  }

  res.json({ status: 'success', data: settings });
});

// ═══════════════════════════════════════
// IMAGE UPLOAD
// ═══════════════════════════════════════

const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No image file provided');
  }

  const folder = req.body.folder || 'v3classes';
  const result = await storageService.upload(req.file.buffer, { folder });

  res.json({
    status: 'success',
    data: { url: result.url, publicId: result.publicId },
  });
});

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  createCourse,
  updateCourse,
  deleteCourse,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  createResult,
  updateResult,
  deleteResult,
  createGalleryItem,
  deleteGalleryItem,
  createFaq,
  updateFaq,
  deleteFaq,
  updateSettings,
  uploadImage,
};
