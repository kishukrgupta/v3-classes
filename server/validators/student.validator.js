const { body } = require('express-validator');

const createStudentRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Student name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[\d\s-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('class')
    .optional({ values: 'falsy' })
    .trim(),
  body('course')
    .optional({ values: 'falsy' })
    .trim(),
  body('school')
    .optional({ values: 'falsy' })
    .trim(),
];

const updateStudentRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
];

module.exports = { createStudentRules, updateStudentRules };
