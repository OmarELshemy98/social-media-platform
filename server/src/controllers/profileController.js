/**
 * @file profileController.js
 * @description التحكم في العمليات المتعلقة بالملفات الشخصية (جلب وتحديث البيانات).
 */

const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

/**
 * جلب بيانات الملف الشخصي لمستخدم معين مع منشوراته
 */
const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    // البحث عن المستخدم باستخدام اسم المستخدم
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // التحقق من حالة الصداقة بالنسبة للمستخدم الحالي
    const currentUser = req.user;
    let relationship = "none"; // الحالة الافتراضية

    if (currentUser) {
      if (currentUser.friends.includes(user._id)) {
        relationship = "friends";
      } else if (currentUser.friendRequestsSent.includes(user._id)) {
        relationship = "request_sent";
      } else if (currentUser.friendRequestsReceived.includes(user._id)) {
        relationship = "request_received";
      } else if (currentUser.blockedUsers.includes(user._id)) {
        relationship = "blocked";
      }
    }

    // جلب المنشورات الخاصة بهذا المستخدم
    const posts = await Post.find({ author: user._id })
      .populate("author", "name username avatarUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({ user, posts, relationship });
  } catch (error) {
    return next(error);
  }
};

/**
 * إرسال طلب صداقة
 */
const sendFriendRequest = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (String(targetUserId) === String(req.user._id)) return res.status(400).json({ message: "Cannot friend yourself" });

    // إضافة للطلبات المرسلة والمستلمة
    if (!currentUser.friendRequestsSent.includes(targetUserId)) {
      currentUser.friendRequestsSent.push(targetUserId);
      targetUser.friendRequestsReceived.push(req.user._id);
      
      await currentUser.save();
      await targetUser.save();

      // إنشاء تنبيه
      await Notification.create({
        recipient: targetUserId,
        sender: req.user._id,
        type: "friend_request",
        message: `${req.user.name} sent you a friend request`,
      });
    }

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    next(error);
  }
};

/**
 * قبول طلب صداقة
 */
const acceptFriendRequest = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(targetUserId);

    // إزالة من الطلبات وإضافة للأصدقاء
    currentUser.friendRequestsReceived = currentUser.friendRequestsReceived.filter(id => String(id) !== String(targetUserId));
    targetUser.friendRequestsSent = targetUser.friendRequestsSent.filter(id => String(id) !== String(req.user._id));

    if (!currentUser.friends.includes(targetUserId)) {
      currentUser.friends.push(targetUserId);
      targetUser.friends.push(req.user._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    next(error);
  }
};

/**
 * إلغاء الصداقة
 */
const unfriendUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(targetUserId);

    currentUser.friends = currentUser.friends.filter(id => String(id) !== String(targetUserId));
    targetUser.friends = targetUser.friends.filter(id => String(id) !== String(req.user._id));

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: "Unfriended successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * حظر مستخدم
 */
const blockUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUser = await User.findById(req.user._id);

    // إلغاء الصداقة أولاً إذا وجد
    currentUser.friends = currentUser.friends.filter(id => String(id) !== String(targetUserId));
    if (!currentUser.blockedUsers.includes(targetUserId)) {
      currentUser.blockedUsers.push(targetUserId);
    }

    await currentUser.save();
    res.status(200).json({ message: "User blocked" });
  } catch (error) {
    next(error);
  }
};

/**
 * إلغاء الحظر عن مستخدم
 */
const unblockUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUser = await User.findById(req.user._id);

    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      (id) => String(id) !== String(targetUserId)
    );

    await currentUser.save();
    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * جلب قائمة المستخدمين المحظورين
 */
const getBlockedUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "blockedUsers",
      "name username avatarUrl"
    );
    res.status(200).json({ blockedUsers: user.blockedUsers });
  } catch (error) {
    next(error);
  }
};

/**
 * تحديث بيانات الملف الشخصي للمستخدم الحالي
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { name, bio, avatarUrl, coverUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // تحديث الحقول المرسلة فقط
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (coverUrl !== undefined) user.coverUrl = coverUrl;

    await user.save();
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * تغيير كلمة المرور من داخل الإعدادات
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * تعطيل الحساب (Disable)
 */
const disableAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.isActive = false;
    await user.save();
    res.status(200).json({ message: "Account disabled successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * حذف الحساب نهائياً
 */
const deleteAccount = async (req, res, next) => {
  try {
    // يمكن هنا حذف المنشورات والتعليقات المرتبطة بالمستخدم أيضاً
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "Account deleted permanently" });
  } catch (error) {
    next(error);
  }
};

/**
 * جلب مقترحات لمستخدمين قد تعرفهم
 */
const getSuggestions = async (req, res, next) => {
  try {
    const currentUser = req.user;
    
    // جلب مستخدمين ليسوا أصدقاء وليسوا المستخدم الحالي وليسوا محظورين
    const suggestions = await User.find({
      _id: { 
        $nin: [
          currentUser._id, 
          ...currentUser.friends, 
          ...currentUser.blockedUsers,
          ...currentUser.friendRequestsSent,
          ...currentUser.friendRequestsReceived
        ] 
      }
    })
    .select("name username avatarUrl")
    .limit(5);

    res.status(200).json({ users: suggestions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateMyProfile,
  sendFriendRequest,
  acceptFriendRequest,
  unfriendUser,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getSuggestions,
  updatePassword,
  disableAccount,
  deleteAccount,
};
