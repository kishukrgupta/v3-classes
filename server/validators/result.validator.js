const { body } = require('express-validator');

const createResultRules = [
  body('studentName')
    .trim()
    .notEmpty()
    .withMessage('Student name is required'),
  body('exam')
    .optional({ values: 'falsy' })
    .trim(),
  body('class')
    .optional({ values: 'falsy' })
    .trim(),
  body('score')
    .optional({ values: 'falsy' })
    .trim(),
  body('rank')
    .optional({ values: 'falsy' })
    .trim(),
  body('year')
    .optional({ values: 'falsy' })
    .trim(),
  body('category')
    .optional()
    .isIn(['board', 'competitive'])
    .withMessage('Category must be board or competitive'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
];

const updateResultRules = [
  body('studentName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Student name cannot be empty'),
  body('category')
    .optional()
    .isIn(['board', 'competitive'])
    .withMessage('Category must be board or competitive'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
];

module.exports = { createResultRules, updateResultRules };
