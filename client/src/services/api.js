/**
 * @file api.js
 * @description الفايل ده هو "ساعي البريد" (API Client).
 * بنستخدم مكتبة Axios عشان نبعت طلبات للسيرفر.
 * أهم حاجة هنا هو الـ Interceptor، ده "فلتر" بيعدي على كل طلب رايح للسيرفر ويحط فيه التوكن (Token) تلقائياً عشان السيرفر يعرف مين اللي باعت الطلب.
 */

import axios from "axios";

// إنشاء مثيل (Instance) من axios مع إعدادات أساسية
const api = axios.create({
  // تحديد الرابط الأساسي للـ API
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 60000, // زيادة المهلة لـ 60 ثانية لرفع الملفات الكبيرة
  withCredentials: true, // السماح بإرسال الـ Cookies والـ Headers الأمنية
});

/**
 * إضافة Interceptor لمعالجة كل طلب قبل إرساله
 * يقوم بإضافة رمز الـ JWT إلى رؤوس الطلب (Headers) إن وجد
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
