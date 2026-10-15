const Notification = require('../models/Notification');

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedEntityId = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedEntityId,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService Error]:', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
