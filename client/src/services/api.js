/**
 * @file api.js
 * @description إعداد مكتبة Axios لإجراء طلبات HTTP إلى الخادم.
 */

import axios from "axios";

// إنشاء مثيل (Instance) من axios مع إعدادات أساسية
const api = axios.create({
  // تحديد الرابط الأساسي للـ API
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
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
