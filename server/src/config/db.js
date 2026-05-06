/**
 * @file db.js
 * @description إعداد الاتصال بقاعدة بيانات MongoDB باستخدام مكتبة Mongoose.
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
