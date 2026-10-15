const User = require('../models/User');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Register new tenant or owner
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email address already exists');
    }

    // Enforce role assignment rules: Only tenant or owner can be registered publicly
    const assignedRole = role === 'owner' ? 'owner' : 'tenant';
    const ownerApprovalStatus = assignedRole === 'owner' ? 'pending' : 'approved';

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email,
      phone: phone || '',
      passwordHash,
      role: assignedRole,
      ownerApprovalStatus,
      isActive: true,
    });

    const token = generateToken({ id: user._id, role: user.role });
    setTokenCookie(res, token);

    let message = 'Registration successful.';
    if (assignedRole === 'owner') {
      message =
        'Owner registration submitted successfully. Your account is pending administrator approval before you can publish listings.';
    }

    return successResponse(
      res,
      201,
      message,
      {
        user: user.toJSON(),
        token, // Included for authorization header support
      }
    );
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const token = generateToken({ id: user._id, role: user.role });
    setTokenCookie(res, token);

    return successResponse(res, 200, 'Login successful', {
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    return successResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'Current user retrieved', {
      user: req.user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    return successResponse(res, 200, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  changePassword,
};
