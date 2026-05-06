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
  },
  { timestamps: true } // إضافة createdAt و updatedAt تلقائياً
);

module.exports = mongoose.model("User", userSchema);
