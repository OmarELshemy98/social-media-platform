/**
 * @file db.js
 * @description الفايل ده هو المسؤول عن الربط بين السيرفر بتاعنا وقاعدة البيانات (MongoDB).
 * بنستخدم مكتبة Mongoose عشان تسهل علينا التعامل مع الداتا بيز.
 * لو الربط نجح، السيرفر بيشتغل تمام، لو فشل بنوقف السيرفر ونشوف المشكلة فين.
 */

const mongoose = require("mongoose");

/**
 * وظيفة للاتصال بقاعدة البيانات
 */
const connectDB = async () => {
  try {
    // محاولة الاتصال باستخدام الرابط الموجود في متغيرات البيئة
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // مهلة 5 ثواني عشان لو مفيش اتصال منقعدش مستنيين للأبد
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // في حال فشل الاتصال، طباعة الخطأ وإغلاق الخادم
    console.error(`❌ Database connection error: ${error.message}`);
    console.error("تأكد من أن الـ IP بتاعك مضاف في MongoDB Atlas (Whitelist) أو أن الـ URI صحيحة.");
    process.exit(1);
  }
};

module.exports = connectDB;
