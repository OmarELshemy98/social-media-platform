/**
 * @file User.js
 * @description الفايل ده بيحدد "شكل بيانات المستخدم" في قاعدة البيانات (MongoDB).
 */

// مكتبة Mongoose: هي اللي بتخلينا نتعامل مع MongoDB بسهولة عن طريق الـ Schemas.
const mongoose = require("mongoose");

// تعريف الـ Schema: بنحدد كل "حقل" (Field) نوعه إيه وشروطه إيه.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, // نوعه نص.
      required: true, // لازم اليوزر يكتبه.
      trim: true, // بيشيل المسافات الزيادة من الجناب.
      minlength: 2,
      maxlength: 60,
    },
    username: {
      type: String,
      required: true,
      unique: true, // لازم يكون فريد (محدش يكرره).
      trim: true,
      lowercase: true, // بيتحول لحروف صغيرة تلقائياً.
      minlength: 3,
      maxlength: 24,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // أهم خاصية: الباسورد مش هيرجع أبداً في نتائج البحث العادية للأمان.
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 240,
      default: "", // لو مكتبش حاجة، بيبقى نص فاضي.
    },
    avatarUrl: {
      type: String, // رابط صورة البروفايل.
      default: "",
    },
    coverUrl: {
      type: String, // رابط صورة الغلاف.
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    // قائمة المتابعين: عبارة عن مصفوفة من الـ IDs بتاعة يوزرز تانيين.
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // بنعرف Mongoose إن الـ IDs دي تابعة لجدول الـ User.
      },
    ],
    // قائمة الأصدقاء.
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // طلبات الصداقة المرسلة.
    friendRequestsSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // طلبات الصداقة المستلمة.
    friendRequestsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // المستخدمين المحظورين.
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // تاريخ آخر ظهور لليوزر
    lastActive: {
      type: Date,
      default: Date.now,
    },
    // ميزة الألبومات والميديا
    albums: [
      {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        media: [
          {
            url: { type: String, required: true },
            type: { type: String, enum: ["image", "video"], default: "image" },
            createdAt: { type: Date, default: Date.now }
          }
        ],
        isSystem: { type: Boolean, default: false } // لو ألبوم خاص بالنظام زي Profile Pictures
      }
    ],
    // خاصية الـ About المفصلة
    about: {
      work: { type: String, default: "" },
      education: { type: String, default: "" },
      location: { type: String, default: "" },
      city: { type: String, default: "" },
      governorate: { type: String, default: "" },
      country: { type: String, default: "" },
      birthday: { type: Date },
      gender: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
      relationship: { type: String, enum: ["Single", "Married", "In a relationship", "Secret", ""], default: "" },
      contactInfo: { type: String, default: "" },
      links: [
        {
          platform: { type: String, default: "" },
          url: { type: String, default: "" }
        }
      ]
    },
    googleId: { type: String },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { 
    // بيضيف حقلين (createdAt, updatedAt) تلقائياً عشان نعرف الحساب اتكريت إمتى.
    timestamps: true 
  }
);

// تصدير الموديل عشان نستخدمه في الـ Controllers.
module.exports = mongoose.model("User", userSchema);
