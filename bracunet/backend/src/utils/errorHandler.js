/**
 * Centralized Error Handling Utility
 * Prevents sensitive server information from being exposed to clients
 */

// Known safe error messages that can be shown to users
const SAFE_ERROR_MESSAGES = [
  'You already have a pending verification request',
  'Your account is already verified',
  'Verification request not found',
  'This request has already been reviewed',
  'Only verified users can',
  'Not authorized',
  'Admin only',
  'Students cannot post opportunities',
  'Invalid credentials',
  'User not found',
  'Token expired',
  'No token provided',
  'Campaign not found',
  'This campaign is not accepting donations',
  'Insufficient funds',
  'You can only request verification for your registered role',
  'Not authenticated',
  'Opportunity not found',
  'Recommendation request not found',
  'Faculty member not found',
  'Invalid request status'
];

/**
 * Determines if an error message is safe to expose to the client
 * @param {string} message - The error message
 * @returns {boolean} - True if the message is safe to expose
 */
const isSafeErrorMessage = (message) => {
  if (!message || typeof message !== 'string') return false;
  
  // Check if message starts with any known safe pattern
  return SAFE_ERROR_MESSAGES.some(safeMsg => 
    message.toLowerCase().includes(safeMsg.toLowerCase())
  );
};

/**
 * Sanitizes error messages to prevent information leakage
 * @param {Error} error - The error object
 * @param {boolean} isDevelopment - Whether app is in development mode
 * @returns {Object} - Sanitized error response
 */
export const sanitizeError = (error, isDevelopment = false) => {
  // If it's a known safe error message, return it
  if (error.message && isSafeErrorMessage(error.message)) {
    return {
      message: error.message,
      ...(isDevelopment && { stack: error.stack })
    };
  }

  // For validation errors (like mongoose validation)
  if (error.name === 'ValidationError') {
    return {
      message: 'Validation failed. Please check your input.',
      ...(isDevelopment && { details: error.message })
    };
  }

  // For MongoDB duplicate key errors
  if (error.code === 11000) {
    return {
      message: 'A record with this information already exists.',
      ...(isDevelopment && { details: error.message })
    };
  }

  // For JWT errors
  if (error.name === 'JsonWebTokenError') {
    return {
      message: 'Invalid authentication token.',
      ...(isDevelopment && { details: error.message })
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      message: 'Your session has expired. Please login again.',
      ...(isDevelopment && { details: error.message })
    };
  }

  // For Cast errors (like invalid ObjectId)
  if (error.name === 'CastError') {
    return {
      message: 'Invalid identifier provided.',
      ...(isDevelopment && { details: error.message })
    };
  }

  // Log the actual error for debugging (server-side only)
  console.error('🔴 Server Error:', error);

  // Return generic message for unknown errors
  return {
    message: 'An unexpected error occurred. Please try again later.',
    ...(isDevelopment && { 
      actualError: error.message,
      stack: error.stack 
    })
  };
};

/**
 * Express error handling middleware
 * @param {Error} err - The error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
export const errorMiddleware = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Log error details (server-side only)
  console.error('🔴 Error occurred:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: isDevelopment ? err.stack : undefined
  });

  const statusCode = err.statusCode || err.status || 500;
  const sanitized = sanitizeError(err, isDevelopment);

  res.status(statusCode).json(sanitized);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Creates a custom error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} - Error object with statusCode
 */
export const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
