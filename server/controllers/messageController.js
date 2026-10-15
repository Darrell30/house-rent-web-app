const mongoose = require('mongoose');
const Message = require('../models/Message');
const Property = require('../models/Property');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Send a message regarding a property
const sendMessage = async (req, res, next) => {
  try {
    const { propertyId, recipientId, content } = req.body;

    if (!mongoose.isValidObjectId(propertyId) || !mongoose.isValidObjectId(recipientId)) {
      return errorResponse(res, 400, 'Invalid property or recipient ID');
    }
    if (String(req.user._id) === String(recipientId)) {
      return errorResponse(res, 400, 'You cannot send a message to yourself');
    }
    const [property, recipient] = await Promise.all([
      Property.findById(propertyId),
      User.findById(recipientId),
    ]);
    if (!property || property.isArchived) return errorResponse(res, 404, 'Property listing not found');
    if (!recipient || !recipient.isActive) return errorResponse(res, 404, 'Recipient user not found');
    const ownerId = String(property.owner);
    const senderId = String(req.user._id);
    if (senderId === ownerId) {
      // Landlords can reply only to tenants who already initiated a conversation.
      if (recipient.role !== 'tenant') return errorResponse(res, 403, 'You can only reply to tenants');
      const inquiryExists = await Message.exists({ property: propertyId, sender: recipientId, recipient: req.user._id });
      if (!inquiryExists) return errorResponse(res, 403, 'No tenant inquiry for this property');
    } else {
      if (req.user.role !== 'tenant' || String(recipientId) !== ownerId) {
        return errorResponse(res, 403, 'You may only contact the owner of this property');
      }
    }

    const message = await Message.create({
      property: propertyId,
      sender: req.user._id,
      recipient: recipientId,
      content,
    });

    // Notify recipient of new inquiry message
    await createNotification({
      recipient: recipientId,
      type: 'system',
      title: `New Message from ${req.user.name}`,
      message: `Regarding "${property.title}": ${content.substring(0, 80)}${
        content.length > 80 ? '...' : ''
      }`,
      relatedEntityId: message._id,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatarUrl role')
      .populate('recipient', 'name avatarUrl role')
      .populate('property', 'title');

    return successResponse(res, 201, 'Message sent successfully', populated);
  } catch (error) {
    next(error);
  }
};

// Get message history for a property conversation
const getConversation = async (req, res, next) => {
  try {
    const { propertyId, otherUserId } = req.params;

    if (!mongoose.isValidObjectId(propertyId) || !mongoose.isValidObjectId(otherUserId)) {
      return errorResponse(res, 400, 'Invalid conversation ID');
    }
    const property = await Property.findById(propertyId);
    if (!property) return errorResponse(res, 404, 'Property not found');
    if (String(property.owner) !== String(req.user._id) && String(property.owner) !== String(otherUserId)) {
      return errorResponse(res, 403, 'Not a participant of this property conversation');
    }
    // Only reveal conversations that have actually been initiated.
    const exists = await Message.exists({ property: propertyId, $or: [
      { sender: req.user._id, recipient: otherUserId },
      { sender: otherUserId, recipient: req.user._id },
    ] });
    if (!exists) return errorResponse(res, 404, 'Conversation not found');

    const messages = await Message.find({
      property: propertyId,
      $or: [
        { sender: req.user._id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user._id },
      ],
    })
      .populate('sender', 'name avatarUrl role')
      .populate('recipient', 'name avatarUrl role')
      .sort({ createdAt: 1 });

    // Mark messages addressed to current user as read
    await Message.updateMany(
      {
        property: propertyId,
        sender: otherUserId,
        recipient: req.user._id,
        isRead: false,
      },
      { isRead: true }
    );

    return successResponse(res, 200, 'Conversation retrieved', messages);
  } catch (error) {
    next(error);
  }
};

// Get list of recent conversations for current user
const getConversationsList = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const recentMessages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate('property', 'title address city images')
      .populate('sender', 'name avatarUrl role')
      .populate('recipient', 'name avatarUrl role')
      .sort({ createdAt: -1 });

    // Group by property and the other party
    const conversationMap = new Map();

    for (const msg of recentMessages) {
      if (!msg.property) continue;
      const otherUser =
        msg.sender._id.toString() === userId.toString() ? msg.recipient : msg.sender;
      if (!otherUser) continue;

      const convKey = `${msg.property._id}-${otherUser._id}`;
      if (!conversationMap.has(convKey)) {
        conversationMap.set(convKey, {
          property: msg.property,
          otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      if (msg.recipient._id.toString() === userId.toString() && !msg.isRead) {
        conversationMap.get(convKey).unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationMap.values());
    return successResponse(res, 200, 'Conversations list retrieved', conversations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversationsList,
};
