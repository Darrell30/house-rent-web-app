const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Create a rental booking request
const createBooking = async (req, res, next) => {
  try {
    const { propertyId, moveInDate, moveOutDate, occupants, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property || property.isArchived) {
      return errorResponse(res, 404, 'Property listing not found or is no longer available');
    }

    if (property.availabilityStatus !== 'available') {
      return errorResponse(
        res,
        400,
        `Property is currently ${property.availabilityStatus} and not available for new bookings`
      );
    }

    // Prevent owners from booking their own properties
    if (property.owner.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot submit a rental booking for your own property');
    }

    // Prevent duplicate active booking requests by the same tenant
    const existingActiveBooking = await Booking.findOne({
      property: property._id,
      tenant: req.user._id,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingActiveBooking) {
      return errorResponse(
        res,
        400,
        'You already have an active or pending booking request for this property'
      );
    }

    const booking = await Booking.create({
      property: property._id,
      tenant: req.user._id,
      owner: property.owner,
      moveInDate: new Date(moveInDate),
      moveOutDate: moveOutDate ? new Date(moveOutDate) : null,
      occupants: Number(occupants) || 1,
      message: message || '',
      status: 'pending',
    });

    // Notify the property owner
    await createNotification({
      recipient: property.owner,
      type: 'booking_created',
      title: 'New Booking Request',
      message: `${req.user.name} requested to rent "${property.title}". Move-in date: ${new Date(
        moveInDate
      ).toLocaleDateString()}`,
      relatedEntityId: booking._id,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title address city monthlyRent images')
      .populate('owner', 'name email phone');

    return successResponse(
      res,
      201,
      'Rental booking request submitted successfully',
      populatedBooking
    );
  } catch (error) {
    next(error);
  }
};

// Get current tenant's booking requests
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ tenant: req.user._id })
      .populate('property', 'title address city monthlyRent propertyType images availabilityStatus')
      .populate('owner', 'name email phone avatarUrl')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
};

// Get booking requests for properties owned by current user
const getOwnerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('property', 'title address city monthlyRent propertyType images availabilityStatus')
      .populate('tenant', 'name email phone avatarUrl')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Owner booking requests retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
};

// Get single booking details
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('property')
      .populate('tenant', 'name email phone avatarUrl')
      .populate('owner', 'name email phone avatarUrl');

    if (!booking) {
      return errorResponse(res, 404, 'Booking request not found');
    }

    const isTenant = booking.tenant._id.toString() === req.user._id.toString();
    const isOwner = booking.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTenant && !isOwner && !isAdmin) {
      return errorResponse(res, 403, 'You are not authorized to view this booking request');
    }

    return successResponse(res, 200, 'Booking details retrieved', booking);
  } catch (error) {
    next(error);
  }
};

// Update booking status (Approve or Reject by Owner)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const booking = await Booking.findById(id).populate('property');
    if (!booking) {
      return errorResponse(res, 404, 'Booking request not found');
    }

    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 403, 'Only the property owner or an administrator can update this booking');
    }

    if (booking.status !== 'pending') {
      return errorResponse(
        res,
        400,
        `Cannot change status of a booking that is already ${booking.status}`
      );
    }

    booking.status = status;
    await booking.save();

    if (status === 'approved') {
      // 1. Mark the property as rented
      await Property.findByIdAndUpdate(booking.property._id, {
        availabilityStatus: 'rented',
      });

      // 2. Reject other pending booking requests for this property to avoid double booking
      const otherPendingBookings = await Booking.find({
        property: booking.property._id,
        _id: { $ne: booking._id },
        status: 'pending',
      });

      for (const other of otherPendingBookings) {
        other.status = 'rejected';
        await other.save();

        await createNotification({
          recipient: other.tenant,
          type: 'booking_rejected',
          title: 'Booking Request Closed',
          message: `Your booking request for "${booking.property.title}" was declined because the property has been rented to another applicant.`,
          relatedEntityId: other._id,
        });
      }

      // 3. Notify approved tenant
      await createNotification({
        recipient: booking.tenant,
        type: 'booking_approved',
        title: 'Booking Request Approved!',
        message: `Congratulations! Your rental booking for "${booking.property.title}" has been approved by the owner.`,
        relatedEntityId: booking._id,
      });
    } else if (status === 'rejected') {
      // Notify rejected tenant
      const rejectionMsg = reason
        ? `Your booking request for "${booking.property.title}" was declined. Reason: ${reason}`
        : `Your booking request for "${booking.property.title}" was declined by the property owner.`;

      await createNotification({
        recipient: booking.tenant,
        type: 'booking_rejected',
        title: 'Booking Request Declined',
        message: rejectionMsg,
        relatedEntityId: booking._id,
      });
    }

    const updated = await Booking.findById(booking._id)
      .populate('property')
      .populate('tenant', 'name email phone')
      .populate('owner', 'name email phone');

    return successResponse(res, 200, `Booking status changed to ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

// Cancel booking by Tenant
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('property');

    if (!booking) {
      return errorResponse(res, 404, 'Booking request not found');
    }

    const isTenant = booking.tenant.toString() === req.user._id.toString();
    if (!isTenant) {
      return errorResponse(res, 403, 'You can only cancel your own booking requests');
    }

    if (booking.status !== 'pending') {
      return errorResponse(
        res,
        400,
        `Only pending booking requests can be cancelled. Current status is ${booking.status}`
      );
    }

    booking.status = 'cancelled';
    await booking.save();

    // Notify the owner
    await createNotification({
      recipient: booking.owner,
      type: 'booking_cancelled',
      title: 'Booking Request Cancelled',
      message: `${req.user.name} has cancelled their rental request for "${booking.property.title}".`,
      relatedEntityId: booking._id,
    });

    return successResponse(res, 200, 'Booking request cancelled successfully', booking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};
