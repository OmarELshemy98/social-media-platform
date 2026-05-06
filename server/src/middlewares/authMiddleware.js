/**
 * @file authMiddleware.js
 * @description برمجية وسيطة للتحقق من هوية المستخدم باستخدام رمز JWT.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * وظيفة لحماية المسارات والتأكد من أن المستخدم مسجل دخوله
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // التحقق من وجود الرمز في الرأس (Header) وتنسيقه الصحيح
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: missing token" });
  }

  try {
    // استخراج الرمز وفك تشفيره
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // البحث عن المستخدم المرتبط بالرمز
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // إرفاق بيانات المستخدم بطلب الـ req لاستخدامها في المتحكمات (Controllers)
    req.user = user;
    next();
  } catch (error) {
    // في حال كان الرمز منتهياً أو غير صالح
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

module.exports = { protect };
