/**
 * @file profileController.js
 * @description التحكم في العمليات المتعلقة بالملفات الشخصية (جلب وتحديث البيانات).
 */

const User = require("../models/User");
const Post = require("../models/Post");

/**
 * جلب بيانات الملف الشخصي لمستخدم معين مع منشوراته
 */
const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    // البحث عن المستخدم باستخدام اسم المستخدم
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // جلب المنشورات الخاصة بهذا المستخدم
    const posts = await Post.find({ author: user._id })
      .populate("author", "name username avatarUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({ user, posts });
  } catch (error) {
    return next(error);
  }
};

/**
 * تحديث بيانات الملف الشخصي للمستخدم الحالي
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { name, bio, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // تحديث الحقول المرسلة فقط
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getProfile, updateMyProfile };
