/**
 * @file profileRoutes.js
 * @description تعريف مسارات الملفات الشخصية.
 */

const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  getProfile,
  updateMyProfile,
  sendFriendRequest,
  acceptFriendRequest,
  unfriendUser,
  blockUser,
} = require("../controllers/profileController");
const { updateProfileValidator } = require("../validators/profileValidators");

const router = express.Router();

// جلب بيانات ملف شخصي معين
router.get("/:username", protect, getProfile);

// تحديث بيانات ملفي الشخصي (يتطلب تحقق من البيانات وحماية المسار)
router.put("/me/update", protect, updateProfileValidator, validateRequest, updateMyProfile);

// مسارات الصداقة والحظر
router.post("/:userId/friend-request", protect, sendFriendRequest);
router.post("/:userId/accept-request", protect, acceptFriendRequest);
router.post("/:userId/unfriend", protect, unfriendUser);
router.post("/:userId/block", protect, blockUser);

module.exports = router;
