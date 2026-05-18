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
 * وظيفة لتصفية الملفات المرفوعة (السماح بالصور فقط)
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// إنشاء كائن Multer مع الإعدادات المحددة
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // حد أقصى لحجم الملف (5 ميجابايت)
});

module.exports = upload;
