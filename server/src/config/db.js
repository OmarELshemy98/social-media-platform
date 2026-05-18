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
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // في حال فشل الاتصال، طباعة الخطأ وإغلاق الخادم
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
