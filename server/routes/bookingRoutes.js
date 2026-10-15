const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { requireApprovedOwner } = require('../middleware/role');
const { validateBody } = require('../middleware/validation');
const {
  bookingCreateSchema,
  bookingStatusSchema,
} = require('../validators/schemas');

// Tenant submits booking request
router.post(
  '/',
  authenticate,
  validateBody(bookingCreateSchema),
  bookingController.createBooking
);

// Tenant views own booking requests
router.get('/my', authenticate, bookingController.getMyBookings);

// Owner views received booking requests
router.get(
  '/owner',
  authenticate,
  requireApprovedOwner,
  bookingController.getOwnerBookings
);

// Single booking request details
router.get('/:id', authenticate, bookingController.getBookingById);

// Owner updates booking request status (approve/reject)
router.patch(
  '/:id/status',
  authenticate,
  requireApprovedOwner,
  validateBody(bookingStatusSchema),
  bookingController.updateBookingStatus
);

// Tenant cancels pending booking request
router.patch('/:id/cancel', authenticate, bookingController.cancelBooking);

module.exports = router;
