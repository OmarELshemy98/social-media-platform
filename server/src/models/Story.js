/**
 * @file Story.js
 * @description موديل "الستوري" (Stories).
 * الستوري بتبقى موجودة لمدة 24 ساعة بس وبعدين بتختفي.
 */

const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    // صاحب الستوري
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // رابط الصورة أو الفيديو في Cloudinary
    mediaUrl: {
      type: String,
      required: true,
    },
    // نوع الميديا (image أو video)
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    // قائمة اليوزرز اللي شافوا الستوري
    views: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // تاريخ الانتهاء (تلقائياً بعد 24 ساعة)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      index: { expires: 0 }, // ميزة في MongoDB بتمسح الدوكومنت لما الوقت يخلص
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);
