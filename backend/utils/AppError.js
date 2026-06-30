/**
 * Custom application error class that distinguishes between operational errors
 * (e.g., bad requests, invalid input) and programming errors (e.g., undefined variables).
 */
export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
