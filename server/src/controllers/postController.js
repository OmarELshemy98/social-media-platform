/**
 * @file postController.js
 * @description التحكم في العمليات المتعلقة بالمنشورات (إنشاء، جلب، تعديل، حذف، إعجاب، تعليق).
 */

const Post = require("../models/Post");
const Notification = require("../models/Notification");

/**
 * إنشاء منشور جديد
 */
const createPost = async (req, res, next) => {
  try {
    const { content, tags = [], imageUrl = "" } = req.body;
    // تنظيف الوسوم (Tags) وتحويلها لنص صغير
    const normalizedTags = tags.map((tag) => String(tag).trim().toLowerCase());

    const post = await Post.create({
      author: req.user._id, // صاحب المنشور هو المستخدم الحالي
      content,
      imageUrl,
      tags: normalizedTags,
    });

    // جلب بيانات الكاتب لعرضها مع المنشور
    const populated = await post.populate("author", "name username avatarUrl");
    return res.status(201).json({ post: populated });
  } catch (error) {
    return next(error);
  }
};

/**
 * جلب المنشورات لصفحة الـ Feed مع دعم البحث والتصفية والصفحات
 */
const getFeedPosts = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 10), 50);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const tag = req.query.tag?.trim().toLowerCase();

    const query = {};
    // دعم البحث النصي
    if (search) query.$text = { $search: search };
    // التصفية حسب الوسم
    if (tag) query.tags = tag;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name username avatarUrl")
        .populate("comments.author", "name username avatarUrl")
        .sort({ createdAt: -1 }) // الأحدث أولاً
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
 * جلب منشور واحد بتفاصيله
 */
const getSinglePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "name username avatarUrl")
      .populate("comments.author", "name username avatarUrl");
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json({ post });
  } catch (error) {
    return next(error);
  }
};

/**
 * تحديث منشور موجود
 */
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    // التحقق من أن المستخدم الحالي هو صاحب المنشور
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
    // التحقق من الملكية
    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only post owner can delete this post" });
    }

    await post.deleteOne();
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = String(req.user._id);
    const hasLiked = post.likes.some((id) => String(id) === userId);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => String(id) !== userId);
    } else {
      post.likes.push(req.user._id);
      if (String(post.author) !== userId) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "like",
          post: post._id,
          message: `${req.user.username} liked your post`,
        });
      }
    }

    await post.save();
    return res.status(200).json({
      postId: post._id,
      likesCount: post.likes.length,
      liked: !hasLiked,
    });
  } catch (error) {
    return next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      author: req.user._id,
      content: req.body.content,
      replies: [],
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
      .populate("comments.author", "name username avatarUrl")
      .select("comments");
    return res.status(201).json({ comments: populated.comments });
  } catch (error) {
    return next(error);
  }
};

const addReplyToComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({
      author: req.user._id,
      content: req.body.content,
      createdAt: new Date(),
    });

    await post.save();
    return res.status(201).json({ comment });
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
  toggleLikePost,
  addComment,
  addReplyToComment,
};
