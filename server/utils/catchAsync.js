/**
 * Wraps async route handlers to forward rejected promises
 * to the Express error handler instead of crashing.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
