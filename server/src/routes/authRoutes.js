/**
 * @file authRoutes.js
 * @description تعريف مسارات المصادقة.
 */

const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidators");

const router = express.Router();

// مسار التسجيل: يتحقق من البيانات أولاً ثم ينفذ عملية التسجيل
router.post("/register", registerValidator, validateRequest, registerUser);

// مسار تسجيل الدخول: يتحقق من البيانات أولاً ثم ينفذ عملية الدخول
router.post("/login", loginValidator, validateRequest, loginUser);

// مسار الحصول على بيانات المستخدم الحالي: يتطلب تسجيل الدخول (محمي بـ protect)
router.get("/me", protect, getCurrentUser);

module.exports = router;
