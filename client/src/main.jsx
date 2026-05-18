/**
 * @file main.jsx
 * @description دي "نقطة الانطلاق" (Entry Point) بتاعة الموقع كله.
 * هنا بنربط الـ React بالـ HTML، وبنحط الـ Redux Provider عشان الموقع كله يشوف البيانات.
 * كمان بنشغل الـ Router عشان التنقل بين الصفحات، وبنعمل تهيئة للثيم (Dark/Light) ولليوزر لو مسجل دخول.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux"; // لتوفير متجر الحالات (Store) لجميع المكونات
import { RouterProvider } from "react-router-dom"; // لإدارة التنقل بين الصفحات
import "bootstrap/dist/css/bootstrap.min.css"; // استيراد أنماط بوتستراب
import "./index.css"; // استيراد الأنماط المخصصة
import { store } from "./app/store"; // استيراد متجر Redux
import router from "./app/router"; // استيراد إعدادات المسارات
import { initTheme } from "./features/theme/themeSlice"; // وظيفة تهيئة المظهر
import { fetchCurrentUser } from "./features/auth/authSlice"; // وظيفة جلب المستخدم الحالي

// تهيئة المظهر (داكن أو فاتح) عند بدء التطبيق
store.dispatch(initTheme());

// إذا كان هناك رمز دخول (Token) مخزن، حاول جلب بيانات المستخدم
if (localStorage.getItem("token")) {
  store.dispatch(fetchCurrentUser());
}

// بدء عملية رندر التطبيق في عنصر root
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
