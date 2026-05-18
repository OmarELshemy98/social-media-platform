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
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("name username avatarUrl bio")
      .limit(10);

    // بناخد الـ IDs بتاعة المستخدمين اللي لقيناهم عشان نجيب البوستات بتاعتهم برضه.
    const userIds = users.map(u => u._id);

    // بنجهز طلب البحث عن المنشورات:
    // بندور في المحتوى أو الهاشتاجات أو المنشورات اللي كتبها المستخدمين اللي ظهروا في البحث.
    const posts = await Post.find({
      $or: [
        { author: { $in: userIds } }, // بوستات كتبها الناس اللي ظهروا في البحث
        { tags: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
    })
      .populate("author", "name username avatarUrl")
      .sort({ createdAt: -1 })
      .limit(20);
    
    // بنبعت كل النتائج للفرونت إند.
    return res.status(200).json({ users, posts });
  } catch (error) {
    return next(error);
  }
};

module.exports = { globalSearch };
