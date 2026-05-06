/**
 * @file index.js
 * @description تجميع جميع مسارات التطبيق في موجه (Router) واحد.
 */

const express = require("express");
const authRoutes = require("./authRoutes");
const postRoutes = require("./postRoutes");
const profileRoutes = require("./profileRoutes");
const notificationRoutes = require("./notificationRoutes");
const searchRoutes = require("./searchRoutes");
const messageRoutes = require("./messageRoutes");
const uploadRoutes = require("./uploadRoutes");

const router = express.Router();

/**
 * اختبار حالة الخادم
 */
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "social-media-server" });
});

// تعريف المسارات الفرعية
router.use("/auth", authRoutes); // مسارات المصادقة
router.use("/posts", postRoutes); // مسارات المنشورات
router.use("/profiles", profileRoutes); // مسارات الملفات الشخصية
router.use("/notifications", notificationRoutes); // مسارات التنبيهات
router.use("/search", searchRoutes); // مسارات البحث
router.use("/messages", messageRoutes); // مسارات الرسائل
router.use("/upload", uploadRoutes); // مسارات رفع الملفات

module.exports = router;
