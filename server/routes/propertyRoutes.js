const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireApprovedOwner } = require('../middleware/role');
const { validateBody } = require('../middleware/validation');
const upload = require('../middleware/upload');
const {
  propertyCreateSchema,
  propertyUpdateSchema,
} = require('../validators/schemas');

// Public search and browsing with optional auth for favorite status
router.get('/', optionalAuth, propertyController.getProperties);

// Current owner listings
router.get('/my/listings', authenticate, requireApprovedOwner, propertyController.getMyListings);

// Image upload (Authenticated owners/admins)
router.post(
  '/upload',
  authenticate,
  requireApprovedOwner,
  upload.array('images', 8),
  propertyController.uploadImages
);

// Single property details
router.get('/:id', optionalAuth, propertyController.getPropertyById);

// Create new listing (Approved owners only)
router.post(
  '/',
  authenticate,
  requireApprovedOwner,
  validateBody(propertyCreateSchema),
  propertyController.createProperty
);

// Update listing (Owner or Admin)
router.patch(
  '/:id',
  authenticate,
  validateBody(propertyUpdateSchema),
  propertyController.updateProperty
);

// Delete / Archive listing (Owner or Admin)
router.delete('/:id', authenticate, propertyController.deleteProperty);

module.exports = router;
