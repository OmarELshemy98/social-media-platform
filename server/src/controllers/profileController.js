/**
 * @file profileController.js
 * @description الفايل ده مسؤول عن "الصفحة الشخصية" (Profile).
 * هنا بنعمل كل حاجة تخص اليوزر وبروفايله وطلبات الصداقة.
 */

// استيراد الموديلات اللي هنحتاجها عشان نكلم الداتا بيز.
const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

/**
 * وظيفة جلب بيانات الملف الشخصي (Profile)
 */
const getProfile = async (req, res, next) => {
  try {
    // بناخد اسم المستخدم من رابط الصفحة (URL Parameter).
    const { username } = req.params;
    
    // بندور على اليوزر في الداتا بيز باسمه، وبنستثني الباسورد من النتيجة للأمان.
    // بنعمل populate للـ friends عشان تظهر أسمائهم وصورهم.
    const user = await User.findOne({ username })
      .select("-password")
      .populate("friends", "name username avatarUrl lastActive");
      
    if (!user) return res.status(404).json({ message: "User not found" });

    // بنشيك على "حالة العلاقة" بين اليوزر اللي فاتح الموقع وبين صاحب البروفايل ده.
    const currentUser = await User.findById(req.user._id).populate("friends", "_id");
    let relationship = "none"; 
    let mutualFriends = [];

    if (currentUser) {
      // حساب الأصدقاء المشتركين
      const currentUserFriendIds = currentUser.friends.map(f => String(f._id));
      const profileUserFriendIds = user.friends.map(f => String(f._id));
      
      const mutualIds = profileUserFriendIds.filter(id => currentUserFriendIds.includes(id));
      
      if (mutualIds.length > 0) {
        mutualFriends = await User.find({ _id: { $in: mutualIds } }).select("name username avatarUrl");
      }

      // تحديد العلاقة
      if (currentUserFriendIds.includes(String(user._id))) {
        relationship = "friends";
      } 
      else if (currentUser.friendRequestsSent?.includes(user._id)) {
        relationship = "request_sent";
      } 
      else if (currentUser.friendRequestsReceived?.includes(user._id)) {
        relationship = "request_received";
      } 
      else if (currentUser.blockedUsers?.includes(user._id)) {
        relationship = "blocked";
      }
    }

    // بنجيب كل البوستات اللي صاحب البروفايل ده نشرها أو شاركها، وبنرتبها من الأحدث للأقدم.
    const posts = await Post.find({ 
      $or: [{ author: user._id }, { sharedBy: user._id }] 
    })
      .populate("author", "name username avatarUrl")
      .populate("comments.author", "name username avatarUrl")
      .populate({
        path: "originalPost",
        populate: { path: "author", select: "name username avatarUrl" }
      })
      .sort({ createdAt: -1 });

    // بنرد بكل البيانات للفرونت إند.
    return res.status(200).json({ user, posts, relationship, mutualFriends });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة إرسال طلب صداقة
 */
const sendFriendRequest = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId; // اليوزر اللي عايزين نصاحبه.
    const currentUser = await User.findById(req.user._id); // اليوزر اللي باعت الطلب.
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });
    // مينفعش حد يصاحب نفسه طبعاً!
    if (String(targetUserId) === String(req.user._id)) return res.status(400).json({ message: "Cannot friend yourself" });

    // لو مبعتلوش طلب قبل كده، بنضيفه في "الطلبات المرسلة" عندي و "الطلبات المستلمة" عنده.
    if (!currentUser.friendRequestsSent.includes(targetUserId)) {
      currentUser.friendRequestsSent.push(targetUserId);
      targetUser.friendRequestsReceived.push(req.user._id);
      
      await currentUser.save();
      await targetUser.save();

      // بنبعتله إشعار (Notification) إن فلان بعتلك طلب صداقة.
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
 * تحديث بيانات ملفي الشخصي
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { name, bio, avatarUrl, coverUrl, about } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (coverUrl) user.coverUrl = coverUrl;
    
    // تحديث بيانات الـ about لو موجودة
    if (about) {
      user.about = {
        ...user.about,
        ...about
      };
    }

    await user.save();
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
};

/**
 * إنشاء ألبوم جديد
 */
const createAlbum = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const user = await User.findById(req.user._id);

    // التأكد إن الاسم مش مكرر
    const exists = user.albums.find(a => a.name === name);
    if (exists) return res.status(400).json({ message: "Album already exists" });

    user.albums.push({ name, description, media: [] });
    await user.save();

    res.status(201).json({ message: "Album created", albums: user.albums });
  } catch (error) {
    next(error);
  }
};

/**
 * إضافة ميديا لألبوم
 */
const addMediaToAlbum = async (req, res, next) => {
  try {
    const { url, type, albumName } = req.body;
    const user = await User.findById(req.user._id);

    let album = user.albums.find(a => a.name === albumName);
    
    if (!album) {
      // لو الألبوم مش موجود بنكريته (زي Profile Pictures)
      user.albums.push({ name: albumName, media: [], isSystem: true });
      album = user.albums[user.albums.length - 1];
    }

    album.media.push({ url, type });
    await user.save();

    res.status(200).json({ message: "Media added", albums: user.albums });
  } catch (error) {
    next(error);
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
          ...(currentUser.friends || []), 
          ...(currentUser.blockedUsers || []),
          ...(currentUser.friendRequestsSent || []),
          ...(currentUser.friendRequestsReceived || [])
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
  createAlbum,
  addMediaToAlbum,
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
