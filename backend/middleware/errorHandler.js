import env from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Global Error Handling Middleware.
 * Catches all errors thrown synchronously or passed via next(err).
 * In production, it hides the stack trace and uses a generic message for non-operational errors.
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error using Winston
  if (err.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} >> ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} >> ${err.message}`);
  }

  if (env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err.message,
      stack: err.stack,
    });
  }

  // Production Error Handling
  if (err.isOperational) {
    // Trusted operational error: leak message to client
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err.message,
    });
  }

  // Programming or unknown error: don't leak details
  return res.status(500).json({
    success: false,
    status: 'error',
    error: 'Something went wrong on the server.',
  });
}
