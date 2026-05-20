/**
 * @file storyController.js
 * @description التحكم في الستوريز (Stories).
 */

const Story = require("../models/Story");
const User = require("../models/User");

/**
 * وظيفة إضافة ستوري جديدة
 */
const createStory = async (req, res, next) => {
  try {
    const { mediaUrl, mediaType } = req.body;

    const story = await Story.create({
      user: req.user._id,
      mediaUrl,
      mediaType: mediaType || "image",
    });

    const populated = await story.populate("user", "name username avatarUrl");

    return res.status(201).json({ story: populated });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة جلب الستوريز المتاحة (بتاعتي وبتاعة أصحابي)
 */
const getStories = async (req, res, next) => {
  try {
    // بنجيب قائمة الـ IDs بتاعة الأصدقاء
    const friendIds = req.user.friends || [];
    const myId = req.user._id;

    // بنجيب الستوريز اللي لسه منتهتش بتاعة اليوزر أو أصحابه
    const stories = await Story.find({
      user: { $in: [...friendIds, myId] },
    })
      .populate("user", "name username avatarUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({ stories });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة تسجيل مشاهدة للستوري
 */
const viewStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    // لو اليوزر مش موجود في قائمة المشاهدات، بنضيفه
    if (!story.views.includes(req.user._id)) {
      story.views.push(req.user._id);
      await story.save();
    }

    return res.status(200).json({ message: "Story viewed" });
  } catch (error) {
    return next(error);
  }
};

/**
 * مسح الستوري يدوياً
 */
const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findOne({ _id: req.params.storyId, user: req.user._id });
    if (!story) return res.status(404).json({ message: "Story not found or unauthorized" });

    await story.deleteOne();
    return res.status(200).json({ message: "Story deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createStory,
  getStories,
  viewStory,
  deleteStory
};
