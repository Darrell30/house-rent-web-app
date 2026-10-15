const { errorResponse } = require('../utils/apiResponse');

const validateBody = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return errorResponse(res, 400, 'Validation failed', formattedErrors);
    }
    return errorResponse(res, 400, error.message || 'Validation error');
  }
};

const validateQuery = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.query);
    req.query = validated;
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return errorResponse(res, 400, 'Query validation failed', formattedErrors);
    }
    return errorResponse(res, 400, error.message || 'Validation error');
  }
};

module.exports = {
  validateBody,
  validateQuery,
};
