# Full-Stack Social Media Platform - دليل المناقشة والتشغيل

## 1) فكرة المشروع باختصار
المشروع عبارة عن منصة تواصل اجتماعي كاملة (Frontend + Backend) تحاكي سيناريو حقيقي:
- تسجيل/دخول مستخدمين
- إنشاء منشورات والتفاعل معها
- ملفات شخصية
- إشعارات
- بحث شامل
- مراسلة بين المستخدمين
- إعدادات واجهة مثل Light/Dark mode

الهدف من التنفيذ كان: كود نظيف، تقسيم واضح، وقابلية تطوير لاحقًا.

---

## 2) التقنيات المستخدمة ولماذا

## Frontend
- **React**: بناء UI كمكونات واضحة وسهلة الصيانة.
- **Redux Toolkit**: إدارة حالة التطبيق بشكل مركزي (Auth, Posts, Notifications...).
- **React Router DOM**: التنقل بين الصفحات + حماية المسارات.
- **Axios**: التعامل مع REST APIs مع interceptor للـ JWT.
- **Bootstrap + Custom CSS**: تصميم responsive سريع مع لمسة مخصصة.
- **LocalStorage**: حفظ الجلسة والثيم.

## Backend
- **Node.js + Express**: REST API واضحة وبسيطة التوسع.
- **MongoDB + Mongoose**: نمذجة بيانات مرنة وسريعة.
- **JWT + bcryptjs**: أمان تسجيل الدخول وتخزين كلمات المرور بشكل مشفر.
- **express-validator**: التحقق من المدخلات قبل تنفيذ المنطق.
- **Multer**: رفع الصور.
- **Nodemailer**: إرسال welcome email.
- **dotenv / helmet / cors / morgan**: إعداد بيئة آمنة ومنظمة.

---

## 3) هيكل المشروع

- `client/`
  - `src/app`: إعداد `store` و`router`
  - `src/features`: كل domain في slice مستقل (auth/posts/profile/search/notifications/messages/theme)
  - `src/components`: مكونات قابلة لإعادة الاستخدام
  - `src/pages`: صفحات النظام
  - `src/services`: Axios + upload service

- `server/`
  - `src/models`: `User`, `Post`, `Notification`, `Conversation`, `Message`
  - `src/controllers`: منطق كل ميزة
  - `src/routes`: المسارات
  - `src/middlewares`: auth / error / validate
  - `src/validators`: قواعد validation
  - `src/config`: db / multer / mailer
  - `src/utils`: أدوات مساعدة (JWT generation)

---

## 4) أهم الـ Features المنفذة

## A) Authentication
- Register / Login / Get Current User
- حماية المسارات باستخدام `Bearer Token`
- حفظ `token` و`user` في LocalStorage
- Redirect تلقائي للمستخدم غير المصرح له
- Logout مع session cleanup

## B) Posts & Feed
- إنشاء/عرض/تعديل/حذف البوست
- Like/Unlike
- Comments + Nested Replies (على مستوى الـ API)
- Pagination/filter params في feed endpoint
- Optimistic UI في اللايك
- Polling لتحديث الـ feed بشكل دوري (simulation)

## C) User Profiles
- صفحة بروفايل حسب `username`
- عرض user info + posts history
- تعديل بيانات صاحب الحساب فقط (Conditional Rendering)
- دعم avatar image upload

## D) Notifications
- Notification model موحد (`like`, `comment`, `message`)
- توليد إشعار تلقائي عند التفاعل
- Mark as read / Mark all as read
- Badge unread count في الـ Navbar
- Polling لتحديث الإشعارات

## E) Search
- بحث عن users (name/username)
- بحث عن posts (content/tags/text)
- صفحة نتائج موحدة + navigation لملفات المستخدمين

## F) Messaging
- إنشاء/قراءة المحادثات
- إرسال/قراءة الرسائل
- Chat bubbles للمرسل/المستقبل
- Polling لتحديث الرسائل للمحادثة المفتوحة

## G) Theme & UI
- Light/Dark mode
- حفظ الثيم في LocalStorage
- Dashboard layout responsive

## H) File Upload + Email
- Multer endpoint لرفع الصور
- Serving الملفات من `/uploads`
- Welcome email عند التسجيل عبر Nodemailer
- fallback محلي عبر `jsonTransport`

---

