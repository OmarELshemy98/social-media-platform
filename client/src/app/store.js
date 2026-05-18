/**
 * @file store.js
 * @description الفايل ده هو "المخزن المركزي" (Redux Store).
 * هنا بنجمع كل الـ Slices اللي عملناها (زي الحسابات، البوستات، الإشعارات).
 * ده بيخلينا نقدر نوصل لأي معلومة في أي مكان في الموقع بسهولة من غير تعقيد.
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
