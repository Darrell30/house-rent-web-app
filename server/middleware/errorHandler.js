const { errorResponse } = require('../utils/apiResponse');

const notFoundHandler = (req, res, next) => {
  return errorResponse(res, 404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
};

const errorHandler = (err, req, res, next) => {
  console.error('[Global Error]:', err);

  // Mongoose CastError (e.g., malformed ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, 400, `Resource not found or invalid identifier format for ${err.path}`);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    return errorResponse(res, 409, `A record with this ${fields} already exists`);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Authentication token has expired');
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 400, 'File too large. Maximum size is 5MB.');
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal server error';

  return errorResponse(res, statusCode, message);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
