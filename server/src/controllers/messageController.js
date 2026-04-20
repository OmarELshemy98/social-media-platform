const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

const ensureConversation = async (userA, userB) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [userA, userB], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userA, userB],
      lastMessageAt: new Date(),
    });
  }
  return conversation;
};

const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name username avatarUrl")
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({ conversations });
  } catch (error) {
    return next(error);
  }
};

const getMessagesByConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!conversation.participants.some((id) => String(id) === String(req.user._id))) {
      return res.status(403).json({ message: "Access denied for this conversation" });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", "name username avatarUrl")
      .populate("receiver", "name username avatarUrl")
      .sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    return next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const conversation = await ensureConversation(req.user._id, receiverId);

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    if (String(receiverId) !== String(req.user._id)) {
      await Notification.create({
        recipient: receiverId,
        sender: req.user._id,
        type: "message",
        message: `${req.user.username} sent you a message`,
      });
    }

    const populated = await message.populate([
      { path: "sender", select: "name username avatarUrl" },
      { path: "receiver", select: "name username avatarUrl" },
    ]);
    return res.status(201).json({ message: populated, conversationId: conversation._id });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyConversations,
  getMessagesByConversation,
  sendMessage,
};
