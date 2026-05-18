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
    // نص الرسالة.
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
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
