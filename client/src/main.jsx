/**
 * @file main.jsx
 * @description نقطة الدخول الرئيسية لتطبيق React. يقوم بإعداد Redux و Router وتهيئتهما.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux"; // لتوفير متجر الحالات (Store) لجميع المكونات
import { RouterProvider } from "react-router-dom"; // لإدارة التنقل بين الصفحات
import "bootstrap/dist/css/bootstrap.min.css"; // استيراد أنماط بوتستراب
import "./index.css"; // استيراد الأنماط المخصصة
import { store } from "./app/store"; // استيراد متجر Redux
import router from "./app/router"; // استيراد إعدادات المسارات
import { initializeTheme } from "./features/theme/themeSlice"; // وظيفة تهيئة المظهر
import { fetchCurrentUser } from "./features/auth/authSlice"; // وظيفة جلب المستخدم الحالي

// تهيئة المظهر (داكن أو فاتح) عند بدء التطبيق
store.dispatch(initializeTheme());

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
