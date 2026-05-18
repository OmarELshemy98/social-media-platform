/**
 * @file Post.js
 * @description الفايل ده بيحدد "شكل المنشور" (Post) في قاعدة البيانات.
 */

const mongoose = require("mongoose");

// بنعرف هيكل الكومنت (Comment Schema) كجزء فرعي من البوست.
const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // بنربطه بجدول اليوزرز عشان نعرف مين اللي كتب الكومنت.
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true } // بنسيف وقت كتابة الكومنت.
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // صاحب البوست.
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    imageUrl: {
      type: String, // لو البوست فيه صورة.
      default: "",
    },
    // الهاشتاجات: مصفوفة من النصوص.
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // اللايكات: مصفوفة فيها الـ IDs بتاعة اليوزرز اللي عملوا لايك.
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // الكومنتات: مصفوفة بتستخدم الـ commentSchema اللي عرفناه فوق.
    comments: [commentSchema],
  },
  { timestamps: true }
);

// بنعمل "فهرس نصي" (Text Index) على المحتوى والهاشتاجات عشان البحث يكون سريع جداً.
postSchema.index({ content: "text", tags: "text" });

module.exports = mongoose.model("Post", postSchema);
