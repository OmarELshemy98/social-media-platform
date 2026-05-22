/**
 * @file profileRoutes.js
 * @description عناوين (Endpoints) الملفات الشخصية.
 * بنحدد هنا كل حاجة تخص البروفايل: جلب البيانات، التحديث، طلبات الصداقة، الحظر، وإعدادات الحساب.
 */

const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  getProfile,
  updateMyProfile,
  createAlbum,
  addMediaToAlbum,
  sendFriendRequest,
  acceptFriendRequest,
  unfriendUser,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getSuggestions,
  updatePassword,
  disableAccount,
  deleteAccount,
} = require("../controllers/profileController");
const { updateProfileValidator } = require("../validators/profileValidators");

const router = express.Router();

// جلب بيانات ملف شخصي معين
router.get("/suggestions", protect, getSuggestions);
router.get("/:username", protect, getProfile);

// تحديث بيانات ملفي الشخصي (يتطلب تحقق من البيانات وحماية المسار)
router.put("/me/update", protect, updateProfileValidator, validateRequest, updateMyProfile);

// مسارات الميديا والألبومات
router.post("/me/albums", protect, createAlbum);
router.post("/me/media", protect, addMediaToAlbum);

// مسارات الصداقة والحظر
router.post("/:userId/friend-request", protect, sendFriendRequest);
router.post("/:userId/accept-request", protect, acceptFriendRequest);
router.post("/:userId/unfriend", protect, unfriendUser);
router.post("/:userId/block", protect, blockUser);
router.post("/:userId/unblock", protect, unblockUser);

// مسارات الإعدادات
router.get("/me/blocked-users", protect, getBlockedUsers);
router.put("/me/update-password", protect, updatePassword);
router.put("/me/disable", protect, disableAccount);
router.delete("/me/delete", protect, deleteAccount);

module.exports = router;
