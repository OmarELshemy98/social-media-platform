/**
 * @file User.js
 * @description نموذج (Model) المستخدم في قاعدة البيانات.
 */

const mongoose = require("mongoose");

// تعريف هيكل بيانات المستخدم
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    username: {
      type: String,
      required: true,
      unique: true, // يجب أن يكون فريداً
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 24,
    },
    email: {
      type: String,
      required: true,
      unique: true, // يجب أن يكون فريداً
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // لا يتم إرجاعه تلقائياً عند البحث عن المستخدم
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 240,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    coverUrl: {
      type: String,
      default: "",
    },
    // قائمة المتابعين
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // قائمة الأشخاص الذين يتابعهم المستخدم
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // طلبات الصداقة المرسلة
    friendRequestsSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // طلبات الصداقة المستلمة
    friendRequestsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // قائمة الأصدقاء
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // قائمة الحظر
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // حقول استعادة كلمة المرور
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // حالة الحساب
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // إضافة createdAt و updatedAt تلقائياً
);

module.exports = mongoose.model("User", userSchema);
