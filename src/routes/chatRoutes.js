const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/:userId', authMiddleware, chatController.getChatHistory);
router.post('/', authMiddleware, chatController.sendMessage);

module.exports = router;