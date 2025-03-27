const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  user:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message:{
    type: String,
    required: true
  },
  isRead:{
    type: Boolean,
    default: false
  },
}, [timestamps = true]);

module.exports = mongoose.model('Notification', notificationSchema);