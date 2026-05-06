/**
 * @file generateToken.js
 * @description وظيفة لتوليد رمز JWT (JSON Web Token) للمستخدمين.
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
