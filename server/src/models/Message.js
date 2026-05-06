/**
 * @file Message.js
 * @description نموذج (Model) الرسائل الخاصة بين المستخدمين.
 */

const mongoose = require("mongoose");

// تعريف هيكل بيانات الرسالة
const messageSchema = new mongoose.Schema(
  {
    // المحادثة التي تنتمي إليها الرسالة
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    // المرسل
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // المستقبل
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // محتوى الرسالة
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    // حالة القراءة
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
