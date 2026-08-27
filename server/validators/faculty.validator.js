const { body } = require('express-validator');

const createFacultyRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Faculty name is required'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('qualification')
    .optional({ values: 'falsy' })
    .trim(),
  body('experience')
    .optional({ values: 'falsy' })
    .trim(),
  body('description')
    .optional({ values: 'falsy' })
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updateFacultyRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('subject')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject cannot be empty'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

module.exports = { createFacultyRules, updateFacultyRules };
