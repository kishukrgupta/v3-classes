const { body } = require('express-validator');

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = { loginRules };
