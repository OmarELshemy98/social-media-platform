/**
 * @file storyRoutes.js
 * @description مسارات الستوري.
 */

const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  createStory,
  getStories,
  viewStory,
  deleteStory
} = require("../controllers/storyController");

const router = express.Router();

router.use(protect); // كل المسارات محتاجة تسجيل دخول

router.post("/", createStory);
router.get("/", getStories);
router.post("/:storyId/view", viewStory);
router.delete("/:storyId", deleteStory);

module.exports = router;
