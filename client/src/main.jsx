/**
 * @file main.jsx
 * @description دي "نقطة الانطلاق" (Entry Point) بتاعة الموقع كله.
 * هنا بنربط الـ React بالـ HTML، وبنحط الـ Redux Provider عشان الموقع كله يشوف البيانات.
 * كمان بنشغل الـ Router عشان التنقل بين الصفحات، وبنعمل تهيئة للثيم (Dark/Light) ولليوزر لو مسجل دخول.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { RouterProvider } from "react-router-dom";
import router from "./app/router";
import { initTheme } from "./features/theme/themeSlice";
import { fetchCurrentUser } from "./features/auth/authSlice";

// استيراد التنسيقات العالمية (CSS)
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// تهيئة الثيم
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
