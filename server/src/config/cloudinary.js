/**
 * @file cloudinary.js
 * @description إعدادات خدمة Cloudinary لرفع الصور.
 */

const cloudinary = require("cloudinary").v2;

// ضبط الإعدادات باستخدام متغيرات البيئة
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
