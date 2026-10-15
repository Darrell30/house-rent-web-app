const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Admin platform dashboard statistics
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTenants,
      totalOwners,
      pendingOwnerApprovals,
      totalProperties,
      availableProperties,
      totalBookings,
      pendingBookings,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'tenant' }),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'owner', ownerApprovalStatus: 'pending' }),
      Property.countDocuments({ isArchived: false }),
      Property.countDocuments({ isArchived: false, availabilityStatus: 'available' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      User.find().sort({ createdAt: -1 }).limit(5).lean(),
      Booking.find()
        .populate('tenant', 'name email')
        .populate('property', 'title city')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Breakdown of properties by type
    const propertyTypeBreakdown = await Property.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$propertyType', count: { $sum: 1 } } },
    ]);

    const stats = {
      totalUsers,
      totalTenants,
      totalOwners,
      pendingOwnerApprovals,
      totalProperties,
      availableProperties,
      totalBookings,
      pendingBookings,
      propertyTypeBreakdown: propertyTypeBreakdown.map((item) => ({
        type: item._id,
        count: item.count,
      })),
      recentActivity: {
        recentUsers,
        recentBookings,
      },
    };

    return successResponse(res, 200, 'Admin dashboard metrics retrieved', stats);
  } catch (error) {
    next(error);
  }
};

// Get all users with filters and pagination
const getUsers = async (req, res, next) => {
  try {
    const { role, ownerApprovalStatus, isActive, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) query.role = role;
    if (ownerApprovalStatus) query.ownerApprovalStatus = ownerApprovalStatus;
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Users retrieved successfully', users, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// Approve or reject owner application
const updateUserApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user.role !== 'owner') {
      return errorResponse(res, 400, 'User is not registered as an owner');
    }

    user.ownerApprovalStatus = status;
    await user.save();

    // Notify the user of the decision
    if (status === 'approved') {
      await createNotification({
        recipient: user._id,
        type: 'owner_approved',
        title: 'Owner Application Approved!',
        message:
          'Your owner account has been approved by the administrator. You can now post and manage property listings.',
        relatedEntityId: user._id,
      });
    } else {
      await createNotification({
        recipient: user._id,
        type: 'owner_rejected',
        title: 'Owner Application Declined',
        message:
          'Your owner account application has been reviewed and declined. Please contact administration for more details.',
        relatedEntityId: user._id,
      });
    }

    return successResponse(res, 200, `Owner status updated to ${status}`, user.toJSON());
  } catch (error) {
    next(error);
  }
};

// Activate or deactivate user account
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent admin from deactivating their own account
    if (req.user._id.toString() === id && isActive === false) {
      return errorResponse(res, 400, 'You cannot deactivate your own administrator account');
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    user.isActive = Boolean(isActive);
    await user.save();

    return successResponse(
      res,
      200,
      `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user.toJSON()
    );
  } catch (error) {
    next(error);
  }
};

// Moderate / View all properties
const getAdminProperties = async (req, res, next) => {
  try {
    const { search, availabilityStatus, isArchived, page = 1, limit = 20 } = req.query;

    const query = {};

    if (isArchived !== undefined && isArchived !== '') {
      query.isArchived = isArchived === 'true';
    }
    if (availabilityStatus) {
      query.availabilityStatus = availabilityStatus;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { city: searchRegex }, { address: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Property.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Admin properties retrieved', properties, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// Toggle archive/hide on a property listing
const toggleArchiveProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    property.isArchived = !property.isArchived;
    await property.save();

    return successResponse(
      res,
      200,
      `Property ${property.isArchived ? 'archived' : 'unarchived'} successfully`,
      property
    );
  } catch (error) {
    next(error);
  }
};

// Get all bookings platform-wide
const getAdminBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('property', 'title address city monthlyRent')
        .populate('tenant', 'name email phone')
        .populate('owner', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Admin bookings retrieved', bookings, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  updateUserApproval,
  updateUserStatus,
  getAdminProperties,
  toggleArchiveProperty,
  getAdminBookings,
};
