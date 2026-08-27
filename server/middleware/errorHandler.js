const config = require('../config');

/**
 * Global error handler middleware.
 * Sends structured JSON error responses.
 */
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let status = err.status || 'error';

  // Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    status = 'fail';
    message = 'A record with this value already exists';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    status = 'fail';
    message = 'Record not found';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    status = 'fail';
    message = 'Related record not found';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    status = 'fail';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    status = 'fail';
    message = 'Token expired';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    status = 'fail';
  }

  // Log error in development
  if (config.isDev) {
    console.error(`[ERROR] ${statusCode} - ${message}`);
    if (statusCode >= 500) {
      console.error(err.stack);
    }
  }

  const response = {
    status,
    message,
  };

  // Include stack trace in development for 500+ errors
  if (config.isDev && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
