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
router.use(protect);

router.get("/", getFeedPosts);
router.post("/", postCreateValidator, validateRequest, createPost);
router.get("/:postId", getSinglePost);
router.put("/:postId", postUpdateValidator, validateRequest, updatePost);
router.delete("/:postId", deletePost);
router.patch("/:postId/like", toggleLikePost);
router.post("/:postId/comments", commentValidator, validateRequest, addComment);
router.post(
  "/:postId/comments/:commentId/replies",
  commentValidator,
  validateRequest,
  addReplyToComment
);

module.exports = router;
