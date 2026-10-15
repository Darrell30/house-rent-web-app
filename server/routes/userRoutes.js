const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { profileUpdateSchema } = require('../validators/schemas');

router.get('/me', authenticate, userController.getProfile);
router.patch('/me', authenticate, validateBody(profileUpdateSchema), userController.updateProfile);

module.exports = router;
