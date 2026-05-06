/**
 * @file Conversation.js
 * @description نموذج (Model) المحادثات التي تجمع بين المستخدمين.
 */

const mongoose = require("mongoose");

// تعريف هيكل بيانات المحادثة
const conversationSchema = new mongoose.Schema(
  {
    // المشاركون في المحادثة
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // تاريخ آخر رسالة لتسهيل الترتيب
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// إضافة فهرس للمشاركين لتسريع عمليات البحث
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
