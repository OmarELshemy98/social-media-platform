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

// Request Logger لعمل Debugging
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    console.log(`[DEBUG] Incoming upload request: ${req.method} ${req.path}`);
  }
  next();
});

// إعداد الـ Middlewares الأساسية:
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // حل مشكلة الـ Google OAuth popup
    contentSecurityPolicy: false, // تعطيل الـ CSP مؤقتاً للتأكد من أنها ليست السبب في الـ connection closed
  })
);

// إعداد الـ CORS بطريقة مرنة وقوية للإنتاج
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://crew-socialmedia.up.railway.app",
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean).map(url => url.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: function (origin, callback) {
      // السماح لو الـ origin موجود في القائمة أو لو الطلب من نفس الدومين أو من أي subdomain على railway.app
      if (
        !origin || 
        allowedOrigins.includes(origin) || 
        origin.endsWith(".railway.app") ||
        origin.includes("railway.app")
      ) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// بنخلي السيرفر يفهم البيانات اللي مبعوتة بصيغة JSON وبنحدد أقصى حجم ليها 50 ميجا.
app.use(express.json({ limit: "50mb" })); 
// بنخلي السيرفر يفهم البيانات المبعوتة من الـ Forms العادية.
app.use(express.urlencoded({ extended: true, limit: "50mb" })); 
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
