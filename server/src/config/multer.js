/**
 * @file multer.js
 * @description إعدادات مكتبة Multer للتعامل مع رفع الملفات (الصور).
 */

const fs = require("fs");
const path = require("path");
const multer = require("multer");

// تحديد مجلد الرفع والتأكد من وجوده
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * إعدادات التخزين (Storage)
 */
const storage = multer.diskStorage({
  // تحديد المجلد الوجهة
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // توليد اسم فريد للملف المرفوع
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

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
