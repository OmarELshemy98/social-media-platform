/**
 * @file app.js
 * @description ده الفايل اللي بنجهز فيه "تطبيق Express" (الإطار بتاع السيرفر).
 */

const express = require("express");
// مكتبة CORS: بنستخدمها عشان نسمح للفرونت إند (اللي شغال على Port 5173) إنه يكلم الباك إند (اللي شغال على Port 5000).
const cors = require("cors"); 
// مكتبة Helmet: بتضيف HTTP Headers أمنية عشان تحمي الموقع من بعض الهجمات المشهورة.
const helmet = require("helmet"); 
// مكتبة Morgan: بتطبع لنا في الـ console كل طلب (Request) جاي للسيرفر، وده مفيد جداً في الـ Debugging.
const morgan = require("morgan"); 
const path = require("path");
// استيراد ملف المسارات الرئيسي اللي بيجمع كل الـ Routes.
const routes = require("./routes"); 
// استيراد معالجات الأخطاء المخصصة.
const { notFound, errorHandler } = require("./middlewares/errorMiddleware"); 

const app = express();

// إعداد الـ Middlewares الأساسية:
app.use(
  helmet({
    // بنعدل الإعداد ده عشان نسمح بتحميل الصور اللي متسيفة عندنا على السيرفر ونعرضها في الموقع.
    crossOriginResourcePolicy: { policy: "cross-origin" }, 
  })
);
app.use(
  cors({
    // بنحدد إننا بنقبل طلبات من رابط الفرونت إند بس.
    origin: process.env.CLIENT_URL || "http://localhost:5173", 
    credentials: true, // عشان نسمح ببعت الـ Cookies أو الـ Headers الخاصة بالمصادقة.
  })
);

// بنخلي السيرفر يفهم البيانات اللي مبعوتة بصيغة JSON وبنحدد أقصى حجم ليها 1 ميجا.
app.use(express.json({ limit: "1mb" })); 
// بنخلي السيرفر يفهم البيانات المبعوتة من الـ Forms العادية.
app.use(express.urlencoded({ extended: true })); 
// تشغيل تسجيل الطلبات في الـ console (Logging).
app.use(morgan("dev")); 

// بنحدد إن فولدر "uploads" يكون متاح للكل (Static)، عشان لما نكتب رابط الصورة في المتصفح تفتح معانا.
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// بنربط كل المسارات بتبدأ بـ /api.
app.use("/api", routes);

// لو اليوزر طلب رابط مش موجود، بنبعته للـ notFound middleware.
app.use(notFound);
// أي غلط بيحصل في السيرفر، الـ errorHandler هو اللي بيطلعه بشكل منظم.
app.use(errorHandler);

module.exports = app;
