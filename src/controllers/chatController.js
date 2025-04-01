// const express = require('express');
// const authMiddleware = require('../middlewares/auth-middleware');
const Chat = require('../models/chat-model')
const {createNotification} = require('../controllers/notificationController')
// const router = express.Router();

module.exports.getChat=async (req, res)=>{
    try {
        const chats = await Chat.find({
        $or:[
            {sender: req.user.id, receiver: req.params.userId},
            {sender: req.params.userId, receiver: req.user.id}
        ]
    }).sort({timestamp:1})
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// send a new message
module.exports.sendMessage = async (req, res) => {
    try {
      const { receiver, message } = req.body;

      if (!receiver || !message) {
        return res.status(400).json({ message: 'Receiver and message are required' });
    }

      const newChat = new Chat({ sender: req.user.id, receiver, message });
      await newChat.save();
  
      // Emit real-time chat message
      req.io.to(receiver).emit('newMessage', newChat);

    //   creates a notification for the receiver
    await createNotification(receiver, 'You have a new message');
    
      res.json(newChat);
    } catch (error) {
        console.error('Error sending message:', error);
      res.status(500).json({ message: 'Error sending message', error });
    }
  };