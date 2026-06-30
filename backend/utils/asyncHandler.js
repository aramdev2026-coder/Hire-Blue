/**
 * Wraps async route handlers to automatically catch errors and pass them to next().
 * This eliminates the need for repetitive try/catch blocks in every route.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
