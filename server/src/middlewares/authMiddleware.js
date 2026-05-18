/**
 * @file authMiddleware.js
 * @description الفايل ده هو "ضابط الأمن" بتاع السيرفر.
 * وظيفته إنه يتأكد إن اللي باعت الطلب يوزر حقيقي ومسجل دخول.
 */

// مكتبة jsonwebtoken: بنستخدمها عشان نفك تشفير التوكن (Token) ونقرأ البيانات اللي جواه.
const jwt = require("jsonwebtoken");
// استيراد موديل المستخدم عشان نتأكد إن اليوزر لسه موجود في الداتا بيز.
const User = require("../models/User");

/**
 * وظيفة حماية المسارات (Protect Middleware)
 */
const protect = async (req, res, next) => {
  // بنجيب التوكن من الـ Headers بتاع الطلب (بيكون اسمه Authorization).
  const authHeader = req.headers.authorization;

  // بنشيك: هل في توكن أصلاً؟ وهل بيبدأ بكلمة "Bearer "؟ (ده التنسيق العالمي للـ JWT).
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: missing token" });
  }

  try {
    // بناخد الجزء التاني من الـ Header اللي هو التوكن الفعلي.
    const token = authHeader.split(" ")[1];
    
    // بنفك تشفير التوكن باستخدام "كلمة السر" (JWT_SECRET) اللي مخبينها في الـ .env.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // بعد ما فكينا التوكن، بناخد الـ ID بتاع اليوزر اللي جواه وبندور عليه في الداتا بيز.
    // لاحظ إننا بنشيل الباسورد من النتيجة (-password).
    const user = await User.findById(decoded.id).select("-password");
    
    // لو ملقيناش اليوزر (ممكن يكون اتمسح مثلاً)، بنرفض الطلب.
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // لو كل حاجة تمام، بنحط بيانات اليوزر في كائن الطلب (req.user) عشان أي Controller بعد كده يقدر يستخدمها بسهولة.
    req.user = user;
    
    // بنقول للسيرفر "كمل للخطوة اللي بعدها" (next).
    next();
  } catch (error) {
    // لو التوكن غلط، منتهي الصلاحية، أو حد حاول يزوره، بنرفض الطلب فوراً.
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

module.exports = { protect };
