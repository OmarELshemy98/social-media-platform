/**
 * @file postController.js
 * @description الفايل ده هو "مدير المنشورات" (Posts Manager).
 * هنا بنتحكم في كل حاجة تخص البوستات: إنشاء، جلب، لايك، وكومنت.
 */

// استيراد موديل البوست عشان نكلم جدول المنشورات في الداتا بيز.
const Post = require("../models/Post");
// استيراد موديل التنبيهات عشان نبعت إشعار لليوزر لما حد يتفاعل معاه.
const Notification = require("../models/Notification");

/**
 * وظيفة إنشاء منشور جديد
 */
const createPost = async (req, res, next) => {
  try {
    // بناخد المحتوى، الوسوم (الهاشتاجات)، ورابط الصورة من جسم الطلب (Request Body).
    const { content, tags = [], imageUrl = "" } = req.body;
    
    // بننظف الهاشتاجات: بنشيل المسافات الزيادة وبنحولها لحروف صغيرة (Lowercase).
    const normalizedTags = tags.map((tag) => String(tag).trim().toLowerCase());

    // بنسيف البوست الجديد في الداتا بيز.
    // لاحظ إننا بنربط البوست باليوزر اللي بعت الطلب عن طريق req.user._id (اللي جابه الـ Auth Middleware).
    const post = await Post.create({
      author: req.user._id,
      content,
      imageUrl,
      tags: normalizedTags,
    });

    // بعد ما البوست يتسيف، بنعمل له "populate" يعني بنجيب بيانات كاتب البوست (الاسم، اليوزر نيم، الصورة) عشان نعرضها في الفرونت إند.
    const populated = await post.populate("author", "name username avatarUrl");
    
    // بنرد على الفرونت إند بإن البوست اتكريت بنجاح.
    return res.status(201).json({ post: populated });
  } catch (error) {
    // لو حصل أي غلط، بنبعته للـ errorHandler.
    return next(error);
  }
};

/**
 * وظيفة جلب البوستات (الـ Feed) مع دعم البحث والترقيم (Pagination)
 */
const getFeedPosts = async (req, res, next) => {
  try {
    // بنحدد الصفحة المطلوبة (الافتراضي صفحة 1) وعدد البوستات في كل صفحة (الافتراضي 10).
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 10), 50); // مش بنسمح بأكثر من 50 بوست في المرة الواحدة للأداء.
    const skip = (page - 1) * limit; // بنحسب السيرفر هيفوت كام بوست عشان يوصل للصفحة المطلوبة.
    
    const search = req.query.search?.trim(); // لو اليوزر بيبحث عن كلمة معينة.
    const tag = req.query.tag?.trim().toLowerCase(); // لو اليوزر بيبحث عن هاشتاج معين.

    const query = {};
    // لو في بحث نصي، بنستخدم الفهرس النصي ($text) بتاع MongoDB.
    if (search) query.$text = { $search: search };
    // لو في بحث بهاشتاج، بندور عليه في مصفوفة الـ tags.
    if (tag) query.tags = tag;

    // بنعمل طلبين للداتا بيز في نفس الوقت (Parallel) عشان السرعة:
    // 1. بنجيب البوستات المطلوبة وبنعمل لها populate لبيانات الكاتب والكومنتات.
    // 2. بنعد إجمالي البوستات اللي مطابقة للبحث عشان الترقيم.
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name username avatarUrl")
        .populate("comments.author", "name username avatarUrl")
        .sort({ createdAt: -1 }) // الأحدث بيظهر فوق.
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query),
    ]);

    // بنبعت البوستات وبيانات الترقيم للفرونت إند.
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
