const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { messageCreateSchema } = require('../validators/schemas');

router.use(authenticate);

router.post('/', validateBody(messageCreateSchema), messageController.sendMessage);
router.get('/conversations', messageController.getConversationsList);
router.get('/:propertyId/:otherUserId', messageController.getConversation);

module.exports = router;
