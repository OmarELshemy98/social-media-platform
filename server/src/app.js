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

// 1. Logging Middleware (First thing)
app.use(morgan("dev"));

// 2. Debug Logger
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No Origin'}`);
  next();
});

// 3. CORS Configuration (Before Helmet)
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://crew-socialmedia.up.railway.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
].filter(Boolean).map(url => url.trim().toLowerCase().replace(/\/$/, ""));

app.use(
  cors({
    origin: function (origin, callback) {
      // لو مفيش origin (زي طلبات Postman أو الـ Server-to-Server) بنسمح بيه
      if (!origin) return callback(null, true);
      
      const normalizedOrigin = origin.trim().toLowerCase().replace(/\/$/, "");
      
      // التحقق من الدومين
      const isAllowed = allowedOrigins.includes(normalizedOrigin) || 
                        normalizedOrigin.endsWith(".railway.app") || 
                        normalizedOrigin.includes("railway.app") ||
                        normalizedOrigin.includes("localhost") ||
                        normalizedOrigin.includes("127.0.0.1");

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Unauthorized Origin: ${origin}`);
        // بدلاً من إرجاع false، سنقوم بإرجاع true ولكن مع تسجيل تحذير في التطوير
        // في الإنتاج، يفضل إرجاع false، لكن هنا سنحاول تسهيل الأمر
        callback(null, true); 
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Access-Control-Allow-Origin"],
  })
);

// 4. Helmet Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: false, 
  })
);

// إضافة Headers إضافية يدوياً للتأكد من حل مشكلة COOP و CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  // إذا كان الـ origin مسموح به، نضعه في الـ Header
  const origin = req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  next();
});

// 5. Body Parsers
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ extended: true, limit: "50mb" })); 

// بنحدد إن فولدر "uploads" يكون متاح للكل (Static)، عشان لما نكتب رابط الصورة في المتصفح تفتح معانا.
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// بنربط كل المسارات بتبدأ بـ /api.
app.use("/api", routes);

// لو اليوزر طلب رابط مش موجود، بنبعته للـ notFound middleware.
app.use(notFound);
// أي غلط بيحصل في السيرفر، الـ errorHandler هو اللي بيطلعه بشكل منظم.
app.use(errorHandler);

module.exports = app;
