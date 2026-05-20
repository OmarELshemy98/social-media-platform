/**
 * @file index.js
 * @description الفايل ده هو "مجمع المسارات" (Routes Index).
 * هنا بنجمع كل العناوين (Routes) بتاعة التطبيق في مكان واحد عشان نبعتها لملف الـ app.js.
 */

const express = require("express");
const router = express.Router();

// استيراد ملفات المسارات الفرعية.
const authRoutes = require("./authRoutes"); // مسارات الحسابات.
const postRoutes = require("./postRoutes"); // مسارات البوستات.
const profileRoutes = require("./profileRoutes"); // مسارات البروفايل.
const messageRoutes = require("./messageRoutes"); // مسارات الشات.
const notificationRoutes = require("./notificationRoutes"); // مسارات الإشعارات.
const searchRoutes = require("./searchRoutes"); // مسارات البحث.
const uploadRoutes = require("./uploadRoutes"); // مسارات رفع الصور.
const storyRoutes = require("./storyRoutes"); // مسارات الستوري.

// ربط كل مجموعة مسارات بالكلمة المفتاحية بتاعتها.
router.use("/auth", authRoutes); // أي حاجة بتبدأ بـ /api/auth
router.use("/posts", postRoutes); // أي حاجة بتبدأ بـ /api/posts
router.use("/profiles", profileRoutes);
router.use("/messages", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/search", searchRoutes);
router.use("/upload", uploadRoutes);
router.use("/stories", storyRoutes);

module.exports = router;
