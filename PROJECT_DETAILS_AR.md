# Social Media Platform - Project Guide

## نظرة عامة
هذا مشروع Full-Stack Social Media Platform متكامل باستخدام:
- **Frontend:** React + Redux Toolkit + React Router + Axios + Bootstrap
- **Backend:** Node.js + Express + MongoDB + Mongoose + JWT + bcrypt

المشروع يدعم المصادقة، إدارة المنشورات، التعليقات، الإشعارات، البحث، الملفات الشخصية، والمراسلة.

---

## هيكل المشروع
- `client/` واجهة المستخدم (React)
- `server/` الـ API وBusiness Logic (Node/Express)

---

## أهم الميزات المنفذة

### 1) Authentication
- تسجيل مستخدم جديد
- تسجيل الدخول
- JWT Middleware لحماية المسارات
- حفظ الجلسة في LocalStorage (token + user)
- استرجاع المستخدم الحالي تلقائياً عند فتح التطبيق

### 2) Posts & Feed
- إنشاء منشور
- عرض Feed مع Pagination params جاهزة
- حذف منشور (للصاحب فقط)
- Like / Unlike
- إضافة Comment
- دعم Nested Replies على مستوى الـ API
- Optimistic UI لزر الـ Like في الواجهة

### 3) Profiles
- عرض صفحة بروفايل ديناميكية حسب `username`
- عرض تاريخ منشورات المستخدم
- تعديل البيانات الشخصية (لصاحب الحساب فقط)

### 4) Notifications
- نموذج إشعارات موحد (`like`, `comment`, `message`)
- توليد إشعارات تلقائياً عند:
  - عمل لايك على منشور
  - إضافة تعليق
  - إرسال رسالة
- تعليم إشعار واحد كمقروء
- تعليم كل الإشعارات كمقروءة

### 5) Search
- بحث شامل عن:
  - المستخدمين (name / username)
  - المنشورات (content / tags / text index)
- صفحة نتائج موحدة في الواجهة

### 6) Messaging (Phase 2 - implemented)
- Conversations model
- Messages model
- جلب المحادثات
- جلب رسائل محادثة محددة
- إرسال رسالة بين المستخدمين

### 7) Theme & UI
- Light / Dark mode toggle
- حفظ الثيم في LocalStorage
- Dashboard-style layout responsive باستخدام Bootstrap + Custom CSS

### 8) Uploads & Email
- رفع صور فعلي للبوستات والصورة الشخصية عبر `Multer`
- Static serving للملفات المرفوعة من السيرفر
- إرسال Welcome email عند التسجيل عبر `Nodemailer`
- fallback `jsonTransport` للتطوير المحلي بدون SMTP

---

## Backend Architecture
- `server/src/config` اتصال قاعدة البيانات
- `server/src/models` جميع الـ Models
- `server/src/controllers` منطق كل ميزة
- `server/src/routes` REST Endpoints
- `server/src/middlewares` حماية/أخطاء/Validation
- `server/src/validators` قواعد التحقق من البيانات
- `server/src/utils` أدوات مساعدة مثل JWT generation

### API Base
- كل المسارات تحت: `/api`
- Health check: `/api/health`

---

## Frontend Architecture
- `client/src/app` store + router
- `client/src/features` slices لكل domain (auth/posts/profile/search/notifications/messages/theme)
- `client/src/pages` صفحات النظام
- `client/src/components` مكونات reusable
- `client/src/services/api.js` Axios instance + JWT interceptor

---

## خطوات التشغيل

## 1) تشغيل السيرفر
1. ادخل إلى `server/`
2. انسخ `.env.example` إلى `.env`
3. عدّل القيم (خصوصاً `MONGODB_URI` و `JWT_SECRET` وبيانات SMTP لو هتفعّل الإرسال الحقيقي)
4. نفذ:
   - `npm install`
   - `npm run dev`

## 2) تشغيل الواجهة
1. ادخل إلى `client/`
2. انسخ `.env.example` إلى `.env`
3. نفذ:
   - `npm install`
   - `npm run dev`

---

## ملاحظات إنتاجية (Production)
- تأكد من:
  - JWT secret قوي
  - CORS مضبوط على دومين الواجهة الحقيقي
  - تفعيل HTTPS
  - إضافة Rate Limiting
  - استخدام Cloud storage لرفع الصور
  - إضافة اختبارات API وواجهة

---

## اقتراحات تطوير مستقبلية
- Realtime notifications/messages عبر Socket.IO
- Upload صور وفيديو
- Role-based access
- Unit + Integration tests
- Deployment (Vercel + Render/Railway)
