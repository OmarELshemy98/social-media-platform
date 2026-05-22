/**
 * @file server.js
 * @description دي "نقطة البداية" (Entry Point) بتاعة السيرفر.
 * أول حاجة بنعملها هنا إننا بنحمل الإعدادات من ملف الـ .env.
 * بعدين بننادي على الداتا بيز عشان نربط معاها.
 * وفي الآخر بنشغل السيرفر ونخليه "يسمع" (Listen) لأي طلبات جاية على الـ Port المحدد (غالباً 5000).
 */

require("dotenv").config(); // تحميل متغيرات البيئة من ملف .env
const app = require("./app"); // استيراد إعدادات تطبيق Express
const connectDB = require("./config/db"); // استيراد وظيفة الاتصال بقاعدة البيانات

const PORT = process.env.PORT || 5000; // تحديد المنفذ (Port) الذي سيعمل عليه الخادم

/**
 * وظيفة لتشغيل الخادم بشكل غير متزامن
 */
const startServer = async () => {
  try {
    console.log("Starting server...");
    // الاتصال بقاعدة بيانات MongoDB
    console.log("Connecting to MongoDB...");
    await connectDB();

    // بدء الاستماع للطلبات على المنفذ المحدد
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`💻 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    });

    // التعامل مع أي أخطاء غير متوقعة خارج نطاق الـ Express (زي فشل الاتصال بالداتا بيز)
    process.on("unhandledRejection", (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
      // إغلاق السيرفر بشكل نظيف في حالة وجود خطأ فادح.
      // server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      console.error(`Uncaught Exception: ${err.message}`);
    });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
