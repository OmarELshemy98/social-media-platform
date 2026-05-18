/**
 * @file searchController.js
 * @description الفايل ده مسؤول عن "البحث الشامل" (Global Search).
 * لما اليوزر بيكتب حاجة في خانة البحث، الفايل ده بيدور في قاعدة البيانات على المستخدمين والمنشورات.
 */

// استيراد الموديلات اللي هنبحث فيها.
const User = require("../models/User");
const Post = require("../models/Post");

/**
 * وظيفة البحث الشامل
 */
const globalSearch = async (req, res, next) => {
  try {
    // بناخد كلمة البحث من الـ Query String (مثلاً: /search?q=ahmed).
    const q = String(req.query.q || "").trim();
    
    // لو خانة البحث فاضية، بنرجع نتائج فاضية فوراً.
    if (!q) return res.status(200).json({ users: [], posts: [] });

    // بنجهز طلب البحث عن المستخدمين:
    // بندور في اليوزر نيم، الاسم، أو الإيميل باستخدام Regular Expression (regex) عشان البحث يكون مرن (مش لازم الكلمة بالظبط).
    // الخيار "i" معناه إن البحث Case-insensitive (مش بيفرق بين حروف كبيرة وصغيرة).
    const usersPromise = User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("name username avatarUrl bio") // بنختار الحقول اللي تظهر بس.
      .limit(10); // بنجيب أول 10 مستخدمين بس.

    // بنجهز طلب البحث عن المنشورات:
    // بندور في المحتوى، الهاشتاجات، أو باستخدام الفهرس النصي ($text).
    const postsPromise = Post.find({
      $or: [
        { $text: { $search: q } },
        { tags: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
    })
      .populate("author", "name username avatarUrl") // بنجيب بيانات كاتب البوست.
      .sort({ createdAt: -1 }) // الأحدث بيظهر أولاً.
      .limit(20); // بنجيب أول 20 بوست بس.

    // بنشغل الطلبين في نفس الوقت (Parallel) عشان السرعة.
    const [users, posts] = await Promise.all([usersPromise, postsPromise]);
    
    // بنبعت كل النتائج للفرونت إند.
    return res.status(200).json({ users, posts });
  } catch (error) {
    return next(error);
  }
};

module.exports = { globalSearch };
