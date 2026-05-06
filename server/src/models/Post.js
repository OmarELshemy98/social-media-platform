/**
 * @file Post.js
 * @description نموذج (Model) المنشورات والتعليقات في قاعدة البيانات.
 */

const mongoose = require("mongoose");

// تعريف هيكل بيانات التعليق
const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // صاحب التعليق
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    // الردود على التعليق
    replies: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// تعريف هيكل بيانات المنشور
const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // كاتب المنشور
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    imageUrl: {
      type: String, // رابط الصورة المرفقة إن وجدت
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // قائمة الإعجابات (تحتوي على معرفات المستخدمين)
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // قائمة التعليقات
    comments: [commentSchema],
  },
  { timestamps: true }
);

// إضافة فهرس نصي للبحث في محتوى المنشورات والوسوم
postSchema.index({ content: "text", tags: "text" });

module.exports = mongoose.model("Post", postSchema);
