/**
 * @file app.js
 * @description إعداد تطبيق Express والبرمجيات الوسيطة (Middlewares) والمسارات (Routes).
 */

const express = require("express");
const cors = require("cors"); // للتعامل مع طلبات من نطاقات مختلفة
const helmet = require("helmet"); // لحماية التطبيق من خلال وضع رؤوس HTTP أمنية
const morgan = require("morgan"); // لتسجيل تفاصيل الطلبات في وحدة التحكم (Logging)
const path = require("path");
const routes = require("./routes"); // استيراد جميع المسارات
const { notFound, errorHandler } = require("./middlewares/errorMiddleware"); // استيراد معالجات الأخطاء

const app = express();

// استخدام البرمجيات الوسيطة الأساسية
app.use(helmet()); // تأمين الرؤوس (Headers)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // السماح للواجهة الأمامية بالوصول
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" })); // تحليل بيانات JSON الواردة
app.use(express.urlencoded({ extended: true })); // تحليل البيانات المشفرة في الروابط
app.use(morgan("dev")); // تسجيل الطلبات في وضع التطوير

// جعل مجلد الرفع متاحاً بشكل عام للوصول للصور والملفات
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// استخدام المسارات الأساسية للتطبيق
app.use("/api", routes);

// معالجة الأخطاء والمسارات غير الموجودة
app.use(notFound);
app.use(errorHandler);

module.exports = app;
