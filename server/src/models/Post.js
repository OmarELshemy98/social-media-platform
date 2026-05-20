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
    isEdited: {
      type: Boolean,
      default: false,
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
    // التفاعلات: مصفوفة كائنات تحتوي على اليوزر ونوع التفاعل (Like, Love, Sad, Angry)
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: ["like", "love", "sad", "angry"],
          default: "like",
        },
      },
    ],
    // بنسيب الـ likes القديمة عشان ميعملش مشاكل دلوقتي
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
