/**
 * @file Notification.js
 * @description نموذج (Model) التنبيهات التي تصل للمستخدمين.
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
    // نوع التنبيه (إعجاب، تعليق، رسالة، طلب صداقة)
    type: {
      type: String,
      enum: ["like", "comment", "message", "friend_request"],
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
