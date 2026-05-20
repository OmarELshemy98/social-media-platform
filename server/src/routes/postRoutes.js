/**
 * @file postRoutes.js
 * @description الفايل ده بيحدد "عناوين المنشورات" (Post Endpoints).
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
  toggleReaction,
  addComment,
  updateComment,
  deleteComment,
} = require("../controllers/postController");
const {
  postCreateValidator,
  postUpdateValidator,
  commentValidator,
} = require("../validators/postValidators");

const router = express.Router();

router.use(protect);

router.get("/", getFeedPosts);
router.post("/", postCreateValidator, validateRequest, createPost);
router.get("/:postId", getSinglePost);
router.put("/:postId", postUpdateValidator, validateRequest, updatePost);
router.delete("/:postId", deletePost);

// التفاعلات والتعليقات
router.patch("/:postId/reaction", toggleReaction);
router.post("/:postId/comments", commentValidator, validateRequest, addComment);
router.put("/:postId/comments/:commentId", commentValidator, validateRequest, updateComment);
router.delete("/:postId/comments/:commentId", deleteComment);

module.exports = router;
