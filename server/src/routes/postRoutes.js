/**
 * @file postRoutes.js
 * @description الفايل ده بيحدد "عناوين المنشورات" (Post Endpoints).
 * هنا بنحدد اللينكات اللي بنستخدمها عشان نكريت بوست، نعمل لايك، أو نكتب كومنت.
 * كل المسارات هنا محمية بـ protect، يعني لازم اليوزر يكون مسجل دخول.
 */

const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  createPost,
  getFeedPosts,
  getSinglePost,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment,
  addReplyToComment,
} = require("../controllers/postController");
const {
  postCreateValidator,
  postUpdateValidator,
  commentValidator,
} = require("../validators/postValidators");

const router = express.Router();

// جميع مسارات المنشورات تتطلب تسجيل دخول
router.use(protect);

router.get("/", getFeedPosts); // جلب المنشورات
router.post("/", postCreateValidator, validateRequest, createPost); // إنشاء منشور
router.get("/:postId", getSinglePost); // جلب منشور محدد
router.put("/:postId", postUpdateValidator, validateRequest, updatePost); // تحديث منشور
router.delete("/:postId", deletePost); // حذف منشور
router.patch("/:postId/like", toggleLikePost); // إعجاب أو إلغاء إعجاب
router.post("/:postId/comments", commentValidator, validateRequest, addComment); // إضافة تعليق
router.post(
  "/:postId/comments/:commentId/replies",
  commentValidator,
  validateRequest,
  addReplyToComment
); // الرد على تعليق

module.exports = router;
