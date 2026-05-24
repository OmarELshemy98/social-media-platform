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
    // مرجع لآخر رسالة تم إرسالها (لتسريع العرض في قائمة المحادثات)
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    // إعدادات المحادثة لكل يوزر بشكل منفصل
    settings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        isArchived: { type: Boolean, default: false },
        isMuted: { type: Boolean, default: false },
        isPinned: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null }, // تاريخ مسح المحادثة لليوزر ده (عشان منظهرلوش الرسايل القديمة)
      },
    ],
    // حظر الرسايل فقط (بين الطرفين)
    messageBlockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// إضافة فهرس للمشاركين لتسريع عمليات البحث
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
