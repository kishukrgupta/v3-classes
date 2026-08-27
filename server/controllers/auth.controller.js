const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const config = require('../config');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/** POST /api/admin/login — Admin login */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find admin by email
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!admin) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  res.json({
    status: 'success',
    data: {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});

module.exports = { login };
