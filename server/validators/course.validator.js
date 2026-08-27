const { body } = require('express-validator');

const createCourseRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Course name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('description')
    .optional({ values: 'falsy' })
    .trim(),
  body('classRange')
    .optional({ values: 'falsy' })
    .trim(),
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array'),
  body('duration')
    .optional({ values: 'falsy' })
    .trim(),
  body('fee')
    .optional({ values: 'falsy' })
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updateCourseRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course name cannot be empty'),
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

module.exports = { createCourseRules, updateCourseRules };
