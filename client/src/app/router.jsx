/**
 * @file router.jsx
 * @description إعداد مسارات التطبيق وتحديد الصفحات العامة والمحمية.
 */

import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import FeedPage from "../pages/FeedPage";
import ProfilePage from "../pages/ProfilePage";
import PostDetailsPage from "../pages/PostDetailsPage";
import NotFoundPage from "../pages/NotFoundPage";
import SearchPage from "../pages/SearchPage";
import NotificationsPage from "../pages/NotificationsPage";
import MessagesPage from "../pages/MessagesPage";
import SettingsPage from "../pages/SettingsPage";

const router = createBrowserRouter([
  // مسارات عامة (لا تتطلب تسجيل دخول)
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password/:resetToken", element: <ResetPasswordPage /> },
  
  // مسارات محمية (تتطلب تسجيل دخول)
  {
    element: <ProtectedRoute />, // برمجية حماية للتأكد من تسجيل الدخول
    children: [
      {
        element: <AppLayout />, // الهيكل العام للتطبيق (Nav, Footer, etc.)
        children: [
          { path: "/", element: <FeedPage /> }, // الصفحة الرئيسية
          { path: "/posts/:postId", element: <PostDetailsPage /> }, // تفاصيل المنشور
          { path: "/profile", element: <ProfilePage /> }, // ملف المستخدم الشخصي
          { path: "/profile/:username", element: <ProfilePage /> }, // ملف شخصي لمستخدم آخر
          { path: "/search", element: <SearchPage /> }, // صفحة البحث
          { path: "/notifications", element: <NotificationsPage /> }, // صفحة التنبيهات
          { path: "/messages", element: <MessagesPage /> }, // صفحة الرسائل
          { path: "/settings", element: <SettingsPage /> }, // صفحة الإعدادات
        ],
      },
    ],
  },
  
  // مسار للصفحات غير الموجودة
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
