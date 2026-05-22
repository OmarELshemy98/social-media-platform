/**
 * @file Message.js
 * @description الفايل ده بيحدد "شكل الرسالة الواحدة" في الشات.
 */

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // المحادثة اللي الرسالة دي تابعة ليها.
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    // مين اللي بعت الرسالة.
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // مين اللي استلم الرسالة.
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // نص الرسالة (اختياري لو فيه ميديا).
    content: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    // نوع الرسالة: نص، صورة، فيديو، صوت، أو ملف.
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },
    // رابط الميديا (لو موجودة) المرفوعة على Cloudinary.
    mediaUrl: {
      type: String,
      default: "",
    },
    // اسم الملف الأصلي (للملفات).
    fileName: {
      type: String,
      default: "",
    },
    // هل الرسالة اتقرأت ولا لسه؟
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // بيسيف وقت الإرسال.
);

module.exports = mongoose.model("Message", messageSchema);
