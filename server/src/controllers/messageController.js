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
    // بنجيب كل المحادثات اللي الـ ID بتاعي موجود في قائمة المشاركين فيها.
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name username avatarUrl") // بنجيب بيانات الناس اللي بكلمهم.
      .sort({ lastMessageAt: -1 }); // بنرتبهم من الأحدث للأقدم حسب آخر رسالة.

    return res.status(200).json({ conversations });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة جلب الرسايل بتاعة محادثة معينة
 */
const getMessagesByConversation = async (req, res, next) => {
  try {
    // بنجيب المحادثة بالـ ID بتاعها.
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    
    // بنشيك: هل اليوزر اللي باعت الطلب هو طرف في المحادثة دي فعلاً؟
    if (!conversation.participants.some((id) => String(id) === String(req.user._id))) {
      return res.status(403).json({ message: "Access denied for this conversation" });
    }

    // بنجيب كل الرسايل التابعة للمحادثة دي، وبنرتبها من الأقدم للأحدث (عشان تظهر زي الشات الطبيعي).
    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", "name username avatarUrl")
      .populate("receiver", "name username avatarUrl")
      .sort({ createdAt: 1 });

    // تحديث الرسايل اللي انا استلمتها كـ "مقروءة" (Seen)
    await Message.updateMany(
      { 
        conversation: conversation._id, 
        receiver: req.user._id, 
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
 * وظيفة إرسال رسالة جديدة (نص، صورة، فيديو، صوت، أو ملف)
 */
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, messageType, mediaUrl, fileName } = req.body;

    // التأكد إن الطرف التاني مش عامل بلوك أو أنا مش عامله بلوك
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: "User not found" });

    const isBlocked = receiver.blockedUsers.includes(req.user._id) || req.user.blockedUsers.includes(receiverId);
    if (isBlocked) {
      return res.status(403).json({ message: "Messaging is blocked between you and this user" });
    }

    // بنتأكد إن في محادثة أو بنكريت واحدة.
    const conversation = await ensureConversation(req.user._id, receiverId);

    // بنسيف الرسالة في الداتا بيز.
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      content: content || "",
      messageType: messageType || "text",
      mediaUrl: mediaUrl || "",
      fileName: fileName || "",
    });

    // بنحدث وقت "آخر رسالة" في المحادثة عشان تطلع فوق في القائمة.
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // لو أنا ببعت لحد تاني (مش لنفسي)، بنبعتله إشعار.
    if (String(receiverId) !== String(req.user._id)) {
      await Notification.create({
        recipient: receiverId,
        sender: req.user._id,
        type: "message",
        message: `${req.user.username} sent you a ${messageType || 'message'}`,
      });
    }

    // بنرجع الرسالة كاملة ببيانات المرسل.
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
  markMessagesAsRead
};
