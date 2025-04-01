const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/:userId', authMiddleware, chatController.getChat);
router.post('/chats', authMiddleware, chatController.sendMessage);

module.exports = router;