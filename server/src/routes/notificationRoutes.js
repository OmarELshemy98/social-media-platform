/**
 * @file notificationRoutes.js
 * @description عناوين (Endpoints) الإشعارات.
 * هنا بنحدد المسارات اللي بنجيب منها التنبيهات ونعلم عليها إنها اتقرأت.
 */

const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const router = express.Router();
router.use(protect);

router.get("/", getMyNotifications);
router.patch("/:notificationId/read", markNotificationAsRead);
router.patch("/read-all", markAllNotificationsAsRead);

module.exports = router;
