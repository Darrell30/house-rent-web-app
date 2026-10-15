const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const { validateBody } = require('../middleware/validation');
const {
  adminUserApprovalSchema,
  adminUserStatusSchema,
} = require('../validators/schemas');

// Require admin role for all subroutes
router.use(authenticate, authorizeRoles('admin'));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/users', adminController.getUsers);
router.patch(
  '/users/:id/approval',
  validateBody(adminUserApprovalSchema),
  adminController.updateUserApproval
);
router.patch(
  '/users/:id/status',
  validateBody(adminUserStatusSchema),
  adminController.updateUserStatus
);

router.get('/properties', adminController.getAdminProperties);
router.patch('/properties/:id/archive', adminController.toggleArchiveProperty);

router.get('/bookings', adminController.getAdminBookings);

module.exports = router;
