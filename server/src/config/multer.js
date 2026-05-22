/**
 * @file multer.js
 * @description الفايل ده مسؤول عن "رفع الصور" (File Upload).
 * بنستخدم مكتبة Multer عشان نقدر نستقبل الصور اللي اليوزر بيرفعها (زي صور البروفايل أو البوستات).
 * هنا بنحدد الصور هتتحفظ فين (فولدر uploads) وبنغير اسمها لاسم فريد عشان مفيش صورتين يدخلوا في بعض.
 * كمان بنحدد إننا مش بنقبل غير صور بس، وبحجم أقصى 5 ميجا.
 */

const fs = require("fs");
const path = require("path");
const multer = require("multer");

/**
 * إعدادات التخزين (Storage)
 * نستخدم memoryStorage لأننا سنرفع الصور مباشرة إلى Cloudinary
 */
const storage = multer.memoryStorage();

/**
 * وظيفة لتصفية الملفات المرفوعة (السماح بالصور، الصوت، الفيديو، والملفات الشائعة)
 */
const fileFilter = (req, file, cb) => {
  console.log(`Multer receiving file: ${file.originalname} (${file.mimetype})`);
  const allowedTypes = [
    "image/",
    "audio/",
    "video/",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "text/plain"
  ];

  const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));

  if (isAllowed) {
    cb(null, true);
  } else {
    // بنقبل أي ملف في الشات، بس بنعمل تشيك بسيط
    console.log(`Multer: Allowing generic file type: ${file.mimetype}`);
    cb(null, true);
  }
};

// إنشاء كائن Multer مع الإعدادات المحددة
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // زيادة الحد الأقصى لـ 50 ميجابايت (عشان الفيديوهات والريكوردات)
});

module.exports = upload;
