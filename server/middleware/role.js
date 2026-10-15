const { errorResponse } = require('../utils/apiResponse');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Role '${req.user.role}' is not authorized to perform this action.`
      );
    }

    next();
  };
};

const requireApprovedOwner = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, 'Authentication required');
  }

  // Admins bypass owner approval requirements
  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role !== 'owner') {
    return errorResponse(res, 403, 'Access denied. Only property owners can perform this action.');
  }

  if (req.user.ownerApprovalStatus === 'pending') {
    return errorResponse(
      res,
      403,
      'Your owner account is currently pending administrator approval. You cannot list or manage properties until approved.'
    );
  }

  if (req.user.ownerApprovalStatus === 'rejected') {
    return errorResponse(
      res,
      403,
      'Your owner account application has been rejected by an administrator. Please contact support.'
    );
  }

  next();
};

module.exports = {
  authorizeRoles,
  requireApprovedOwner,
};
