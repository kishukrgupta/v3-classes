const { body } = require('express-validator');

const createFaqRules = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required'),
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required'),
  body('category')
    .optional({ values: 'falsy' })
    .trim(),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updateFaqRules = [
  body('question')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Question cannot be empty'),
  body('answer')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Answer cannot be empty'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

module.exports = { createFaqRules, updateFaqRules };
