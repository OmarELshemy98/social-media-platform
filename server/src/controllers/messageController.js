/**
 * @file messageController.js
 * @description الفايل ده هو "المسؤول عن الشات" (Chat & Messages).
 * هنا بنتحكم في كل حاجة تخص الرسايل الخاصة بين المستخدمين.
 */

// استيراد الموديلات (Models) اللي هنحتاجها عشان نكلم الداتا بيز.
const Conversation = require("../models/Conversation"); // موديل المحادثة (العلبة اللي بتشيل الرسايل).
const Message = require("../models/Message"); // موديل الرسالة الواحدة.
const Notification = require("../models/Notification"); // موديل الإشعارات عشان ننبه اليوزر لما تجيله رسالة.
const User = require("../models/User"); // موديل اليوزر عشان نتأكد إن اليوزر اللي بنكلمه موجود.

/**
 * وظيفة للتأكد من وجود محادثة بين شخصين، ولو مش موجودة بنكريت واحدة جديدة.
 * دي وظيفة مساعدة (Helper function) مش بتتربط بـ Route.
 */
const ensureConversation = async (userA, userB) => {
  // بندور في الداتا بيز على محادثة فيها الطرفين دول بالظبط.
  let conversation = await Conversation.findOne({
    participants: { $all: [userA, userB], $size: 2 },
  });

  // لو ملقيناش محادثة، بنعمل واحدة جديدة.
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userA, userB],
      lastMessageAt: new Date(),
      settings: [
        { user: userA },
        { user: userB }
      ]
    });
  }
  return conversation;
};

/**
 * وظيفة بدء محادثة باستخدام اسم المستخدم (Username)
 */
const startConversationByUsername = async (req, res, next) => {
  try {
    const { username } = req.body;
    // بندور على اليوزر اللي عايزين نكلمه.
    const targetUser = await User.findOne({ username: username.toLowerCase() });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // مينفعش حد يبعت رسالة لنفسه!
    if (String(targetUser._id) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    // بنتأكد إن في محادثة بينهم.
    const conversation = await ensureConversation(req.user._id, targetUser._id);
    // بنجيب بيانات المشاركين (الاسم، الصورة) عشان نعرضهم في الفرونت إند.
    const populated = await conversation.populate("participants", "name username avatarUrl");

    return res.status(200).json({ conversation: populated });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة جلب كل المحادثات الخاصة بي
 */
const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // بنجيب كل المحادثات اللي الـ ID بتاعي موجود فيها.
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name username avatarUrl")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name username" }
      })
      .sort({ lastMessageAt: -1 });

    // تصفية المحادثات:
    // 1. لو اليوزر مسح المحادثة (deletedAt)، بنشيلها لو مفيش رسايل جديدة بعدها.
    // 2. بنضيف بيانات الـ settings الخاصة باليوزر ده للرد.
    const filteredConversations = conversations.filter(conv => {
      const userSettings = conv.settings.find(s => String(s.user) === String(userId));
      // لو المحادثة ممسوحة نهائياً لليوزر ده، بنشيلها (إلا لو في رسايل جديدة هتيجي مستقبلاً)
      if (userSettings?.deletedAt && conv.lastMessageAt <= userSettings.deletedAt) {
        return false;
      }
      return true;
    });

    return res.status(200).json({ conversations: filteredConversations });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة جلب الرسايل بتاعة محادثة معينة
 */
const getMessagesByConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // بنجيب المحادثة بالـ ID بتاعها.
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    
    // بنشيك: هل اليوزر اللي باعت الطلب هو طرف في المحادثة دي فعلاً؟
    if (!conversation.participants.some((id) => String(id) === String(userId))) {
      return res.status(403).json({ message: "Access denied for this conversation" });
    }

    const userSettings = conversation.settings.find(s => String(s.user) === String(userId));

    // جلب الرسايل مع استثناء الرسايل اللي اتمسحت (قبل تاريخ deletedAt)
    const messageQuery = { conversation: conversation._id };
    if (userSettings?.deletedAt) {
      messageQuery.createdAt = { $gt: userSettings.deletedAt };
    }

    const messages = await Message.find(messageQuery)
      .populate("sender", "name username avatarUrl")
      .populate("receiver", "name username avatarUrl")
      .sort({ createdAt: 1 });

    // تحديث الرسايل اللي انا استلمتها كـ "مقروءة" (Seen)
    await Message.updateMany(
      { 
        conversation: conversation._id, 
        receiver: userId, 
        isRead: false 
      },
      { isRead: true }
    );

    return res.status(200).json({ messages });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة إرسال رسالة جديدة
 */
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, messageType, mediaUrl, fileName } = req.body;
    const senderId = req.user._id;

    // التأكد إن الطرف التاني مش عامل بلوك أو أنا مش عامله بلوك (Full Block)
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: "User not found" });

    const isFullBlocked = receiver.blockedUsers.includes(senderId) || req.user.blockedUsers.includes(receiverId);
    if (isFullBlocked) {
      return res.status(403).json({ message: "Messaging is blocked between you and this user" });
    }

    // بنتأكد إن في محادثة أو بنكريت واحدة.
    const conversation = await ensureConversation(senderId, receiverId);

    // التأكد من حظر الرسايل فقط (Message Block)
    if (conversation.messageBlockedBy && conversation.messageBlockedBy.length > 0) {
      return res.status(403).json({ message: "Messaging is temporarily blocked in this conversation" });
    }

    // بنسيف الرسالة في الداتا بيز.
    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content: content || "",
      messageType: messageType || "text",
      mediaUrl: mediaUrl || "",
      fileName: fileName || "",
    });

    // بنحدث وقت "آخر رسالة" في المحادثة ونسجل الـ ID بتاعها.
    conversation.lastMessageAt = new Date();
    conversation.lastMessage = message._id;
    
    // لو المحادثة كانت ممسوحة أو مؤرشفة للطرف التاني، بنرجعها نشطة تاني.
    conversation.settings.forEach(s => {
      if (String(s.user) === String(receiverId)) {
        s.isArchived = false;
        // لا نقوم بتصفير deletedAt لأننا نريد إخفاء الرسايل القديمة فقط
      }
    });

    await conversation.save();

    // إرسال إشعار
    if (String(receiverId) !== String(senderId)) {
      await Notification.create({
        recipient: receiverId,
        sender: senderId,
        type: "message",
        message: `${req.user.username} sent you a ${messageType || 'message'}`,
      });
    }

    const populated = await message.populate([
      { path: "sender", select: "name username avatarUrl" },
      { path: "receiver", select: "name username avatarUrl" }
    ]);

    return res.status(201).json({ message: populated });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة لإدارة إعدادات المحادثة (Archive, Mute, Pin, Delete)
 */
const updateConversationSettings = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { action } = req.body; // 'archive', 'unarchive', 'mute', 'unmute', 'pin', 'unpin', 'delete'
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    let userSettings = conversation.settings.find(s => String(s.user) === String(userId));
    if (!userSettings) {
      userSettings = { user: userId };
      conversation.settings.push(userSettings);
      userSettings = conversation.settings[conversation.settings.length - 1];
    }

    switch (action) {
      case 'archive': userSettings.isArchived = true; break;
      case 'unarchive': userSettings.isArchived = false; break;
      case 'mute': userSettings.isMuted = true; break;
      case 'unmute': userSettings.isMuted = false; break;
      case 'pin': userSettings.isPinned = true; break;
      case 'unpin': userSettings.isPinned = false; break;
      case 'delete': 
        userSettings.deletedAt = new Date();
        userSettings.isArchived = false;
        userSettings.isPinned = false;
        break;
      default: return res.status(400).json({ message: "Invalid action" });
    }

    await conversation.save();
    return res.status(200).json({ message: `Conversation ${action}d successfully`, conversation });
  } catch (error) {
    next(error);
  }
};

/**
 * وظيفة حظر الرسايل فقط (Message Block)
 */
const toggleMessageBlock = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const blockedIndex = conversation.messageBlockedBy.indexOf(userId);
    if (blockedIndex === -1) {
      conversation.messageBlockedBy.push(userId);
    } else {
      conversation.messageBlockedBy.splice(blockedIndex, 1);
    }

    await conversation.save();
    const action = blockedIndex === -1 ? "blocked" : "unblocked";
    return res.status(200).json({ message: `Messages ${action} successfully`, conversation });
  } catch (error) {
    next(error);
  }
};

/**
 * وظيفة لتحديد الرسايل كـ "مقروءة" (Seen) يدوياً
 */
const markMessagesAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    
    await Message.updateMany(
      { 
        conversation: conversationId, 
        receiver: req.user._id, 
        isRead: false 
      },
      { isRead: true }
    );

    return res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة تعديل رسالة (فقط لو معملش Seen)
 */
const updateMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // التأكد إن اللي بيعدل هو اللي بعت الرسالة
    if (String(message.sender) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to edit this message" });
    }

    // الشرط الأساسي: اليوزر التاني لسه معملش Seen
    if (message.isRead) {
      return res.status(400).json({ message: "Cannot edit message after it has been seen" });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    return res.status(200).json({ message });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة مسح رسالة (فقط لو معملش Seen)
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (String(message.sender) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    if (message.isRead) {
      return res.status(400).json({ message: "Cannot delete message after it has been seen" });
    }

    await message.deleteOne();

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { 
  startConversationByUsername, 
  getMyConversations, 
  getMessagesByConversation, 
  sendMessage,
  updateMessage,
  deleteMessage,
  markMessagesAsRead,
  updateConversationSettings,
  toggleMessageBlock
};