## 5) API Endpoints المهمة (مختصر عملي)

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/posts`
- `POST /api/posts`
- `PUT /api/posts/:postId`
- `DELETE /api/posts/:postId`
- `PATCH /api/posts/:postId/like`
- `POST /api/posts/:postId/comments`
- `POST /api/posts/:postId/comments/:commentId/replies`
- `GET /api/profiles/:username`
- `PUT /api/profiles/me/update`
- `GET /api/notifications`
- `PATCH /api/notifications/:notificationId/read`
- `PATCH /api/notifications/read-all`
- `GET /api/search?q=...`
- `GET /api/messages/conversations`
- `GET /api/messages/conversations/:conversationId/messages`
- `POST /api/messages`
- `POST /api/upload`

---

## 6) خطوات تشغيل المشروع (من الصفر)

## A) متطلبات قبل التشغيل
- Node.js (إصدار حديث LTS)
- MongoDB شغال محليًا أو عبر Atlas

## B) تشغيل الـ Backend
1. افتح terminal داخل `server/`
2. انسخ `.env.example` إلى `.env`
3. عدّل القيم الأساسية:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
4. (اختياري) فعّل SMTP إذا تريد إرسال email فعلي
5. نفذ:
   - `npm install`
   - `npm run dev`

السيرفر يعمل افتراضيًا على `http://localhost:5000`

## C) تشغيل الـ Frontend
1. افتح terminal داخل `client/`
2. انسخ `.env.example` إلى `.env`
3. تأكد أن:
   - `VITE_API_BASE_URL=http://localhost:5000/api`
4. نفذ:
   - `npm install`
   - `npm run dev`

الواجهة تعمل افتراضيًا على `http://localhost:5173`

---

## 7) سيناريو Demo جاهز للمناقشة
اتبع التسلسل ده أثناء العرض:
1. تسجيل مستخدم جديد (توضيح التحقق + hash + JWT)
2. تسجيل الدخول وشرح protected routes
3. إنشاء post + tags + صورة
4. عمل like/comment وإظهار التحديث السريع
5. فتح profile وتعديل البيانات والصورة
6. عرض notifications badge + panel
7. تجربة البحث عن مستخدم وبوست
8. فتح messages وإرسال رسالة وإظهار chat bubbles
9. تبديل Light/Dark mode مع إعادة تحميل الصفحة لإثبات persistence

---

## 8) نقاط قوة تتكلم بها في المناقشة
- فصل واضح بين الطبقات (routes/controllers/models).
- كل API تقريبًا عليها validation.
- حماية endpoints الحساسة بـ JWT middleware.
- State management منظم بRedux slices لكل domain.
- واجهة Responsive وقابلة للتوسع.
- تصميم الـ data models يدعم التطوير المستقبلي بسهولة.

---

## 9) تحسينات احترافية مقترحة (لو الدكتور سأل "إيه القادم؟")
- Socket.IO بدل polling لتحديثات realtime حقيقية.
- Cloud storage للصور (S3/Cloudinary) بدل local uploads.
- Unit + integration tests (Jest/Supertest + React Testing Library).
- Rate limiting + brute-force protection + refresh tokens.
- CI/CD + production deployment (Vercel + Render/Railway).

---

## 10) أسئلة شائعة متوقعة وإجابات مختصرة

**س: لماذا Redux Toolkit بدل Context فقط؟**  
ج: لأن المشروع كبير وفيه domains متعددة وتفاعلات async كثيرة، فRedux Toolkit بيوفر تنظيم أقوى وأوضح.

**س: كيف أمنت النظام؟**  
ج: bcrypt لتشفير الباسورد + JWT للتحقق + middleware للحماية + validation للمدخلات.

**س: كيف حققت realtime؟**  
ج: استخدمت Optimistic UI + polling كـ simulation، والخطوة التالية Socket.IO.

**س: كيف المشروع قابل للتوسع؟**  
ج: كل ميزة منفصلة في طبقة/ملفات مستقلة، وإضافة feature جديدة لا تكسر النظام الحالي.

---

## 11) ملاحظة مهمة لك أثناء العرض
خليك تشرح قراراتك الهندسية ("ليه اخترت كده") أكثر من مجرد "أنا عملت إيه".  
التركيز على القرار والسبب يظهر فهمك الحقيقي للمشروع.
