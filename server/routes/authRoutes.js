const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const {
  registerSchema,
  loginSchema,
  passwordChangeSchema,
} = require('../validators/schemas');

// Public auth routes
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected auth routes
router.get('/me', authenticate, authController.getMe);
router.patch(
  '/password',
  authenticate,
  validateBody(passwordChangeSchema),
  authController.changePassword
);

module.exports = router;
