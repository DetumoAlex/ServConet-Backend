const Notification = require('../models/notification');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    notification.isRead = true;
    await notification.save();
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error });
  }
};

// Create a new notification
exports.createNotification = async (userId, message) => {
  try {
    const notification = new Notification({
      user: userId,
      message: message,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
