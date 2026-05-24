const User = require("../models/User");
const Post = require("../models/Post");

/**
 * جلب جميع المستخدمين (للوحة التحكم)
 */
const getAllUsers = async (req, res, next) => {
  try {
    // جلب كل اليوزرز مع الباسورد (بناءً على طلب المستخدم)
    // ملاحظة: الباسوردات مشفرة (hashed) ولا يمكن رؤيتها كنص واضح.
    const users = await User.find({}).select("+password");
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

/**
 * إيقاف أو تفعيل حساب يوزر
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "active" ? "suspended" : "active";
    await user.save();

    res.status(200).json({ message: `User account ${user.status} successfully`, user });
  } catch (error) {
    next(error);
  }
};

/**
 * حذف يوزر نهائياً
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    // مسح بوستات اليوزر ده كمان
    await Post.deleteMany({ author: userId });
    res.status(200).json({ message: "User and their content deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * حذف أي منشور (Admin Moderation)
 */
const deleteAnyPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post removed by admin" });
  } catch (error) {
    next(error);
  }
};

/**
 * ترقية يوزر لآدمن
 */
const makeAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { role: "admin" }, { new: true });
    res.status(200).json({ message: "User promoted to admin", user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  deleteAnyPost,
  makeAdmin
};
