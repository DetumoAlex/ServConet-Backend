const express = require('express');
const authMiddleware = require('../middlewares/auth-middleware');
const chat = require('../models/chat-model')
const router = express.Router();

module.exports.getChat=async (req, res)=>{
    try {
        const chats = await chat.find({
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
      const chat = new Chat({ sender: req.user.id, receiver, message });
      await chat.save();
  
      // Emit real-time chat message
      req.io.to(receiver).emit('newMessage', chat);
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: 'Error sending message', error });
    }
  };