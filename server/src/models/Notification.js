/**
 * @file Notification.js
 * @description الفايل ده بيحدد "شكل الإشعار" (Notification) اللي بيوصل لليوزر.
 * الإشعار بيبقى فيه (مين اللي هيستلم، مين اللي بعت، نوع الإشعار زي لايك أو كومنت، والرسالة اللي هتظهر لليوزر).
 */

const mongoose = require("mongoose");

// تعريف هيكل بيانات التنبيه
const notificationSchema = new mongoose.Schema(
  {
    // المستخدم الذي سيتلقى التنبيه
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // المستخدم الذي تسبب في التنبيه
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // نوع التنبيه (إعجاب، تعليق، رسالة، طلب صداقة، مشاركة، منشن)
    type: {
      type: String,
      enum: ["like", "comment", "message", "friend_request", "share", "mention"],
      required: true,
    },
    // المنشور المتعلق بالتنبيه (إن وجد)
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    // نص التنبيه
    message: {
      type: String,
      default: "",
    },
    // حالة القراءة
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
