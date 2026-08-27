const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/ApiError');

/**
 * JWT authentication middleware.
 * Extracts token from Authorization header and verifies it.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('No authentication token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired, please login again'));
    }
    return next(ApiError.unauthorized('Invalid authentication token'));
  }
};

/**
 * Role-based authorization middleware.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(ApiError.unauthorized('Not authenticated'));
    }
    if (roles.length && !roles.includes(req.admin.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
