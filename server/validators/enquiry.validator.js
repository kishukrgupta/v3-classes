const { body } = require('express-validator');

const createEnquiryRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
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
    .withMessage('Please provide a valid email address'),
  body('class')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Class must be less than 50 characters'),
  body('course')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Course must be less than 100 characters'),
  body('message')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters'),
  body('source')
    .optional()
    .isIn(['WEBSITE', 'CHAT', 'CONTACT_FORM', 'PHONE', 'WALK_IN'])
    .withMessage('Invalid enquiry source'),
];

const updateEnquiryRules = [
  body('status')
    .optional()
    .isIn(['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED'])
    .withMessage('Invalid status value'),
  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must be less than 2000 characters'),
];

module.exports = { createEnquiryRules, updateEnquiryRules };
