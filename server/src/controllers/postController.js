/**
 * @file postController.js
 * @description الفايل ده هو "مدير المنشورات" (Posts Manager).
 * هنا بنتحكم في كل حاجة تخص البوستات: إنشاء، جلب، لايك، وكومنت.
 */

const Post = require("../models/Post"); 
const User = require("../models/User");
const Notification = require("../models/Notification");

/**
 * وظيفة إنشاء منشور جديد
 */
const createPost = async (req, res, next) => {
  try {
    const { content, tags = [], imageUrl = "" } = req.body;
    const normalizedTags = tags.map((tag) => String(tag).trim().toLowerCase());

    // استخراج المنشنات من المحتوى (مثال: @username)
    const mentionRegex = /@(\w+)/g;
    const usernames = content.match(mentionRegex)?.map(m => m.substring(1)) || [];
    
    let mentions = [];
    if (usernames.length > 0) {
      const mentionedUsers = await User.find({ username: { $in: usernames } });
      mentions = mentionedUsers.map(u => u._id);
      
      // إرسال إشعارات للمنشن
      for (const u of mentionedUsers) {
        if (String(u._id) !== String(req.user._id)) {
          await Notification.create({
            recipient: u._id,
            sender: req.user._id,
            type: "mention",
            message: `${req.user.username} mentioned you in a post`,
          });
        }
      }
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      imageUrl,
      tags: normalizedTags,
      mentions,
    });

    const populated = await post.populate("author", "name username avatarUrl");
    return res.status(201).json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة جلب البوستات (الـ Feed)
 */
const getFeedPosts = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 10), 50);
    const skip = (page - 1) * limit;
    
    const search = req.query.search?.trim();
    const tag = req.query.tag?.trim().toLowerCase();

    const query = {};
    if (search) query.$text = { $search: search };
    if (tag) query.tags = tag;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name username avatarUrl")
        .populate("comments.author", "name username avatarUrl")
        .populate({
          path: "originalPost",
          populate: { path: "author", select: "name username avatarUrl" }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query),
    ]);

    return res.status(200).json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * جلب منشور واحد
 */
const getSinglePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "name username avatarUrl")
      .populate("comments.author", "name username avatarUrl")
      .populate({
        path: "originalPost",
        populate: { path: "author", select: "name username avatarUrl" }
      });
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json({ post });
  } catch (error) {
    return next(error);
  }
};

/**
 * تحديث منشور
 */
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only post owner can edit this post" });
    }

    const { content, tags, imageUrl } = req.body;
    if (content !== undefined) post.content = content;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;
    if (tags !== undefined) post.tags = tags.map((tag) => String(tag).trim().toLowerCase());
    await post.save();

    const populated = await post.populate("author", "name username avatarUrl");
    return res.status(200).json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

/**
 * حذف منشور
 */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only post owner can delete this post" });
    }

    await post.deleteOne();
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

/**
 * التفاعل مع منشور (Like, Love, Sad, Angry)
 */
const toggleReaction = async (req, res, next) => {
  try {
    const { type = "like" } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = String(req.user._id);
    const existingReactionIndex = post.reactions.findIndex((r) => String(r.user) === userId);

    if (existingReactionIndex !== -1) {
      if (post.reactions[existingReactionIndex].type === type) {
        post.reactions.splice(existingReactionIndex, 1);
      } else {
        post.reactions[existingReactionIndex].type = type;
      }
    } else {
      post.reactions.push({ user: req.user._id, type });
      if (String(post.author) !== userId) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "like",
          post: post._id,
          message: `${req.user.username} reacted ${type} to your post`,
        });
      }
    }

    await post.save();
    return res.status(200).json({
      postId: post._id,
      reactions: post.reactions,
      reactionsCount: post.reactions.length,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * إضافة تعليق
 */
const addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      author: req.user._id,
      content: req.body.content,
    });
    await post.save();

    if (String(post.author) !== String(req.user._id)) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        message: `${req.user.username} commented on your post`,
      });
    }

    const populated = await Post.findById(post._id)
      .populate("author", "name username avatarUrl")
      .populate("comments.author", "name username avatarUrl");

    return res.status(201).json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

/**
 * تعديل تعليق
 */
const updateComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (String(comment.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    comment.content = content;
    comment.isEdited = true;
    await post.save();

    const populated = await Post.findById(postId)
      .populate("author", "name username avatarUrl")
      .populate("comments.author", "name username avatarUrl");

    return res.status(200).json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

/**
 * حذف تعليق
 */
const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (String(comment.author) !== String(req.user._id) && String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    post.comments.pull(commentId);
    await post.save();

    const populated = await Post.findById(postId)
      .populate("author", "name username avatarUrl")
      .populate("comments.author", "name username avatarUrl");

    return res.status(200).json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة مشاركة منشور (Share)
 */
const sharePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content = "" } = req.body;

    const originalPost = await Post.findById(postId);
    if (!originalPost) return res.status(404).json({ message: "Original post not found" });

    // إنشاء منشور جديد مرتبط بالمنشور الأصلي
    const sharedPost = await Post.create({
      author: req.user._id,
      content,
      originalPost: originalPost._id,
    });

    // تحديث البوست الأصلي لإضافة اليوزر في قائمة الـ sharedBy (اختياري لو محتاجها للفلترة)
    if (!originalPost.sharedBy) originalPost.sharedBy = [];
    originalPost.sharedBy.push(req.user._id);
    await originalPost.save();

    // إرسال إشعار لصاحب المنشور الأصلي
    if (String(originalPost.author) !== String(req.user._id)) {
      await Notification.create({
        recipient: originalPost.author,
        sender: req.user._id,
        type: "share", // تأكد من إضافة هذا النوع في موديل الإشعارات لو محتاج
        post: originalPost._id,
        message: `${req.user.username} shared your post`,
      });
    }

    const populated = await sharedPost.populate([
      { path: "author", select: "name username avatarUrl" },
      { 
        path: "originalPost", 
        populate: { path: "author", select: "name username avatarUrl" } 
      }
    ]);

    return res.status(201).json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPost,
  getFeedPosts,
  getSinglePost,
  updatePost,
  deletePost,
  toggleReaction,
  sharePost,
  addComment,
  updateComment,
  deleteComment,
};
