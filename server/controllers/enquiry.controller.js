const prisma = require('../utils/prisma');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/** POST /api/enquiries — Create a new enquiry (public) */
const createEnquiry = catchAsync(async (req, res) => {
  const { name, phone, email, class: studentClass, course, message, source } = req.body;

  const enquiry = await prisma.enquiry.create({
    data: {
      name,
      phone,
      email: email || null,
      class: studentClass || null,
      course: course || null,
      message: message || null,
      source: source || 'WEBSITE',
      status: 'NEW',
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Thank you for your enquiry! Our team will contact you shortly.',
    data: { id: enquiry.id },
  });
});

/** POST /api/contact — Create a contact form submission (public) */
const createContact = catchAsync(async (req, res) => {
  const { name, phone, email, message } = req.body;

  const enquiry = await prisma.enquiry.create({
    data: {
      name,
      phone,
      email: email || null,
      message: message || null,
      source: 'CONTACT_FORM',
      status: 'NEW',
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Your message has been received! We will get back to you soon.',
    data: { id: enquiry.id },
  });
});

/** GET /api/admin/enquiries — List all enquiries (admin) */
const getEnquiries = catchAsync(async (req, res) => {
  const { status, source, page = 1, limit = 20, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [enquiries, total] = await Promise.all([
    prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.enquiry.count({ where }),
  ]);

  res.json({
    status: 'success',
    data: enquiries,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      pages: Math.ceil(total / take),
    },
  });
});

/** PATCH /api/admin/enquiries/:id — Update an enquiry (admin) */
const updateEnquiry = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const data = {};
  if (status) data.status = status;
  if (notes !== undefined) data.notes = notes;

  const enquiry = await prisma.enquiry.update({
    where: { id },
    data,
  });

  res.json({ status: 'success', data: enquiry });
});

module.exports = {
  createEnquiry,
  createContact,
  getEnquiries,
  updateEnquiry,
};
