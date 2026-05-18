/**
 * @file generateToken.js
 * @description الفايل ده فيه وظيفة واحدة: "توليد التوكن" (JWT Generation).
 * لما اليوزر بيدخل صح، بنستخدم الفانكشن دي عشان نطلع له "الكارنيه" (Token) اللي هيفضل معاه.
 * التوكن ده بيبقى متفر بنوع سر (Secret Key) وصلاحيته غالباً 7 أيام.
 */

const jwt = require("jsonwebtoken");

/**
 * توليد رمز تشفير يحتوي على بيانات معينة (Payload)
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    // تحديد مدة صلاحية الرمز (الافتراضي 7 أيام)
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
