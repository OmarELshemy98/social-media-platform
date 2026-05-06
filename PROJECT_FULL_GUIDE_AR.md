# الدليل الشامل لمشروع منصة التواصل الاجتماعي (Social Media Platform)

هذا الملف يحتوي على شرح تفصيلي للمشروع، هيكلية الملفات، التقنيات المستخدمة، وكيفية التشغيل.

---

## 1. نظرة عامة على المشروع
المشروع عبارة عن منصة تواصل اجتماعي كاملة (Full-Stack) تتيح للمستخدمين:
- إنشاء حسابات وتسجيل الدخول.
- نشر منشورات (نصوص وصور).
- التفاعل بالإعجاب (Like) والتعليق (Comment).
- نظام محادثات خاصة بين المستخدمين.
- نظام تنبيهات فورية (إشعارات).
- البحث عن مستخدمين ومنشورات.
- دعم الوضع الداكن والفاتح (Dark/Light Mode).

---

## 2. هيكلية الملفات وشرح وظيفة كل ملف

### أ) جانب الخادم (Server - Backend)
المسار: `/server`

#### المجلد: `src/config`
- **[db.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/config/db.js)**: مسؤول عن الاتصال بقاعدة بيانات MongoDB.
- **[mailer.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/config/mailer.js)**: إعدادات إرسال البريد الإلكتروني (مثل رسالة الترحيب).
- **[multer.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/config/multer.js)**: إعدادات رفع الملفات والصور وتخزينها في مجلد `uploads`.

#### المجلد: `src/controllers` (المنطق البرمجي)
- **[authController.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/controllers/authController.js)**: عمليات التسجيل، الدخول، وجلب بيانات المستخدم الحالي.
- **[postController.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/controllers/postController.js)**: إدارة المنشورات (إنشاء، حذف، إعجاب، تعليق).
- **[profileController.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/controllers/profileController.js)**: جلب وتحديث بيانات الملف الشخصي للمستخدم.
- **[messageController.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/controllers/messageController.js)**: إدارة الرسائل والمحادثات الخاصة.
- **[notificationController.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/controllers/notificationController.js)**: إدارة التنبيهات (قراءتها وجلبها).
- **[searchController.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/controllers/searchController.js)**: منطق البحث عن المنشورات والمستخدمين.
- **[uploadController.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/controllers/uploadController.js)**: معالجة طلبات رفع الصور.

#### المجلد: `src/models` (هيكلة البيانات)
- **[User.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/models/User.js)**: تعريف بيانات المستخدم (الاسم، البريد، كلمة المرور، المتابعين).
- **[Post.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/models/Post.js)**: تعريف بيانات المنشور والتعليقات.
- **[Message.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/models/Message.js)**: تعريف هيكل الرسالة الخاصة.
- **[Conversation.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/models/Conversation.js)**: تعريف المحادثة التي تجمع المستخدمين.
- **[Notification.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/models/Notification.js)**: تعريف أنواع التنبيهات وحالتها.

#### المجلد: `src/middlewares` (البرمجيات الوسيطة)
- **[authMiddleware.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/middlewares/authMiddleware.js)**: حماية المسارات والتأكد من هوية المستخدم عبر JWT.
- **[errorMiddleware.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/middlewares/errorMiddleware.js)**: معالجة الأخطاء والروابط غير الموجودة.
- **[validateRequest.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/middlewares/validateRequest.js)**: التحقق من صحة البيانات المدخلة قبل معالجتها.

#### المجلد: `src/routes` (المسارات)
- **[index.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/routes/index.js)**: الموجه الرئيسي الذي يجمع كل المسارات الأخرى.
- **[authRoutes.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/routes/authRoutes.js)**: مسارات المصادقة.
- **[postRoutes.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/routes/postRoutes.js)**: مسارات المنشورات.

