/**
 * @file notificationController.js
 * @description الفايل ده مسؤول عن "الإشعارات" (Notifications).
 * هنا بنجيب كل التنبيهات اللي جات لليوزر (زي حد عمله لايك أو بعتله رسالة).
 */

// استيراد موديل الإشعارات عشان نكلم جدول التنبيهات في الداتا بيز.
const Notification = require("../models/Notification");

/**
 * وظيفة جلب كل الإشعارات الخاصة بي
 */
const getMyNotifications = async (req, res, next) => {
  try {
    // بنجيب الإشعارات اللي مبعوتة لليوزر اللي مسجل دخول دلوقتي.
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name username avatarUrl") // بنجيب بيانات الشخص اللي عمل الإشعار.
      .populate("post", "content") // لو الإشعار على بوست، بنجيب جزء من محتواه.
      .sort({ createdAt: -1 }) // بنرتبهم من الأحدث للأقدم.
      .limit(50); // بنجيب آخر 50 إشعار بس للأداء.

    // بنحسب عدد الإشعارات اللي لسه "ماتقرأتش" عشان نعرض الرقم في الفرونت إند.
    const unreadCount = notifications.filter((item) => !item.isRead).length;
    
    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة تعليم إشعار معين كـ "مقروء"
 */
const markNotificationAsRead = async (req, res, next) => {
  try {
    // بندور على الإشعار بالـ ID بتاعه وبنتأكد إنه بتاع اليوزر اللي باعت الطلب.
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      recipient: req.user._id,
    });
    
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    // بنغير حالة القراءة لـ true.
    notification.isRead = true;
    await notification.save();
    
    return res.status(200).json({ notification });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة تعليم "كل الإشعارات" كـ "مقروءة" مرة واحدة
 */
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    // بنعمل تحديث لكل الإشعارات اللي لسه ماتقرأتش وتابعة لليوزر ده.
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false }, 
      { isRead: true }
    );
    
    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
