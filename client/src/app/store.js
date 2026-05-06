/**
 * @file store.js
 * @description إعداد متجر Redux المركزي وتجميع جميع الـ Slices (أجزاء الحالة).
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice"; // إدارة حالة المصادقة
import themeReducer from "../features/theme/themeSlice"; // إدارة مظهر التطبيق
import postsReducer from "../features/posts/postsSlice"; // إدارة حالة المنشورات
import profileReducer from "../features/profile/profileSlice"; // إدارة بيانات الملفات الشخصية
import notificationsReducer from "../features/notifications/notificationsSlice"; // إدارة التنبيهات
import searchReducer from "../features/search/searchSlice"; // إدارة عمليات البحث
import messagesReducer from "../features/messages/messagesSlice"; // إدارة الرسائل الخاصة

export const store = configureStore({
  reducer: {
    // ربط كل جزء من الحالة بالمخفض (Reducer) الخاص به
    auth: authReducer,
    theme: themeReducer,
    posts: postsReducer,
    profile: profileReducer,
    notifications: notificationsReducer,
    search: searchReducer,
    messages: messagesReducer,
  },
});