#### ملفات أساسية أخرى:
- **[app.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/app.js)**: تهيئة تطبيق Express وإضافة الـ Middlewares العامة.
- **[server.js](file:///d:/amit%20projects/final-project/social-media-platform/server/src/server.js)**: نقطة البداية لتشغيل الخادم والاتصال بقاعدة البيانات.

---

### ب) جانب العميل (Client - Frontend)
المسار: `/client`

#### المجلد: `src/app`
- **[store.js](file:///d:/amit%20projects/final-project/social-media-platform/client/src/app/store.js)**: إعداد Redux Store لإدارة حالة التطبيق بالكامل.
- **[router.jsx](file:///d:/amit%20projects/final-project/social-media-platform/client/src/app/router.jsx)**: تعريف مسارات الصفحات (مثل الرئيسية، البروفايل، الرسائل).

#### المجلد: `src/features` (إدارة الحالات لكل ميزة)
- تحتوي هذه المجلدات (auth, posts, messages, etc.) على ملفات `slice.js` التي تدير البيانات والعمليات غير المتزامنة (Async Thunks) لكل ميزة.

#### المجلد: `src/pages` (الصفحات)
- تحتوي على مكونات الصفحات الرئيسية مثل `FeedPage`, `LoginPage`, `ProfilePage`, إلخ.

#### المجلد: `src/components` (المكونات)
- **common/**: مكونات عامة مثل `ProtectedRoute`.
- **layout/**: مكونات الهيكل مثل `AppLayout` و Navbars.
- **posts/**: مكونات خاصة بالمنشورات مثل `PostCard` و `PostComposer`.

#### ملفات أساسية أخرى:
- **[main.jsx](file:///d:/amit%20projects/final-project/social-media-platform/client/src/main.jsx)**: نقطة انطلاق تطبيق React.
- **[api.js](file:///d:/amit%20projects/final-project/social-media-platform/client/src/services/api.js)**: إعداد Axios لإجراء الطلبات للسيرفر مع إضافة Token المصادقة تلقائياً.

---

## 3. التقنيات والمكتبات المستخدمة

### الخادم (Backend)
- **Node.js & Express**: لإنشاء الخادم.
- **MongoDB & Mongoose**: لقاعدة البيانات والتعامل معها.
- **JWT (jsonwebtoken)**: لتأمين الحسابات.
- **Bcryptjs**: لتشفير كلمات المرور.
- **Multer**: لرفع الصور.
- **Nodemailer**: لإرسال الإيميلات.

### العميل (Frontend)
- **React**: المكتبة الأساسية للواجهة.
- **Redux Toolkit**: لإدارة الحالة (State Management).
- **React Router Dom**: للتنقل بين الصفحات.
- **Axios**: للاتصال بالـ API.
- **Bootstrap & React-Bootstrap**: للتصميم والتنسيق.
- **Vite**: أداة بناء وتطوير سريعة.

---

## 4. طريقة تشغيل المشروع

### المتطلبات:
- تثبيت [Node.js](https://nodejs.org/).
- قاعدة بيانات [MongoDB](https://www.mongodb.com/) (محلياً أو Atlas سحابياً).

### الخطوة 1: إعداد الخادم (Server)
1. افتح مجلد `server`.
2. قم بإنشاء ملف `.env` بناءً على `.env.example`.
3. قم بتعبئة البيانات المطلوبة (رابط قاعدة البيانات، السر الخاص بـ JWT).
4. افتح الـ Terminal في مجلد `server` وشغل:
   ```bash
   npm install
   npm run dev
   ```

### الخطوة 2: إعداد العميل (Client)
1. افتح مجلد `client`.
2. افتح الـ Terminal في مجلد `client` وشغل:
   ```bash
   npm install
   npm run dev
   ```
3. افتح الرابط الذي سيظهر لك (غالباً `http://localhost:5173`).

---
تم إعداد هذا الدليل لمساعدتك في فهم المشروع وتطويره بسهولة.
