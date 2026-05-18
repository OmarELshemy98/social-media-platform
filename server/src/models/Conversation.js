/**
 * @file Conversation.js
 * @description الفايل ده بيحدد "شكل المحادثة" (Conversation) اللي بتجمع اتنين يوزرز.
 * المحادثة هي "العلبة" اللي بتشيل الرسايل بين طرفين، وبنخزن فيها (مين هما الطرفين، وتاريخ آخر رسالة بينهم عشان ترتيب الشات).
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
